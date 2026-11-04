import type { OrderRepository, OrderRecord } from '../../src/order-service';
import type { MessageRepository, MessageRecord } from '../../src/message-queue';
export class InMemoryOrderRepository implements OrderRepository {
  private items = new Map<string, OrderRecord>();
  async save(r: OrderRecord): Promise<void> { this.items.set(r.id, { ...r }); }
  async findById(id: string): Promise<OrderRecord | undefined> { return this.items.get(id); }
  get size() { return this.items.size; }
}
export class InMemoryMessageRepository implements MessageRepository {
  private items = new Map<string, MessageRecord>();
  async save(r: MessageRecord): Promise<void> { this.items.set(r.id, { ...r }); }
  async findById(id: string): Promise<MessageRecord | undefined> { return this.items.get(id); }
  get size() { return this.items.size; }
}
