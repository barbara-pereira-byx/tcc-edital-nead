// server.js ou app.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads'; // Diretório para salvar arquivos
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // Cria a pasta se não existir
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renomeia o arquivo
  }
});

const upload = multer({ storage });

// Endpoint para receber o formulário
app.post('/api/editais', upload.array('arquivos'), (req, res) => {
  const { titulo, codigo, dataPublicacao, dataEncerramento } = req.body;

  // Aqui você pode inserir a lógica para armazenar os dados no banco de dados

  res.json({ message: 'Edital criado com sucesso!', id: 'some-id' });
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});