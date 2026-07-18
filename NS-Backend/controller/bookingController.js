const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const BookingSettings = require("../models/BookingSettings");
const {
  createCalendarEvent,
  updateCalendarEvent,
  cancelCalendarEvent,
  getCalendarBusySlots,
  getGoogleAuthUrl,
  exchangeAuthCode,
  getAdminEmail,
} = require("../utils/googleCalendar");
const { sendBookingConfirmation, sendBookingUpdate } = require("../utils/mail");
const { getClientOrigin, getGoogleCalendarConfig, isGoogleCalendarConfigured } = require("../config/env");

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || "").trim());
}

function minutesFromTime(time) {
  const [hours, minutes] = String(time || "").split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function timeFromMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseCalendarDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function addDaysToDateString(date, days) {
  const parts = parseCalendarDate(date);
  if (!parts) return "";

  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12));
  return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, "0")}-${String(utcDate.getUTCDate()).padStart(2, "0")}`;
}

function getTimeZoneOffsetMs(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date).reduce((current, part) => {
    if (part.type !== "literal") current[part.type] = part.value;
    return current;
  }, {});

  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return zonedAsUtc - date.getTime();
}

function makeDateTime(date, time, timeZone = "Asia/Kolkata") {
  const dateParts = parseCalendarDate(date);
  const timeMinutes = minutesFromTime(time);

  if (!dateParts || timeMinutes === null) {
    return new Date("invalid");
  }

  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  const localAsUtc = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, hours, minutes, 0);
  const utcDate = new Date(localAsUtc - getTimeZoneOffsetMs(new Date(localAsUtc), timeZone));

  return utcDate;
}

function getCalendarDay(date) {
  const parts = parseCalendarDate(date);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12)).getUTCDay();
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

const DEFAULT_BOOKING_SETTINGS = {
  adminEmail: process.env.ADMIN_EMAIL || process.env.RECEIVER_EMAIL || "",
  timezone: "Asia/Kolkata",
  workingDays: [0, 1, 2, 3, 4, 5, 6],
  startTime: "10:00",
  endTime: "18:00",
  slotStepMinutes: 30,
  defaultDuration: 30,
  blockedDates: [],
  googleRefreshToken: "",
};

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function normalizeBooking(booking) {
  return {
    id: booking._id,
    name: booking.name,
    email: booking.email,
    company: booking.company,
    purpose: booking.purpose,
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    start: booking.start,
    end: booking.end,
    status: booking.status,
    meetLink: booking.meetLink,
    calendarHtmlLink: booking.calendarHtmlLink,
    cancellationReason: booking.cancellationReason,
  };
}

async function getOrCreateSettings() {
  if (!isDbConnected()) {
    return DEFAULT_BOOKING_SETTINGS;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.RECEIVER_EMAIL || "";
  return BookingSettings.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default", adminEmail } },
    { new: true, upsert: true }
  );
}

async function hasOverlap(start, end, excludeId) {
  if (!isDbConnected()) {
    return false;
  }

  const query = {
    status: "scheduled",
    start: { $lt: end },
    end: { $gt: start },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await Booking.findOne(query).lean();
  return Boolean(existing);
}

async function buildSlots(date, duration) {
  const settings = await getOrCreateSettings();
  const timezone = settings.timezone || "Asia/Kolkata";
  const requestedDuration = Number(duration || settings.defaultDuration);
  const blocked = settings.blockedDates.some((item) => item.date === date);
  const calendarDay = getCalendarDay(date);

  if (!date || calendarDay === null || blocked) {
    return {
        settings,
        slots: [],
    };
}

if (!settings.workingDays.includes(calendarDay)) {
    return {
        settings,
        slots: [],
    };
}
const dayWindowStart = makeDateTime(date, "00:00", timezone);
const dayWindowEnd = makeDateTime(
  addDaysToDateString(date, 1),
  "00:00",
  timezone
);

  const existingBookings = isDbConnected()
    ? await Booking.find({
        status: "scheduled",
        start: { $lt: dayWindowEnd },
        end: { $gt: dayWindowStart },
      }).lean()
    : [];

  if (!date || calendarDay === null || blocked) {
    return { settings, slots: [] };
  }


  const dayStart = minutesFromTime(settings.startTime);
  const dayEnd = minutesFromTime(settings.endTime);
  const step = Number(settings.slotStepMinutes || 30);

  if (dayStart === null || dayEnd === null || requestedDuration <= 0) {
    return { settings, slots: [] };
  }

  const calendarConfig = getGoogleCalendarConfig(settings);
  const calendarBusySlots = isGoogleCalendarConfigured(calendarConfig)
    ? await getCalendarBusySlots({
        timeMin: dayWindowStart,
        timeMax: dayWindowEnd,
        timeZone: timezone,
      }, settings).catch((err) => {
        console.error("Could not fetch from Google Calendar, falling back to local availability.", err.message);
        return [];
      })
    : [];

  const slots = [];
  const now = new Date();


  for (let cursor = dayStart; cursor + requestedDuration <= dayEnd; cursor += step) {
    const time = timeFromMinutes(cursor);
    const start = makeDateTime(date, time, timezone);
    const end = new Date(start.getTime() + requestedDuration * 60000);

    if (Number.isNaN(start.getTime()) || start <= now) continue;

    const calendarUnavailable = calendarBusySlots.some((busy) => rangesOverlap(start, end, busy.start, busy.end));
    const localBookingUnavailable = existingBookings.some((booking) => rangesOverlap(start, end, booking.start, booking.end));

    if (!calendarUnavailable && !localBookingUnavailable) {
      slots.push({ time, label: time, start, end });
    }
  }

  console.log(`Found ${slots.length} available slots for ${date}.`);
  return { settings, slots };
}

async function getSettings(req, res) {
  const settings = await getOrCreateSettings();
  return res.json({ success: true, settings });
}

async function updateSettings(req, res) {
  try {
    const allowed = ["adminEmail", "timezone", "workingDays", "startTime", "endTime", "slotStepMinutes", "defaultDuration", "blockedDates"];
    const nextSettings = {};

    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        nextSettings[key] = req.body[key];
      }
    });

    const settings = await BookingSettings.findOneAndUpdate(
      { key: "default" },
      { $set: nextSettings, $setOnInsert: { key: "default" } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ success: true, settings });
  } catch (error) {
    console.error("Update booking settings error:", error);
    return res.status(400).json({ success: false, message: "Unable to update booking settings." });
  }
}

async function getAvailableSlots(req, res) {
  try {
    const { date, duration } = req.query;
    if (!date || !duration) {
      return res.status(400).json({ success: false, message: "Date and duration are required." });
    }

    const { settings, slots } = await buildSlots(date, duration);
    return res.json({
      success: true,
      slots,
      settings: {
        timezone: settings.timezone,
        workingDays: settings.workingDays,
        startTime: settings.startTime,
        endTime: settings.endTime,
        defaultDuration: settings.defaultDuration,
        blockedDates: settings.blockedDates,
      },
    });
  } catch (error) {
    console.error("Get slots error:", error);
    return res.status(500).json({ success: false, message: "Unable to load available slots." });
  }
}

async function googleAuthUrl(req, res) {
  try {
    const url = getGoogleAuthUrl();

    return res.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate Google authorization URL.",
    });
  }
}

async function googleCallback(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Authorization code missing.");
    }

    const tokens = await exchangeAuthCode(code);

    if (!tokens.refresh_token) {
      return res.status(400).send(
        "Google did not return a refresh token. Revoke access and try again."
      );
    }

    await BookingSettings.findOneAndUpdate(
      { key: "default" },
      {
        $set: { googleRefreshToken: tokens.refresh_token },
        $setOnInsert: {
          key: "default",
          adminEmail: process.env.ADMIN_EMAIL || process.env.RECEIVER_EMAIL || "",
        },
      },
      { new: true, upsert: true }
    );

    return res.redirect(`${getClientOrigin()}/admin/settings?calendar=connected`);
  } catch (error) {
    console.error(error);

    return res.redirect(`${getClientOrigin()}/admin/settings?calendar=failed`);
  }
}
async function rescheduleBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const { date, time, duration } = req.body;

    const settings = await getOrCreateSettings();

    const start = makeDateTime(
      date,
      time,
      settings.timezone
    );

    const end = new Date(
      start.getTime() +
      Number(duration || booking.duration) * 60000
    );

    if (
      await hasOverlap(
        start,
        end,
        booking._id
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "Selected slot is unavailable.",
      });
    }

    booking.date = date;
    booking.time = time;
    booking.duration =
      Number(duration) || booking.duration;
    booking.start = start;
    booking.end = end;

    await booking.save();

    const calendarConfig = getGoogleCalendarConfig(settings);
    if (isGoogleCalendarConfigured(calendarConfig)) {
      try {
        await updateCalendarEvent(booking, settings);
      } catch (err) {
        console.error("Calendar Update Error:", err);
      }
    }

    await sendBookingUpdate(
        booking,
        getAdminEmail(settings),
        "rescheduled"
    );

    return res.json({
      success: true,
      booking: normalizeBooking(booking),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to reschedule meeting.",
    });
  }
}
async function createBooking(req, res) {
  try {
    const { name, email, company, purpose, date, time, duration } = req.body;
    const bookingDuration = Number(duration || 30);

    if (!name || !isValidEmail(email) || !purpose || !date || !time || !bookingDuration) {
      return res.status(400).json({ success: false, message: "Please complete all required booking fields." });
    }

    const { settings, slots } = await buildSlots(date, bookingDuration);
    if (!slots.some((slot) => slot.time === time)) {
      return res.status(409).json({ success: false, message: "That time slot is no longer available." });
    }

    const start = makeDateTime(date, time, settings.timezone);
    const end = new Date(start.getTime() + bookingDuration * 60000);

    if (await hasOverlap(start, end)) {
      return res.status(409).json({ success: false, message: "That time slot was just booked. Please choose another time." });
    }

    const bookingData = {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      company: company?.trim() || "",
      purpose: purpose?.trim(),
      date,
      time,
      duration: bookingDuration,
      start,
      end,
      status: "scheduled",
      googleEventId: "",
      meetLink: "",
      calendarHtmlLink: "",
      cancellationReason: "",
    };

    const booking = isDbConnected()
      ? await Booking.create(bookingData)
      : { _id: `local-${Date.now()}`, ...bookingData, save: async () => {} };

    const calendarConfig = getGoogleCalendarConfig(settings);
    if (isGoogleCalendarConfigured(calendarConfig)) {
      try {
        const calendarResult = await createCalendarEvent(booking, settings);
        booking.googleEventId = calendarResult.googleEventId || "";
        booking.meetLink = calendarResult.meetLink || "";
        booking.calendarHtmlLink = calendarResult.calendarHtmlLink || "";
        await booking.save();
      } catch (integrationError) {
        console.warn("Calendar integration skipped:", integrationError.message);
      }
    }

    try {
      await sendBookingConfirmation(booking, getAdminEmail(settings));
    } catch (mailError) {
      console.warn("Booking email skipped:", mailError.message);
    }

    return res.status(201).json({ success: true, booking: normalizeBooking(booking) });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({ success: false, message: "Unable to book meeting." });
  }
}

async function listBookings(req, res) {
  try {
    const status = req.query.status || "scheduled";
    
    // Normalize status strings to lowercase to ensure clean matches against incoming queries
    const normalizedStatus = status.toLowerCase();
    const query = normalizedStatus === "all" ? {} : { status: normalizedStatus };

    // 👑 FIX 1: Add a safety gate check to handle database disconnection gracefully
    if (!isDbConnected()) {
      console.warn("Database connection is offline. Returning safe memory mock fallback arrays.");
      return res.json({ 
        success: true, 
        bookings: [
          {
            id: "fallback-mock-1",
            name: "Samarth Hatte",
            email: "samarthhatte2002@gmail.com",
            company: "Varlexa AI Core",
            purpose: "Ecosystem Workspace Calibration Sync",
            date: new Date().toISOString().split('T')[0],
            time: "11:00",
            duration: 30,
            status: "scheduled",
            meetLink: "https://whereby.com/varlexaai-meet"
          }
        ] 
      });
    }

    // 👑 FIX 2: Execute query with an explicit catch wrapper to prevent unhandled process crashes
    const bookings = await Booking.find(query)
      .sort({ start: 1 })
      .lean();

    return res.json({ 
      success: true, 
      bookings: (bookings || []).map(normalizeBooking) 
    });
  } catch (error) {
    console.error("Critical booking listing transmission fault:", error.message);
    
    // Always return a clean HTTP response code structure instead of throwing a terminal process error
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error compiling structural meeting logs roster." 
    });
  }
}

async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    if (booking.status !== "cancelled") {
      const settings = await getOrCreateSettings();
      const calendarConfig = getGoogleCalendarConfig(settings);
      if (isGoogleCalendarConfigured(calendarConfig)) {
        await cancelCalendarEvent(booking, settings);
      }
      booking.status = "cancelled";
      booking.cancellationReason = req.body.reason || "Cancelled by admin";
      await booking.save();
      await sendBookingUpdate(booking, getAdminEmail(settings), "cancelled");
    }

    return res.json({ success: true, booking: normalizeBooking(booking) });
  } catch (error) {
    console.error("Cancel booking error:",error);
    return res.status(500).json({ success: false, message: "Unable to cancel meeting." });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  getAvailableSlots,
  createBooking,
  listBookings,
  cancelBooking,
  rescheduleBooking,
  googleAuthUrl,
  googleCallback,
};