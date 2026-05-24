// Live SERP rank lookup via Semrush connector gateway.
// Given a domain + list of keywords, returns each keyword's position in the
// top organic SERP, plus search volume / difficulty / CPC where available.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY = 'https://connector-gateway.lovable.dev/semrush';

function normalizeDomain(d: string): string {
  try {
    const u = new URL(d.startsWith('http') ? d : `https://${d}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }
}

function parseSemrushCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(';');
  const rows = lines.slice(1).map(l => l.split(';'));
  return { headers, rows };
}

async function fetchKeywordSerp(keyword: string, database: string, lovableKey: string, semrushKey: string) {
  // phrase_organic returns top organic results for a keyword
  const params = new URLSearchParams({
    type: 'phrase_organic',
    phrase: keyword,
    database,
    export_columns: 'Dn,Ur',
    display_limit: '100',
  });
  const resp = await fetch(`${GATEWAY}/?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': semrushKey,
    },
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Semrush phrase_organic ${resp.status}: ${text.substring(0, 200)}`);
  return parseSemrushCsv(text);
}

async function fetchKeywordMetrics(keyword: string, database: string, lovableKey: string, semrushKey: string) {
  const params = new URLSearchParams({
    type: 'phrase_this',
    phrase: keyword,
    database,
    export_columns: 'Ph,Nq,Cp,Co,Kd',
  });
  const resp = await fetch(`${GATEWAY}/?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': semrushKey,
    },
  });
  const text = await resp.text();
  if (!resp.ok) return null;
  const parsed = parseSemrushCsv(text);
  if (parsed.rows.length === 0) return null;
  const row = parsed.rows[0];
  const idx = (h: string) => parsed.headers.indexOf(h);
  return {
    searchVolume: parseInt(row[idx('Nq')] || '0', 10) || 0,
    cpc: parseFloat(row[idx('Cp')] || '0') || 0,
    difficulty: Math.round(parseFloat(row[idx('Kd')] || '0') || 0),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { domain, keywords, database = 'us' } = await req.json();
    if (!domain || !Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'domain and keywords[] are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const kws = keywords.slice(0, 10).map((k: string) => String(k).trim()).filter(Boolean);
    if (kws.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'At least one keyword required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const semrushKey = Deno.env.get('SEMRUSH_API_KEY');
    if (!lovableKey || !semrushKey) {
      return new Response(JSON.stringify({
        success: false,
        provider: 'semrush',
        notConnected: true,
        error: 'Connect Semrush to enable live SERP ranking. Open the connectors panel and link Semrush.',
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const target = normalizeDomain(domain);
    const results = await Promise.all(kws.map(async (keyword) => {
      try {
        const [serp, metrics] = await Promise.all([
          fetchKeywordSerp(keyword, database, lovableKey, semrushKey),
          fetchKeywordMetrics(keyword, database, lovableKey, semrushKey),
        ]);
        const dnIdx = serp.headers.indexOf('Dn');
        const urIdx = serp.headers.indexOf('Ur');
        let position: number | null = null;
        let foundUrl = '';
        for (let i = 0; i < serp.rows.length; i++) {
          const row = serp.rows[i];
          const dn = (row[dnIdx] || '').toLowerCase().replace(/^www\./, '');
          if (dn === target || dn.endsWith(`.${target}`) || target.endsWith(`.${dn}`)) {
            position = i + 1;
            foundUrl = row[urIdx] || '';
            break;
          }
        }
        return {
          keyword,
          position,
          url: foundUrl,
          searchVolume: metrics?.searchVolume ?? 0,
          difficulty: metrics?.difficulty ?? 0,
          cpc: metrics?.cpc ?? 0,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        // Detect quota exhaustion
        if (msg.includes('TOTAL LIMIT EXCEEDED') || msg.includes('"status":403')) {
          throw new Error('QUOTA_EXHAUSTED');
        }
        return { keyword, position: null, url: '', searchVolume: 0, difficulty: 0, cpc: 0, error: msg };
      }
    }));

    return new Response(JSON.stringify({ success: true, provider: 'semrush', database, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'QUOTA_EXHAUSTED') {
      return new Response(JSON.stringify({ success: false, error: 'Semrush API quota exhausted. Upgrade your plan or wait for the quota to reset.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
