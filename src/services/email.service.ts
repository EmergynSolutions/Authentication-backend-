import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Verify Your Email - Emergyn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ea580c; font-size: 32px; margin: 0;">Emergyn</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 8px; border: 1px solid #ffedd5;">
          <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for signing up! Please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Verify Email
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #ea580c; font-size: 12px; word-break: break-all;">
            ${verificationUrl}
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours.
          </p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
