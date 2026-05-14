// netlify/functions/admin.js
const SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
const API_SECRET = process.env.MSC_API_SECRET;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://mcboswimclub.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const authHeader = event.headers['authorization'] || '';
  const sessionToken = authHeader.replace('Bearer ', '').trim();

  if (!sessionToken) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Sesión requerida' }) };
  }

  try {
    let response;
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const url = SHEETS_URL + '?' + new URLSearchParams(params).toString();
      response = await fetch(url, {
        headers: { 'X-API-Secret': API_SECRET, 'X-Session-Token': sessionToken },
        redirect: 'follow'
      });
    } else if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Secret': API_SECRET, 'X-Session-Token': sessionToken },
        body: JSON.stringify(body),
        redirect: 'follow'
      });
    }
    const text = await response.text();
    return { statusCode: 200, headers, body: text };
  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
