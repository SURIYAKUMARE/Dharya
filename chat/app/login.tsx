import AuthScreen from './auth';

/**
 * Route: /login
 * Reuses the existing authentication screen directly without duplicating code.
 */
export default function LoginRoute() {
  return <AuthScreen />;
}
