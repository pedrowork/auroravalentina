const { google } = require('googleapis');

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
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });
}

function toIso(dateStr, timeStr, tzOffset) {
  return new Date(`${dateStr}T${timeStr}${tzOffset}`).toISOString();
}

function generateSlots() {
  const ranges = [
    { startHour: 9, endHour: 11 },
    { startHour: 14, endHour: 17 },
  ];
  const step = 10; // minutes
  const slots = [];
  for (const r of ranges) {
    for (let h = r.startHour; h < r.endHour; h++) {
      for (let m = 0; m < 60; m += step) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
  }
  return slots;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const date = (event.queryStringParameters || {}).date; // YYYY-MM-DD
    if (!date) return { statusCode: 400, body: JSON.stringify({ error: 'date é obrigatório (YYYY-MM-DD)' }) };

    const calendarId = getEnv('GOOGLE_CALENDAR_ID', 'primary');
    const tzOffset = getEnv('TIMEZONE_OFFSET', '-03:00');

    const auth = buildJwtAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    // FreeBusy para o dia
    const timeMin = toIso(date, '00:00:00', tzOffset);
    const timeMax = toIso(date, '23:59:59', tzOffset);
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      },
    });

    const busy = (fb.data.calendars?.[calendarId]?.busy || []).map(b => ({
      start: new Date(b.start),
      end: new Date(b.end),
    }));

    const allSlots = generateSlots();
    const available = [];
    for (const s of allSlots) {
      const start = new Date(toIso(date, `${s}:00`, tzOffset));
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const blocked = busy.some(b => overlaps(start, end, b.start, b.end));
      if (!blocked) available.push(s);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ date, tzOffset, slots: available }),
      headers: { 'Cache-Control': 'public, max-age=60' },
    };
  } catch (e) {
    console.error('availability error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Falha ao consultar disponibilidade' }) };
  }
};


