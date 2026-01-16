
export interface GitHubRun {
    id: number;
    status: string;
    conclusion: string | null;
    head_branch: string;
    head_sha: string;
    created_at: string;
    display_title: string;
    html_url: string;
    actor: {
        login: string;
        avatar_url: string;
    };
}

export interface GitHubConfig {
    token: string;
    owner: string;
    repo: string;
}

export async function fetchWorkflowRuns(config: GitHubConfig): Promise<GitHubRun[]> {
    let { token, owner, repo } = config;

    // Basic sanitization
    owner = owner.trim().replace(/^https?:\/\/github\.com\//, "").split("/")[0] || owner.trim();
    repo = repo.trim().split("/").pop()?.replace(/\.git$/, "") || repo.trim();

    const headers: HeadersInit = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token && token.trim()) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`, {
        headers
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) throw new Error("Repository not found (check owner/repo)");
        if (response.status === 401) throw new Error("Invalid GitHub token");
        if (response.status === 403) throw new Error(errorData.message || "GitHub API rate limit exceeded");
        throw new Error(errorData.message || "Failed to fetch from GitHub");
    }

    const data = await response.json();
    return data.workflow_runs || [];
}

export async function fetchDeployments(config: GitHubConfig): Promise<any[]> {
    let { token, owner, repo } = config;
    owner = owner.trim().replace(/^https?:\/\/github\.com\//, "").split("/")[0] || owner.trim();
    repo = repo.trim().split("/").pop()?.replace(/\.git$/, "") || repo.trim();

    const headers: HeadersInit = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token && token.trim()) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/deployments?per_page=10`, {
        headers
    });

    if (!response.ok) return [];
    return await response.json();
}
