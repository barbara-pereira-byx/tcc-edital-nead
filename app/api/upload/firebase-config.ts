// Configuração do Firebase para o ambiente de servidor
// Este arquivo é usado apenas pela API de upload

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig, 'api-upload');

// Inicializa o Firebase Storage
export const storage = getStorage(app);

export default app;