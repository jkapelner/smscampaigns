import { Request, Response } from 'express';
import { createAccount, findUserByEmail, createUser } from '../models';
import { hashPassword, comparePassword, generateToken, generateApiKey } from '../utils/auth.js';
import { isValidEmail, getPasswordErrors } from '../utils/validation.js';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const passwordErrors = getPasswordErrors(password);
    if (passwordErrors.length > 0) {
      res.status(400).json({ error: passwordErrors.join('. ') });
      return;
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const apiKey = generateApiKey();

    const newAccount = await createAccount();
    const newUser = await createUser({
      accountId: newAccount.id,
      email,
      password: hashedPassword,
      apiKey,
    });

    const token = generateToken(newUser.id);

    res.status(201).json({
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await findUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        accountId: user.accountId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
