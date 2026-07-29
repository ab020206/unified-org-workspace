import assert from 'assert';
import { registerSchema, loginSchema } from '../../src/validators/auth.validator';
import { createTicketSchema } from '../../src/validators/ticket.validator';
import { TicketCategory, TicketPriority } from '@workspace/shared-types';

export async function runValidatorsUnitTests() {
  console.log('    • Running Zod Request Validators Unit Tests...');

  // 1. Valid Register Payload
  const validRegister = registerSchema.safeParse({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    password: 'Password123!',
    organizationName: 'Acme Corp',
  });
  assert.strictEqual(validRegister.success, true);

  // 2. Invalid Register Password (too short)
  const invalidPassword = registerSchema.safeParse({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    password: '123',
  });
  assert.strictEqual(invalidPassword.success, false);

  // 3. Valid Ticket Creation Payload
  const validTicket = createTicketSchema.safeParse({
    title: 'Fix Navigation Drawer Alignment',
    description: 'The navigation drawer is missing smooth transition animation on mobile views.',
    category: TicketCategory.BUG,
    priority: TicketPriority.HIGH,
  });
  assert.strictEqual(validTicket.success, true);

  // 4. Invalid Ticket Title (empty)
  const emptyTicket = createTicketSchema.safeParse({
    title: '',
    description: 'Some description',
  });
  assert.strictEqual(emptyTicket.success, false);

  console.log('      ✔ Request validators unit tests passed');
}
