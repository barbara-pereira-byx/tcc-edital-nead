import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
};

// Inicializa o Firebase apenas se ainda não estiver inicializado
let app;
let storage;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Inicializa o Firebase Storage
  storage = getStorage(app);
  console.log("Firebase Storage inicializado com sucesso");
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
  // Criar um objeto mock para o storage quando o Firebase não puder ser inicializado
  storage = {
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve("") } }),
      getDownloadURL: () => Promise.resolve(""),
      getBytes: () => Promise.resolve(new Uint8Array())
    })
  };
}

export { storage };
export default app;