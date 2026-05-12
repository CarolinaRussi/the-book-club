import { google } from "googleapis";
import * as userRepository from "../repositories/userRepository";
import { decryptGoogleRefreshToken } from "./googleTokenCrypto";
import { getGoogleOAuthWebCredentials } from "../services/googleOAuthService";

export class GoogleCalendarNotConnectedError extends Error {
  constructor(message = "Utilizador sem Google Calendar ligado.") {
    super(message);
    this.name = "GoogleCalendarNotConnectedError";
  }
}

export async function getCalendarClientForUserId(userId: string) {
  const u = await userRepository.findUserById(userId);
  if (!u?.googleRefreshToken) {
    throw new GoogleCalendarNotConnectedError();
  }
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthWebCredentials();
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2.setCredentials({
    refresh_token: decryptGoogleRefreshToken(u.googleRefreshToken),
  });
  const calendar = google.calendar({ version: "v3", auth: oauth2 });
  const calendarId = u.googleCalendarId?.trim() || "primary";
  return { calendar, calendarId };
}
