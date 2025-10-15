import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/users.model.ts'; // Assuming your model is here
import bcrypt from 'bcryptjs';

// Configuration Constants
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECURE_FALLBACK_SECRET'; 
const JWT_EXPIRES_IN = '24h';

// Secure Cookie Settings (HttpOnly for XSS defense)
const COOKIE_OPTIONS = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' as const, 
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

const authController = {
    user: async (req: Request, res: Response) => {
        // 1. The verifyToken middleware ensures req.user is populated if the token is valid
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. No user data found.' });
        }

        try {
            // 2. Fetch user details from DB (excluding sensitive info like password)
            const user = await User.findById(req.user.userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // 3. Send user data to client
            res.status(200).json({ user });
        }
        catch (error) {
            console.error('Fetch User Error:', error);
            res.status(500).json({ message: 'Server error fetching user data.' });
        }
    },
    
    signup: async (req: Request, res: Response) => {
        // Updated destructuring to match schema: name, email, password
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        try {
            // 1. Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: 'User already exists.' });
            }

            // 2. Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. Create User in MongoDB
            const newUser = new User({ 
                email, 
                password: hashedPassword, // Store the HASHED password
                name: name, // Use the single name field
            });
            await newUser.save();

            // 4. Successful signup response
            res.status(201).json({ message: 'User registered successfully. Please log in.' });
            
        }
        catch (error) {
            console.error('Signup Error:', error);
            res.status(500).json({ message: 'Server error during registration.' });
        }
    },

    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            const existingToken = req.cookies?.jwt;
            // console.log(req.cookies);
            if (existingToken) {
                try {
                    // Check if the existing token is still valid (fast check)
                    const decoded = jwt.verify(existingToken, JWT_SECRET) as { 
                        userId: string, 
                        email: string,
                        iat: number,
                        exp: number 
                    };
                    // If verification succeeds, the user is already authenticated.
                    return res.status(200).json({ 
                        message: 'Already logged in.', 
                        user: { email: decoded.email, name: (decoded as any).name || 'User' }
                    });
                }
                catch (e) {
                    // Token is invalid/expired; continue to re-authenticate (re-login)
                    res.clearCookie('jwt', { path: '/' }); 
                }
            }
            // 1. Find User by email and retrieve password for comparison
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials (User not found).' });
            }

            // 2. Verify Password (TODO: Replace MOCK with actual hash comparison)
            const isMatch = bcrypt.compare(password, user.password || 'password_hash');

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials (Password mismatch).' });
            }

            // 3. Generate JWT
            // Note: MongoDB's _id is available as user._id
            const payload = { userId: user._id, email: user.email };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            // 4. Set Secure HTTP-Only Cookie
            res.cookie('jwt', token, COOKIE_OPTIONS);

            // 5. Send Success Response (client can now use the cookie)
            return res.status(200).json({ 
                user: { email: user.email, name: user.name },
                message: 'Login successful.'
            });

        }
        catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ message: 'Server error during login.' });
        }
    },
    
    logout: (req: Request, res: Response) => {
        // Clear the JWT cookie by setting it to an empty string and immediately expiring it
        res.clearCookie('jwt', { 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/', // Ensure the path matches the original set path
        }); 
        res.status(200).json({ message: 'Logout successful.' });
    }
};

export default authController;