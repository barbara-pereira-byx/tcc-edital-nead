// arquivo: /app/api/ajustar-senha/route.ts
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, novaSenha } = await req.json();

    if (!email || !novaSenha) {
      return NextResponse.json(
        { message: "E-mail e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const senhaRepetida = await compare(novaSenha, usuario.senha);
    if (senhaRepetida) {
      return NextResponse.json(
        { message: "A nova senha não pode ser igual à anterior" },
        { status: 400 }
      );
    }

    const novaSenhaHash = await hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { email },
      data: { senha: novaSenhaHash },
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao ajustar senha:", error);
    return NextResponse.json({ message: "Erro ao ajustar senha" }, { status: 500 });
  }
}
