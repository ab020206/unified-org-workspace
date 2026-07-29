import { z } from 'zod';
import { NotificationType } from '@workspace/shared-types';

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  unreadOnly: z
    .string()
    .transform((val) => val === 'true')
    .or(z.boolean())
    .optional(),
  type: z.nativeEnum(NotificationType).optional(),
});
