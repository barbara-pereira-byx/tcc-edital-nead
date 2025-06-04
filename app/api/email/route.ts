// app/api/email/route.ts
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  const { email, nome } = await request.json()

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,       // Ex: seuemail@gmail.com
        pass: process.env.EMAIL_PASS,       // App password (não sua senha de login)
      },
    })

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Bem-vindo(a) ao Portal de Editais - NEAD",
        text: `Olá ${nome},

        Seu cadastro foi realizado com sucesso no Portal de Editais do NEAD!

        Acesse o sistema para visualizar os editais abertos, acompanhar prazos e submeter suas inscrições:
        https://tcc-edital-nead.vercel.app/

        Em caso de dúvidas, entre em contato com a equipe responsável pelo e-mail de suporte informado no site.

        Atenciosamente,
        Equipe NEAD
        `,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Olá <strong>${nome}</strong>,</h2>
            <p>Seu cadastro foi realizado com <strong>sucesso</strong> no <strong>Portal de Editais - NEAD</strong>!</p>
            <p>Agora você pode acessar o sistema para:</p>
            <ul>
                <li>Visualizar os editais disponíveis</li>
                <li>Acompanhar datas de publicação e encerramento</li>
                <li>Realizar e acompanhar suas inscrições</li>
            </ul>
            <p style="margin-top: 20px;">
                🔗 <a href="https://tcc-edital-nead.vercel.app/" target="_blank" style="color: #1a73e8;">Clique aqui para acessar o portal</a>
            </p>
            <hr style="margin: 30px 0;" />
            <p style="font-size: 0.9em; color: #777;">
                Em caso de dúvidas, entre em contato com a equipe de suporte pelo e-mail informado no rodapé do site.
            </p>
            <p style="margin-top: 20px;">Atenciosamente,<br /><strong>Equipe NEAD</strong></p>
            </div>
        `
        }


    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 })
  }
}
