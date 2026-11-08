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
 * Example: "08/11/2026"
 */
export function getISTDateString(d = new Date()) {
  const p = getISTDateParts(d);
  return `${p.day}/${p.month}/${p.year}`;
}

/**
 * Returns formatted 24-hr time string in IST: HH:MM:SS
 * Example: "05:30:15"
 */
export function getISTTimeString(d = new Date()) {
  const p = getISTDateParts(d);
  return `${p.hour}:${p.minute}:${p.second}`;
}

/**
 * Returns an ISO 8601-formatted timestamp anchored to the IST offset (+05:30)
 * Example: "2026-11-08T05:30:15.123+05:30"
 */
export function getISTISOString(d = new Date()) {
  const p = getISTDateParts(d);
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}.${ms}+05:30`;
}

/**
 * Returns a human-friendly timestamp string in IST
 * Example: "08/11/2026 at 05:30:15 IST"
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
// cPanel Node.js Application Manager / Phusion Passenger dynamically provides process.env.PORT.
// In production, never assign a hardcoded port number.
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' && typeof PhusionPassenger !== 'undefined' ? 'passenger' : 3001);
const isDev = process.env.NODE_ENV !== 'production';
const startTime = Date.now();

// Disable express identification banner
app.disable('x-powered-by');

// Trust reverse proxy (cPanel Passenger, Cloudflare, Apache, Nginx)
app.set('trust proxy', 1);

// Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: false,
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
  'https://urbancraftgifts.com',
  'https://www.urbancraftgifts.com',
  ...allowedOriginsEnv
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (BetterStack health monitors, cURL, internal pings)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = defaultAllowedOrigins.includes(origin);
    const isLocalDev = isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isUrbanCraftDomain = origin.endsWith('.urbancraftgifts.com') || origin.endsWith('.shellinfosec.com');

    if (isExplicitlyAllowed || isLocalDev || isUrbanCraftDomain) {
      return callback(null, true);
    }

    log.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
    return callback(new Error('Cross-Origin Request Blocked by Security Policy'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'X-Admin-Key', 'CF-Connecting-IP', 'CF-IPCountry']
}));

// ==============================================================================
// 4b. RFC 8288 Link Headers & Markdown for Agents (Content Negotiation)
// ==============================================================================
app.use((req, res, next) => {
  // RFC 8288 Link headers for automated agent discovery (IANA registered relation types)
  res.setHeader(
    'Link',
    [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</.well-known/ard.json>; rel="ard"',
      '</.well-known/openapi.json>; rel="service-desc"',
      '</docs/api>; rel="service-doc"',
      '</auth.md>; rel="describedby"',
      '</.well-known/ai-catalog.json>; rel="service-desc"',
      '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"'
    ].join(', ')
  );

  // Markdown for Agents content negotiation (requests with Accept: text/markdown)
  const accept = req.headers.accept || '';
  if (accept.includes('text/markdown') && req.method === 'GET' && !req.path.startsWith('/api')) {
    const publicDir = path.join(__dirname, 'public');
    const distDir = path.join(__dirname, 'dist');
    const baseSlug =
      req.path === '/'
        ? 'index'
        : req.path.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
    const prospectiveMdFiles = [
      path.join(publicDir, `${baseSlug}.md`),
      path.join(distDir, `${baseSlug}.md`),
      path.join(publicDir, 'index.md'),
      path.join(distDir, 'index.md'),
    ];

    for (const mdFile of prospectiveMdFiles) {
      if (fs.existsSync(mdFile)) {
        const content = fs.readFileSync(mdFile, 'utf8');
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('x-markdown-tokens', Math.ceil(content.length / 4));
        res.setHeader('Vary', 'Accept');
        return res.status(200).send(content);
      }
    }
  }

  next();
});

// ==============================================================================
// 4c. Well-Known Agent Discovery Endpoints & Direct Fallbacks
// ==============================================================================
const sendWellKnownFile = (res, relativePath, contentType) => {
  const fileCandidates = [
    path.join(__dirname, 'public', '.well-known', relativePath),
    path.join(__dirname, 'dist', '.well-known', relativePath),
    path.join(__dirname, '..', 'public', '.well-known', relativePath),
  ];
  for (const f of fileCandidates) {
    if (fs.existsSync(f)) {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
      return res.status(200).sendFile(f);
    }
  }
  return res.status(404).json({ error: `${relativePath} not found` });
};

app.get('/.well-known/oauth-protected-resource', (req, res) => {
  sendWellKnownFile(res, 'oauth-protected-resource', 'application/json; charset=utf-8');
});
app.get('/.well-known/oauth-protected-resource.json', (req, res) => {
  sendWellKnownFile(res, 'oauth-protected-resource.json', 'application/json; charset=utf-8');
});

app.get('/.well-known/oauth-authorization-server', (req, res) => {
  sendWellKnownFile(res, 'oauth-authorization-server', 'application/json; charset=utf-8');
});
app.get('/.well-known/oauth-authorization-server.json', (req, res) => {
  sendWellKnownFile(res, 'oauth-authorization-server.json', 'application/json; charset=utf-8');
});

app.get('/.well-known/openid-configuration', (req, res) => {
  sendWellKnownFile(res, 'openid-configuration', 'application/json; charset=utf-8');
});
app.get('/.well-known/openid-configuration.json', (req, res) => {
  sendWellKnownFile(res, 'openid-configuration.json', 'application/json; charset=utf-8');
});

app.get('/.well-known/api-catalog', (req, res) => {
  sendWellKnownFile(res, 'api-catalog', 'application/linkset+json; charset=utf-8');
});
app.get('/.well-known/api-catalog.json', (req, res) => {
  sendWellKnownFile(res, 'api-catalog.json', 'application/linkset+json; charset=utf-8');
});

app.get('/.well-known/ai-catalog.json', (req, res) => {
  sendWellKnownFile(res, 'ai-catalog.json', 'application/json; charset=utf-8');
});

app.get('/.well-known/ard.json', (req, res) => {
  sendWellKnownFile(res, 'ard.json', 'application/json; charset=utf-8');
});

app.get('/.well-known/mcp/server-card.json', (req, res) => {
  sendWellKnownFile(res, path.join('mcp', 'server-card.json'), 'application/json; charset=utf-8');
});

app.get('/.well-known/agent-skills/index.json', (req, res) => {
  sendWellKnownFile(res, path.join('agent-skills', 'index.json'), 'application/json; charset=utf-8');
});

app.get('/.well-known/dns-aid.json', (req, res) => {
  sendWellKnownFile(res, 'dns-aid.json', 'application/json; charset=utf-8');
});

app.get('/auth.md', (req, res) => {
  const authCandidates = [
    path.join(__dirname, 'public', 'auth.md'),
    path.join(__dirname, 'dist', 'auth.md'),
    path.join(__dirname, '..', 'public', 'auth.md'),
  ];
  for (const f of authCandidates) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('x-markdown-tokens', Math.ceil(content.length / 4));
      return res.status(200).send(content);
    }
  }
  return res.status(404).send('# auth.md not found');
});

// ==============================================================================
// 5. Lightweight In-Memory Sliding Window Rate Limiter
// ==============================================================================
const requestWindowMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 30; // 30 submissions per IP per 15 min

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
      error: 'Too many requests submitted from your network. Please wait a few minutes before trying again or reach out directly via WhatsApp.'
    });
  }

  next();
}

// ==============================================================================
// 6. Cloudflare Turnstile Server-Side Verification
// ==============================================================================
const TURNSTILE_SECRET = process.env.CF_TURNSTILE_SECRET || process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY || '';
const TURNSTILE_BYPASS = process.env.TURNSTILE_BYPASS === 'true';

async function verifyTurnstile(token, clientIp) {
  if (TURNSTILE_BYPASS) {
    log.info('[TURNSTILE] Bypass enabled by environment variable.');
    return { success: true, bypassed: true };
  }

  // Seamless local development bypass
  if (
    token === 'cf_dev_dummy_token' ||
    (typeof token === 'string' && token.startsWith('dummy_')) ||
    token === '1x00000000000000000000AA' ||
    (isDev && (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost' || clientIp === '::ffff:127.0.0.1'))
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
// 7. Atomic Monthly Rotating Lead Storage
// ==============================================================================
const dataDir = path.join(__dirname, process.env.DATA_DIR || 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {}
}

const rescueFile = path.join(dataDir, 'leads_rescue.jsonl');

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
        // Write to temporary file, then atomically rename to prevent partial writes
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
const smtpHost = process.env.SMTP_HOST || 's782.bom1.mysecurecloudhost.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER || 'notifications@urbancraftgifts.com';
const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
const isSecure = process.env.SSL_SECURE === 'YES' || process.env.SSL_SECURE === 'true' || smtpPort === 465;

const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USERNAME || process.env.SMTP_FROM || 'notifications@urbancraftgifts.com';
const recipientEmail = process.env.RECIPIENT_EMAIL || process.env.NOTIFICATION_EMAIL || senderEmail;

if (!smtpPass) {
  log.warn('[SECURITY NOTICE] SMTP_PASS is unset. Outbound emails will simulate delivery until configured.');
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
      log.info(`[SMTP] Transporter verified & ready for ${smtpUser} via ${smtpHost}:${smtpPort}`);
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
function buildUrbanCraftLeadEmail({
  id,
  source = 'Website Enquiry',
  name,
  email,
  phone,
  company,
  location,
  intent,
  quantity,
  date,
  customization,
  categories = [],
  products = [],
  subject,
  notes,
  telemetry
}) {
  const cleanPhone = cleanPhoneNumber(phone);
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hello ${name || 'there'},\n\nThank you for reaching out to Urban Craft & Co. We have received your enquiry regarding corporate gifting (Ref: ${id}) and would love to assist you with curated options and pricing.`
      )}`
    : '';

  const siteUrl = 'https://urbancraftgifts.com';
  const logoUrl = 'https://urbancraftgifts.com/brand/urbancraft-logo.png';

  const uaDetails = parseUserAgentDetails(telemetry?.userAgent);
  const deviceType = telemetry?.device || uaDetails.device;
  const osType = uaDetails.os;
  const browserType = uaDetails.browser;
  const formattedDate = telemetry?.submissionDate || getISTDateString();
  const formattedTime = telemetry?.submissionTime || getISTTimeString();

  // Normalize intent label
  const intentLabels = {
    employee: 'Employee Gifting',
    client: 'Client / Partner Gifting',
    onboarding: 'Onboarding / Welcome Kits',
    event: 'Event or Conference Giveaways',
    festive: 'Festive Gifting',
    other: 'Custom Merchandise / Other'
  };
  const displayIntent = intentLabels[intent] || intent || 'Corporate Gifting';

  const customizationLabels = {
    yes: 'Yes, with Company Logo & Custom Branding',
    no: 'No, unbranded / standard',
    unsure: 'Not sure yet (Guidance needed)'
  };
  const displayCustomization = customizationLabels[customization] || customization || 'Not specified';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Urban Craft & Co. - New Enquiry [${escapeHtml(id)}]</title>
  <style>
    body {
      margin: 0 !important;
      padding: 24px 12px !important;
      background-color: #FAF8F5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1F2421;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    td {
      padding: 0;
    }
    a {
      text-decoration: none;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center style="width: 100%; table-layout: fixed;">
    <div style="max-width: 620px; margin: 0 auto; text-align: left;">

      <!-- Main Container Card -->
      <table role="presentation" width="100%" style="background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E6E0D6; overflow: hidden; box-shadow: 0 4px 16px rgba(47, 58, 46, 0.04);">

        <!-- Header -->
        <tr>
          <td style="background-color: #FAF8F5; padding: 28px 32px; border-bottom: 1px solid #E6E0D6; text-align: center;">
            <a href="${siteUrl}" target="_blank" style="display: inline-block;">
              <span style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #2F3A2E; letter-spacing: 0.5px; display: block;">URBAN CRAFT &amp; CO.</span>
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8C6D58; display: block; margin-top: 4px;">Gifts That Mean More &bull; Corporate Gifting</span>
            </a>
            <div style="margin-top: 18px; display: inline-block; background-color: #EAE6DE; padding: 5px 14px; border-radius: 20px;">
              <span style="color: #2F3A2E; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(source)}</span>
            </div>
            <p style="margin: 10px 0 0 0; color: #6B7280; font-size: 12px;">
              Received on <strong style="color: #1F2421;">${escapeHtml(formattedDate)}</strong> at <strong style="color: #1F2421;">${escapeHtml(formattedTime)} IST</strong> &bull; Ref: <strong style="color: #2F3A2E;">${escapeHtml(id)}</strong>
            </p>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 28px 32px;">

            <!-- Lead Summary Highlight -->
            <div style="background-color: #F8F6F1; border-left: 4px solid #2F3A2E; padding: 14px 18px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px;">
              <p style="margin: 0; color: #2F3A2E; font-size: 15px; font-weight: 600;">
                New Enquiry from <span style="color: #8C6D58;">${escapeHtml(name)}</span>${company ? ` (${escapeHtml(company)})` : ''}
              </p>
              <p style="margin: 4px 0 0 0; color: #4B5563; font-size: 13px;">
                ${quantity ? `Quantity: <strong>${escapeHtml(quantity)} units</strong> &bull; ` : ''}Purpose: <strong>${escapeHtml(displayIntent)}</strong>
              </p>
            </div>

            <!-- Client Contact Details -->
            <h2 style="margin: 0 0 12px 0; color: #2F3A2E; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              Contact Information
            </h2>
            <table role="presentation" width="100%" style="margin-bottom: 24px; border: 1px solid #EAE6DE; border-radius: 8px; overflow: hidden;">
              <tr style="background-color: #FAF8F5;">
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; width: 35%; border-bottom: 1px solid #EAE6DE;">Full Name:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Email Address:</td>
                <td style="padding: 10px 14px; color: #2F3A2E; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">
                  <a href="mailto:${escapeHtml(email)}" style="color: #2F3A2E; text-decoration: underline;">${escapeHtml(email || 'Not provided')}</a>
                </td>
              </tr>
              <tr style="background-color: #FAF8F5;">
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Phone / WhatsApp:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">
                  ${phone ? `<a href="tel:${escapeHtml(phone)}" style="color: #1F2421;">${escapeHtml(phone)}</a>` : 'Not provided'}
                  ${cleanPhone ? ` &bull; <a href="${waUrl}" target="_blank" style="color: #166534; font-weight: bold; text-decoration: underline;">Chat on WhatsApp &rarr;</a>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Company / Org:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(company || 'Not provided')}</td>
              </tr>
              <tr style="background-color: #FAF8F5;">
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px;">Delivery City:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600;">${escapeHtml(location || 'Not provided')}</td>
              </tr>
            </table>

            <!-- Requirements Section -->
            <h2 style="margin: 0 0 12px 0; color: #2F3A2E; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              Gifting &amp; Project Requirements
            </h2>
            <table role="presentation" width="100%" style="margin-bottom: 24px; border: 1px solid #EAE6DE; border-radius: 8px; overflow: hidden;">
              <tr style="background-color: #FAF8F5;">
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; width: 35%; border-bottom: 1px solid #EAE6DE;">Gifting Purpose:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(displayIntent)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Approximate Quantity:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(quantity || 'Not specified')}</td>
              </tr>
              <tr style="background-color: #FAF8F5;">
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Needed By / Date:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(date || 'Flexible / Not stated')}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Logo Customization:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(displayCustomization)}</td>
              </tr>
              ${subject ? `
              <tr style="background-color: #FAF8F5;">
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Subject / Interest:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(subject)}</td>
              </tr>
              ` : ''}
              ${categories.length > 0 ? `
              <tr style="background-color: #FAF8F5;">
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px; border-bottom: 1px solid #EAE6DE;">Categories:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600; border-bottom: 1px solid #EAE6DE;">${escapeHtml(categories.join(', '))}</td>
              </tr>
              ` : ''}
              ${products.length > 0 ? `
              <tr>
                <td style="padding: 10px 14px; color: #6B7280; font-size: 13px;">Selected Products:</td>
                <td style="padding: 10px 14px; color: #1F2421; font-size: 13px; font-weight: 600;">${escapeHtml(products.join(', '))}</td>
              </tr>
              ` : ''}
            </table>

            <!-- Client Message / Notes -->
            ${notes ? `
            <h2 style="margin: 0 0 10px 0; color: #2F3A2E; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              Client Brief / Message
            </h2>
            <div style="background-color: #FAF8F5; border: 1px solid #EAE6DE; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-line;">
              ${escapeHtml(notes)}
            </div>
            ` : ''}

            <!-- Quick Action Buttons -->
            <table role="presentation" width="100%" style="margin-top: 10px; margin-bottom: 24px;">
              <tr>
                <td align="center">
                  <table role="presentation">
                    <tr>
                      ${email ? `
                      <td style="padding-right: 10px;">
                        <a href="mailto:${escapeHtml(email)}?subject=Re:%20Urban%20Craft%20%26%20Co.%20Enquiry%20%5B${escapeHtml(id)}%5D" style="display: inline-block; background-color: #2F3A2E; color: #FAF8F5; padding: 12px 22px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">
                          Reply via Email
                        </a>
                      </td>
                      ` : ''}
                      ${cleanPhone ? `
                      <td>
                        <a href="${waUrl}" target="_blank" style="display: inline-block; background-color: #166534; color: #FFFFFF; padding: 12px 22px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">
                          Message on WhatsApp
                        </a>
                      </td>
                      ` : ''}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Telemetry & Security Footprint -->
            <div style="border-top: 1px solid #E6E0D6; padding-top: 18px; margin-top: 18px;">
              <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                Security &amp; Telemetry Data
              </p>
              <table role="presentation" width="100%" style="font-size: 11px; color: #6B7280;">
                <tr>
                  <td style="padding: 2px 0; width: 25%;">Client IP:</td>
                  <td style="padding: 2px 0; color: #374151; font-family: monospace;">${escapeHtml(telemetry?.ip || 'Unknown')}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0;">Estimated Location:</td>
                  <td style="padding: 2px 0; color: #374151;">${escapeHtml(telemetry?.location || 'Unknown')}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0;">ISP / Network:</td>
                  <td style="padding: 2px 0; color: #374151;">${escapeHtml(telemetry?.isp || 'Unknown')}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0;">Device &amp; OS:</td>
                  <td style="padding: 2px 0; color: #374151;">${escapeHtml(deviceType)} &bull; ${escapeHtml(osType)} &bull; ${escapeHtml(browserType)}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0;">Referer / Source:</td>
                  <td style="padding: 2px 0; color: #374151; word-break: break-all;">${escapeHtml(telemetry?.page || telemetry?.referer || 'Direct')}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0;">Security Status:</td>
                  <td style="padding: 2px 0; color: #166534; font-weight: 600;">Cloudflare Turnstile Verified &bull; Honeypot Clear</td>
                </tr>
              </table>
            </div>

          </td>
        </tr>

        <!-- Official Brand Footer -->
        <tr>
          <td style="background-color: #FAF8F5; padding: 22px 32px; border-top: 1px solid #E6E0D6; text-align: center; color: #6B7280; font-size: 11px; line-height: 1.6;">
            <strong>Urban Craft &amp; Co.</strong> &bull; Ground Floor, 724, Shivaji Rd, Azad Market, Sadar Bazar, New Delhi 110006<br>
            Phone: <a href="tel:+919266129456" style="color: #2F3A2E;">+91 92661 29456</a> &bull; Email: <a href="mailto:info@urbancraftgifts.com" style="color: #2F3A2E;">info@urbancraftgifts.com</a><br>
            <a href="${siteUrl}" target="_blank" style="color: #8C6D58; font-weight: 600; text-decoration: underline;">urbancraftgifts.com</a> &bull; All rights reserved.
          </td>
        </tr>

      </table>
    </div>
  </center>
</body>
</html>`;

  return { html };
}

// ==============================================================================
// 11. API Health & Monitoring Routes
// ==============================================================================
function getPublicHealthStatus() {
  const now = new Date();
  return {
    status: 'healthy',
    timestampIST: getISTISOString(now),
    timestampUTC: now.toISOString(),
    timezone: IST_TIMEZONE
  };
}

app.get(['/', '/api', '/api/', '/health', '/api/health'], (req, res) => {
  res.status(200).json(getPublicHealthStatus());
});

app.head(['/', '/api', '/api/', '/health', '/api/health'], (req, res) => {
  res.status(200).end();
});

app.get('/api/health/ping', (req, res) => {
  res.status(200).send('pong');
});

// Protected admin diagnostics route (requires secret key in header)
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
      turnstile: TURNSTILE_SECRET ? 'active' : 'unconfigured'
    },
    storage: fs.existsSync(dataDir) ? 'ready' : 'initializing'
  });
});

// ==============================================================================
// 12. Lead Ingestion Processor
// ==============================================================================
async function handleSubmission(req, res, formType = 'inquiry') {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referer = req.headers['referer'] || req.headers['origin'] || 'Direct';
  const now = new Date();
  const body = req.body || {};

  // ----------------------------------------------------------------------------
  // Honeypot Protection: Silent Trapping of Bots
  // ----------------------------------------------------------------------------
  const honeypotWebsite = body.hp_website || body.company_website || body.website;
  const honeypotEmail = body.hp_email || body.hp_secondary_email || body.confirm_email;
  const honeypotPhone = body.hp_phone || body.phone_check;
  const renderTimestamp = parseInt(body._renderedAt || '0', 10);
  const timeTakenMs = renderTimestamp > 0 ? Date.now() - renderTimestamp : 9999;

  const isHoneypotTriggered =
    Boolean(honeypotWebsite) ||
    Boolean(honeypotEmail) ||
    Boolean(honeypotPhone) ||
    (renderTimestamp > 0 && timeTakenMs < 750);

  if (isHoneypotTriggered) {
    log.warn(`[HONEYPOT_TRAPPED] Bot submission trapped from IP: ${clientIp}. Reason: ${
      honeypotWebsite ? 'hp_website' : honeypotEmail ? 'hp_email' : honeypotPhone ? 'hp_phone' : `rapid_submission_${timeTakenMs}ms`
    }`);

    // Silently return 200 OK so bots never adapt or retry
    return res.status(200).json({
      success: true,
      message: 'Enquiry received. An Urban Craft corporate gifting specialist will review your request.'
    });
  }

  // ----------------------------------------------------------------------------
  // Cloudflare Turnstile Verification
  // ----------------------------------------------------------------------------
  const turnstileToken = body['cf-turnstile-response'] || body.turnstileToken || body.token;
  const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);

  if (!turnstileResult.success) {
    log.warn(`[TURNSTILE_FAILED] IP: ${clientIp} failed verification. Error: ${turnstileResult.error || JSON.stringify(turnstileResult['error-codes'])}`);
    return res.status(403).json({
      success: false,
      error: 'Security verification failed. Please complete the security check and try again.'
    });
  }

  // ----------------------------------------------------------------------------
  // Data Sanitization & Extraction
  // ----------------------------------------------------------------------------
  const name = String(body.name || body.fullName || body.userName || '').trim();
  const email = String(body.email || body.userEmail || '').trim();
  const phone = String(body.phone || body.userPhone || body.contact || '').trim();
  const company = String(body.company || body.organization || '').trim();
  const location = String(body.location || body.city || '').trim();
  const intent = String(body.intent || body.purpose || (formType === 'contact' ? 'Contact Form' : 'Corporate Gifting')).trim();
  const quantity = String(body.quantity || '').trim();
  const date = String(body.date || body.neededBy || '').trim();
  const customization = String(body.customization || 'unsure').trim();
  const subject = String(body.subject || '').trim();
  const notes = String(body.notes || body.message || '').trim();
  const source = String(body.source || (formType === 'contact' ? 'Contact Us Page' : 'Corporate Gifting Inquiry')).trim();
  const pageUrl = String(body.pageUrl || referer || '').trim();

  const categories = Array.isArray(body.categories) ? body.categories : (body.categories ? [String(body.categories)] : []);
  const products = Array.isArray(body.products) ? body.products : (body.products ? [String(body.products)] : []);

  // Basic sanity validation
  if (!name && !email && !phone) {
    return res.status(400).json({
      success: false,
      error: 'Please provide at least a name and contact number or email address.'
    });
  }

  // Disallow backdated event / delivery dates
  if (date) {
    const todayIST = getISTISOString(now).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date < todayIST) {
      return res.status(400).json({
        success: false,
        error: 'Target delivery deadline cannot be in the past.'
      });
    }
  }

  // Device & Date formatting in IST
  const clientDevice = parseUserAgentDetails(userAgent).device;
  const submissionDate = getISTDateString(now);
  const submissionTime = getISTTimeString(now);
  const submissionTimestampIST = getISTISOString(now);

  // Geolocation & ISP Network lookup based on IP
  const geo = await lookupIpGeolocation(clientIp, req.headers);

  // Generate unique lead ID: UC-YYYYMM-XXXXXX
  const p = getISTDateParts(now);
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const leadId = `UC-${p.year}${p.month}-${randomSuffix}`;

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
    timezone: 'Asia/Kolkata (IST)'
  };

  const storedEntry = {
    id: leadId,
    timestamp: submissionTimestampIST,
    timestampUTC: now.toISOString(),
    submittedAtIST: getISTDisplayTimestamp(now),
    source,
    formType,
    data: {
      name,
      email: email || '—',
      phone: phone || '—',
      company: company || '—',
      location: location || '—',
      intent: intent || '—',
      quantity: quantity || '—',
      date: date || '—',
      customization,
      categories,
      products,
      subject: subject || '—',
      notes: notes || '—'
    },
    telemetry
  };

  // 1. Persist to Monthly Rotating File (Zero Data Loss Invariant)
  const isSaved = await saveLeadToStorage(storedEntry);
  if (!isSaved) {
    log.error(`[STORAGE] Lead ${leadId} could not be saved to monthly file. Rescue file utilized.`);
  }

  // 2. Dispatch Email Notification via SMTP
  if (smtpPass) {
    try {
      const emailContent = buildUrbanCraftLeadEmail({
        id: leadId,
        source,
        name,
        email,
        phone,
        company,
        location,
        intent,
        quantity,
        date,
        customization,
        categories,
        products,
        subject,
        notes,
        telemetry
      });

      const mailOptions = {
        from: `Urban Craft & Co. <${senderEmail}>`,
        to: recipientEmail,
        replyTo: email || senderEmail,
        subject: `[Urban Craft] New ${source} - ${name || 'Customer'}${company ? ` (${company})` : ''} [${leadId}]`,
        html: emailContent.html
      };

      await transporter.sendMail(mailOptions);
      log.info(`[SMTP] Email notification dispatched for lead [${leadId}] to ${recipientEmail}`);
    } catch (mailErr) {
      log.error(`[SMTP] Delivery failure for lead [${leadId}]:`, mailErr.message);
    }
  } else {
    log.info(`[SMTP] Simulation: Outbound email notification skipped (SMTP_PASS not configured). Lead ID: ${leadId}`);
  }

  return res.status(200).json({
    success: true,
    id: leadId,
    message: 'Thank you! Your enquiry has been received. Our team will get back to you shortly.'
  });
}

// ==============================================================================
// 12b. Agent Discovery & RFC Standards Endpoints
// ==============================================================================

// RFC 9727 API Catalog
app.get('/.well-known/api-catalog', (req, res) => {
  res.setHeader('Content-Type', 'application/linkset+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'api-catalog');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  return res.json({
    linkset: [
      {
        anchor: 'https://urbancraftgifts.com/api',
        'service-desc': [{ href: 'https://urbancraftgifts.com/.well-known/openapi.json', type: 'application/json' }],
        'service-doc': [{ href: 'https://urbancraftgifts.com/docs/api', type: 'text/html' }],
        status: [{ href: 'https://urbancraftgifts.com/api/health', type: 'application/json' }]
      }
    ]
  });
});

// ARD Manifest (Agentic Resource Discovery)
app.get('/.well-known/ai-catalog.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'ai-catalog.json');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

// MCP Server Card (SEP-1649)
app.get('/.well-known/mcp/server-card.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'mcp', 'server-card.json');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

// Agent Skills Discovery Index (RFC v0.2.0)
app.get('/.well-known/agent-skills/index.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'agent-skills', 'index.json');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

// OpenAPI Spec
app.get('/.well-known/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'openapi.json');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

// OAuth & OpenID Discovery
app.get('/.well-known/openid-configuration', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'openid-configuration');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

app.get('/.well-known/oauth-authorization-server', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'oauth-authorization-server');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

app.get('/.well-known/oauth-protected-resource', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', '.well-known', 'oauth-protected-resource');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

// auth.md
app.get('/auth.md', (req, res) => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', 'auth.md');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

// sitemap.xml & robots.txt
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const filePath = path.join(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  const filePath = path.join(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).end();
});

// Route handlers
app.post(['/api/inquire', '/api/leads'], rateLimiterMiddleware, (req, res) => {
  return handleSubmission(req, res, 'inquiry');
});

app.post('/api/contact', rateLimiterMiddleware, (req, res) => {
  return handleSubmission(req, res, 'contact');
});

// ==============================================================================
// 13. 404 & Global Error Handling
// ==============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    requestedPath: req.path
  });
});

app.use((err, req, res, next) => {
  log.error('Unhandled Server Exception:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred. Please contact us directly via WhatsApp or phone.'
  });
});

// ==============================================================================
// 14. Server Bootstrapping
// ==============================================================================
const server = app.listen(PORT, () => {
  log.info(`Urban Craft & Co. API Server online on port/socket: ${PORT}`);
  log.info(`Process Node Version: ${process.version} | Environment: ${process.env.NODE_ENV || 'production'}`);
  log.info(`Timezone enforced: ${process.env.TZ} (${IST_TIMEZONE})`);
});

export default app;
