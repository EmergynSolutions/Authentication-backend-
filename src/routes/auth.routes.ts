import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User'
import { sendVerificationEmail } from '../services/email.service'

const router = Router()

// REGISTER
router.post('/register', async (req: Request, res: Response) => {
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
})

// LOGIN
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' })

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email before logging in' })
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  })

  res.json({ token })
})

// FORGOT PASSWORD
router.post('/forgot-password', async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.json({ message: 'Email sent if exists' })

  const token = crypto.randomBytes(32).toString('hex')
  user.resetToken = token
  user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)
  await user.save()

  res.json({ resetToken: token })
})

// RESET PASSWORD
router.post('/reset-password/:token', async (req: Request, res: Response) => {
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
})

// VERIFY EMAIL
router.post('/verify-email/:token', async (req: Request, res: Response) => {
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
})

export default router
