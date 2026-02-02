import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User'
import { sendVerificationEmail } from '../services/email.service'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    const user = await User.create({
      name,
      email,
      password: hashed,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    try {
      await sendVerificationEmail(email, verificationToken)
      res.json({ message: 'Registration successful. Please check your email to verify your account.' })
    } catch (error) {
      res.status(500).json({ message: 'Registration successful but failed to send verification email' })
    }
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' })
    }
    res.status(500).json({ message: 'Registration failed' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    })

    res.json({ token })
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.json({ message: 'Email sent if exists' })

    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    res.json({ resetToken: token })
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() },
    })

    if (!user) return res.status(400).json({ message: 'Invalid token' })

    user.password = await bcrypt.hash(req.body.password, 10)
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    res.json({ message: 'Password reset success' })
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed' })
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpiry: { $gt: Date.now() },
    })

    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' })

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiry = undefined
    await user.save()

    res.json({ message: 'Email verified successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Email verification failed' })
  }
}
