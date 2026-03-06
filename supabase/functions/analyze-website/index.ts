import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || req.headers.get('cf-connecting-ip')
    || 'unknown';
}

function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  if (rateLimitStore.size > 1000) {
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) rateLimitStore.delete(ip);
    }
  }
  const record = rateLimitStore.get(clientIP);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

const genericError = (message: string, status = 500) =>
  new Response(JSON.stringify({ success: false, error: message }), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function validateUrl(url: string): { valid: boolean; error?: string; formatted?: string } {
  if (!url || typeof url !== 'string') return { valid: false, error: 'Please provide a valid URL' };
  const trimmed = url.trim();
  if (trimmed.length > 2048) return { valid: false, error: 'URL is too long' };
  let formatted = trimmed;
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) formatted = `https://${formatted}`;
  try {
    const parsed = new URL(formatted);
    if (!['http:', 'https:'].includes(parsed.protocol)) return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
    const hostname = parsed.hostname.toLowerCase();
    if (['localhost', '0.0.0.0', '127.0.0.1', '::1'].includes(hostname)) return { valid: false, error: 'Local addresses are not allowed' };
    const privatePatterns = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^169\.254\./, /^0\./, /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./];
    for (const p of privatePatterns) if (p.test(hostname)) return { valid: false, error: 'Private network addresses are not allowed' };
    if (hostname === '169.254.169.254' || hostname.includes('metadata.google') || hostname.includes('metadata.azure'))
      return { valid: false, error: 'Metadata endpoints are not allowed' };
    if (!hostname.includes('.')) return { valid: false, error: 'Please provide a valid domain name' };
    return { valid: true, formatted };
  } catch { return { valid: false, error: 'Please provide a valid URL' }; }
}

function detectPlatform(html: string): string {
  const h = html.toLowerCase();
  if (h.includes('cdn.shopify.com') || h.includes('shopify.shop') || h.includes('shopify.theme') || h.includes('myshopify.com')) return 'Shopify';
  if (h.includes('/wp-content/') || h.includes('/wp-includes/') || h.includes('wp-json')) return 'WordPress';
  if (h.includes('static.wixstatic.com') || h.includes('wix.com')) return 'Wix';
  if (h.includes('webflow.js') || h.includes('data-wf-site') || h.includes('webflow.com')) return 'Webflow';
  if (h.includes('static.squarespace.com') || h.includes('squarespace.com')) return 'Squarespace';
  return 'Custom / Unknown';
}

function detectTechnologies(html: string): string[] {
  const techs: string[] = [];
  const h = html.toLowerCase();
  if (h.includes('cdn.shopify.com')) techs.push('Shopify');
  if (h.includes('/wp-content/')) techs.push('WordPress');
  if (h.includes('static.wixstatic.com')) techs.push('Wix');
  if (h.includes('webflow.js') || h.includes('data-wf-site')) techs.push('Webflow');
  if (h.includes('static.squarespace.com')) techs.push('Squarespace');
  if (h.includes('react') || h.includes('__next') || h.includes('_next')) techs.push('React');
  if (h.includes('__next') || h.includes('_next/static')) techs.push('Next.js');
  if (h.includes('vue') || h.includes('__vue')) techs.push('Vue.js');
  if (h.includes('angular')) techs.push('Angular');
  if (h.includes('googletagmanager.com') || h.includes('google-analytics.com') || h.includes('gtag')) techs.push('Google Analytics');
  if (h.includes('cloudflare') || h.includes('cf-ray')) techs.push('Cloudflare');
  if (h.includes('hotjar')) techs.push('Hotjar');
  if (h.includes('facebook.com/tr') || h.includes('fbevents.js')) techs.push('Facebook Pixel');
  if (h.includes('stripe.com') || h.includes('stripe.js')) techs.push('Stripe');
  if (h.includes('intercom')) techs.push('Intercom');
  if (h.includes('crisp.chat')) techs.push('Crisp');
  if (h.includes('tailwind')) techs.push('Tailwind CSS');
  if (h.includes('bootstrap')) techs.push('Bootstrap');
  if (h.includes('jquery')) techs.push('jQuery');
  return [...new Set(techs)];
}

function extractAdvancedSeo(html: string, markdown: string, links: string[]) {
  // Meta title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleVal = titleMatch ? titleMatch[1].trim() : '';
  const titleLen = titleVal.length;
  const titleStatus = !titleVal ? 'missing' : titleLen < 30 ? 'too_short' : titleLen > 60 ? 'too_long' : 'good';

  // Meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const descVal = descMatch ? descMatch[1].trim() : '';
  const descLen = descVal.length;
  const descStatus = !descVal ? 'missing' : descLen < 70 ? 'too_short' : descLen > 160 ? 'too_long' : 'good';

  // Headings
  const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings: { tag: string; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({ tag: match[1].toUpperCase(), text: match[2].replace(/<[^>]*>/g, '').trim().substring(0, 100) });
  }

  // Canonical
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);

  // Structured data
  const hasStructuredData = html.includes('application/ld+json');
  const schemaTypes: string[] = [];
  const ldMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of ldMatches) {
    try {
      const ld = JSON.parse(m[1]);
      if (ld['@type']) schemaTypes.push(ld['@type']);
    } catch {}
  }

  // Images
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const totalImages = imgTags.length;
  const imagesWithoutAlt = imgTags.filter(img => !img.match(/alt=["'][^"']+["']/i)).length;

  // Links
  const urlObj = new URL('https://placeholder.com');
  try { /* just for counting */ } catch {}
  const internalLinks = links.filter(l => {
    try { return new URL(l).hostname === urlObj.hostname; } catch { return false; }
  }).length;

  // Keyword cloud from markdown
  const words = markdown.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const stopWords = new Set(['that', 'this', 'with', 'from', 'your', 'have', 'been', 'will', 'more', 'when', 'what', 'they', 'about', 'which', 'their', 'there', 'would', 'could', 'also', 'into', 'just', 'some', 'than', 'them', 'very', 'each', 'over', 'such', 'were', 'like', 'then', 'most', 'only', 'here', 'come', 'made']);
  const freq: Record<string, number> = {};
  words.forEach(w => { if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1; });
  const keywordCloud = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  return {
    metaTitle: { value: titleVal, length: titleLen, status: titleStatus },
    metaDescription: { value: descVal, length: descLen, status: descStatus },
    headingStructure: headings.slice(0, 30),
    hasCanonical,
    hasRobotsTxt: false, // Can't check from HTML alone
    hasSitemap: false,   // Can't check from HTML alone
    hasStructuredData,
    structuredDataTypes: schemaTypes,
    imagesWithoutAlt,
    totalImages,
    internalLinks,
    externalLinks: links.length - internalLinks,
    keywordCloud,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
      return new Response(
        JSON.stringify({ success: false, error: `Rate limit exceeded. Please try again in ${resetMinutes} minutes.` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url } = await req.json();
    const validation = validateUrl(url);
    if (!validation.valid) return genericError(validation.error || 'Invalid URL', 400);
    const formattedUrl = validation.formatted!;

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) return genericError('Service temporarily unavailable. Please try again later.');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) return genericError('Service temporarily unavailable. Please try again later.');

    console.log('Scraping URL:', formattedUrl);

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: formattedUrl, formats: ['markdown', 'html', 'links'], onlyMainContent: false }),
    });

    const scrapeData = await scrapeResponse.json();
    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('[SCRAPE_ERROR]', scrapeData);
      return genericError('Unable to access this website. Please check the URL and try again.', 400);
    }

    const websiteContent = scrapeData.data?.markdown || '';
    const htmlContent = scrapeData.data?.html || '';
    const links = scrapeData.data?.links || [];
    const metadata = scrapeData.data?.metadata || {};

    // Platform & tech detection
    const detectedPlatform = detectPlatform(htmlContent);
    const technologies = detectTechnologies(htmlContent);
    const advancedSeo = extractAdvancedSeo(htmlContent, websiteContent, links);

    // Check robots.txt and sitemap
    let domain = formattedUrl;
    try { domain = new URL(formattedUrl).origin; } catch {}
    
    try {
      const robotsResp = await fetch(`${domain}/robots.txt`, { signal: AbortSignal.timeout(5000) });
      advancedSeo.hasRobotsTxt = robotsResp.ok;
    } catch { advancedSeo.hasRobotsTxt = false; }

    try {
      const sitemapResp = await fetch(`${domain}/sitemap.xml`, { signal: AbortSignal.timeout(5000) });
      advancedSeo.hasSitemap = sitemapResp.ok;
    } catch { advancedSeo.hasSitemap = false; }

    console.log('Platform:', detectedPlatform, '| Techs:', technologies.join(', '));

    // Build platform-specific prompt section
    let platformPrompt = '';
    if (detectedPlatform === 'Shopify') {
      platformPrompt = `\nPLATFORM-SPECIFIC: This is a Shopify store. Also analyze: theme performance, unused app indicators, product schema markup, Shopify-specific SEO structure, image optimization for product images, collection page structure.`;
    } else if (detectedPlatform === 'WordPress') {
      platformPrompt = `\nPLATFORM-SPECIFIC: This is a WordPress site. Also analyze: plugin overload indicators, caching plugin presence, theme performance, image compression, SEO plugin configuration (Yoast/RankMath), WordPress core update status.`;
    } else if (detectedPlatform === 'Wix') {
      platformPrompt = `\nPLATFORM-SPECIFIC: This is a Wix site. Also analyze: Wix SEO settings, meta tag configuration, mobile responsiveness, image optimization within Wix constraints.`;
    } else if (detectedPlatform === 'Webflow') {
      platformPrompt = `\nPLATFORM-SPECIFIC: This is a Webflow site. Also analyze: Webflow interactions performance, custom script overhead, CMS collection performance, SEO structure within Webflow.`;
    } else if (detectedPlatform === 'Squarespace') {
      platformPrompt = `\nPLATFORM-SPECIFIC: This is a Squarespace site. Also analyze: template performance, SEO configuration, mobile responsiveness, built-in analytics setup.`;
    }

    const analysisPrompt = `You are a professional website auditor. Analyze the following website content and HTML to identify real issues.

Website URL: ${formattedUrl}
Page Title: ${metadata.title || 'Unknown'}
Description: ${metadata.description || 'None found'}
Detected Platform: ${detectedPlatform}
Technologies: ${technologies.join(', ') || 'None detected'}

HTML Content (first 15000 chars):
${htmlContent.substring(0, 15000)}

Page Content:
${websiteContent.substring(0, 10000)}

Links found: ${links.length}
${platformPrompt}

Analyze this specific website for REAL issues. Look for:
1. SEO issues (missing meta tags, poor headings, missing alt text, keyword usage, schema markup, canonical tags)
2. Performance concerns (large images, too many scripts, render-blocking resources, DOM size)
3. Security issues (no HTTPS, mixed content, exposed emails, unsafe cross-origin links)
4. Mobile responsiveness indicators
5. Accessibility problems (missing ARIA, poor contrast, missing alt text)
6. Conversion issues (unclear CTAs, poor UX signals)
7. Content quality issues
8. Branding/trust issues
9. Image optimization (format usage, compression, sizing)

Return a JSON object with this EXACT structure (no markdown, just raw JSON):
{
  "issues": [
    {
      "id": "1",
      "title": "Specific issue title based on actual finding",
      "description": "Detailed description of the actual problem found",
      "severity": "critical|error|warning|info",
      "category": "SEO|Performance|Security|Mobile|Accessibility|Conversion|UX|Branding",
      "impact": "Business impact explanation",
      "recommendation": "Specific actionable fix",
      "priority": "high|medium|low"
    }
  ],
  "scores": {
    "performance": 0-100,
    "seo": 0-100,
    "security": 0-100,
    "mobile": 0-100,
    "accessibility": 0-100,
    "conversion": 0-100
  },
  "summary": "Brief summary of the website's overall health",
  "competitors": [
    {
      "name": "ActualCompetitorDomain.com",
      "healthScore": 84,
      "authorityGap": "+12",
      "contentVolumeGap": "+15%",
      "pageSpeedGap": "-2s"
    }
  ],
  "keywords": [
    {
      "keyword": "specific keyword from this site's niche",
      "monthlySearches": 1200,
      "competition": "Low|Medium|High",
      "currentRank": "Not Ranked|12|45",
      "opportunity": "Low|Medium|High"
    }
  ],
  "growthForecast": [
    {
      "area": "Technical Fixes",
      "action": "Specific action based on issues found",
      "seoLift": "+15-25%",
      "conversionLift": "—"
    }
  ]
}

IMPORTANT:
- Only report issues that are ACTUALLY found in the content
- Be specific to THIS website, not generic issues
- If something looks good, don't report it as an issue
- Return 8-20 issues based on what you actually find
- For competitors: identify 2-3 REAL competing websites in this exact industry/niche
- For keywords: identify 5-8 HIGH-VALUE keywords derived from actual content
- For growthForecast: return 3-5 specific improvement areas with realistic lifts`;

    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error('[AI_ERROR]', await aiResponse.text());
      return genericError('Analysis could not be completed. Please try again.');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';

    let analysis;
    try {
      let clean = aiContent.trim();
      if (clean.startsWith('```json')) clean = clean.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      else if (clean.startsWith('```')) clean = clean.replace(/^```\n?/, '').replace(/\n?```$/, '');
      analysis = JSON.parse(clean);
    } catch (e) {
      console.error('[PARSE_ERROR]', e, aiContent.substring(0, 500));
      return genericError('Analysis could not be completed. Please try again.');
    }

    // Revenue impact calculation
    const baseRevenue = 25000;
    const issuesWithRevenue = analysis.issues.map((issue: any, index: number) => {
      let lossMult = 0, gainMult = 0;
      switch (issue.severity) {
        case 'critical': lossMult = 0.15 + Math.random() * 0.15; gainMult = lossMult + 0.05; break;
        case 'error': lossMult = 0.08 + Math.random() * 0.07; gainMult = lossMult + 0.04; break;
        case 'warning': lossMult = 0.03 + Math.random() * 0.05; gainMult = lossMult + 0.02; break;
        default: lossMult = 0.01 + Math.random() * 0.02; gainMult = lossMult + 0.01;
      }
      return { ...issue, id: String(index + 1), revenueLoss: Math.floor(baseRevenue * lossMult), revenueGain: Math.floor(baseRevenue * gainMult), implemented: false };
    });

    // Build categories
    const categoryIcons: Record<string, string> = { Performance: 'Zap', SEO: 'Search', Security: 'Shield', Mobile: 'Smartphone', Accessibility: 'Eye', Conversion: 'TrendingUp', UX: 'MousePointer', Branding: 'Palette' };
    const categoryMap: Record<string, any[]> = {};
    issuesWithRevenue.forEach((issue: any) => {
      if (!categoryMap[issue.category]) categoryMap[issue.category] = [];
      categoryMap[issue.category].push(issue);
    });
    const categories = Object.entries(categoryMap).map(([name, issues]) => ({
      id: name.toLowerCase(), name, icon: categoryIcons[name] || 'Zap',
      score: analysis.scores?.[name.toLowerCase()] || 70, maxScore: 100, issues,
    }));

    const totalRevenueLoss = issuesWithRevenue.reduce((a: number, i: any) => a + i.revenueLoss, 0);
    const potentialRevenueGain = issuesWithRevenue.reduce((a: number, i: any) => a + i.revenueGain, 0);
    const scores = analysis.scores || {};
    const scoreValues = Object.values(scores).filter((v): v is number => typeof v === 'number');
    const overallScore = scoreValues.length > 0 ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 65;

    let domainName = formattedUrl;
    try { domainName = new URL(formattedUrl).hostname; } catch { domainName = formattedUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]; }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const resultObj = {
      url: formattedUrl, domain: domainName, auditDate: new Date().toISOString(),
      overallScore, totalRevenueLoss, potentialRevenueGain,
      categories, issues: issuesWithRevenue,
      pageSpeed: scores.performance || 65, mobileScore: scores.mobile || 70,
      seoScore: scores.seo || 72, accessibilityScore: scores.accessibility || 75,
      securityScore: scores.security || 80, conversionScore: scores.conversion || 60,
      summary: analysis.summary || '',
      competitors: analysis.competitors || [],
      keywords: analysis.keywords || [],
      growthForecast: analysis.growthForecast || [],
      detectedPlatform, technologies, advancedSeo,
    };

    const { data: reportRow, error: dbError } = await supabase
      .from('audit_reports')
      .insert({ url: formattedUrl, domain: domainName, result: resultObj })
      .select('id')
      .single();

    if (dbError) console.error('[DB_ERROR]', dbError);
    
    const finalResult = { ...resultObj, reportId: reportRow?.id || null };

    console.log('Analysis complete,', issuesWithRevenue.length, 'issues, platform:', detectedPlatform);

    return new Response(
      JSON.stringify({ success: true, data: finalResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[UNEXPECTED_ERROR]', error);
    return genericError('An unexpected error occurred. Please try again.');
  }
});
