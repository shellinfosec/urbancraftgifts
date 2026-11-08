import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================================================================
// 1. Environment Configuration Loader
// ==============================================================================
const prospectiveEnvFiles = [
  path.join(process.cwd(), '.env.local'),
  path.join(__dirname, '.env.local'),
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env')
];

for (const envFile of prospectiveEnvFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
}
dotenv.config();

// ==============================================================================
// 1b. Timezone Enforcement (Indian Standard Time - Asia/Kolkata, UTC+05:30)
// ==============================================================================
export const IST_TIMEZONE = 'Asia/Kolkata';
process.env.TZ = IST_TIMEZONE;

/**
 * Extracts date parts according to the Asia/Kolkata timezone (IST)
 */
export function getISTDateParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(d);
  return Object.fromEntries(parts.map(p => [p.type, p.value]));
}

/**
 * Returns formatted date string in IST: DD/MM/YYYY
 * Example: "28/10/2026"
 */
export function getISTDateString(d = new Date()) {
  const p = getISTDateParts(d);
  return `${p.day}/${p.month}/${p.year}`;
}

/**
 * Returns formatted 24-hr time string in IST: HH:MM:SS
 * Example: "09:20:15"
 */
export function getISTTimeString(d = new Date()) {
  const p = getISTDateParts(d);
  return `${p.hour}:${p.minute}:${p.second}`;
}

/**
 * Returns formatted 12-hr time string in IST: HH:MM:SS AM/PM
 * Example: "09:20:15 AM"
 */
export function getISTTime12String(d = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(d);
}

/**
 * Returns an ISO 8601-formatted timestamp anchored to the IST offset (+05:30)
 * Example: "2026-10-28T09:20:15.123+05:30"
 */
export function getISTISOString(d = new Date()) {
  const p = getISTDateParts(d);
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}.${ms}+05:30`;
}

/**
 * Returns a human-friendly timestamp string in IST
 * Example: "28/10/2026 at 09:20:15 IST"
 */
export function getISTDisplayTimestamp(d = new Date()) {
  return `${getISTDateString(d)} at ${getISTTimeString(d)} IST`;
}

// ==============================================================================
// 2. Structured Logging System
// ==============================================================================
const logDir = path.join(__dirname, process.env.LOG_DIR || 'logs');
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch {}
}

const logFile = path.join(logDir, 'api.log');
const errorLogFile = path.join(logDir, 'api-error.log');

function writeLogToFile(targetFile, level, message, details = null) {
  try {
    const timestamp = getISTISOString();
    const detailsStr = details ? ` | ${typeof details === 'object' ? JSON.stringify(details) : details}` : '';
    const line = `[${timestamp}] [${level}] ${message}${detailsStr}\n`;
    fs.appendFileSync(targetFile, line, 'utf8');
  } catch {
    // Fail-safe: console will still output
  }
}

export const log = {
  info: (msg, ...args) => {
    console.log(`[${getISTISOString()}] [INFO] ${msg}`, ...args);
    writeLogToFile(logFile, 'INFO', msg, args.length ? args : null);
  },
  warn: (msg, ...args) => {
    console.warn(`[${getISTISOString()}] [WARN] ${msg}`, ...args);
    writeLogToFile(logFile, 'WARN', msg, args.length ? args : null);
  },
  error: (msg, ...args) => {
    console.error(`[${getISTISOString()}] [ERROR] ${msg}`, ...args);
    writeLogToFile(errorLogFile, 'ERROR', msg, args.length ? args : null);
  }
};

// ==============================================================================
// 3. Express Application Setup & Hardening
// ==============================================================================
const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';
const startTime = Date.now();

// Disable express identification banner
app.disable('x-powered-by');

// Trust reverse proxy (cPanel Passenger, Cloudflare, Apache, Nginx)
app.set('trust proxy', 1);

// Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Managed by Apache .htaccess / frontend layer
  crossOriginEmbedderPolicy: false
}));

// Strictly bounded payload sizes (100KB is generous for lead JSON, defends against buffer exhaustion)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// ==============================================================================
// 4. CORS Policy
// ==============================================================================
const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'https://grandeurvoyages.com',
  'https://www.grandeurvoyages.com',
  'https://gv2.demo.shellinfosec.com',
  ...allowedOriginsEnv
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (BetterStack health monitors, cURL, internal pings)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = defaultAllowedOrigins.includes(origin);
    const isLocalDev = isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isGrandeurDomain = origin.endsWith('.grandeurvoyages.com') || origin.endsWith('.shellinfosec.com');

    if (isExplicitlyAllowed || isLocalDev || isGrandeurDomain) {
      return callback(null, true);
    }

    log.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
    return callback(new Error('Cross-Origin Request Blocked by Security Policy'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With']
}));

// ==============================================================================
// 5. Lightweight In-Memory Sliding Window Rate Limiter
// ==============================================================================
const requestWindowMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 25; // 25 submissions per IP per 15 min

function rateLimiterMiddleware(req, res, next) {
  const clientIp = getClientIp(req);
  const now = Date.now();
  const clientRecord = requestWindowMap.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientRecord.resetTime) {
    clientRecord.count = 0;
    clientRecord.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  clientRecord.count += 1;
  requestWindowMap.set(clientIp, clientRecord);

  // Periodic garbage collection to maintain small memory footprint
  if (requestWindowMap.size > 2000) {
    for (const [key, record] of requestWindowMap.entries()) {
      if (now > record.resetTime) requestWindowMap.delete(key);
    }
  }

  if (clientRecord.count > MAX_SUBMISSIONS_PER_WINDOW) {
    log.warn(`[RATE LIMIT] IP ${clientIp} exceeded threshold (${clientRecord.count}/${MAX_SUBMISSIONS_PER_WINDOW})`);
    return res.status(429).json({
      success: false,
      error: 'Too many requests submitted from your network. Please wait a few minutes before trying again or reach out directly on WhatsApp.'
    });
  }

  next();
}

// ==============================================================================
// 6. Cloudflare Turnstile Server-Side Verification
// ==============================================================================
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY || '';
const TURNSTILE_BYPASS = process.env.TURNSTILE_BYPASS === 'true';

async function verifyTurnstile(token, clientIp) {
  if (TURNSTILE_BYPASS) {
    log.info('[TURNSTILE] Bypass enabled by environment variable.');
    return { success: true, bypassed: true };
  }

  // Seamless local development bypass: allows testing on localhost without strict domain blocking
  if (
    token === 'cf_dev_dummy_token' ||
    (typeof token === 'string' && token.startsWith('dummy_')) ||
    token === '1x00000000000000000000AA' ||
    (process.env.NODE_ENV !== 'production' && (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost' || clientIp === '::ffff:127.0.0.1'))
  ) {
    log.info(`[TURNSTILE] Local dev test token accepted for IP: ${clientIp}`);
    return { success: true, local_dev: true };
  }

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { success: false, error: 'Verification token is required. Please complete the security check.' };
  }

  if (!TURNSTILE_SECRET) {
    log.warn('[TURNSTILE] TURNSTILE_SECRET is unconfigured in environment. Allowing submission.');
    return { success: true, unconfigured: true };
  }

  if (token.length > 2048) {
    return { success: false, error: 'Malformed verification token.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET);
    formData.append('response', token.trim());
    if (clientIp && clientIp !== 'Unknown IP') {
      formData.append('remoteip', clientIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      log.error(`Turnstile siteverify returned HTTP ${res.status}`);
      return { success: false, error: `Verification service returned HTTP ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    log.error('Turnstile verification network failure:', err.message);
    return { success: false, error: 'Could not connect to Cloudflare verification authority.' };
  }
}

// ==============================================================================
// 7. Atomic Monthly Rotating Fallback Storage
// ==============================================================================
const dataDir = path.join(__dirname, process.env.DATA_DIR || 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {}
}

const rescueFile = path.join(dataDir, 'leads_rescue.jsonl');

// Month names for clean rotating files like "october-2026-leads.json"
const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

function getMonthlyFilePaths(date = new Date()) {
  const p = getISTDateParts(date);
  const monthIndex = parseInt(p.month, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] || 'leads';
  const year = p.year;
  const baseName = `${monthName}-${year}-leads`;
  return {
    jsonFile: path.join(dataDir, `${baseName}.json`),
    jsonlFile: path.join(dataDir, `${baseName}.jsonl`),
    label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
  };
}

// Sequential asynchronous write queue to guarantee zero race conditions on concurrent submissions
let writeQueue = Promise.resolve();
function enqueueWrite(task) {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => {});
  return next;
}

async function saveLeadToStorage(entry) {
  return enqueueWrite(async () => {
    try {
      const { jsonFile, jsonlFile } = getMonthlyFilePaths(new Date(entry.timestamp || Date.now()));

      // 1. Append immediately to append-only JSONL log (ultra-fast, O(1), immune to file corruption)
      await fs.promises.appendFile(jsonlFile, JSON.stringify(entry) + '\n', 'utf8');

      // 2. Read and atomically update the monthly JSON array file
      let list = [];
      let parseSuccess = false;

      if (fs.existsSync(jsonFile)) {
        try {
          const content = await fs.promises.readFile(jsonFile, 'utf8');
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            list = parsed;
            parseSuccess = true;
          }
        } catch (readErr) {
          log.error(`[STORAGE] Failed to parse ${path.basename(jsonFile)}. Preserving file & saving to rescue:`, readErr.message);
          await fs.promises.appendFile(rescueFile, JSON.stringify(entry) + '\n', 'utf8');
          return true;
        }
      } else {
        parseSuccess = true;
      }

      if (parseSuccess) {
        list.push(entry);
        // Write to temporary file, then atomically rename to prevent partial writes during server reboots
        const tmpFile = `${jsonFile}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
        await fs.promises.writeFile(tmpFile, JSON.stringify(list, null, 2), 'utf8');
        await fs.promises.rename(tmpFile, jsonFile);
      }

      log.info(`[STORAGE] Lead [${entry.id}] persisted to monthly file: ${path.basename(jsonFile)}`);
      return true;
    } catch (err) {
      log.error('[STORAGE] Critical write failure:', err.message);
      try {
        await fs.promises.appendFile(rescueFile, JSON.stringify(entry) + '\n', 'utf8');
      } catch {}
      return false;
    }
  });
}

// ==============================================================================
// 8. Nodemailer SMTP Setup
// ==============================================================================
const smtpHost = process.env.SMTP_HOST || 'mail.grandeurvoyages.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER || 'info@grandeurvoyages.com';
const smtpPass = process.env.SMTP_PASS || '';
const isSecure = process.env.SMTP_SECURE !== 'false';

if (!smtpPass) {
  log.warn('[SECURITY NOTICE] SMTP_PASS is unset. Outbound emails will simulate delivery until SMTP credentials are configured in .env.');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass
  },
  tls: {
    rejectUnauthorized: true
  }
});

if (smtpPass) {
  transporter.verify((error) => {
    if (error) {
      log.warn('[SMTP] Transporter verification reported an issue:', error.message);
    } else {
      log.info(`[SMTP] Transporter ready for ${smtpUser} via ${smtpHost}:${smtpPort}`);
    }
  });
}

// ==============================================================================
// 9. Telemetry & Utility Helpers
// ==============================================================================
function getClientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'Unknown IP'
  );
}

function escapeHtml(val) {
  if (val === undefined || val === null) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cleanPhoneNumber(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

function parseDeviceType(ua) {
  const details = parseUserAgentDetails(ua);
  return details.device;
}

function parseUserAgentDetails(ua) {
  if (!ua) return { device: 'Unknown Device', os: 'Unknown OS', browser: 'Unknown Browser' };
  const str = String(ua);
  const lower = str.toLowerCase();

  // Operating System
  let os = 'Unknown OS';
  if (/iphone/i.test(lower)) os = 'iOS (iPhone)';
  else if (/ipad/i.test(lower)) os = 'iPadOS';
  else if (/macintosh|mac os x/i.test(lower)) os = 'macOS';
  else if (/android/i.test(lower)) os = 'Android';
  else if (/windows nt 10\.0/i.test(lower)) os = 'Windows 10/11';
  else if (/windows nt 6\.3/i.test(lower)) os = 'Windows 8.1';
  else if (/windows/i.test(lower)) os = 'Windows';
  else if (/linux/i.test(lower)) os = 'Linux';

  // Device Form Factor
  let device = 'Desktop';
  if (/ipad|tablet/i.test(lower)) device = 'Tablet';
  else if (/mobile|iphone|android.*mobile/i.test(lower)) device = 'Mobile';

  // Browser
  let browser = 'Unknown Browser';
  if (/edg\//i.test(lower)) browser = 'Microsoft Edge';
  else if (/opr\/|opera/i.test(lower)) browser = 'Opera';
  else if (/chrome|crios/i.test(lower)) browser = 'Google Chrome';
  else if (/safari/i.test(lower) && !/chrome/i.test(lower)) browser = 'Apple Safari';
  else if (/firefox|fxios/i.test(lower)) browser = 'Mozilla Firefox';

  return { device, os, browser };
}

function getDestinationMeta(dest) {
  const d = String(dest || '').trim();
  const lower = d.toLowerCase();

  // If empty or consultation fallback, return empty so no false destination badge is shown
  if (!d || lower === 'aria consultation' || lower === 'consultation' || lower === 'not specified' || lower === 'undecided') {
    return {
      name: '',
      displayLabel: '',
      flagUrl: ''
    };
  }
  if (lower.includes('kenya')) {
    return { name: 'Kenya', displayLabel: 'Kenya Safari', flagUrl: 'https://flagcdn.com/w40/ke.png' };
  }
  if (lower.includes('tanzania') || lower.includes('serengeti') || lower.includes('zanzibar')) {
    return { name: 'Tanzania', displayLabel: 'Tanzania Safari', flagUrl: 'https://flagcdn.com/w40/tz.png' };
  }
  if (lower.includes('bali') || lower.includes('indonesia')) {
    return { name: 'Bali', displayLabel: 'Bali / Indonesia', flagUrl: 'https://flagcdn.com/w40/id.png' };
  }
  if (lower.includes('thailand') || lower.includes('bangkok') || lower.includes('phuket')) {
    return { name: 'Thailand', displayLabel: 'Thailand Voyage', flagUrl: 'https://flagcdn.com/w40/th.png' };
  }
  if (lower.includes('vietnam') || lower.includes('hanoi') || lower.includes('saigon')) {
    return { name: 'Vietnam', displayLabel: 'Vietnam Voyage', flagUrl: 'https://flagcdn.com/w40/vn.png' };
  }
  return { name: d, displayLabel: d, flagUrl: 'https://img.icons8.com/ios-filled/50/003a4c/globe--v1.png' };
}

// ==============================================================================
// 9b. IP Geolocation & ISP Network Intelligence
// ==============================================================================
async function lookupIpGeolocation(ip, headers = {}) {
  const isLoopback =
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('::ffff:127.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.');

  if (isLoopback) {
    return {
      location: 'Localhost / Developer Environment',
      isp: 'Internal Loopback Network'
    };
  }

  // Check Cloudflare edge headers first
  const cfCountry = headers['cf-ipcountry'];
  const cfCity = headers['cf-ipcity'];
  const cfRegion = headers['cf-region'] || headers['cf-region-code'];

  // Fast external lookup via ip-api with 1.2s timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,org`, {
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        const parts = [data.city, data.regionName, data.country].filter(Boolean);
        return {
          location: parts.join(', ') || 'Unknown Location',
          isp: data.isp || data.org || 'Unknown ISP'
        };
      }
    }
  } catch {
    // Fall back to Cloudflare edge headers if query timed out
  }

  if (cfCountry) {
    const parts = [cfCity, cfRegion, cfCountry].filter(Boolean);
    return {
      location: parts.join(', ') || cfCountry,
      isp: 'Cloudflare Edge Network'
    };
  }

  return {
    location: 'Location Unavailable',
    isp: 'Unknown Network / ISP'
  };
}

// ==============================================================================
// 10. Minimalist, Elegant, On-Brand HTML Email Notification Generator
// ==============================================================================
function buildConciergeLeadEmail({
  id,
  source,
  isKenyaLanding = false,
  destinationsSelected = [],
  destinationsDisplay = '',
  name,
  email,
  phone,
  destination,
  tripType,
  adultsCount,
  childrenCount,
  childrenAges,
  partySize,
  duration,
  travelMonth,
  travelYear,
  travelWindow,
  propertySegment,
  budget,
  seriousness,
  notes,
  telemetry,
  experience,
  vibe,
  timing
}) {
  const isAria = Boolean(source && source.toLowerCase().includes('aria'));
  const cleanDuration = (() => {
    if (!duration) return 'Custom';
    const s = String(duration).trim();
    if (/days?$/i.test(s)) return s;
    return `${s} Days`;
  })();
  const selectedReserves = destinationsDisplay || (Array.isArray(destinationsSelected) && destinationsSelected.length > 0 ? destinationsSelected.join(', ') : 'Masai Mara');
  const cleanPhone = cleanPhoneNumber(phone);
  const destMeta = getDestinationMeta(destination);
  const journeyTopic = destMeta.name ? `${destMeta.name} voyage` : 'bespoke luxury journey';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        isAria
          ? `Dear ${name || 'Guest'},\n\nThank you for reaching out to Grandeur Voyages via Aria.${destMeta.name ? ` We see you are interested in exploring ${destMeta.name}.` : ''} Our private travel desk has received your callback request and we are delighted to assist you.`
          : `Dear ${name || 'Traveler'},\n\nThank you for reaching out to Grandeur Voyages regarding your ${journeyTopic}. Our private travel desk has received your inquiry and we are delighted to assist you.`
      )}`
    : '';

  const logoUrl = process.env.BRAND_LOGO_URL || 'https://grandeurvoyages.com/assets/brand/gv-logo.webp';
  const siteUrl = process.env.PUBLIC_URL || 'https://grandeurvoyages.com';

  const uaDetails = parseUserAgentDetails(telemetry?.userAgent);
  const deviceType = telemetry?.device || uaDetails.device;
  const osType = uaDetails.os;
  const browserType = uaDetails.browser;
  const formattedDate = telemetry?.submissionDate || getISTDateString();
  const formattedTime = telemetry?.submissionTime || getISTTimeString();

  // Clean custom notes (ignore if it's just the extracted "Requested Experience:")
  const displayNotes = notes && !notes.startsWith('Requested Experience:') ? notes : '';

  // Responsive, on-brand luxury HTML template
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Grandeur Voyages - ${isAria ? 'New Callback Request' : 'New Travel Inquiry'}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Base resets */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      display: block;
      max-width: 100%;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    /* Responsive dark mode: Allow email client to adapt backgrounds naturally without enforcing dark teal */
    @media (prefers-color-scheme: dark) {
      .text-title {
        color: #F8FAFC !important;
      }
      .text-body {
        color: #F1F5F9 !important;
      }
      .text-sub {
        color: #94A3B8 !important;
      }
      .highlight-text {
        color: #38BDF8 !important;
      }
      .highlight-link {
        color: #38BDF8 !important;
      }
      .badge-label {
        color: #F8FAFC !important;
        border-color: #475569 !important;
      }
      .btn-email {
        color: #F8FAFC !important;
        border-color: #475569 !important;
      }
    }
  </style>
</head>
<body class="email-body" style="margin: 0; padding: 24px 12px; background-color: #F8FAFC;">
  <center style="width: 100%; table-layout: fixed;">
    <div style="max-width: 620px; margin: 0 auto; text-align: left;">

      <!-- Outer Card Container -->
      <table role="presentation" width="100%" class="card-wrap" style="background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 58, 76, 0.05);">

        <!-- 1. Header Banner (Clean White Background) -->
        <tr>
          <td style="background-color: #FFFFFF; padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #E2E8F0;">
            <table role="presentation" width="100%">
              <tr>
                <td align="center">
                  <a href="${siteUrl}" target="_blank" style="display: inline-block;">
                    <img src="${logoUrl}" alt="Grandeur Voyages" width="180" style="width: 180px; max-width: 180px; height: auto; margin: 0 auto;" />
                  </a>
                  <h1 class="text-title" style="margin: 16px 0 4px 0; color: #003A4C; font-size: 21px; font-weight: 700; letter-spacing: -0.4px; line-height: 1.25;">
                    ${isAria ? 'New Callback Request &bull; Aria Chatbot' : isKenyaLanding ? 'New Kenya Safari Inquiry &bull; Kenya Landing Page' : 'New Journey Inquiry'}
                  </h1>
                  <p style="margin: 0; color: #64748B; font-size: 13px; font-weight: 400;">
                    Received on <strong style="color: #0F172A;">${escapeHtml(formattedDate)}</strong> at <strong style="color: #0F172A;">${escapeHtml(formattedTime)} IST</strong> &bull; Ref: <code class="highlight-text" style="color: #003A4C; background-color: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 600;">${escapeHtml(id)}</code>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 2. Simple, Natural Team Greeting -->
        <tr>
          <td style="padding: 24px 32px 14px 32px;">
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
              Hi Team,<br><br>
              ${isAria
                ? `A new callback request has been received from <strong>${escapeHtml(name || 'a website visitor')}</strong> via <strong>Aria Chatbot</strong>. Below are the guest contact details and conversation preferences:`
                : isKenyaLanding
                ? `A new safari inquiry has been received from <strong>${escapeHtml(name || 'a website visitor')}</strong> via the <strong>Kenya Landing Page</strong>. Below are the safari details and guest contact information:`
                : `A new travel inquiry has been received from <strong>${escapeHtml(name || 'a website visitor')}</strong> via <strong>${escapeHtml(source || 'Website Form')}</strong>. Below is the full summary and guest contact details:`}
            </p>
          </td>
        </tr>

        <!-- 3. Primary Guest Card & Quick Actions (Fixed Spacing & Clean Layout) -->
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <table role="presentation" width="100%" class="guest-card" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; border-collapse: separate;">
              <tr>
                <td style="padding: 22px 24px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="vertical-align: top;">
                        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748B; line-height: 1.2;">
                          Primary Guest
                        </p>
                        <h2 class="text-title" style="margin: 0; font-size: 21px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                          ${escapeHtml(name || 'Anonymous Traveler')}
                        </h2>
                      </td>
                      ${destMeta.displayLabel ? `
                      <td align="right" style="vertical-align: top; padding-left: 12px;">
                        <span class="badge-label" style="display: inline-flex; align-items: center; padding: 6px 12px; background-color: #FFFFFF; border: 1px solid #CBD5E1; color: #003A4C; border-radius: 8px; font-size: 12px; font-weight: 700; white-space: nowrap;">
                          ${destMeta.flagUrl ? `<img src="${destMeta.flagUrl}" alt="" width="18" height="13" style="display: inline-block; vertical-align: middle; margin-right: 6px; border-radius: 2px;" />` : ''}
                          ${escapeHtml(destMeta.displayLabel)}
                        </span>
                      </td>
                      ` : ''}
                    </tr>
                  </table>

                  <!-- Quick Action Buttons with Icons8 CDN (No emojis) -->
                  <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        ${waUrl ? `
                        <td style="padding-right: 10px; padding-bottom: 6px;">
                          <a href="${waUrl}" target="_blank" style="display: inline-block; padding: 10px 18px; background-color: #25D366; color: #FFFFFF; font-size: 13px; font-weight: 700; border-radius: 8px; text-decoration: none; line-height: 1.2;">
                            <img src="https://img.icons8.com/color/48/whatsapp--v1.png" width="16" height="16" alt="" style="display: inline-block; vertical-align: -3px; margin-right: 6px;" />Reply on WhatsApp
                          </a>
                        </td>
                        ` : ''}
                        ${cleanPhone ? `
                        <td style="padding-right: 10px; padding-bottom: 6px;">
                          <a href="tel:${cleanPhone}" style="display: inline-block; padding: 10px 16px; background-color: #003A4C; color: #FFFFFF; font-size: 13px; font-weight: 700; border-radius: 8px; text-decoration: none; line-height: 1.2;">
                            <img src="https://img.icons8.com/ios-filled/50/ffffff/phone.png" width="14" height="14" alt="" style="display: inline-block; vertical-align: -2px; margin-right: 6px;" />Call Guest
                          </a>
                        </td>
                        ` : ''}
                        ${email ? `
                        <td style="padding-bottom: 6px;">
                          <a href="mailto:${escapeHtml(email)}" class="btn-email" style="display: inline-block; padding: 10px 16px; background-color: #FFFFFF; color: #0F172A; font-size: 13px; font-weight: 700; border-radius: 8px; border: 1px solid #CBD5E1; text-decoration: none; line-height: 1.2;">
                            <img src="https://img.icons8.com/ios-filled/50/003a4c/mail.png" width="14" height="14" alt="" style="display: inline-block; vertical-align: -2px; margin-right: 6px;" />Send Email
                          </a>
                        </td>
                        ` : ''}
                      </tr>
                    </table>
                  </div>

                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 4. Detailed Data Table (Aria Specific vs Multi-Step Inquiry) -->
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table role="presentation" width="100%" class="border-light" style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
              <!-- Contact Number -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td width="36%" class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Number</td>
                <td width="64%" class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 14px; font-weight: 700;">
                  ${phone ? `<a href="tel:${escapeHtml(phone)}" class="highlight-link" style="color: #003A4C; text-decoration: underline;">${escapeHtml(phone)}</a>` : '<span style="color:#94A3B8;">&mdash;</span>'}
                </td>
              </tr>
              <!-- Email Address -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 14px; font-weight: 500;">
                  ${email ? `<a href="mailto:${escapeHtml(email)}" class="highlight-link" style="color: #003A4C; text-decoration: underline;">${escapeHtml(email)}</a>` : '<span style="color:#94A3B8;">&mdash;</span>'}
                </td>
              </tr>
              <!-- Destination -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Destination</td>
                <td class="text-body highlight-text" style="padding: 12px 16px; color: #003A4C; font-size: 14px; font-weight: 700;">
                  ${destMeta.flagUrl ? `<img src="${destMeta.flagUrl}" alt="" width="18" height="13" style="display: inline-block; vertical-align: middle; margin-right: 6px; border-radius: 2px;" />` : ''}
                  ${escapeHtml(destMeta.displayLabel || (isAria ? 'Consultation / Undecided' : 'Open to Recommendations'))}
                </td>
              </tr>

              ${isAria ? `
              <!-- Aria Specific: Preferred Experience -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Preferred Experience</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">
                  ${escapeHtml(experience || '—')}
                </td>
              </tr>
              <!-- Aria Specific: Travel Vibe -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Travel Vibe / Style</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">
                  ${escapeHtml(vibe || tripType || '—')}
                </td>
              </tr>
              <!-- Aria Specific: Travel Timing -->
              <tr class="row-alt" style="border-bottom: ${displayNotes ? '1px solid #E2E8F0' : 'none'}; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Travel Timing</td>
                <td class="text-body highlight-text" style="padding: 12px 16px; color: #003A4C; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(timing || travelWindow || '—')}
                </td>
              </tr>
              ${displayNotes ? `
              <tr>
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">Notes / Special Requests</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 400; line-height: 1.6; background-color: #FFFDF9; border-left: 3px solid #C5A059;">
                  <em>&ldquo;${escapeHtml(displayNotes)}&rdquo;</em>
                </td>
              </tr>
              ` : ''}
              ` : isKenyaLanding ? `
              <!-- Kenya Landing Specific: Selected Reserves -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Selected Reserves</td>
                <td class="text-body highlight-text" style="padding: 12px 16px; color: #003A4C; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(selectedReserves)}
                </td>
              </tr>
              <!-- Kenya Landing Specific: Total Party Size -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Party Size</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(partySize || 'Not specified')}
                </td>
              </tr>
              <!-- Kenya Landing Specific: Safari Duration -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Safari Duration</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(cleanDuration)}
                </td>
              </tr>
              <!-- Kenya Landing Specific: Estimated Departure Date -->
              <tr style="border-bottom: ${displayNotes ? '1px solid #E2E8F0' : 'none'};">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Departure Date</td>
                <td class="text-body highlight-text" style="padding: 12px 16px; color: #003A4C; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(travelWindow || 'Upcoming Season')}
                </td>
              </tr>
              ${displayNotes ? `
              <tr>
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">Notes / Special Requests</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 400; line-height: 1.6; background-color: #FFFDF9; border-left: 3px solid #C5A059;">
                  <em>&ldquo;${escapeHtml(displayNotes)}&rdquo;</em>
                </td>
              </tr>
              ` : ''}
              ` : `
              <!-- Multi-Step Inquiry: Voyage Style -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Voyage Style</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">
                  ${escapeHtml(tripType || 'Bespoke Luxury')}
                </td>
              </tr>
              <!-- Adults Count -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Adults</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">
                  ${escapeHtml(adultsCount || 'Not specified')}
                </td>
              </tr>
              <!-- Children Breakdown -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Children</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">
                  ${childrenCount && childrenCount !== '0' ? `${escapeHtml(childrenCount)} Child(ren) &bull; ${escapeHtml(childrenAges || '')}` : 'None'}
                </td>
              </tr>
              <!-- Total Party Size -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Party Size</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(partySize || 'Not specified')}
                </td>
              </tr>
              <!-- Duration -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Duration</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">
                  ${escapeHtml(cleanDuration)}
                </td>
              </tr>
              <!-- Travel Window -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Travel Window</td>
                <td class="text-body highlight-text" style="padding: 12px 16px; color: #003A4C; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(travelWindow || 'Upcoming Season')} ${travelMonth && travelYear ? `(${escapeHtml(travelMonth)} ${escapeHtml(travelYear)})` : ''}
                </td>
              </tr>
              <!-- Property Segment -->
              <tr class="row-alt" style="border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Accommodation Tier</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 600;">
                  ${escapeHtml(propertySegment || 'Open to All')}
                </td>
              </tr>
              <!-- Budget -->
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Budget</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(budget || 'Bespoke / Custom')}
                </td>
              </tr>
              <!-- Planning Stage -->
              <tr class="row-alt" style="border-bottom: ${displayNotes ? '1px solid #E2E8F0' : 'none'}; background-color: #FFFFFF;">
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Planning Stage</td>
                <td class="text-body highlight-text" style="padding: 12px 16px; color: #003A4C; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(seriousness || 'Active Inquiry')}
                </td>
              </tr>
              <!-- Special Notes -->
              ${displayNotes ? `
              <tr>
                <td class="text-sub" style="padding: 12px 16px; background-color: #F8FAFC; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">Notes / Special Requests</td>
                <td class="text-body" style="padding: 12px 16px; color: #0F172A; font-size: 13px; font-weight: 400; line-height: 1.6; background-color: #FFFDF9; border-left: 3px solid #C5A059;">
                  <em>&ldquo;${escapeHtml(displayNotes)}&rdquo;</em>
                </td>
              </tr>
              ` : ''}
              `}
            </table>
          </td>
        </tr>

        <!-- 5. Extended System Telemetry & Audit Footprint -->
        <tr>
          <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0;" class="telemetry-card">
            <p style="margin: 0 0 10px 0; color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              System Telemetry &amp; Audit Details
            </p>
            <table role="presentation" width="100%" style="font-size: 11px; color: #64748B; line-height: 1.65;">
              <tr>
                <td width="32%"><strong>Lead Reference ID:</strong></td>
                <td><code>${escapeHtml(id)}</code></td>
              </tr>
              <tr>
                <td><strong>Submission Timestamp:</strong></td>
                <td>${escapeHtml(formattedDate)} at ${escapeHtml(formattedTime)} IST (${escapeHtml(telemetry?.timestamp || getISTISOString())})</td>
              </tr>
              <tr>
                <td><strong>Form Source:</strong></td>
                <td>${escapeHtml(source || 'Grandeur Voyages Website')}</td>
              </tr>
              <tr>
                <td><strong>Device &amp; Form Factor:</strong></td>
                <td>${escapeHtml(deviceType)}</td>
              </tr>
              <tr>
                <td><strong>Operating System:</strong></td>
                <td>${escapeHtml(osType)}</td>
              </tr>
              <tr>
                <td><strong>Web Browser:</strong></td>
                <td>${escapeHtml(browserType)}</td>
              </tr>
              <tr>
                <td><strong>Client IP Address:</strong></td>
                <td><code>${escapeHtml(telemetry?.ip || 'Unknown')}</code></td>
              </tr>
              <tr>
                <td><strong>User Geolocation:</strong></td>
                <td>${escapeHtml(telemetry?.location || 'Unknown Location')}</td>
              </tr>
              <tr>
                <td><strong>Client ISP / Network:</strong></td>
                <td>${escapeHtml(telemetry?.isp || 'Unknown Network')}</td>
              </tr>
              <tr>
                <td><strong>Referral Page URL:</strong></td>
                <td>${escapeHtml(telemetry?.page || 'Unknown')}</td>
              </tr>
              <tr>
                <td><strong>Referring Source:</strong></td>
                <td>${escapeHtml(telemetry?.referer || 'Direct')}</td>
              </tr>
              <tr>
                <td><strong>Security Verification:</strong></td>
                <td>Honeypot: Passed &bull; Turnstile: Verified</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 6. Footer Signature (Clean & Minimal) -->
        <tr>
          <td style="padding: 20px 32px; text-align: center; color: #94A3B8; font-size: 12px;">
            <p style="margin: 0;">Grandeur Voyages &bull; <a href="${siteUrl}" target="_blank" class="highlight-link" style="color: #003A4C; text-decoration: none; font-weight: 600;">grandeurvoyages.com</a></p>
          </td>
        </tr>

      </table>

    </div>
  </center>
</body>
</html>`;

  // Plain-text alternative for high deliverability & anti-spam score
  const text = isAria
    ? `
Grandeur Voyages - New Callback Request • Aria Chatbot
=================================================
Reference ID: ${id}
Received: ${formattedDate} at ${formattedTime} IST
Source: ${source || 'Aria Chatbot (Callback)'}
Client Device: ${deviceType} (${osType}, ${browserType})

GUEST CONTACT DETAILS
---------------------
Name: ${name || 'N/A'}
Contact Phone: ${phone || 'N/A'}
Email Address: ${email || 'N/A'}

CONVERSATION PREFERENCES
------------------------
Destination: ${destMeta.displayLabel || 'Consultation / Undecided'}
Preferred Experience: ${experience || '—'}
Travel Vibe / Style: ${vibe || tripType || '—'}
Travel Timing: ${timing || travelWindow || '—'}
${displayNotes ? `Notes: "${displayNotes}"\n` : ''}
SYSTEM TELEMETRY & AUDIT DETAILS
--------------------------------
Lead ID: ${id}
Submission: ${formattedDate} at ${formattedTime} IST
Source: ${source || 'Aria Chatbot (Callback)'}
Device: ${deviceType}
Operating System: ${osType}
Browser: ${browserType}
Client IP: ${telemetry?.ip || 'Unknown'}
User Geolocation: ${telemetry?.location || 'Unknown Location'}
Client ISP / Network: ${telemetry?.isp || 'Unknown Network'}
Referral Page: ${telemetry?.page || 'Unknown'}
Referring Source: ${telemetry?.referer || 'Direct'}
Security: Honeypot Passed, Turnstile Verified
`
    : isKenyaLanding
    ? `
Grandeur Voyages - New Kenya Safari Inquiry • Kenya Landing Page
=================================================
Reference ID: ${id}
Received: ${formattedDate} at ${formattedTime} IST
Source Form: Kenya Landing Page
Client Device: ${deviceType} (${osType}, ${browserType})

TRAVELER DETAILS
----------------
Name: ${name || 'N/A'}
Contact Phone: ${phone || 'N/A'}
Email Address: ${email || 'N/A'}

SAFARI EXPEDITION DETAILS
-------------------------
Destination: ${destMeta.displayLabel || 'Kenya Safari'}
Selected Reserves: ${selectedReserves}
Total Party Size: ${partySize || 'Not specified'}
Safari Duration: ${cleanDuration}
Estimated Departure Date: ${travelWindow || 'Upcoming Season'}
${displayNotes ? `Special Requests / Notes: "${displayNotes}"\n` : ''}
SYSTEM TELEMETRY & AUDIT DETAILS
--------------------------------
Lead ID: ${id}
Submission: ${formattedDate} at ${formattedTime} IST
Form Source: Kenya Landing Page
Device: ${deviceType}
Operating System: ${osType}
Browser: ${browserType}
Client IP: ${telemetry?.ip || 'Unknown'}
User Geolocation: ${telemetry?.location || 'Unknown Location'}
Client ISP / Network: ${telemetry?.isp || 'Unknown Network'}
Referral Page: ${telemetry?.page || 'Unknown'}
Referring Source: ${telemetry?.referer || 'Direct'}
Security: Honeypot Passed, Turnstile Verified
`
    : `
Grandeur Voyages - New Journey Inquiry
=================================================
Reference ID: ${id}
Received: ${formattedDate} at ${formattedTime} IST
Source Form: ${source || 'Website Form'}
Client Device: ${deviceType} (${osType}, ${browserType})

TRAVELER DETAILS
----------------
Name: ${name || 'N/A'}
Contact Phone: ${phone || 'N/A'}
Email Address: ${email || 'N/A'}

EXPEDITION DETAILS
------------------
Destination: ${destMeta.displayLabel || 'Open to Recommendations'}
Trip Style / Vibe: ${tripType || 'Bespoke Luxury'}
Adults: ${adultsCount || 'Not specified'}
Children: ${childrenCount && childrenCount !== '0' ? `${childrenCount} (${childrenAges})` : 'None'}
Total Party Size: ${partySize || 'Not specified'}
Voyage Duration: ${cleanDuration}
Travel Window: ${travelWindow || 'Upcoming Season'} ${travelMonth && travelYear ? `(${travelMonth} ${travelYear})` : ''}
Property Segment: ${propertySegment || 'Open to All'}
Estimated Budget: ${budget || 'Bespoke / Custom'}
Planning Stage: ${seriousness || 'Active Inquiry'}
${notes ? `Special Requests / Notes: "${notes}"\n` : ''}
SYSTEM TELEMETRY & AUDIT DETAILS
--------------------------------
Lead ID: ${id}
Submission: ${formattedDate} at ${formattedTime} IST
Form Source: ${source || 'Website Form'}
Device: ${deviceType}
Operating System: ${osType}
Browser: ${browserType}
Client IP: ${telemetry?.ip || 'Unknown'}
User Geolocation: ${telemetry?.location || 'Unknown Location'}
Client ISP / Network: ${telemetry?.isp || 'Unknown Network'}
Referral Page: ${telemetry?.page || 'Unknown'}
Referring Source: ${telemetry?.referer || 'Direct'}
Security: Honeypot Passed, Turnstile Verified
`;

  return { html, text };
}

// ==============================================================================
// 11. Asynchronous n8n Webhook Forwarder
// ==============================================================================
async function dispatchToN8N(payload) {
  // STRICT GUARD: Never dispatch newsletter / journal subscriptions to n8n (SMTP only)
  const source = String(payload['Form Source'] || payload['Form Name'] || payload.form?.name || payload.source || '').toLowerCase();
  if (
    source.includes('newsletter') ||
    source.includes('journal') ||
    source.includes('subscribe') ||
    source.includes('blog')
  ) {
    return;
  }

  // Dual Webhook Architecture:
  // 1. Dedicated webhook for Kenya Landing Page (N8N_KENYA_WEBHOOK_URL)
  // 2. Standard configured webhook for all other website queries (N8N_WEBHOOK_URL)
  const isKenyaLead =
    source.includes('kenya landing') ||
    source.includes('kenya google ads') ||
    source.includes('kenya-safari') ||
    (String(payload['Destination'] || payload.destination || '').toLowerCase() === 'kenya' && source.includes('landing'));

  const webhookUrl = isKenyaLead
    ? (process.env.N8N_KENYA_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL_KENYA || process.env.N8N_WEBHOOK_URL)
    : process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl || !webhookUrl.startsWith('http')) return;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_SECRET_TOKEN ? { 'X-N8N-Token': process.env.N8N_SECRET_TOKEN } : {})
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      log.info(`[N8N] Dispatched lead [${payload.entry?.id}] successfully to webhook`);
    } else if (res.status === 404) {
      // Auto-fallback: If test URL was configured, attempt production URL (without -test)
      if (webhookUrl.includes('/webhook-test/')) {
        const prodWebhookUrl = webhookUrl.replace('/webhook-test/', '/webhook/');
        try {
          const prodRes = await fetch(prodWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(process.env.N8N_SECRET_TOKEN ? { 'X-N8N-Token': process.env.N8N_SECRET_TOKEN } : {})
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(8000)
          });
          if (prodRes.ok) {
            log.info(`[N8N] Dispatched lead [${payload.entry?.id}] successfully to production webhook`);
            return;
          }
        } catch (_) {}
      }
      log.info(`[N8N] Webhook endpoint not actively listening (HTTP 404) — n8n workflow may be paused or awaiting test trigger.`);
    } else {
      log.warn(`[N8N] Webhook returned status HTTP ${res.status}`);
    }
  } catch (err) {
    log.info('[N8N] Webhook dispatch bypassed or unreachable (non-blocking):', err.message);
  }
}

// ==============================================================================
// 12. API Health & Monitoring Routes (BetterStack, UptimeRobot, Pingdom)
// ==============================================================================
// Public Health Check: Strictly minimal, sanitized, and zero information leakage
function getPublicHealthStatus() {
  const now = new Date();
  return {
    status: 'healthy',
    timestampIST: getISTISOString(now),
    timestampUTC: now.toISOString(),
    timezone: IST_TIMEZONE
  };
}

// Support multiple health URL conventions so BetterStack can point to any
app.get(['/', '/api', '/api/', '/health', '/api/health'], (req, res) => {
  res.status(200).json(getPublicHealthStatus());
});

app.head(['/', '/api', '/api/', '/health', '/api/health'], (req, res) => {
  res.status(200).end();
});

app.get('/api/health/ping', (req, res) => {
  res.status(200).send('pong');
});

// Protected admin diagnostics route (requires secret key in header, never leaks local paths)
app.get('/api/admin/diagnostics', (req, res) => {
  const secretKey = process.env.ADMIN_SECRET_KEY || process.env.API_SECRET_KEY;
  const providedKey = req.headers['x-admin-key'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!secretKey || !providedKey || providedKey !== secretKey) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }

  const uptimeSec = Math.round((Date.now() - startTime) / 1000);
  const mem = process.memoryUsage();
  const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return res.status(200).json({
    status: 'healthy',
    uptimeSeconds: uptimeSec,
    timestampIST: getISTISOString(),
    timestampUTC: new Date().toISOString(),
    timezone: IST_TIMEZONE,
    memory: {
      rss: formatMB(mem.rss),
      heapUsed: formatMB(mem.heapUsed)
    },
    integrations: {
      smtp: smtpPass ? 'connected' : 'unconfigured',
      turnstile: TURNSTILE_SECRET ? 'active' : 'unconfigured',
      n8n: process.env.N8N_WEBHOOK_URL ? 'active' : 'unset',
      n8nKenya: (process.env.N8N_KENYA_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL_KENYA) ? 'active' : 'unset'
    },
    storage: fs.existsSync(dataDir) ? 'ready' : 'initializing'
  });
});

// ==============================================================================
// 13. Primary Lead Ingestion Endpoint (`/api/inquire` and `/api/leads`)
// ==============================================================================
async function handleLeadSubmission(req, res) {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referer = req.headers['referer'] || req.headers['origin'] || 'Direct';
  const now = new Date();

  const body = req.body || {};

  // ----------------------------------------------------------------------------
  // Honeypot Protection: Trapping Automated Bots Silently
  // ----------------------------------------------------------------------------
  const honeypotWebsite = body.hp_website || body.company_website || body.website;
  const honeypotEmail = body.hp_secondary_email || body.secondary_email || body.confirm_email;
  const honeypotPhone = body.hp_phone_confirmation || body.phone_check;
  const renderTimestamp = parseInt(body._renderedAt || '0', 10);
  const timeTakenMs = renderTimestamp > 0 ? Date.now() - renderTimestamp : 9999;

  // Bot trapped if any honeypot input contains data OR if form was filled inhumanly fast (< 750ms)
  const isHoneypotTriggered =
    Boolean(honeypotWebsite) ||
    Boolean(honeypotEmail) ||
    Boolean(honeypotPhone) ||
    (renderTimestamp > 0 && timeTakenMs < 750);

  if (isHoneypotTriggered) {
    log.warn(`[HONEYPOT_TRAPPED] Bot submission trapped & silenced from IP: ${clientIp}. Reason: ${
      honeypotWebsite ? 'hp_website' : honeypotEmail ? 'hp_email' : honeypotPhone ? 'hp_phone' : `rapid_submission_${timeTakenMs}ms`
    }`);

    // Silently return 200 OK so bots believe they succeeded and never adapt or retry
    return res.status(200).json({
      success: true,
      message: 'Inquiry received. A luxury travel specialist will review your request.'
    });
  }

  // ----------------------------------------------------------------------------
  // Cloudflare Turnstile Verification (exempt for internal PHP landing page bridge)
  // ----------------------------------------------------------------------------
  const isInternalBridge =
    req.headers['x-internal-source'] === 'kenya-safari-bridge' ||
    body.internalSource === 'kenya-safari-bridge';

  if (!isInternalBridge) {
    const turnstileToken = body['cf-turnstile-response'] || body.turnstileToken || body.token;
    const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);

    if (!turnstileResult.success) {
      log.warn(`[TURNSTILE_FAILED] IP: ${clientIp} failed verification. Error: ${turnstileResult.error || JSON.stringify(turnstileResult['error-codes'])}`);
      return res.status(403).json({
        success: false,
        error: 'Security verification failed. Please complete the security check and try again.'
      });
    }
  } else {
    log.info(`[API_BRIDGE] Internal bridge lead accepted from ${clientIp} (Source: ${body.source || 'Kenya Safari Landing Page'})`);
  }

  // ----------------------------------------------------------------------------
  // Lead Data Sanitization & Extraction
  // ----------------------------------------------------------------------------
  const name = String(body.name || body.guestName || body.userName || '').trim();
  const email = String(body.email || body.guestEmail || body.userEmail || '').trim();
  const phone = String(body.phone || body.guestPhone || body.userPhone || body.contact || '').trim();
  const rawDest = String(body.destination || body.region || '').trim();
  const isAriaConsultation =
    rawDest.toLowerCase().includes('aria consultation') ||
    rawDest.toLowerCase() === 'consultation' ||
    rawDest.toLowerCase() === 'undecided' ||
    rawDest.toLowerCase() === 'not specified';
  const destination = isAriaConsultation ? '' : rawDest;
  const tripType = String(body.tripType || body.vibe || '').trim();
  const adultsCount = String(body.adultsCount || body.adults || '').trim();
  const hasChildren = Boolean(body.hasChildren);
  const children = Array.isArray(body.children) ? body.children : [];
  const duration = String(body.duration || body.noOfDays || '').trim();
  const travelMonth = String(body.travelMonth || '').trim();
  const travelYear = String(body.travelYear || '').trim();
  const propertySegment = String(body.propertySegment || body.accommodation || '').trim();
  const budget = String(body.budget || '').trim();
  const seriousness = String(body.seriousness || '').trim();
  const notes = String(body.notes || body.message || body.specialRequests || '').trim();
  let source = String(body.source || body.formSource || 'Grandeur Voyages Website').trim();
  // Ensure "AI" is completely removed from Aria Chatbot
  if (/aria/i.test(source)) {
    source = source.replace(/aria\s+ai/gi, 'Aria').replace(/aria\s+ai\s+concierge\s+chatbot/gi, 'Aria Chatbot');
    if (!source.includes('Aria Chatbot')) {
      source = 'Aria Chatbot (Callback)';
    }
  }
  const isAria = Boolean(source && source.toLowerCase().includes('aria'));
  const pageUrl = String(body.pageUrl || referer || '').trim();
  const isKenyaLanding = Boolean(
    (source && /kenya/i.test(source)) ||
    (body.formSource && /kenya/i.test(body.formSource)) ||
    (pageUrl && /\/kenya\b/i.test(pageUrl))
  );

  const destinationsSelected = Array.isArray(body.destinationsSelected)
    ? body.destinationsSelected
    : (body.destinationsSelected ? [String(body.destinationsSelected)] : []);
  const destinationsDisplay = destinationsSelected.length > 0
    ? destinationsSelected.join(', ')
    : (body.destinationsRawData ? String(body.destinationsRawData).split('\n')[0] : (isKenyaLanding ? 'Masai Mara' : ''));

  const cleanDuration = (() => {
    const rawDur = String(body.duration || body.noOfDays || duration || '').trim();
    if (!rawDur) return 'Custom';
    if (/days?$/i.test(rawDur)) return rawDur;
    return `${rawDur} Days`;
  })();

  // Extract Aria-specific conversation fields if provided
  const rawExperience = String(body.experience || (notes.startsWith('Requested Experience:') ? notes.replace('Requested Experience:', '').trim() : '') || '').trim();
  const experience = rawExperience;
  const vibe = String(body.vibe || '').trim();
  const timing = String(body.timing || '').trim();

  // Basic sanity validation
  if (!name && !email && !phone) {
    return res.status(400).json({
      success: false,
      error: 'Please provide at least a name and contact number or email.'
    });
  }

  // Party size formatted string & detailed breakdown
  const childrenCountStr = hasChildren && children.length > 0 ? String(children.length) : '0';
  const childrenAgesStr = hasChildren && children.length > 0
    ? children.map((c, i) => `Child ${i + 1}: ${c.age ? `Age ${c.age}` : 'Age unstated'}`).join(', ')
    : 'None';

  let partySizeFormatted = adultsCount || 'Not specified';
  if (body.noOfPeople) {
    partySizeFormatted = String(body.noOfPeople).trim();
  } else if (hasChildren && children.length > 0) {
    partySizeFormatted += ` + ${children.length} Child(ren) (${childrenAgesStr})`;
  }

  // Travel window formatted string
  let travelWindowFormatted = '';
  if (isAria) {
    travelWindowFormatted = timing || (body.travelWindow ? String(body.travelWindow) : '—');
  } else if (travelMonth && travelYear) {
    travelWindowFormatted = `${travelMonth} ${travelYear}`;
  } else if (body.travelWindow) {
    travelWindowFormatted = String(body.travelWindow);
  } else if (body.timing) {
    travelWindowFormatted = String(body.timing);
  } else {
    travelWindowFormatted = 'Upcoming Season';
  }

  // Device & Date formatting in IST (Asia/Kolkata, UTC+5:30)
  const clientDevice = parseDeviceType(userAgent);
  const submissionDate = getISTDateString(now); // DD/MM/YYYY in IST
  const submissionTime = getISTTimeString(now); // HH:MM:SS in IST
  const submissionTimestampIST = getISTISOString(now);

  // Geolocation & ISP Network lookup based on IP
  const geo = await lookupIpGeolocation(clientIp, req.headers);

  // Generate unique lead ID with IST Year and Month
  const p = getISTDateParts(now);
  const leadId = `GV-${p.year}${p.month}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const telemetry = {
    ip: clientIp,
    location: geo.location,
    isp: geo.isp,
    userAgent,
    device: clientDevice,
    referer,
    page: pageUrl,
    timestamp: submissionTimestampIST,
    timestampUTC: now.toISOString(),
    submissionDate,
    submissionTime,
    timezone: 'Asia/Kolkata (IST)',
    clientTimestamp: body.clientTimestamp || null,
    clientTimezone: body.clientTimezone || null
  };

  const storedEntry = {
    id: leadId,
    timestamp: submissionTimestampIST,
    timestampUTC: now.toISOString(),
    submittedAtIST: getISTDisplayTimestamp(now),
    source,
    data: isKenyaLanding ? {
      name,
      email: email || '—',
      phone: phone || '—',
      destination: destination || 'Kenya Safari',
      destinationsSelected,
      selectedReserves: destinationsDisplay || 'Masai Mara',
      partySize: partySizeFormatted,
      duration: cleanDuration,
      travelWindow: travelWindowFormatted,
      notes: notes || '—'
    } : {
      name,
      email: email || '—',
      phone: phone || '—',
      destination: destination || (isAria ? '—' : 'Open to Recommendations'),
      tripType: isAria ? (vibe || tripType || '—') : (tripType || 'Bespoke Luxury'),
      adultsCount: isAria ? '—' : (adultsCount || 'Not specified'),
      childrenCount: isAria ? '—' : childrenCountStr,
      childrenAges: isAria ? '—' : childrenAgesStr,
      partySize: isAria ? '—' : partySizeFormatted,
      duration: isAria ? '—' : cleanDuration,
      travelMonth: isAria ? '—' : (travelMonth || '—'),
      travelYear: isAria ? '—' : (travelYear || '—'),
      travelWindow: isAria ? (timing || '—') : travelWindowFormatted,
      propertySegment: isAria ? '—' : (propertySegment || 'Open to All'),
      budget: isAria ? '—' : (budget || 'Bespoke / Custom'),
      seriousness: isAria ? '—' : (seriousness || 'Active Inquiry'),
      notes: isAria
        ? (experience ? `Requested Experience: ${experience}${notes && !notes.startsWith('Requested Experience:') ? ` | Notes: ${notes}` : ''}` : (notes || '—'))
        : (notes || '—'),
      experience: isAria ? (experience || '—') : undefined,
      vibe: isAria ? (vibe || '—') : undefined,
      timing: isAria ? (timing || '—') : undefined
    },
    raw: body,
    telemetry,
    delivery: {
      smtpStatus: 'pending',
      n8nStatus: 'pending'
    }
  };

  // ----------------------------------------------------------------------------
  // 1. Persist to Monthly Rotating File (Zero Data Loss Invariant)
  // ----------------------------------------------------------------------------
  await saveLeadToStorage(storedEntry);

  // ----------------------------------------------------------------------------
  // 2. Dispatch Email Notification via SMTP
  // ----------------------------------------------------------------------------
  const recipientEmail = process.env.RECIPIENT_EMAIL || process.env.SMTP_USER || 'info@grandeurvoyages.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Grandeur Voyages Concierge';
  const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;

  const emailContent = buildConciergeLeadEmail({
    id: leadId,
    source,
    isKenyaLanding,
    destinationsSelected,
    destinationsDisplay,
    name,
    email,
    phone,
    destination: destination || (isKenyaLanding ? 'Kenya Safari' : ''),
    tripType,
    adultsCount: adultsCount || (isAria ? '—' : 'Not specified'),
    childrenCount: isAria ? '—' : childrenCountStr,
    childrenAges: isAria ? '—' : childrenAgesStr,
    partySize: partySizeFormatted,
    duration: cleanDuration,
    travelMonth: isAria ? '—' : travelMonth,
    travelYear: isAria ? '—' : travelYear,
    travelWindow: travelWindowFormatted,
    propertySegment: isAria ? '—' : propertySegment,
    budget: isAria ? '—' : budget,
    seriousness: isAria ? '—' : seriousness,
    notes,
    telemetry,
    experience,
    vibe,
    timing
  });

  const destMeta = getDestinationMeta(destination);
  const subjectDestPrefix = destMeta.name ? `${destMeta.name.toUpperCase()} - ` : '';
  const mailSubject = isAria
    ? `[Aria Chatbot] ${subjectDestPrefix}Callback Request from ${name || 'Guest'} [${leadId}]`
    : isKenyaLanding
    ? `[Kenya Safari Lead] ${name || 'Guest Inquiry'} (${partySizeFormatted}, ${cleanDuration}) [${leadId}]`
    : `[New Lead] ${subjectDestPrefix}${name || 'Guest Inquiry'} (${partySizeFormatted}) [${leadId}]`;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: recipientEmail,
    ...(process.env.RECIPIENT_CC ? { cc: process.env.RECIPIENT_CC } : {}),
    ...(process.env.RECIPIENT_BCC ? { bcc: process.env.RECIPIENT_BCC } : {}),
    ...(email ? { replyTo: `"${name}" <${email}>` } : {}),
    subject: mailSubject,
    text: emailContent.text,
    html: emailContent.html
  };

  let emailSent = false;
  if (smtpPass) {
    try {
      const info = await transporter.sendMail(mailOptions);
      log.info(`[SMTP] Email notification delivered for [${leadId}] messageId: ${info.messageId}`);
      emailSent = true;
      storedEntry.delivery.smtpStatus = 'sent';
    } catch (smtpErr) {
      log.error(`[SMTP] Delivery failed for [${leadId}]:`, smtpErr.message);
      storedEntry.delivery.smtpStatus = `failed: ${smtpErr.message}`;
    }
  } else {
    log.info(`[SMTP SIMULATION] Lead [${leadId}] received. (SMTP_PASS is not set in .env)`);
    storedEntry.delivery.smtpStatus = 'simulated_no_smtp_pass';
    emailSent = true;
  }

  // ----------------------------------------------------------------------------
  // 3. Forward to n8n Webhook (Asynchronous / Non-blocking)
  // ----------------------------------------------------------------------------
  const leadFields = {
    'Lead ID': leadId,
    'Submission Date': submissionDate,
    'Submission Time': submissionTime,
    'Guest Name': name || (isAria ? 'Guest' : 'Anonymous Traveler'),
    'Email Address': email || '—',
    'Contact Number': phone || '—',
    'Destination': destination || (isAria ? '—' : 'Open to Recommendations'),
    'Voyage Style': isAria ? (vibe || tripType || '—') : (tripType || 'Bespoke Luxury'),
    'Adults Count': isAria ? '—' : (adultsCount || 'Not specified'),
    'Children Count': isAria ? '—' : childrenCountStr,
    'Children Ages': isAria ? '—' : childrenAgesStr,
    'Total Party Size': isAria ? '—' : partySizeFormatted,
    'Trip Duration': isAria ? '—' : (duration ? `${duration} Days` : 'Custom'),
    'Travel Month': isAria ? '—' : (travelMonth || '—'),
    'Travel Year': isAria ? '—' : (travelYear || '—'),
    'Travel Window': isAria ? (timing || travelWindowFormatted || '—') : travelWindowFormatted,
    'Property Segment': isAria ? '—' : (propertySegment || 'Open to All'),
    'Estimated Budget': isAria ? '—' : (budget || 'Bespoke / Custom'),
    'Planning Stage': isAria ? '—' : (seriousness || 'Active Inquiry'),
    'Special Requests / Notes': isAria
      ? (experience ? `Requested Experience: ${experience}${notes && !notes.startsWith('Requested Experience:') ? ` | Notes: ${notes}` : ''}` : (notes || '—'))
      : (notes || '—'),
    'Form Source': source,
    'Lead Status': 'New Lead',
    'Assigned Concierge': '—',
    'Follow-up Notes': '—',
    'Client Device': clientDevice,
    'Client IP': clientIp,
    'User Geolocation': geo.location,
    'Client ISP': geo.isp,
    'Referral Page': pageUrl,
    // WPForms & Kenya Lead Sheet Compatibility (strip whitespace to prevent formula parse errors)
    'Lead Date': body.LeadDate || submissionDate,
    'Name': name || (isAria ? 'Guest' : 'Anonymous Traveler'),
    'Email': email || '—',
    'Contact No. ': (phone ? phone.replace(/\s+/g, '') : '—'),
    'Contact No.': (phone ? phone.replace(/\s+/g, '') : '—'),
    'Safari Date': body.safariDateFormatted || body.safariDate || travelWindowFormatted,
    'No. Of People': body.noOfPeople || partySizeFormatted,
    'No. Of Days': body.noOfDays || duration || 'Custom',
    'Destinations Raw Data': body.destinationsRawData || (Array.isArray(body.destinationsSelected) ? body.destinationsSelected.join(', ') : 'Kenya Safari'),
    'Message': notes || '—'
  };

  const cleanContactPhone = phone ? phone.replace(/\s+/g, '') : '—';

  const n8nPayload = {
    ...leadFields,
    fields: {
      ...leadFields,
      LeadDate: body.LeadDate || submissionDate,
      Name: name || (isAria ? 'Guest' : 'Anonymous Traveler'),
      Email: email || '—',
      'ContactNo.': cleanContactPhone,
      'Contact No. ': cleanContactPhone,
      SafariDate: body.SafariDate || {
        unix: body.safariDateUnix || Math.floor(now.getTime() / 1000),
        value: body.safariDateFormatted || body.safariDate || submissionDate
      },
      'Safari Date': body.safariDateFormatted || body.safariDate || travelWindowFormatted,
      'No.OfPeople': body.noOfPeople || partySizeFormatted,
      'No. Of People': body.noOfPeople || partySizeFormatted,
      'No.OfDays': body.noOfDays || duration || 'Custom',
      'No. Of Days': body.noOfDays || duration || 'Custom',
      DestinationsRawData: body.destinationsRawData || (Array.isArray(body.destinationsSelected) ? body.destinationsSelected.join(', ') : 'Kenya Safari'),
      'Destinations Raw Data': body.destinationsRawData || (Array.isArray(body.destinationsSelected) ? body.destinationsSelected.join(', ') : 'Kenya Safari'),
      Message: notes || '—'
    },
    // Root aliases for n8n expressions
    LeadDate: body.LeadDate || submissionDate,
    'No.OfPeople': body.noOfPeople || partySizeFormatted,
    'No.OfDays': body.noOfDays || duration || 'Custom',
    'ContactNo.': cleanContactPhone,
    DestinationsRawData: body.destinationsRawData || (Array.isArray(body.destinationsSelected) ? body.destinationsSelected.join(', ') : 'Kenya Safari'),
    Message: notes || '—',
    form: {
      id: 'grandeur-lead',
      name: source
    },
    meta: {
      ip: clientIp,
      page: pageUrl,
      referer,
      userAgent,
      device: clientDevice,
      submissionDate,
      submissionTime
    },
    entry: {
      id: leadId,
      createdAt: submissionTimestampIST,
      createdAtUTC: now.toISOString()
    },
    raw: body
  };

  // STRICT GUARD: If this submission is a newsletter or journal subscription, DO NOT dispatch to n8n (strictly SMTP only)
  const isNewsletter =
    source.toLowerCase().includes('newsletter') ||
    source.toLowerCase().includes('journal') ||
    source.toLowerCase().includes('subscriber') ||
    source.toLowerCase().includes('blog') ||
    body.type === 'newsletter_subscription';

  if (!isNewsletter) {
    dispatchToN8N(n8nPayload);
  }

  // Generate a cryptographically signed one-time receipt for secure thank-you page attribution
  const receiptTimestamp = Date.now();
  const secretKey = process.env.ADMIN_SECRET_KEY || process.env.API_SECRET_KEY || 'gv-secure-salt-2026';
  const receiptSig = crypto
    .createHmac('sha256', secretKey)
    .update(`${leadId}:${receiptTimestamp}`)
    .digest('hex')
    .slice(0, 16);
  const receipt = `${leadId}.${receiptTimestamp}.${receiptSig}`;

  // Return success response to frontend client
  return res.status(200).json({
    success: true,
    leadId,
    receipt,
    emailSent,
    message: 'Your inquiry has been received. Our luxury travel concierge will reach out promptly.'
  });
}

app.post(['/api/inquire', '/api/leads'], rateLimiterMiddleware, handleLeadSubmission);

// ==============================================================================
// 14. Newsletter Subscription Route (`/api/subscribe`, `/api/newsletter`, `/subscribe`)
// ==============================================================================
// Strictly SMTP-only dispatch: No n8n webhooks invoked for blog newsletter signups
app.post(['/api/subscribe', '/api/newsletter', '/subscribe'], rateLimiterMiddleware, async (req, res) => {
  const clientIp = getClientIp(req);
  const email = String(req.body.email || '').trim();

  // Honeypot check
  if (req.body.hp_website || req.body.website) {
    return res.status(200).json({ success: true, message: 'Subscribed successfully.' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }

  // Optional Turnstile token check if provided
  if (req.body['cf-turnstile-response']) {
    const vr = await verifyTurnstile(req.body['cf-turnstile-response'], clientIp);
    if (!vr.success) {
      return res.status(403).json({ success: false, error: 'Security verification failed.' });
    }
  }

  const subNow = new Date();
  const subDate = getISTDateString(subNow);
  const subTime = getISTTimeString(subNow);
  const subTimestampIST = getISTISOString(subNow);

  const subEntry = {
    id: `SUB-${Date.now()}`,
    type: 'newsletter_subscription',
    email,
    timestamp: subTimestampIST,
    timestampUTC: subNow.toISOString(),
    submittedAtIST: getISTDisplayTimestamp(subNow),
    source: req.body.source || 'Journal & Stories Page',
    ip: clientIp
  };

  await saveLeadToStorage(subEntry);

  // Send minimalist, elegant notification strictly via SMTP
  if (smtpPass) {
    const logoUrl = process.env.BRAND_LOGO_URL || 'https://grandeurvoyages.com/assets/brand/gv-logo.webp';
    const siteUrl = process.env.PUBLIC_URL || 'https://grandeurvoyages.com';
    const submissionDate = subDate;
    const submissionTime = subTime;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Journal Subscriber</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .text-title { color: #F8FAFC !important; }
      .highlight-link { color: #38BDF8 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border-radius: 14px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 58, 76, 0.05);">
    <tr>
      <td style="padding: 28px 28px 20px 28px; text-align: center; border-bottom: 1px solid #E2E8F0;">
        <img src="${logoUrl}" alt="Grandeur Voyages" width="160" style="width: 160px; max-width: 160px; height: auto; margin: 0 auto;" />
        <h2 class="text-title" style="margin: 14px 0 4px 0; color: #003A4C; font-size: 19px; font-weight: 700;">New Journal Subscriber</h2>
        <p style="margin: 0; color: #64748B; font-size: 12px;">Grandeur Voyages Journal &bull; ${submissionDate} at ${submissionTime} IST</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 28px;">
        <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px; line-height: 1.5;">
          A new reader has subscribed to the Grandeur Voyages Journal to receive stories, reflections, and destination updates:
        </p>
        <table role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; margin-bottom: 18px;">
          <tr>
            <td style="padding: 14px 16px;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;">Subscriber Email</p>
              <a href="mailto:${escapeHtml(email)}" class="highlight-link" style="font-size: 16px; font-weight: 700; color: #003A4C; text-decoration: underline;">${escapeHtml(email)}</a>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" style="font-size: 11px; color: #64748B; line-height: 1.6;">
          <tr>
            <td width="30%"><strong>Source:</strong></td>
            <td>${escapeHtml(req.body.source || 'Journal & Stories Page')}</td>
          </tr>
          <tr>
            <td><strong>Client IP:</strong></td>
            <td><code>${escapeHtml(clientIp)}</code></td>
          </tr>
          <tr>
            <td><strong>Timestamp (IST):</strong></td>
            <td>${escapeHtml(subTimestampIST)}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 28px; text-align: center; border-top: 1px solid #E2E8F0; background-color: #F8FAFC; font-size: 12px; color: #94A3B8;">
        Grandeur Voyages &bull; <a href="${siteUrl}" class="highlight-link" style="color: #003A4C; text-decoration: none; font-weight: 600;">grandeurvoyages.com</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Grandeur Voyages'}" <${smtpUser}>`,
        to: process.env.RECIPIENT_EMAIL || process.env.SMTP_USER || 'info@grandeurvoyages.com',
        replyTo: email,
        subject: `[Journal] New Newsletter Subscriber: ${email}`,
        text: `New subscriber signed up for Grandeur Voyages Journal stories:\n\nEmail: ${email}\nSource: ${req.body.source || 'Journal & Stories Page'}\nIP: ${clientIp}\nTime: ${subDate} at ${subTime} IST (${subTimestampIST})`,
        html: htmlContent
      });
      log.info(`[SMTP] Newsletter subscription notification delivered for: ${email}`);
    } catch (e) {
      log.warn('[SMTP] Newsletter notification send error:', e.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Thank you for subscribing to Grandeur Voyages Journal.'
  });
});

// ==============================================================================
// 15. Callback Request Route (`/api/callback` for Aria Chatbot)
// ==============================================================================
app.post('/api/callback', rateLimiterMiddleware, (req, res) => {
  req.body.source = req.body.source || 'Aria Chatbot (Callback)';
  return handleLeadSubmission(req, res);
});

// ==============================================================================
// 16. 404 & Global Error Handling
// ==============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

app.use((err, req, res, _next) => {
  log.error('Unhandled Server Exception:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error. Please reach out to Grandeur Voyages directly on WhatsApp or phone.'
  });
});

// ==============================================================================
// 17. Server Bootstrapping
// ==============================================================================
const server = app.listen(PORT, () => {
  log.info(`=======================================================`);
  log.info(`Grandeur Voyages Concierge API Server listening on port ${PORT}`);
  log.info(`Environment: ${process.env.NODE_ENV || 'production'}`);
  log.info(`Timezone: ${IST_TIMEZONE} (System TZ: ${process.env.TZ || 'default'})`);
  log.info(`Current Server Time (IST): ${getISTDisplayTimestamp()}`);
  log.info(`Health check: http://localhost:${PORT}/api/health`);
  log.info(`=======================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    log.info('HTTP server closed.');
    process.exit(0);
  });
});

export default app;
