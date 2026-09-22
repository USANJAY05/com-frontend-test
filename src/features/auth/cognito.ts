import { Amplify } from 'aws-amplify';
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';

const config = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',
  region: import.meta.env.VITE_COGNITO_REGION ?? '',
  domain: import.meta.env.VITE_COGNITO_DOMAIN ?? '',
  redirectSignIn: import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN ?? window.location.origin,
  redirectSignOut: import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT ?? window.location.origin,
};

let configured = false;
export function isCognitoConfigured() {
  return Boolean(config.userPoolId && config.userPoolClientId && config.region && config.domain);
}
export function configureCognito() {
  if (configured || !isCognitoConfigured()) return;
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        loginWith: {
          oauth: {
            domain: config.domain,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [config.redirectSignIn],
            redirectSignOut: [config.redirectSignOut],
            responseType: 'code',
          },
        },
      },
    },
  });
  configured = true;
}
export async function signInWithCognito(provider?: 'Google' | 'Facebook' | 'Amazon' | 'Apple') {
  configureCognito();
  await signInWithRedirect(provider ? { provider } : undefined);
}
export async function getCognitoToken() {
  configureCognito();
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? session.tokens?.accessToken?.toString() ?? '';
}
export async function getCognitoUser() {
  configureCognito();
  try { return await getCurrentUser(); } catch { return null; }
}
export async function signOutCognito() {
  configureCognito();
  await signOut({ global: true });
}
