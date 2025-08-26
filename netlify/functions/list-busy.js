// Netlify Function: lista horários ocupados em uma data
// Requer: mesmas variáveis do create-event.js

const { google } = require('googleapis');

function buildJwtAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Service Account credenciais ausentes.');
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar.events.readonly', 'https://www.googleapis.com/auth/calendar.readonly'],
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const date = (event.queryStringParameters || {}).date; // YYYY-MM-DD
    if (!date) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro date é obrigatório (YYYY-MM-DD).' }) };
    }

    const tz = process.env.TIMEZONE || 'America/Sao_Paulo';
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Constrói janelas de tempo aproximadas para o dia no fuso alvo
    // Nota: para simplicidade, usamos offset fixo quando houver, caso contrário UTC
    const start = new Date(`${date}T00:00:00-03:00`);
    const end = new Date(`${date}T23:59:59-03:00`);

    const auth = buildJwtAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false,
    });

    const busy = [];
    for (const ev of res.data.items || []) {
      if (!ev.start || !ev.start.dateTime) continue;
      const d = new Date(ev.start.dateTime);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      busy.push(`${hh}:${mm}`);
    }

    return { statusCode: 200, body: JSON.stringify({ date, busy, tz }) };
  } catch (err) {
    console.error('list-busy error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Falha ao listar eventos', details: String(err) }) };
  }
};


