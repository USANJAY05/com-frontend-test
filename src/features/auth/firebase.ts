import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_IDENTITY_PLATFORM_API_KEY ?? '',
  authDomain: import.meta.env.VITE_IDENTITY_PLATFORM_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_IDENTITY_PLATFORM_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_IDENTITY_PLATFORM_APP_ID ?? '',
};

export function isIdentityPlatformConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(config);

export const identityAuth = getAuth(firebaseApp);
