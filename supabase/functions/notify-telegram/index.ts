// Edge function: send a Telegram message to the platform owner's chat
// Used by the public-facing "Telegram" CTA so visitors don't need a Telegram account
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !CHAT_ID) {
      return new Response(
        JSON.stringify({ error: 'Telegram is not fully configured on the server.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const { domain, score, reportUrl, name, contact, note } = body || {};

    const lines = [
      '🔔 <b>New audit lead from your CTA</b>',
      '',
      domain ? `🌐 <b>Domain:</b> ${escapeHtml(domain)}` : null,
      typeof score === 'number' ? `📊 <b>Score:</b> ${score}/100` : null,
      reportUrl ? `📄 <b>Report:</b> ${escapeHtml(reportUrl)}` : null,
      name ? `👤 <b>Name:</b> ${escapeHtml(name)}` : null,
      contact ? `✉️ <b>Contact:</b> ${escapeHtml(contact)}` : null,
      '',
      note ? escapeHtml(note) : 'Visitor clicked "Talk on Telegram" — they want to start Phase 1 (Website Optimization).',
    ].filter(Boolean).join('\n');

    const tgRes = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: lines,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await tgRes.json().catch(() => ({}));
    if (!tgRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Telegram delivery failed', detail: data }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
