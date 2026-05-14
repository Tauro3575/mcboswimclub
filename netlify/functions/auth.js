// netlify/functions/auth.js
const SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
const API_SECRET = process.env.MSC_API_SECRET;

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
    delete loginAttempts[ip];
    return false;
  }
  return false;
}

function getRemainingBlock(ip) {
  const record = loginAttempts[ip];
  if (!record?.blockedUntil) return 0;
  return Math.ceil((record.blockedUntil - Date.now()) / 60000);
}

async function notificarBloqueo(ip, email) {
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET },
      body: JSON.stringify({
        accion: 'alertaBloqueo',
        ip,
        email,
        fecha: new Date().toISOString()
      }),
      redirect: 'follow'
    });
  } catch(e) {
    console.log('Error notificando bloqueo:', e.message);
  }
}

async function registerAttempt(ip, email, success) {
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, blockedUntil: null, email };
  if (success) { delete loginAttempts[ip]; return false; }
  
  loginAttempts[ip].count++;
  loginAttempts[ip].email = email;
  
  if (loginAttempts[ip].count >= 3) {
    loginAttempts[ip].blockedUntil = Date.now() + (30 * 60 * 1000);
    await notificarBloqueo(ip, email);
    return true; // bloqueado
  }
  return false;
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

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const ip = getClientIP(event);

  try {
    const body = JSON.parse(event.body);
    const { accion, email, password, totp } = body;

    if (accion === 'loginAdmin') {
      if (isBlocked(ip)) {
        const mins = getRemainingBlock(ip);
        return {
          statusCode: 429, headers,
          body: JSON.stringify({
            success: false,
            error: `IP bloqueada por demasiados intentos. Intenta en ${mins} minutos.`,
            bloqueado: true
          })
        };
      }

      const response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET },
        body: JSON.stringify({ accion: 'validarAdmin', email, password, totp, ip }),
        redirect: 'follow'
      });

      const data = await response.json();

      if (data.success || data.primerLogin || data.requiere2FA) {
        await registerAttempt(ip, email, true);
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      } else {
        const bloqueado = await registerAttempt(ip, email, false);
        const attempts  = loginAttempts[ip]?.count || 0;
        const restantes = Math.max(0, 3 - attempts);
        return {
          statusCode: 401, headers,
          body: JSON.stringify({
            ...data,
            intentosRestantes: restantes,
            bloqueado
          })
        };
      }
    }

    if (accion === 'setup2FA' || accion === 'cambiarPassword') {
      const response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET },
        body: JSON.stringify(body),
        redirect: 'follow'
      });
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Acción no válida' }) };

  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno: ' + e.message }) };
  }
};
