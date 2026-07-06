require("dotenv").config();

function getEnv(name, fallback = "") {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).trim();
}

function getBooleanEnv(name, fallback = false) {
  const value = getEnv(name);
  if (!value) {
    return fallback;
  }

  return ["true", "1", "yes", "on"].includes(value.toLowerCase());
}

function getMongoUri() {
  return getEnv("MONGODB_URI") || getEnv("MONGO_URI");
}

function getClientOrigin() {
  return getEnv("CLIENT_ORIGIN", "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getMailConfig() {
  const host = getEnv("SMTP_HOST");
  const port = Number(getEnv("SMTP_PORT") || 0);
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const from = getEnv("MAIL_FROM") || user;
  const recipient = getEnv("ADMIN_EMAIL") || getEnv("RECEIVER_EMAIL");

  return {
    host,
    port,
    secure: getBooleanEnv("SMTP_SECURE", false),
    user,
    pass,
    from,
    recipient,
    isConfigured: Boolean(host && port && user && pass),
  };
}

function getGoogleCalendarConfig(settings = {}) {
  const refreshToken =
    String(settings.googleRefreshToken || "").trim() || getEnv("GOOGLE_REFRESH_TOKEN");

  return {
    clientId: getEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: getEnv(
      "GOOGLE_REDIRECT_URI",
      "http://localhost:5000/api/bookings/google/callback"
    ),
    calendarId: getEnv("GOOGLE_CALENDAR_ID", "primary"),
    adminEmail:
      String(settings.adminEmail || "").trim() ||
      getEnv("ADMIN_EMAIL") ||
      getEnv("RECEIVER_EMAIL"),
    refreshToken,
  };
}

function isGoogleCalendarConfigured(config) {
  return Boolean(config.clientId && config.clientSecret && config.refreshToken);
}

module.exports = {
  getBooleanEnv,
  getClientOrigin,
  getEnv,
  getGoogleCalendarConfig,
  getMailConfig,
  getMongoUri,
  isGoogleCalendarConfigured,
};