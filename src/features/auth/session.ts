import keycloak from './keycloak';
import { identityAuth } from './firebase';
import { configureCognito, getCognitoToken } from './cognito';

const provider = String(import.meta.env.VITE_AUTH_PROVIDER || 'cognito').toLowerCase();

export async function getSessionToken(): Promise<string | null> {
  if (provider === 'cognito') { try { configureCognito(); return await getCognitoToken(); } catch { return null; } }
  if (provider === 'identity_platform') {
    const user = identityAuth?.currentUser;
    if (!user) return null;
    try { return await user.getIdToken(); } catch { return null; }
  }
  if (!keycloak.authenticated) return null;
  try { await keycloak.updateToken(10); } catch { return null; }
  return keycloak.token ?? null;
}

export function getSessionTokenSync(): string | null {
  if (provider === 'identity_platform' || provider === 'cognito') return null;
  return keycloak.token ?? null;
}
