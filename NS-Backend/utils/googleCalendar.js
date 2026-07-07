const { OAuth2Client } = require("google-auth-library");
const { getGoogleCalendarConfig } = require("../config/env");

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

function getAdminEmail(settings) {
  return getGoogleCalendarConfig(settings).adminEmail;
}

function hasUsableRefreshToken(settings = {}) {
  const token = getGoogleCalendarConfig(settings).refreshToken;
  const isPlaceholder = token === "generated-refresh-token" || token === "your-google-refresh-token";
  return Boolean(token && !isPlaceholder);
}

function isGoogleCalendarConfigured(settings = {}) {
  const config = getGoogleCalendarConfig(settings);
  return Boolean(config.clientId && config.clientSecret && hasUsableRefreshToken(settings));
}

function getOAuthClient(settings = {}) {
  const config = getGoogleCalendarConfig(settings);

  if (!config.clientId || !config.clientSecret || !hasUsableRefreshToken(settings)) {
    return null;
  }

  const client = new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
  client.setCredentials({ refresh_token: config.refreshToken });
  return client;
}

function getGoogleAuthUrl() {
  const config = getGoogleCalendarConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const client = new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.freebusy",
    ],
  });
}

async function exchangeAuthCode(code) {
  const config = getGoogleCalendarConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const client = new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens;
}

async function getCalendarBusySlots({ timeMin, timeMax, timeZone }, settings = {}) {
  const client = getOAuthClient(settings);
  if (!client) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const calendarId = getGoogleCalendarConfig(settings).calendarId;
  const response = await client.request({
    url: `${CALENDAR_API}/freeBusy`,
    method: "POST",
    data: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone,
      items: [{ id: calendarId }],
    },
  });

  const calendar = response.data.calendars?.[calendarId];
  if (calendar?.errors?.length) {
    throw new Error(calendar.errors[0]?.reason || "Unable to read Google Calendar availability.");
  }

  return (calendar?.busy || []).map((busy) => ({
    start: new Date(busy.start),
    end: new Date(busy.end),
  }));
}

async function createCalendarEvent(booking, settings) {
  const client = getOAuthClient(settings);
  if (!client) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const adminEmail = getAdminEmail(settings);
  if (!adminEmail) {
    throw new Error("Admin email is not configured.");
  }

  // 🚀 Defined your custom static testing room link directly
  const WHEREBY_LINK = "https://whereby.com/varlexaai-meet";

  const calendarId = getGoogleCalendarConfig(settings).calendarId;
  const event = {
    summary: `Varlexa AI Meeting - ${booking.company || booking.name}`,
    // 🎥 Added Whereby link directly inside the calendar event layout details description slot
    description: [
      `Purpose: ${booking.purpose}`,
      `Client: ${booking.name}`,
      `Email: ${booking.email}`,
      `Company: ${booking.company || "N/A"}`,
      `\n🎥 Video Call Link: ${WHEREBY_LINK}`
    ].join("\n"),
    location: WHEREBY_LINK, // 👈 Drops the custom Whereby room link right into the map location box slot
    start: {
      dateTime: booking.start.toISOString(),
      timeZone: settings.timezone,
    },
    end: {
      dateTime: booking.end.toISOString(),
      timeZone: settings.timezone,
    },
    attendees: [{ email: booking.email }, { email: adminEmail }],
    // ✂️ Removed the entire conferenceData object container so Google does not attach Google Meet automatically
  };

  // Removed conferenceDataVersion parameters since we are bypassing custom native video injections
  const response = await client.request({
    url: `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    method: "POST",
    data: event,
  });

  const createdEvent = response.data;
  return {
    googleEventId: createdEvent.id,
    videoLink: WHEREBY_LINK, // 👈 Returns videoLink pointing straight to your Whereby room instead of meetLink
    calendarHtmlLink: createdEvent.htmlLink || "",
  };
}

async function updateCalendarEvent(booking, settings) {
  const client = getOAuthClient(settings);
  if (!client || !booking.googleEventId) return null;

  const adminEmail = getAdminEmail(settings);
  const calendarId = getGoogleCalendarConfig(settings).calendarId;
  const WHEREBY_LINK = "https://whereby.com/varlexaai-meet";

  const response = await client.request({
    url: `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(booking.googleEventId)}?sendUpdates=all`,
    method: "PATCH",
    data: {
      summary: `Varlexa AI Meeting - ${booking.company || booking.name}`,
      description: `Purpose: ${booking.purpose}\nClient: ${booking.name}\nEmail: ${booking.email}\nCompany: ${booking.company || "N/A"}\n\n🎥 Video Call Link: ${WHEREBY_LINK}`,
      location: WHEREBY_LINK, // Keep sync location accurate
      start: { dateTime: booking.start.toISOString(), timeZone: settings.timezone },
      end: { dateTime: booking.end.toISOString(), timeZone: settings.timezone },
      attendees: [{ email: booking.email }, { email: adminEmail }],
    },
  });

  return response.data;
}

async function cancelCalendarEvent(booking, settings = {}) {
  const client = getOAuthClient(settings);
  if (!client || !booking.googleEventId) return;

  const calendarId = getGoogleCalendarConfig(settings).calendarId;

  await client.request({
    url: `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(booking.googleEventId)}?sendUpdates=all`,
    method: "DELETE",
  });
}

module.exports = {
  createCalendarEvent,
  updateCalendarEvent,
  cancelCalendarEvent,
  getCalendarBusySlots,
  getGoogleAuthUrl,
  exchangeAuthCode,
  getAdminEmail,
  isGoogleCalendarConfigured,
};