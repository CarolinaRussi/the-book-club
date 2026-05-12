import type { Request, Response } from "express";
import {
  completeGoogleOAuth,
  GoogleOAuthConfigError,
  GoogleOAuthExchangeError,
  GoogleOAuthMissingRefreshError,
  GoogleOAuthStateError,
} from "../../services/googleOAuthService";

function appendQuery(
  base: string,
  params: Record<string, string>,
): string {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) {
    u.searchParams.set(k, v);
  }
  return u.toString();
}

export const getGoogleOAuthCallback = async (
  req: Request,
  res: Response,
) => {
  const successUrl = process.env.GOOGLE_OAUTH_SUCCESS_REDIRECT?.trim();
  const errorBase =
    process.env.GOOGLE_OAUTH_ERROR_REDIRECT?.trim() ?? successUrl;

  const failRedirect = (reason: string) => {
    if (!errorBase) {
      return res.status(503).send("GOOGLE_OAUTH_ERROR_REDIRECT não definido");
    }
    return res.redirect(
      302,
      appendQuery(errorBase, { google: "error", reason }),
    );
  };

  if (!successUrl) {
    return res
      .status(503)
      .send("GOOGLE_OAUTH_SUCCESS_REDIRECT não definido");
  }

  if (typeof req.query.error === "string") {
    return failRedirect(req.query.error);
  }

  const code = req.query.code;
  const state = req.query.state;
  if (typeof code !== "string" || typeof state !== "string") {
    return failRedirect("missing_code_or_state");
  }

  try {
    await completeGoogleOAuth(code, state);
    return res.redirect(
      302,
      appendQuery(successUrl, { google: "connected" }),
    );
  } catch (error) {
    if (error instanceof GoogleOAuthStateError) {
      return failRedirect("invalid_state");
    }
    if (error instanceof GoogleOAuthExchangeError) {
      return failRedirect("token_exchange");
    }
    if (error instanceof GoogleOAuthMissingRefreshError) {
      return failRedirect("missing_refresh_token");
    }
    if (error instanceof GoogleOAuthConfigError) {
      return failRedirect("config");
    }
    console.error(error);
    return failRedirect("server");
  }
};
