exports.handler = async (event) => {
  const APPS_SCRIPT_URL = process.env.GOOGLE_SHEETS_URL;

  try {
    if (event.httpMethod === 'GET') {
      const qs = event.queryStringParameters || {};
      const params = Object.keys(qs)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(qs[k])}`)
        .join('&');
      const url = params ? `${APPS_SCRIPT_URL}?${params}` : APPS_SCRIPT_URL;
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow'
      });
      const text = await response.text();
      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: text
      };
    }

    if (event.httpMethod === 'POST') {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body,
        redirect: 'follow'
      });
      const text = await response.text();
      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: text
      };
    }

  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: e.message })
    };
  }
};
