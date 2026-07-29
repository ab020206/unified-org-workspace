import { z } from 'zod';

export const healthQuerySchema = z.object({
  verbose: z.enum(['true', 'false']).optional(),
});
