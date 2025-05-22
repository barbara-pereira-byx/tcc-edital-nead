-- CreateTable
CREATE TABLE "ArquivoUsuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeOriginal" TEXT NOT NULL,
    "nomeArmazenado" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "campoId" TEXT,
    "inscricaoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArquivoUsuario_campoId_fkey" FOREIGN KEY ("campoId") REFERENCES "FormularioUsuarioCampo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArquivoUsuario_inscricaoId_fkey" FOREIGN KEY ("inscricaoId") REFERENCES "FormularioUsuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ArquivoUsuario_campoId_key" ON "ArquivoUsuario"("campoId");
