exports.handler = async function(event, context) {
  // CORS headers
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
    const { telefono, nombre } = event.queryStringParameters || {};

    if (!telefono && !nombre) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Se requiere telefono o nombre' })
      };
    }

    const SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

    // Consultamos el Google Apps Script pasando los parámetros de verificación
    const url = `${SHEETS_URL}?action=verificarPrueba&telefono=${encodeURIComponent(telefono || '')}&nombre=${encodeURIComponent(nombre || '')}`;

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.toString(), tienePrueba: false })
    };
  }
};
