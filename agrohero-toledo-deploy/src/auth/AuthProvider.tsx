import React from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

export const auth0Configured = Boolean(domain && clientId && audience);

interface AppAuthContextValue {
  configured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { sub?: string; name?: string; email?: string; picture?: string } | undefined;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | undefined>;
}

const AppAuthContext = React.createContext<AppAuthContextValue>({
  configured: false,
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
  login: async () => undefined,
  logout: () => undefined,
  getAccessToken: async () => undefined,
});

export const useAppAuth = () => React.useContext(AppAuthContext);

const Auth0Bridge: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  return (
    <AppAuthContext.Provider
      value={{
        configured: true,
        isAuthenticated,
        isLoading,
        user,
        login: () => loginWithRedirect(),
        logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
        getAccessToken: () => getAccessTokenSilently(),
      }}
    >
      {children}
    </AppAuthContext.Provider>
  );
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (!auth0Configured) {
    return <AppAuthContext.Provider value={{
      configured: false,
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      login: async () => undefined,
      logout: () => undefined,
      getAccessToken: async () => undefined,
    }}>{children}</AppAuthContext.Provider>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
      }}
      cacheLocation="memory"
      useRefreshTokens
    >
      <Auth0Bridge>{children}</Auth0Bridge>
    </Auth0Provider>
  );
};
