import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  isVerified: boolean
  verificationToken?: string
  verificationTokenExpiry?: Date
  resetToken?: string
  resetTokenExpiry?: Date
}

const UserSchema = new Schema<IUser>({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetToken: String,
  resetTokenExpiry: Date,
})

export default mongoose.model<IUser>('User', UserSchema)
