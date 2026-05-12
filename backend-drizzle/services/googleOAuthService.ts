import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository";
import { encryptGoogleRefreshToken } from "../utils/googleTokenCrypto";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v2/userinfo";

const STATE_PURPOSE = "google_calendar_oauth";

export class GoogleOAuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleOAuthConfigError";
  }
}

export class GoogleOAuthStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleOAuthStateError";
  }
}

export class GoogleOAuthExchangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleOAuthExchangeError";
  }
}

export class GoogleOAuthMissingRefreshError extends Error {
  constructor() {
    super(
      "O Google não devolveu refresh token. Tente novamente ou revogue o acesso do app em myaccount.google.com e reconecte.",
    );
    this.name = "GoogleOAuthMissingRefreshError";
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new GoogleOAuthConfigError(`Variável de ambiente ${name} não definida`);
  }
  return v.trim();
}

function googleClientId(): string {
  const v =
    process.env.GOOGLE_CLIENT_ID?.trim();
  if (!v) {
    throw new GoogleOAuthConfigError(
      "GOOGLE_CLIENT_ID não definido",
    );
  }
  return v;
}

function googleClientSecret(): string {
  const v =
    process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!v) {
    throw new GoogleOAuthConfigError(
      "GOOGLE_CLIENT_SECRET não definido",
    );
  }
  return v;
}

export function getGoogleOAuthWebCredentials(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  return {
    clientId: googleClientId(),
    clientSecret: googleClientSecret(),
    redirectUri: requireEnv("GOOGLE_OAUTH_REDIRECT_URI"),
  };
}

export function createGoogleOAuthState(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new GoogleOAuthConfigError("JWT_SECRET não definido");
  }
  return jwt.sign({ p: STATE_PURPOSE, sub: userId }, secret, {
    expiresIn: "15m",
  });
}

export function parseGoogleOAuthState(state: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new GoogleOAuthConfigError("JWT_SECRET não definido");
  }
  try {
    const payload = jwt.verify(state, secret) as { p?: string; sub?: string };
    if (payload.p !== STATE_PURPOSE || !payload.sub) {
      throw new GoogleOAuthStateError("State inválido");
    }
    return payload.sub;
  } catch (e) {
    if (e instanceof GoogleOAuthStateError) {
      throw e;
    }
    throw new GoogleOAuthStateError("State inválido ou expirado");
  }
}

export function buildGoogleAuthorizationUrl(state: string): string {
  const clientId = googleClientId();
  const redirectUri = requireEnv("GOOGLE_OAUTH_REDIRECT_URI");
  const scope = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
  ].join(" ");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
};

async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: googleClientId(),
    client_secret: googleClientSecret(),
    redirect_uri: requireEnv("GOOGLE_OAUTH_REDIRECT_URI"),
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new GoogleOAuthExchangeError(text.slice(0, 500));
  }
  return JSON.parse(text) as TokenResponse;
}

async function fetchGoogleAccountEmail(
  accessToken: string,
): Promise<string | null> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { email?: string };
  return data.email ?? null;
}

export async function startGoogleOAuth(userId: string): Promise<string> {
  const state = createGoogleOAuthState(userId);
  return buildGoogleAuthorizationUrl(state);
}

export async function completeGoogleOAuth(code: string, state: string) {
  const userId = parseGoogleOAuthState(state);
  const tokens = await exchangeCodeForTokens(code);
  const existing = await userRepository.findUserById(userId);

  let refreshCiphertext: string;
  if (tokens.refresh_token) {
    refreshCiphertext = encryptGoogleRefreshToken(tokens.refresh_token);
  } else if (existing?.googleRefreshToken) {
    refreshCiphertext = existing.googleRefreshToken;
  } else {
    throw new GoogleOAuthMissingRefreshError();
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  const email = await fetchGoogleAccountEmail(tokens.access_token);

  await userRepository.updateUserGoogleOAuth(userId, {
    googleRefreshToken: refreshCiphertext,
    googleAccessTokenExpiresAt: expiresAt,
    googleCalendarId: "primary",
    googleAccountEmail: email,
  });
}

export async function disconnectGoogleOAuth(userId: string) {
  await userRepository.clearUserGoogleOAuth(userId);
}

export async function getGoogleOAuthStatus(userId: string) {
  const row = await userRepository.findUserById(userId);
  if (!row) {
    return { googleConnected: false, googleAccountEmail: null as string | null };
  }
  return {
    googleConnected: Boolean(row.googleRefreshToken),
    googleAccountEmail: row.googleAccountEmail ?? null,
  };
}
