import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, profiles } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, userType } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
    }).returning();

    // Determine role
    const role = userType === 'technician' ? 'technician' : 'customer';

    // Create profile
    await db.insert(profiles).values({
      id: newUser.id,
      name,
      phone: phone || null,
      role,
      email,
      activeRole: role,
      availableRoles: [role],
    });

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name,
        role,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: profile?.activeRole || 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name,
        role: profile?.activeRole || 'customer',
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    
    const [user] = await db.select().from(users).where(eq(users.id, userId!)).limit(1);
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId!)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: profile?.name,
      phone: profile?.phone,
      role: profile?.activeRole || 'customer',
      availableRoles: profile?.availableRoles || ['customer'],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
