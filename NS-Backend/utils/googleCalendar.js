const { OAuth2Client } = require("google-auth-library");

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

function getCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || "primary";
}

function getAdminEmail(settings) {
  return settings?.adminEmail || process.env.ADMIN_EMAIL || process.env.RECEIVER_EMAIL || "";
}

function hasUsableRefreshToken() {
  const token = String(process.env.GOOGLE_REFRESH_TOKEN || "").trim();
  const isPlaceholder = token === "generated-refresh-token" || token === "your-google-refresh-token";
  return Boolean(token && !isPlaceholder);
}

function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      hasUsableRefreshToken()
  );
}

function getOAuthClient() {
  if (!isGoogleCalendarConfigured()) {
    return null;
  }

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/bookings/google/callback"
  );

  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

function getGoogleAuthUrl() {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/bookings/google/callback"
  );

  return client.generateAuthUrl({
    // 'offline' access type is required to get a refresh token.
    access_type: "offline",
    // 'consent' prompt is required to be sure the user sees the consent screen,
    // which is necessary to get a refresh token on subsequent authorizations.
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.freebusy",
    ],
  });
}

async function exchangeAuthCode(code) {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/bookings/google/callback"
  );

  const { tokens } = await client.getToken(code);
  return tokens;
}

async function getCalendarBusySlots({ timeMin, timeMax, timeZone }) {
  const client = getOAuthClient();
  if (!client) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const calendarId = getCalendarId();
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
  const client = getOAuthClient();
  if (!client) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const adminEmail = getAdminEmail(settings);
  if (!adminEmail) {
    throw new Error("Admin email is not configured.");
  }

  const event = {
    summary: `Varlexa AI Meeting - ${booking.company || booking.name}`,
    description: [
      `Purpose: ${booking.purpose}`,
      `Client: ${booking.name}`,
      `Email: ${booking.email}`,
      `Company: ${booking.company || "N/A"}`,
    ].join("\n"),
    start: {
      dateTime: booking.start.toISOString(),
      timeZone: settings.timezone,
    },
    end: {
      dateTime: booking.end.toISOString(),
      timeZone: settings.timezone,
    },
    attendees: [{ email: booking.email }, { email: adminEmail }],
    conferenceData: {
      createRequest: {
        requestId: `varlexa-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await client.request({
    url: `${CALENDAR_API}/calendars/${encodeURIComponent(getCalendarId())}/events?conferenceDataVersion=1&sendUpdates=all`,
    method: "POST",
    data: event,
  });

  const createdEvent = response.data;
  return {
    googleEventId: createdEvent.id,
    meetLink: createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri || "",
    calendarHtmlLink: createdEvent.htmlLink || "",
  };
}

async function updateCalendarEvent(booking, settings) {
  const client = getOAuthClient();
  if (!client || !booking.googleEventId) return null;

  const adminEmail = getAdminEmail(settings);
  const response = await client.request({
    url: `${CALENDAR_API}/calendars/${encodeURIComponent(getCalendarId())}/events/${encodeURIComponent(booking.googleEventId)}?sendUpdates=all`,
    method: "PATCH",
    data: {
      summary: `Varlexa AI Meeting - ${booking.company || booking.name}`,
      description: `Purpose: ${booking.purpose}\nClient: ${booking.name}\nEmail: ${booking.email}\nCompany: ${booking.company || "N/A"}`,
      start: { dateTime: booking.start.toISOString(), timeZone: settings.timezone },
      end: { dateTime: booking.end.toISOString(), timeZone: settings.timezone },
      attendees: [{ email: booking.email }, { email: adminEmail }],
    },
  });

  return response.data;
}

async function cancelCalendarEvent(booking) {
  const client = getOAuthClient();
  if (!client || !booking.googleEventId) return;

  await client.request({
    url: `${CALENDAR_API}/calendars/${encodeURIComponent(getCalendarId())}/events/${encodeURIComponent(booking.googleEventId)}?sendUpdates=all`,
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
