import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: any
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  req.user = jwt.verify(token, process.env.JWT_SECRET as string)
  next()
}
