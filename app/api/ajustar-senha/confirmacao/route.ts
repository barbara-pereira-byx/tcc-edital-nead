import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { email, nome } = await req.json()

    if (!email || !nome) {
      return NextResponse.json({ error: "Email e nome são obrigatórios." }, { status: 400 })
    }
    console.log(email)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    })

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Olá,</h2>
        <p>Sua senha foi atualizada com <strong>sucesso</strong> no <strong>Portal de Editais - NEAD</strong>.</p>
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

    const mailOptions = {
      from: `"Portal NEAD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Alteração de senha realizada com sucesso! - NEAD",
      text: `Olá ${nome},

Sua senha foi atualizada com sucesso no Portal de Editais do NEAD!

Acesse: https://tcc-edital-nead.vercel.app/

Se não reconhece esta ação, entre em contato com o suporte.

Atenciosamente,
Equipe NEAD`,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: "E-mail enviado com sucesso." })
  } catch (error: any) {
    console.error("Erro ao enviar e-mail:", error)
    return NextResponse.json({ error: "Erro ao enviar e-mail: " + error.message }, { status: 500 })
  }
}
