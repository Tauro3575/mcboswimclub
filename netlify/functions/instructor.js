const { google } = require('googleapis');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);

    // Autenticación con Google
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    if (payload.accion === 'reporte_clase') {
      const fecha = new Date(payload.fecha).toLocaleString('es-VE');
      const presentes = Object.entries(payload.asistencia)
        .filter(([,v]) => v === 'present')
        .map(([id]) => payload.alumnos.find(a => a.id === id)?.nombre || id)
        .join(', ');
      const ausentes = Object.entries(payload.asistencia)
        .filter(([,v]) => v === 'absent')
        .map(([id]) => payload.alumnos.find(a => a.id === id)?.nombre || id)
        .join(', ');
      const justificados = Object.entries(payload.asistencia)
        .filter(([,v]) => v === 'justified')
        .map(([id]) => payload.alumnos.find(a => a.id === id)?.nombre || id)
        .join(', ');

      // Fila resumen de la clase
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Reportes_Clase!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            fecha,
            payload.instructor,
            payload.clase,
            presentes,
            ausentes,
            justificados,
            payload.notas_clase || '',
            JSON.stringify(payload.evaluaciones)
          ]]
        }
      });

      // Filas de evaluación por alumno
      for (const alumno of payload.alumnos) {
        if (payload.asistencia[alumno.id] !== 'present') continue;
        for (const [objId, evals] of Object.entries(payload.evaluaciones)) {
          const resultado = evals[alumno.id] || 'sin-eval';
          const escalado = payload.escalados[objId] ? 'Sí' : 'No';
          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Evaluaciones!A:G',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [[
                fecha,
                payload.instructor,
                payload.clase,
                alumno.nombre,
                objId,
                resultado,
                escalado
              ]]
            }
          });
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
