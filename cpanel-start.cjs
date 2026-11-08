/**
 * cPanel Phusion Passenger CommonJS Bootstrap Wrapper
 *
 * Phusion Passenger on cPanel requires a CommonJS entry point on many hosting environments.
 * This wrapper dynamically imports the ES Module server.js to eliminate 503 Service Unavailable errors.
 */

// Enforce Indian Standard Time (IST, UTC+5:30) across the Passenger Node process
process.env.TZ = 'Asia/Kolkata';

(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('Fatal: Failed to bootstrap Urban Craft & Co. API Server:', err);
    process.exit(1);
  }
})();

