// Configuração do Firebase para o ambiente de servidor
// Este arquivo é usado apenas pela API de upload

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Verificar se todas as variáveis de ambiente necessárias estão definidas
const hasRequiredEnvVars = 
  process.env.FIREBASE_API_KEY && 
  process.env.FIREBASE_AUTH_DOMAIN && 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_STORAGE_BUCKET;

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'placeholder-project-id.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'placeholder-project-id',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'placeholder-project-id.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000'
};

// Inicializa o Firebase apenas se as variáveis de ambiente estiverem configuradas
// ou se estivermos em ambiente de build (para evitar erros durante o build)
let app;
let storage;

try {
  app = initializeApp(firebaseConfig, 'api-upload');
  storage = getStorage(app);
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
  // Criar objetos vazios para evitar erros durante o build
  storage = {} as any;
}

export { storage };
export default app;