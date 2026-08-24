import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, doc, getDocFromServer } from 'firebase/firestore';
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

// Optional: run dev builds against the local Firebase emulators instead of the
// live project, so local work never touches real accounts or data. Opt-in via
// VITE_USE_FIREBASE_EMULATOR — a plain `vite` run still uses the real backend.
// Must happen before the first Auth/Firestore call (testConnection below).
if (import.meta.env.DEV && env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const host = env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
  const authPort = Number(env.VITE_AUTH_EMULATOR_PORT || 9099);
  const firestorePort = Number(env.VITE_FIRESTORE_EMULATOR_PORT || 8080);
  connectAuthEmulator(auth, `http://${host}:${authPort}`);
  connectFirestoreEmulator(db, host, firestorePort);
}

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

// Short, user-safe copy per Firestore error code. Everything diagnostic goes to
// the console; nothing here leaks the caller's identity or the document path.
function userMessageFor(error: unknown, operationType: OperationType): string {
  const code = (error as { code?: string })?.code ?? "";
  const writing = operationType !== OperationType.GET && operationType !== OperationType.LIST;

  switch (code) {
    case "permission-denied":
      return "You don't have permission to do that. If this looks wrong, refresh and try again.";
    case "unavailable":
    case "deadline-exceeded":
      return "We couldn't reach the server. Check your connection and try again.";
    case "resource-exhausted":
      return "The app is busy right now. Please wait a moment and try again.";
    case "failed-precondition":
      return "That didn't go through. Refresh the page and try again.";
    case "not-found":
      return "We couldn't find that — it may have been deleted.";
    default:
      return writing
        ? "Something went wrong saving your changes. Please try again."
        : "Something went wrong loading that. Please try again.";
  }
}

/**
 * Logs the full diagnostic payload and returns a short message safe to render.
 *
 * This deliberately does NOT throw. The previous `handleFirestoreError` threw,
 * but every call site used it as if it returned a string — so the throw escaped
 * from inside the `catch` block, the error message was never displayed, and the
 * user watched a spinner stop with no explanation. It also stringified the
 * user's email and uid into text meant for the screen.
 */
export function formatFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): string {
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
  return userMessageFor(error, operationType);
}
