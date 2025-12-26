import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { findUserById, findUserByApiKey } from '../models';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    accountId: number;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const origin = req.headers.origin;

    // Check for API key authentication (only for non-CORS requests)
    if (apiKey && !origin) {
      const user = await findUserByApiKey(apiKey);

      if (!user) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        accountId: user.accountId,
      };

      next();
      return;
    }

    // Fall back to JWT authentication
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await findUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      accountId: user.accountId,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
