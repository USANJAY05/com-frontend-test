# Frontend authentication providers

The frontend supports three selectable authentication providers:

- `VITE_AUTH_PROVIDER=keycloak` — development
- `VITE_AUTH_PROVIDER=identity_platform` — Google Identity Platform / Firebase Auth
- `VITE_AUTH_PROVIDER=cognito` — AWS Cognito Hosted UI

The application exposes the same `useAuth()` contract regardless of provider: `user`, `getToken()`, and `logout()`.

## Cognito

Create a Cognito User Pool and App Client. Enable Hosted UI/OAuth with Authorization Code + PKCE. Configure Google (or another supported social provider) inside Cognito if desired. Add the exact frontend callback and sign-out URLs to the App Client.

Set the corresponding `VITE_COGNITO_*` variables. Never put AWS access keys or service-account credentials in the frontend.
