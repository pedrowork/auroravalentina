// Netlify Function: cria evento no Google Calendar da conta administradora
// Requer variáveis de ambiente:
// - GOOGLE_SERVICE_ACCOUNT_EMAIL
// - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (com \n escapados)
// - GOOGLE_CALENDAR_ID (ex.: 'primary' ou ID do calendário)
// - TIMEZONE (ex.: 'America/Sao_Paulo')

const { google } = require('googleapis');

function buildJwtAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Service Account credenciais ausentes. Configure GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.');
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { nome, parentesco, data, horario, email } = body;

    if (!nome || !parentesco || !data || !horario) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Campos obrigatórios: nome, parentesco, data, horario' }) };
    }

    const timezone = process.env.TIMEZONE || 'America/Sao_Paulo';
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Monta datas
    const startDateTime = new Date(`${data}T${horario}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

    const jwtClient = buildJwtAuth();
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const attendees = [];
    if (email) {
      attendees.push({ email });
    }

    const resource = {
      summary: `[Agendamento WhatsApp] ${nome}`,
      description: `Chamada de vídeo agendada\nNome: ${nome}\nParentesco: ${parentesco}\nPlataforma: WhatsApp`,
      start: { dateTime: startDateTime.toISOString(), timeZone: timezone },
      end: { dateTime: endDateTime.toISOString(), timeZone: timezone },
      attendees,
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 15 }] },
    };

    const insertRes = await calendar.events.insert({ calendarId, requestBody: resource });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, eventId: insertRes.data.id }),
    };
  } catch (err) {
    console.error('create-event error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Falha ao criar evento', details: String(err) }) };
  }
};


