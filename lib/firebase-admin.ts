import * as admin from 'firebase-admin';

// Verificar se o app já foi inicializado para evitar inicializações múltiplas
let app: admin.app.App;

try {
  app = admin.app();
} catch (error) {
  // Se não existir, inicializa com as credenciais
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

export const adminStorage = admin.storage(app);
export default app;