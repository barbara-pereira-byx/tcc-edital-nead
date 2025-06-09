import * as admin from 'firebase-admin';

// Verificar se o app já foi inicializado para evitar inicializações múltiplas
let app: admin.app.App;

try {
  app = admin.app();
} catch (error) {
  // Verificar se as credenciais estão disponíveis
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } else {
    // Inicializar com configuração mínima para evitar erros durante o build
    app = admin.initializeApp();
  }
}

export const adminStorage = admin.storage(app);
export default app;