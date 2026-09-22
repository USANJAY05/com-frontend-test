import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_IDENTITY_PLATFORM_API_KEY ?? '',
  authDomain: import.meta.env.VITE_IDENTITY_PLATFORM_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_IDENTITY_PLATFORM_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_IDENTITY_PLATFORM_APP_ID ?? '',
};

export function isIdentityPlatformConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

let firebaseApp: FirebaseApp | null = null;
let identityAuth: Auth | null = null;

if (isIdentityPlatformConfigured()) {
  firebaseApp = getApps().length ? getApps()[0] : initializeApp(config);
  identityAuth = getAuth(firebaseApp);
}

export { firebaseApp, identityAuth };
