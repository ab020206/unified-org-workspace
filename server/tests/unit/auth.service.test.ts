import assert from 'assert';
import { AuthService } from '../../src/services/auth.service';

export async function runAuthServiceUnitTests() {
  console.log('    • Running AuthService Unit Tests...');
  const authService = new AuthService();

  // Test token formatting & access token generation
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockSessionId = '22222222-2222-2222-2222-222222222222';
  const accessToken = authService.generateAccessToken(mockUserId, mockSessionId);

  assert.ok(typeof accessToken === 'string');
  assert.ok(accessToken.length > 20);

  // Test refresh token generation uniqueness
  const token1 = authService.generateRefreshToken();
  const token2 = authService.generateRefreshToken();
  assert.notStrictEqual(token1, token2);

  // Test user payload formatting
  const formattedUser = authService.formatUser({
    id: mockUserId,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    emailVerified: true,
    isActive: true,
    createdAt: new Date(),
  });

  assert.strictEqual(formattedUser.id, mockUserId);
  assert.strictEqual(formattedUser.email, 'jane@example.com');
  assert.strictEqual(formattedUser.firstName, 'Jane');
  console.log('      ✔ AuthService unit tests passed');
}
