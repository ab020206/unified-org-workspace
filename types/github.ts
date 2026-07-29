export interface ConnectGitHubRepoDto {
  repoOwner: string;
  repoName: string;
  accessToken: string;
  installationId?: string;
  webhookSecret: string;
}

export interface GitHubRepoResponseDto {
  id: string;
  organizationId: string;
  repoOwner: string;
  repoName: string;
  githubRepoId?: string | null;
  installationId?: string | null;
  syncStatus: string;
  lastSyncedAt?: string | Date | null;
  createdBy: string;
  createdAt: string | Date;
}

export interface GitHubWebhookPayload {
  action?: string;
  repository?: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
  pull_request?: any;
  review?: any;
  comment?: any;
  check_suite?: any;
  check_run?: any;
  status?: any;
}
