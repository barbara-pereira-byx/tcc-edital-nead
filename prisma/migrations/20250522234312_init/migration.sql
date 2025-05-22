-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edital" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPublicacao" TIMESTAMP(3) NOT NULL,
    "dataEncerramento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "Edital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArquivoEdital" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "editalId" TEXT,

    CONSTRAINT "ArquivoEdital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formulario" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "editalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampoFormulario" (
    "id" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "tipo" INTEGER NOT NULL,
    "obrigatorio" INTEGER NOT NULL,
    "formularioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampoFormulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormularioUsuario" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "formularioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormularioUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormularioUsuarioCampo" (
    "id" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "campoFormularioId" TEXT NOT NULL,
    "formularioUsuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormularioUsuarioCampo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArquivoUsuario" (
    "id" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "nomeArmazenado" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "campoId" TEXT,
    "inscricaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArquivoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Formulario_editalId_key" ON "Formulario"("editalId");

-- CreateIndex
CREATE UNIQUE INDEX "ArquivoUsuario_campoId_key" ON "ArquivoUsuario"("campoId");

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoEdital" ADD CONSTRAINT "ArquivoEdital_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulario" ADD CONSTRAINT "Formulario_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampoFormulario" ADD CONSTRAINT "CampoFormulario_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "Formulario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormularioUsuario" ADD CONSTRAINT "FormularioUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormularioUsuario" ADD CONSTRAINT "FormularioUsuario_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "Formulario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormularioUsuarioCampo" ADD CONSTRAINT "FormularioUsuarioCampo_campoFormularioId_fkey" FOREIGN KEY ("campoFormularioId") REFERENCES "CampoFormulario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormularioUsuarioCampo" ADD CONSTRAINT "FormularioUsuarioCampo_formularioUsuarioId_fkey" FOREIGN KEY ("formularioUsuarioId") REFERENCES "FormularioUsuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoUsuario" ADD CONSTRAINT "ArquivoUsuario_campoId_fkey" FOREIGN KEY ("campoId") REFERENCES "FormularioUsuarioCampo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoUsuario" ADD CONSTRAINT "ArquivoUsuario_inscricaoId_fkey" FOREIGN KEY ("inscricaoId") REFERENCES "FormularioUsuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
