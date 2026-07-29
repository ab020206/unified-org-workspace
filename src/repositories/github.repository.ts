import { prisma } from '../config/prisma';
import { encrypt, decrypt } from '../utils/encryption';
import { GitHubSyncStatus } from '@prisma/client';

export class GitHubRepository {
  async connectRepository(data: {
    organizationId: string;
    repoOwner: string;
    repoName: string;
    accessToken: string;
    installationId?: string;
    webhookSecret: string;
    createdBy: string;
  }) {
    const encryptedToken = encrypt(data.accessToken);
    const encryptedSecret = encrypt(data.webhookSecret);

    return prisma.gitHubIntegration.upsert({
      where: {
        organizationId_repoOwner_repoName: {
          organizationId: data.organizationId,
          repoOwner: data.repoOwner,
          repoName: data.repoName,
        },
      },
      create: {
        organizationId: data.organizationId,
        repoOwner: data.repoOwner,
        repoName: data.repoName,
        accessToken: encryptedToken,
        installationId: data.installationId || null,
        webhookSecret: encryptedSecret,
        createdBy: data.createdBy,
        syncStatus: GitHubSyncStatus.SYNCED,
        lastSyncedAt: new Date(),
      },
      update: {
        accessToken: encryptedToken,
        installationId: data.installationId || null,
        webhookSecret: encryptedSecret,
        syncStatus: GitHubSyncStatus.SYNCED,
        lastSyncedAt: new Date(),
      },
    });
  }

  async disconnectRepository(organizationId: string, integrationId: string) {
    return prisma.gitHubIntegration.deleteMany({
      where: {
        id: integrationId,
        organizationId,
      },
    });
  }

  async listRepositories(organizationId: string) {
    const repos = await prisma.gitHubIntegration.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return repos.map((repo) => ({
      ...repo,
      accessToken: '***MASKED***',
      webhookSecret: '***MASKED***',
    }));
  }

  async findRepository(organizationId: string, repoOwner: string, repoName: string) {
    const repo = await prisma.gitHubIntegration.findUnique({
      where: {
        organizationId_repoOwner_repoName: {
          organizationId,
          repoOwner,
          repoName,
        },
      },
    });

    if (!repo) return null;

    return {
      ...repo,
      rawAccessToken: decrypt(repo.accessToken),
      rawWebhookSecret: decrypt(repo.webhookSecret),
    };
  }

  async findRepositoryById(id: string) {
    const repo = await prisma.gitHubIntegration.findUnique({
      where: { id },
    });

    if (!repo) return null;

    return {
      ...repo,
      rawAccessToken: decrypt(repo.accessToken),
      rawWebhookSecret: decrypt(repo.webhookSecret),
    };
  }

  async findRepositoryByOwnerAndName(repoOwner: string, repoName: string) {
    const repo = await prisma.gitHubIntegration.findFirst({
      where: {
        repoOwner: { equals: repoOwner, mode: 'insensitive' },
        repoName: { equals: repoName, mode: 'insensitive' },
      },
    });

    if (!repo) return null;

    return {
      ...repo,
      rawAccessToken: decrypt(repo.accessToken),
      rawWebhookSecret: decrypt(repo.webhookSecret),
    };
  }

  async updateSyncStatus(integrationId: string, status: GitHubSyncStatus) {
    return prisma.gitHubIntegration.update({
      where: { id: integrationId },
      data: {
        syncStatus: status,
        lastSyncedAt: new Date(),
      },
    });
  }
}
