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

  // Use the exact Amplify v6 OAuth configuration shape. Keep this object
  // minimal while testing the business application so an optional OAuth
  // setting cannot break sign-in before Cognito is reached.
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        loginWith: {
          oauth: {
            domain: String(config.domain).trim().replace(/^https?:\/\//, '').replace(/\/+$/, ''),
            scopes: ['openid', 'email'],
            redirectSignIn: [String(config.redirectSignIn).trim()],
            redirectSignOut: [String(config.redirectSignOut).trim()],
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
  if (provider) { await signInWithRedirect({ provider }); return; }\n  await signInWithRedirect();
}
export async function getCognitoToken() {
  configureCognito();
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? session.tokens?.accessToken?.toString() ?? '';
}
export async function getCognitoUser() {
  configureCognito();
  try {
    // For OAuth/Hosted UI sessions, use the ID-token claims for the profile.
    // Do not call fetchUserAttributes() during bootstrap: that can hit
    // Cognito's UserInfo endpoint and fail when the access token scopes do
    // not match the endpoint requirements. Authentication itself is valid.
    return await getCurrentUser();
  } catch { return null; }
}
export async function signOutCognito() {
  configureCognito();

  // Set this before clearing the local session. The auth provider checks it
  // after Cognito redirects back so it never starts a fresh login immediately.
  sessionStorage.setItem('cognito_logout_requested', '1');
  sessionStorage.removeItem('cognito_signin_attempted');

  try {
    // Revoke the user's Cognito tokens globally. This is separate from the
    // Hosted UI cookie logout below: global sign-out invalidates the existing
    // tokens while the Hosted UI endpoint clears the browser SSO cookie.
    await signOut({ global: true });
  } catch (err) {
    // Continue to Hosted UI logout even if token revocation fails.
    console.warn('Cognito global sign-out failed; continuing with Hosted UI logout:', err);
  }

  const domain = config.domain.replace(/\/+$/, '');
  const logoutUri = config.redirectSignOut;
  const hostedLogoutUrl =
    `${domain}/logout?client_id=${encodeURIComponent(config.userPoolClientId)}`
    + `&logout_uri=${encodeURIComponent(logoutUri)}`;

  // Cognito's /logout endpoint is required to clear the Hosted UI session
  // cookie. Redirect instead of opening it in a new tab so the browser's SSO
  // session is actually terminated before the app returns to /login.
  window.location.replace(hostedLogoutUrl);
}
