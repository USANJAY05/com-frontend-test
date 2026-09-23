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
            scopes: ['openid', 'email'],
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

  // Mark the browser as intentionally signed out before leaving the app.
  // Cognito's hosted logout redirects back to the application; without this
  // flag CognitoAuthProvider immediately starts a new sign-in redirect when it
  // sees that there is no local session yet, making logout appear ineffective.
  sessionStorage.setItem('cognito_logout_requested', '1');

  try {
    // This clears the Amplify browser session even if the Hosted UI logout
    // endpoint is unavailable or misconfigured.
    await signOut({ global: true });
  } catch (err) {
    console.warn('Cognito global sign-out failed; continuing with local logout:', err);
  }

  const logoutUri = config.redirectSignOut;
  window.location.replace(
    `${config.domain}/logout?client_id=${encodeURIComponent(config.userPoolClientId)}&logout_uri=${encodeURIComponent(logoutUri)}`,
  );
}
