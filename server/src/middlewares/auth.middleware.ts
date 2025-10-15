import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Configuration Constants
const JWT_SECRET = process.env.JWT_SECRET || 'SECURE_DEFAULT_SECRET_KEY'; 

// 1. Extend the Request interface to allow 'user' property attachment
// This is crucial for TypeScript to know that req.user exists later in the controller
declare global {
  namespace Express {
    interface Request {
      // Define the structure of the user data stored in the JWT payload
      user?: { userId: string; email: string; };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // 2. Get the token from the cookie property
    // Assumes 'jwt' is the name of the cookie set during login
    const token = req.cookies?.jwt;

    if (!token) {
        // No token found in cookies
        return res.status(401).json({ message: 'Access denied. Authentication required.' });
    }

    try {
        // 3. Verify the token using the secret
        // Define the expected payload structure for JWT verification
        const decoded = jwt.verify(token, JWT_SECRET) as { 
            userId: string, 
            email: string,
            iat: number,
            exp: number 
        };

        // 4. Attach the decoded user payload to the request object
        // This makes user data available in screeningController via req.user
        req.user = { 
            userId: decoded.userId, 
            email: decoded.email
        };

        // 5. Token is valid, proceed to the next middleware or controller
        next();
        
    }
    catch (err) {
        // Handle token corruption, expiration, or invalid signature
        console.error("JWT Verification Error:", err);
        
        // Clear the invalid cookie to force a re-login
        res.clearCookie('jwt', { path: '/' }); 
        
        return res.status(403).json({ message: 'Session expired or invalid. Please log in again.' });
    }
};