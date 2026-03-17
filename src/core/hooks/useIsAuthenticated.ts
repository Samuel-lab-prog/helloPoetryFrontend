import { useAuthClientStore } from "../stores/useAuthClientStore";

export function useIsAuthenticated(): boolean {
  const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);
  const isAuthenticated = authClientId > 0;
  return isAuthenticated;
}
