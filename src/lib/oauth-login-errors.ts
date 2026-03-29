/** Messages for `?error=` returned by Auth.js on the sign-in page after OAuth/callback failures. */
export const OAUTH_ERROR_FALLBACK =
  "Sign-in did not complete. Please try again." as const;

export const oauthErrorMessages: Record<string, string> = {
  Configuration:
    "Server sign-in configuration is wrong (often AUTH_SECRET, DATABASE_URL, or OAuth redirect URL). Check Vercel env vars and redeploy.",
  AccessDenied: "Access was denied. Try another account or sign-in method.",
  Verification: "The sign-in link expired or was already used.",
  Signin: "Sign-in could not start. Check Google OAuth settings and try again.",
  OAuthSignin: "Could not start the Google sign-in flow. Check OAuth client ID/secret on the server.",
  OAuthCallback: "Google returned an error or the callback URL does not match Google Cloud exactly.",
  OAuthCallbackError:
    "Google sign-in was interrupted. Confirm the authorized redirect URI matches your site + /api/auth/callback/google.",
  OAuthCreateAccount: "Could not create an account from this provider.",
  EmailCreateAccount: "Could not create an account with email.",
  Callback: "Something went wrong during sign-in after Google.",
  OAuthAccountNotLinked:
    "This email is already registered. Sign in with your password first.",
  SessionRequired: "Please sign in to continue.",
  CredentialsSignin: "Invalid email or password.",
  EmailSignin: "The e-mail could not be sent.",
  default: OAUTH_ERROR_FALLBACK,
};

export function messageForOAuthError(code: string | null): string | null {
  if (!code) return null;
  return oauthErrorMessages[code] ?? OAUTH_ERROR_FALLBACK;
}
