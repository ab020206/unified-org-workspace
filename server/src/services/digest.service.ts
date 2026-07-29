import { DigestRepository } from '../repositories/digest.repository';
import { UserRepository } from '../repositories/user.repository';
import { digestQueue } from '../queues/digest.queue';
import { processDigestJob } from '../workers/digest.worker';
import { auditService } from './audit.service';
import { DigestStatus } from '@workspace/shared-types';

export class DigestService {
  private digestRepo: DigestRepository;
  private userRepo: UserRepository;

  constructor() {
    this.digestRepo = new DigestRepository();
    this.userRepo = new UserRepository();
  }

  async getLatestDigest(organizationId: string, userId: string) {
    let digest = await this.digestRepo.findLatestActiveDigest(organizationId, userId);

    if (!digest) {
      // Synchronously generate initial digest if none exists yet for seamless DX
      const user = await this.userRepo.findById(userId);
      const pendingDigest = await this.digestRepo.createDigest({
        organizationId,
        userId,
        title: `AI Activity Briefing for ${user?.firstName || 'User'}`,
        summary: 'Digest is being generated in the background...',
        status: DigestStatus.GENERATING,
      });

      await processDigestJob({
        userId,
        organizationId,
        digestId: pendingDigest.id,
      });

      digest = await this.digestRepo.findLatestActiveDigest(organizationId, userId);
    }

    return digest;
  }

  async triggerManualDigestGeneration(organizationId: string, userId: string) {
    const user = await this.userRepo.findById(userId);

    const pendingDigest = await this.digestRepo.createDigest({
      organizationId,
      userId,
      title: `AI Activity Briefing for ${user?.firstName || 'User'}`,
      summary: 'Digest generation initiated in background worker...',
      status: DigestStatus.GENERATING,
    });

    // Enqueue job asynchronously to background worker
    await digestQueue.add('generate-digest', {
      userId,
      organizationId,
      digestId: pendingDigest.id,
    });

    await auditService.log({
      organizationId,
      actorId: userId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: 'AI_DIGEST',
      action: 'DIGEST_REGENERATED',
      entityType: 'DIGEST',
      entityId: pendingDigest.id,
    });

    return pendingDigest;
  }

  async getDigestHistory(organizationId: string, userId: string, page = 1, limit = 10) {
    return this.digestRepo.listDigestHistory(organizationId, userId, page, limit);
  }
}
