import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

interface Payload {
  lead: Record<string, any>;
  audit_score: number;
  opportunity_level: string;
  report_id: string | null;
  domain: string;
}

async function sendTelegram(text: string) {
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram not configured');
    return false;
  }
  try {
    const res = await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error('telegram failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('telegram error', e);
    return false;
  }
}

function esc(s: any): string {
  return String(s ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { lead, audit_score, opportunity_level, report_id, domain } = (await req.json()) as Payload;
    if (!lead?.email || !lead?.full_name || !lead?.store_url) {
      return new Response(JSON.stringify({ error: 'missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

    const { data: inserted, error: insertErr } = await sb
      .from('leads')
      .insert({
        full_name: lead.full_name,
        email: lead.email,
        whatsapp: lead.whatsapp || null,
        company_name: lead.company_name || null,
        store_url: lead.store_url,
        user_type: lead.user_type,
        agency_name: lead.agency_name || null,
        agency_website: lead.agency_website || null,
        agency_logo_url: lead.agency_logo_url || null,
        audit_score,
        opportunity_level,
        report_id,
        ip_address: ip,
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('insert lead', insertErr);
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const leadId = inserted!.id;

    // Telegram notification
    const reportUrl = report_id ? `https://webauditpro.lovable.app/report/${report_id}` : '—';
    const tgText = [
      '🔔 <b>New Audit Generated</b>',
      '',
      `<b>Name:</b> ${esc(lead.full_name)}`,
      `<b>Email:</b> ${esc(lead.email)}`,
      `<b>WhatsApp:</b> ${esc(lead.whatsapp)}`,
      `<b>Store:</b> ${esc(domain)}`,
      `<b>Company:</b> ${esc(lead.company_name)}`,
      `<b>User Type:</b> ${esc(lead.user_type)}`,
      lead.user_type === 'agency' ? `<b>Agency:</b> ${esc(lead.agency_name)}` : '',
      `<b>Score:</b> ${audit_score}/100`,
      `<b>Opportunity:</b> ${esc(opportunity_level)}`,
      `<b>Report:</b> ${esc(reportUrl)}`,
      `<b>Date:</b> ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');

    const tgOk = await sendTelegram(tgText);
    if (tgOk) {
      await sb.from('leads').update({ telegram_sent: true }).eq('id', leadId);
    }

    // Try sending audit email (only works after email domain is verified)
    let emailOk = false;
    try {
      const emailRes = await sb.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'audit-report-ready',
          recipientEmail: lead.email,
          idempotencyKey: `audit-${leadId}`,
          templateData: {
            name: lead.full_name,
            domain,
            score: audit_score,
            opportunityLabel: opportunity_level,
            reportUrl,
            isAgency: lead.user_type === 'agency',
            agencyName: lead.agency_name || null,
          },
        },
      });
      emailOk = !emailRes.error;
      if (emailRes.error) console.error('email send error', emailRes.error);
    } catch (e) {
      console.error('email invoke error', e);
    }

    await sb.from('leads').update({
      email_sent: emailOk,
      email_sent_at: emailOk ? new Date().toISOString() : null,
      delivery_status: emailOk ? 'sent' : 'pending_or_failed',
    }).eq('id', leadId);

    return new Response(JSON.stringify({ ok: true, leadId, telegram: tgOk, email: emailOk }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('save-lead fatal', e);
    return new Response(JSON.stringify({ error: e?.message ?? 'unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
