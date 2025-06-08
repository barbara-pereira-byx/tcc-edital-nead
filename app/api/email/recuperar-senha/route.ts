// app/api/email/recuperar-senha/route.ts
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  const { email, nome } = await request.json()

  try {
    const resetLink = `https://tcc-edital-nead.vercel.app/ajustar-senha?email=${encodeURIComponent(email)}`
    
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Redefinição de senha - Sistema de Editais NEAD",
      html: `
        <p>Olá,</p>
        <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Redefinir senha</a>
        </p>
        <p>Se você não fez essa solicitação, pode ignorar este e-mail.</p>
        <p><small>Sistema de Editais NEAD - <a href="https://tcc-edital-nead.vercel.app">https://tcc-edital-nead.vercel.app</a></small></p>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 })
  }
}
