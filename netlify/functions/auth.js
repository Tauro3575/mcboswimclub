// netlify/functions/auth.js
// Maneja autenticación segura con rate limiting y logs

const SHEETS_URL    = process.env.GOOGLE_SHEETS_URL;
const API_SECRET    = process.env.MSC_API_SECRET;

// Rate limiting en memoria (se resetea con cada deploy)
const loginAttempts = {};

function getClientIP(event) {
  return event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         event.headers['x-real-ip'] ||
         event.headers['client-ip'] ||
         'unknown';
}

function isBlocked(ip) {
  const record = loginAttempts[ip];
  if (!record) return false;
  if (record.blockedUntil && Date.now() < record.blockedUntil) return true;
  if (record.blockedUntil && Date.now() >= record.blockedUntil) {
    delete loginAttempts[ip]; // desbloquear
    return false;
  }
  return false;
}

function registerAttempt(ip, success) {
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, blockedUntil: null };
  if (success) {
    delete loginAttempts[ip];
    return;
  }
  loginAttempts[ip].count++;
  if (loginAttempts[ip].count >= 3) {
    loginAttempts[ip].blockedUntil = Date.now() + (30 * 60 * 1000); // 30 min
  }
}

function getRemainingBlock(ip) {
  const record = loginAttempts[ip];
  if (!record?.blockedUntil) return 0;
  const remaining = record.blockedUntil - Date.now();
  return Math.ceil(remaining / 60000); // minutos
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://mcboswimclub.com',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = getClientIP(event);

  try {
    const body = JSON.parse(event.body);
    const { accion, email, password, totp } = body;

    // ── LOGIN ──
    if (accion === 'loginAdmin') {

      // Verificar bloqueo por IP
      if (isBlocked(ip)) {
        const mins = getRemainingBlock(ip);
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            success: false,
            error: `IP bloqueada por demasiados intentos fallidos. Intenta en ${mins} minutos.`,
            bloqueado: true
          })
        };
      }

      // Llamar al Apps Script para validar credenciales
      const response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': API_SECRET
        },
        body: JSON.stringify({ accion: 'validarAdmin', email, password, totp, ip }),
        redirect: 'follow'
      });

      const data = await response.json();

      if (data.success) {
        registerAttempt(ip, true);
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      } else {
        registerAttempt(ip, false);
        const attempts = loginAttempts[ip]?.count || 0;
        const restantes = 3 - attempts;
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            ...data,
            intentosRestantes: restantes > 0 ? restantes : 0,
            bloqueado: restantes <= 0
          })
        };
      }
    }

    // ── SETUP 2FA ──
    if (accion === 'setup2FA') {
      const response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET },
        body: JSON.stringify({ accion: 'setup2FA', email }),
        redirect: 'follow'
      });
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ── CAMBIAR CONTRASEÑA ──
    if (accion === 'cambiarPassword') {
      const response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET },
        body: JSON.stringify({ accion: 'cambiarPassword', email, passwordActual: password, passwordNuevo: body.passwordNuevo }),
        redirect: 'follow'
      });
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Acción no válida' }) };

  } catch(e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno: ' + e.message })
    };
  }
};
