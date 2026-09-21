// Backward-compatible export. New code should import AuthProvider/useAuth from AuthProvider.tsx.
export { AuthProvider as KeycloakProvider, useAuth } from './AuthProvider';
export type { AuthUser } from './AuthProvider';
