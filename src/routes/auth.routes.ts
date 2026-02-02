import { Router } from 'express'
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/auth.controller'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/verify-email/:token', verifyEmail)

export default router
