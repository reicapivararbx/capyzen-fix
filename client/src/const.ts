export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export function getLoginUrl(redirectPath?: string) {
  const portalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || '';
  if (!portalUrl) {
    console.warn('[Auth] VITE_OAUTH_PORTAL_URL not configured');
    return '#';
  }
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL('/app-auth', portalUrl);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
}
