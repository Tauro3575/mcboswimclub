exports.handler = async (event) => {
  const APPS_SCRIPT_URL = process.env.GOOGLE_SHEETS_URL;

  try {
    if (event.httpMethod === 'GET') {
      const params = new URLSearchParams(event.queryStringParameters || {});
      const url = `${APPS_SCRIPT_URL}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data)
      };
    }

    if (event.httpMethod === 'POST') {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body
      });
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data)
      };
    }

  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: e.message })
    };
  }
};
