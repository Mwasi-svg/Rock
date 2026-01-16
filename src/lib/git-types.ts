// Git-related type definitions

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

export interface GitRemoteInfo {
    name: string;
    url: string;
    type: 'github' | 'gitlab' | 'other';
}

export interface GitRepository {
    id: string;
    name: string;
    path: string;
    remoteUrl?: string;
    lastFetched?: string;
    favicon?: string;
}

export interface GitSettings {
    username?: string;
    email?: string;
    githubToken?: string;
    autoFetch: boolean;
}
