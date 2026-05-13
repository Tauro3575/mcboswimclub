exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

  try {
    let response;

    if (event.httpMethod === 'GET') {
      const qs = event.queryStringParameters || {};
      const params = Object.keys(qs)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(qs[k])}`)
        .join('&');
      const url = params ? `${SHEETS_URL}?${params}` : SHEETS_URL;
      response = await fetch(url, { method: 'GET', redirect: 'follow' });
    } else if (event.httpMethod === 'POST') {
      response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body,
        redirect: 'follow'
      });
    }

    // Devolver la respuesta REAL del Apps Script
    const text = await response.text();
    return {
      statusCode: 200,
      headers,
      body: text
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.toString() })
    };
  }
};
