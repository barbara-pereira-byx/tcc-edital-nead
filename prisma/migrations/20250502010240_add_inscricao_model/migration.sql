-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inscricao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inscricao_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
