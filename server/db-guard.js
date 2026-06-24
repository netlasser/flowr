import pool from './db.js';

let _available = false;

export function isDbAvailable() {
  return _available;
}

export async function checkDbAvailability() {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB health check timed out')), 10000),
    );
    await Promise.race([pool.query('SELECT 1'), timeout]);
    _available = true;
    console.log('[DB] Connection OK');
  } catch (err) {
    _available = false;
    console.warn('[DB] Unavailable — falling back to offline mode:', err.message);
  }
  return _available;
}

export function queryWithTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('DB query timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
