import { logger } from '../utils/logger';

export interface DigestJobData {
  userId: string;
  organizationId: string;
  digestId?: string;
}

export class DigestQueue {
  private static instance: DigestQueue;
  private queue: DigestJobData[] = [];
  private isProcessing = false;
  private processor?: (job: DigestJobData) => Promise<void>;

  public static getInstance(): DigestQueue {
    if (!DigestQueue.instance) {
      DigestQueue.instance = new DigestQueue();
    }
    return DigestQueue.instance;
  }

  public setProcessor(processor: (job: DigestJobData) => Promise<void>) {
    this.processor = processor;
  }

  public async add(
    name: string,
    data: DigestJobData,
    _opts?: { attempts?: number; backoff?: number }
  ) {
    logger.info(
      { jobName: name, userId: data.userId, orgId: data.organizationId },
      'Enqueued Digest Job'
    );
    this.queue.push(data);

    // Trigger async non-blocking execution
    setImmediate(() => this.processNext());
    return { id: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`, data };
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0 || !this.processor) return;
    this.isProcessing = true;

    const job = this.queue.shift();
    if (job) {
      try {
        await this.processor(job);
      } catch (err: any) {
        logger.error({ error: err.message, userId: job.userId }, 'Digest Queue Worker Error');
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      setImmediate(() => this.processNext());
    }
  }
}

export const digestQueue = DigestQueue.getInstance();
