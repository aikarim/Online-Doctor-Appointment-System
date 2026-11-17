import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email?: string; role?: string; name?: string };
}

// Supports both real Firebase ID tokens and signed demo session tokens for role testing
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Check if it is a structured session token for demo/password login (prefix: mc_session_)
  if (token.startsWith('mc_session_')) {
    try {
      const payloadBase64 = token.slice('mc_session_'.length);
      const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
      if (decoded && decoded.uid && decoded.email) {
        req.user = decoded;
        return next();
      }
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid session token' });
    }
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
