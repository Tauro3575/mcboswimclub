// netlify/functions/admin.js
const SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    let response;

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const url = SHEETS_URL + '?' + new URLSearchParams(params).toString();
      response = await fetch(url);
    } else if (event.httpMethod === 'POST') {
      response = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body,
        redirect: 'follow'
      });
    }

    const text = await response.text();
    return { statusCode: 200, headers, body: text };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
