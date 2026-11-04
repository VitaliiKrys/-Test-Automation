import { withRetry } from './retry';
export type DeliveryStatus = 'queued' | 'sent' | 'failed';
export interface MessageRecord { id: string; destination: string; text: string; status: DeliveryStatus; attempts: number; providerMessageId?: string; }
export interface MessageRepository { save(message: MessageRecord): Promise<void>; findById(id: string): Promise<MessageRecord | undefined>; }
export interface MessageGateway { send(destination: string, text: string): Promise<string>; }
export class MessageQueueService {
  constructor(private repository: MessageRepository, private gateway: MessageGateway) { }
  async enqueue(id: string, destination: string, text: string): Promise<MessageRecord> {
    if (!id || !destination || !text) throw new Error('INVALID_MESSAGE');
    const record: MessageRecord = { id, destination, text, status: 'queued', attempts: 0 };
    await this.repository.save(record);
    return record;
  }
  async deliver(id: string): Promise<MessageRecord> {
    const record = await this.repository.findById(id);
    if (!record) throw new Error('MESSAGE_NOT_FOUND');
    if (record.status === 'sent') throw new Error('ALREADY_SENT');
    let attempts = 0;
    try {
      const providerMessageId = await withRetry(async () => {
        attempts += 1;
        return this.gateway.send(record.destination, record.text);
      }, 3, 2000);
      const sent: MessageRecord = { ...record, status: 'sent', attempts, providerMessageId };
      await this.repository.save(sent);
      return sent;
    } catch (error) {
      // Preserve failure state even when all attempts are exhausted.
      await this.repository.save({ ...record, status: 'failed', attempts });
      throw error;
    }
  }
}
