import { TicketCategory, TicketPriority, TicketStatus } from '@workspace/shared-types';

export const createTestUserFixture = (overrides?: Record<string, any>) => ({
  firstName: 'Test',
  lastName: 'User',
  email: `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`,
  password: 'Password123!',
  organizationName: 'Fixture Organization Workspace',
  ...overrides,
});

export const createTestTicketFixture = (overrides?: Record<string, any>) => ({
  title: 'Automated QA Test Ticket',
  description: 'Validating system robustness and security controls in Phase 9 QA sprint.',
  category: TicketCategory.TECHNICAL,
  priority: TicketPriority.HIGH,
  status: TicketStatus.OPEN,
  ...overrides,
});

export const createTestPRFixture = (overrides?: Record<string, any>) => ({
  title: 'QA Pull Request Refactoring',
  description: 'Optimizing database queries and enforcing RBAC policies.',
  requiredApprovals: 1,
  ...overrides,
});
