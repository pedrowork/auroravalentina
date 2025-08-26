const { google } = require('googleapis');
const crypto = require('crypto');

function getEnv(name, fallback) {
  const v = process.env[name];
  return v !== undefined ? v : fallback;
}

function buildJwtAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Service Account credenciais ausentes.');
  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
}

function toIso(dateStr, timeStr, tzOffset) {
  return new Date(`${dateStr}T${timeStr}${tzOffset}`).toISOString();
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = JSON.parse(event.body || '{}');
    const { nome, parentesco, data, horario, email } = body;
    if (!nome || !parentesco || !data || !horario) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Campos obrigatórios: nome, parentesco, data, horario' }) };
    }

    const tzOffset = getEnv('TIMEZONE_OFFSET', '-03:00');
    const timezone = getEnv('TIMEZONE', 'America/Sao_Paulo');
    const calendarId = getEnv('GOOGLE_CALENDAR_ID', 'primary');

    const startIso = toIso(data, `${horario}:00`, tzOffset);
    const endIso = new Date(new Date(startIso).getTime() + 30 * 60 * 1000).toISOString();

    const auth = buildJwtAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    // Revalidação via FreeBusy
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: startIso,
        timeMax: endIso,
        items: [{ id: calendarId }],
      },
    });
    const hasBusy = (fb.data.calendars?.[calendarId]?.busy || []).length > 0;
    if (hasBusy) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Horário indisponível' }) };
    }

    const deterministicId = crypto
      .createHash('sha256')
      .update(`${data}|${horario}|${nome}`)
      .digest('hex')
      .slice(0, 32);

    const attendees = [];
    if (email) attendees.push({ email });

    const eventResource = {
      id: deterministicId,
      summary: `[Agendamento WhatsApp] ${nome}`,
      description: `Chamada de vídeo agendada\nNome: ${nome}\nParentesco: ${parentesco}\nPlataforma: WhatsApp`,
      start: { dateTime: startIso, timeZone: timezone },
      end: { dateTime: endIso, timeZone: timezone },
      attendees,
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 15 }] },
    };

    const res = await calendar.events.insert({ calendarId, requestBody: eventResource, sendUpdates: 'none' });

    return { statusCode: 200, body: JSON.stringify({ ok: true, eventId: res.data.id }) };
  } catch (e) {
    console.error('book error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Falha ao agendar' }) };
  }
};


