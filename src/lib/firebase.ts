import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Setting VITE_FIREBASE_PROJECT_ID (plus the other VITE_FIREBASE_* vars, see
// .env.example) points the app at a different Firebase project. With no env
// vars set, the committed applet config is used unchanged.
const env = import.meta.env;
const useEnvConfig = Boolean(env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = useEnvConfig
  ? {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    }
  : appletConfig;

// The applet project stores its data in a named Firestore database, not
// "(default)" — the app breaks if that id isn't passed to initializeFirestore.
// An env-configured project uses VITE_FIREBASE_DATABASE_ID, or the default
// database when unset.
const databaseId = useEnvConfig ? env.VITE_FIREBASE_DATABASE_ID : appletConfig.firestoreDatabaseId;

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
} as any, databaseId);
export const auth = getAuth();

// Validate connection to Firestore as requested by the Firebase Integration guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test: successfully contacted backend server.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection test failed: please check your Firebase configuration or internet connection.");
    } else {
      console.log("Firestore connection test: successfully connected to server (or received standard document not found response).");
    }
  }
}
if (import.meta.env.DEV) {
  testConnection();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
