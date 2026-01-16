import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export interface GitFileStatus {
    path: string;
    status: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed';
    staged: boolean;
    oldPath?: string;
}

export interface GitCommit {
    sha: string;
    shortSha: string;
    message: string;
    author: string;
    email: string;
    date: string;
    branch?: string;
}

export interface GitStatus {
    branch: string;
    ahead: number;
    behind: number;
    files: GitFileStatus[];
    hasUncommitted: boolean;
}

export interface GitBranch {
    name: string;
    current: boolean;
    remote: boolean;
    upstream?: string;
}

/**
 * Execute a git command in the specified repository
 */
async function execGit(repoPath: string, command: string): Promise<string> {
    try {
        const { stdout, stderr } = await execAsync(`git ${command}`, {
            cwd: repoPath,
            encoding: 'utf8'
        });

        if (stderr && !stderr.includes('warning')) {
            console.warn('Git stderr:', stderr);
        }

        return stdout.trim();
    } catch (error: any) {
        throw new Error(`Git command failed: ${error.message}`);
    }
}

/**
 * Verify if a path is a valid Git repository
 */
export async function verifyRepository(repoPath: string): Promise<boolean> {
    try {
        await execGit(repoPath, 'rev-parse --is-inside-work-tree');
        return true;
    } catch {
        return false;
    }
}

/**
 * Get the status of the repository
 */
export async function getStatus(repoPath: string): Promise<GitStatus> {
    const porcelainOutput = await execGit(repoPath, 'status --porcelain --branch');
    const lines = porcelainOutput.split('\n').filter(line => line.trim());

    // Parse branch info
    const branchLine = lines[0];
    const branchMatch = branchLine.match(/## ([^.]+)(?:\.\.\.(.+?))?(?:\s+\[(.+)\])?/);
    const branch = branchMatch ? branchMatch[1] : 'unknown';

    let ahead = 0;
    let behind = 0;
    if (branchMatch && branchMatch[3]) {
        const trackingInfo = branchMatch[3];
        const aheadMatch = trackingInfo.match(/ahead (\d+)/);
        const behindMatch = trackingInfo.match(/behind (\d+)/);
        ahead = aheadMatch ? parseInt(aheadMatch[1]) : 0;
        behind = behindMatch ? parseInt(behindMatch[1]) : 0;
    }

    // Parse file statuses
    const files: GitFileStatus[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const statusCode = line.substring(0, 2);
        const filePath = line.substring(3);

        let status: GitFileStatus['status'] = 'modified';
        let staged = false;

        // Parse status codes
        const stagedCode = statusCode[0];
        const unstagedCode = statusCode[1];

        if (stagedCode === 'A') {
            status = 'added';
            staged = true;
        } else if (stagedCode === 'M') {
            status = 'modified';
            staged = true;
        } else if (stagedCode === 'D') {
            status = 'deleted';
            staged = true;
        } else if (stagedCode === 'R') {
            status = 'renamed';
            staged = true;
        } else if (stagedCode === '?') {
            status = 'untracked';
            staged = false;
        }

        // Unstaged changes
        if (unstagedCode === 'M' && !staged) {
            status = 'modified';
        } else if (unstagedCode === 'D' && !staged) {
            status = 'deleted';
        }

        files.push({ path: filePath, status, staged });
    }

    return {
        branch,
        ahead,
        behind,
        files,
        hasUncommitted: files.length > 0
    };
}

/**
 * Get commit log
 */
export async function getLog(repoPath: string, limit: number = 20): Promise<GitCommit[]> {
    const format = '%H%n%h%n%an%n%ae%n%ai%n%s%n%b%n---COMMIT---';
    const output = await execGit(repoPath, `log --pretty=format:"${format}" -n ${limit}`);

    const commits: GitCommit[] = [];
    const commitBlocks = output.split('---COMMIT---').filter(block => block.trim());

    for (const block of commitBlocks) {
        const lines = block.trim().split('\n');
        if (lines.length >= 6) {
            commits.push({
                sha: lines[0],
                shortSha: lines[1],
                author: lines[2],
                email: lines[3],
                date: lines[4],
                message: lines.slice(5).join('\n').trim()
            });
        }
    }

    return commits;
}

/**
 * Get list of branches
 */
export async function getBranches(repoPath: string): Promise<GitBranch[]> {
    const output = await execGit(repoPath, 'branch -a -vv');
    const lines = output.split('\n').filter(line => line.trim());

    const branches: GitBranch[] = [];

    for (const line of lines) {
        const current = line.startsWith('*');
        const cleanLine = line.replace(/^\*?\s+/, '');
        const parts = cleanLine.split(/\s+/);
        const name = parts[0];
        const remote = name.startsWith('remotes/');

        // Extract upstream info if available
        const upstreamMatch = line.match(/\[(.+?)\]/);
        const upstream = upstreamMatch ? upstreamMatch[1] : undefined;

        branches.push({
            name: remote ? name.replace('remotes/', '') : name,
            current,
            remote,
            upstream
        });
    }

    return branches;
}

/**
 * Commit staged changes
 */
export async function commit(repoPath: string, message: string, files: string[]): Promise<void> {
    // Stage specified files
    if (files.length > 0) {
        const fileArgs = files.map(f => `"${f}"`).join(' ');
        await execGit(repoPath, `add ${fileArgs}`);
    }

    // Commit
    const escapedMessage = message.replace(/"/g, '\\"');
    await execGit(repoPath, `commit -m "${escapedMessage}"`);
}

/**
 * Push to remote
 */
export async function push(repoPath: string): Promise<void> {
    await execGit(repoPath, 'push');
}

/**
 * Pull from remote
 */
export async function pull(repoPath: string): Promise<void> {
    await execGit(repoPath, 'pull');
}

/**
 * Switch to a different branch
 */
export async function switchBranch(repoPath: string, branch: string): Promise<void> {
    await execGit(repoPath, `checkout "${branch}"`);
}

/**
 * Create a new branch
 */
export async function createBranch(repoPath: string, branchName: string): Promise<void> {
    await execGit(repoPath, `checkout -b "${branchName}"`);
}

/**
 * Clone a repository
 */
export async function cloneRepository(url: string, destinationPath: string): Promise<void> {
    try {
        const parentDir = path.dirname(destinationPath);
        await execAsync(`git clone "${url}" "${destinationPath}"`, {
            cwd: parentDir,
            encoding: 'utf8'
        });
    } catch (error: any) {
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(repoPath: string): Promise<string> {
    return await execGit(repoPath, 'branch --show-current');
}

/**
 * Get remote URL
 */
export async function getRemoteUrl(repoPath: string): Promise<string> {
    try {
        return await execGit(repoPath, 'remote get-url origin');
    } catch {
        return '';
    }
}

/**
 * Fetch from remote
 */
export async function fetch(repoPath: string): Promise<void> {
    await execGit(repoPath, 'fetch');
}
