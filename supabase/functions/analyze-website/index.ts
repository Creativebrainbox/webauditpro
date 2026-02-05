 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
 
 // Rate limiting configuration
 const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
 const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per hour for anonymous users
 
 // In-memory rate limit store (resets on function cold start, but provides basic protection)
 const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
 
 function getClientIP(req: Request): string {
   // Check various headers for client IP
   const forwardedFor = req.headers.get('x-forwarded-for');
   if (forwardedFor) {
     return forwardedFor.split(',')[0].trim();
   }
   
   const realIP = req.headers.get('x-real-ip');
   if (realIP) {
     return realIP;
   }
   
   const cfConnectingIP = req.headers.get('cf-connecting-ip');
   if (cfConnectingIP) {
     return cfConnectingIP;
   }
   
   // Fallback - this won't be very accurate but provides some protection
   return 'unknown';
 }
 
 function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number; resetIn: number } {
   const now = Date.now();
   const record = rateLimitStore.get(clientIP);
   
   // Clean up expired entries periodically
   if (rateLimitStore.size > 1000) {
     for (const [ip, data] of rateLimitStore.entries()) {
       if (now > data.resetTime) {
         rateLimitStore.delete(ip);
       }
     }
   }
   
   if (!record || now > record.resetTime) {
     // New window - allow and start counting
     rateLimitStore.set(clientIP, {
       count: 1,
       resetTime: now + RATE_LIMIT_WINDOW_MS,
     });
     return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
   }
   
   if (record.count >= MAX_REQUESTS_PER_WINDOW) {
     // Rate limit exceeded
     const resetIn = record.resetTime - now;
     return { allowed: false, remaining: 0, resetIn };
   }
   
   // Increment counter
   record.count++;
   rateLimitStore.set(clientIP, record);
   
   return {
     allowed: true,
     remaining: MAX_REQUESTS_PER_WINDOW - record.count,
     resetIn: record.resetTime - now,
   };
 }
 
 // Generic error response to avoid leaking implementation details
 const genericError = (message: string, status = 500) => {
   return new Response(
     JSON.stringify({ success: false, error: message }),
     { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
   );
 };
 
 // URL validation to prevent SSRF attacks
 function validateUrl(url: string): { valid: boolean; error?: string; formatted?: string } {
   if (!url || typeof url !== 'string') {
     return { valid: false, error: 'Please provide a valid URL' };
   }
 
   const trimmed = url.trim();
   
   // Check length limit
   if (trimmed.length > 2048) {
     return { valid: false, error: 'URL is too long' };
   }
 
   // Add protocol if missing
   let formatted = trimmed;
   if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
     formatted = `https://${formatted}`;
   }
 
   try {
     const parsed = new URL(formatted);
 
     // Only allow HTTP/HTTPS protocols
     if (!['http:', 'https:'].includes(parsed.protocol)) {
       return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
     }
 
     const hostname = parsed.hostname.toLowerCase();
 
     // Block localhost and common local hostnames
     if (['localhost', '0.0.0.0', '127.0.0.1', '::1'].includes(hostname)) {
       return { valid: false, error: 'Local addresses are not allowed' };
     }
 
     // Block private IP ranges
     const privateIpPatterns = [
       /^127\./,                          // Loopback
       /^10\./,                           // Class A private
       /^192\.168\./,                     // Class C private
       /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Class B private
       /^169\.254\./,                     // Link-local
       /^0\./,                            // Current network
       /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
     ];
 
     for (const pattern of privateIpPatterns) {
       if (pattern.test(hostname)) {
         return { valid: false, error: 'Private network addresses are not allowed' };
       }
     }
 
     // Block AWS/GCP/Azure metadata endpoints
     if (hostname === '169.254.169.254' || hostname.includes('metadata.google') || hostname.includes('metadata.azure')) {
       return { valid: false, error: 'Metadata endpoints are not allowed' };
     }
 
     // Ensure hostname has at least one dot (basic domain validation)
     if (!hostname.includes('.')) {
       return { valid: false, error: 'Please provide a valid domain name' };
     }
 
     return { valid: true, formatted };
   } catch {
     return { valid: false, error: 'Please provide a valid URL' };
   }
 }
 
 Deno.serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Rate limiting check
     const clientIP = getClientIP(req);
     const rateLimit = checkRateLimit(clientIP);
     
     if (!rateLimit.allowed) {
       const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
       console.log(`[RATE_LIMIT] IP ${clientIP} exceeded rate limit, reset in ${resetMinutes} minutes`);
       return new Response(
         JSON.stringify({ 
           success: false, 
           error: `Rate limit exceeded. Please try again in ${resetMinutes} minutes.` 
         }),
         { 
           status: 429, 
           headers: { 
             ...corsHeaders, 
             'Content-Type': 'application/json',
             'X-RateLimit-Remaining': '0',
             'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
           } 
         }
       );
     }
 
     console.log(`[REQUEST] IP: ${clientIP}, Remaining: ${rateLimit.remaining}`);
 
     const { url } = await req.json();
 
     // Validate URL with comprehensive checks
     const validation = validateUrl(url);
     if (!validation.valid) {
       return genericError(validation.error || 'Invalid URL', 400);
     }
 
     const formattedUrl = validation.formatted!;
 
     const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
     if (!firecrawlKey) {
       console.error('[CONFIG_ERROR] Firecrawl API key not configured');
       return genericError('Service temporarily unavailable. Please try again later.');
     }
 
     const lovableKey = Deno.env.get('LOVABLE_API_KEY');
     if (!lovableKey) {
       console.error('[CONFIG_ERROR] Lovable API key not configured');
       return genericError('Service temporarily unavailable. Please try again later.');
     }
 
     console.log('Scraping URL:', formattedUrl);
 
     // Step 1: Scrape the website using Firecrawl
     const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${firecrawlKey}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         url: formattedUrl,
         formats: ['markdown', 'html', 'links'],
         onlyMainContent: false,
       }),
     });
 
     const scrapeData = await scrapeResponse.json();
 
     if (!scrapeResponse.ok || !scrapeData.success) {
       console.error('[SCRAPE_ERROR] Firecrawl failed:', scrapeData);
       return genericError('Unable to access this website. Please check the URL and try again.', 400);
     }
 
     const websiteContent = scrapeData.data?.markdown || '';
     const htmlContent = scrapeData.data?.html || '';
     const links = scrapeData.data?.links || [];
     const metadata = scrapeData.data?.metadata || {};
 
     console.log('Scraped website successfully, content length:', websiteContent.length);
 
     // Step 2: Analyze with AI
     const analysisPrompt = `You are a professional website auditor. Analyze the following website content and HTML to identify real issues.
 
 Website URL: ${formattedUrl}
 Page Title: ${metadata.title || 'Unknown'}
 Description: ${metadata.description || 'None found'}
 
 HTML Content (first 15000 chars):
 ${htmlContent.substring(0, 15000)}
 
 Page Content:
 ${websiteContent.substring(0, 10000)}
 
 Links found: ${links.length}
 
 Analyze this specific website for REAL issues. Look for:
 1. SEO issues (missing meta tags, poor headings, missing alt text, etc.)
 2. Performance concerns (large images, too many scripts, etc.)
 3. Security issues (no HTTPS indicators, exposed emails, etc.)
 4. Mobile responsiveness indicators
 5. Accessibility problems (missing ARIA, poor contrast indicators, etc.)
 6. Conversion issues (unclear CTAs, poor UX signals, etc.)
 7. Content quality issues
 8. Branding/trust issues
 
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
   "summary": "Brief summary of the website's overall health"
 }
 
 IMPORTANT:
 - Only report issues that are ACTUALLY found in the content
 - Be specific to THIS website, not generic issues
 - If something looks good, don't report it as an issue
 - Estimate realistic revenue impact based on the severity
 - Return 5-15 issues based on what you actually find`;
 
     const aiResponse = await fetch(AI_GATEWAY_URL, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${lovableKey}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: 'google/gemini-3-flash-preview',
         messages: [
           {
             role: 'user',
             content: analysisPrompt,
           },
         ],
         temperature: 0.3,
       }),
     });
 
     if (!aiResponse.ok) {
       const aiError = await aiResponse.text();
       console.error('[AI_ERROR] Analysis failed:', aiError);
       return genericError('Analysis could not be completed. Please try again.');
     }
 
     const aiData = await aiResponse.json();
     const aiContent = aiData.choices?.[0]?.message?.content || '';
 
     console.log('AI analysis received, length:', aiContent.length);
 
     // Parse AI response
     let analysis;
     try {
       // Clean up the response - remove markdown code blocks if present
       let cleanContent = aiContent.trim();
       if (cleanContent.startsWith('```json')) {
         cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
       } else if (cleanContent.startsWith('```')) {
         cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
       }
       analysis = JSON.parse(cleanContent);
     } catch (parseError) {
       console.error('[PARSE_ERROR] Failed to parse AI response:', parseError);
       console.error('[PARSE_ERROR] Raw content preview:', aiContent.substring(0, 500));
       return genericError('Analysis could not be completed. Please try again.');
     }
 
     // Calculate revenue impacts based on severity
     const baseRevenue = 25000; // Assumed monthly revenue for calculations
     const issuesWithRevenue = analysis.issues.map((issue: any, index: number) => {
       let lossMultiplier = 0;
       let gainMultiplier = 0;
 
       switch (issue.severity) {
         case 'critical':
           lossMultiplier = 0.15 + Math.random() * 0.15;
           gainMultiplier = lossMultiplier + 0.05;
           break;
         case 'error':
           lossMultiplier = 0.08 + Math.random() * 0.07;
           gainMultiplier = lossMultiplier + 0.04;
           break;
         case 'warning':
           lossMultiplier = 0.03 + Math.random() * 0.05;
           gainMultiplier = lossMultiplier + 0.02;
           break;
         default:
           lossMultiplier = 0.01 + Math.random() * 0.02;
           gainMultiplier = lossMultiplier + 0.01;
       }
 
       return {
         ...issue,
         id: String(index + 1),
         revenueLoss: Math.floor(baseRevenue * lossMultiplier),
         revenueGain: Math.floor(baseRevenue * gainMultiplier),
         implemented: false,
       };
     });
 
     // Build categories from issues
     const categoryMap: Record<string, any[]> = {};
     const categoryIcons: Record<string, string> = {
       Performance: 'Zap',
       SEO: 'Search',
       Security: 'Shield',
       Mobile: 'Smartphone',
       Accessibility: 'Eye',
       Conversion: 'TrendingUp',
       UX: 'MousePointer',
       Branding: 'Palette',
     };
 
     issuesWithRevenue.forEach((issue: any) => {
       if (!categoryMap[issue.category]) {
         categoryMap[issue.category] = [];
       }
       categoryMap[issue.category].push(issue);
     });
 
     const categories = Object.entries(categoryMap).map(([name, issues]) => ({
       id: name.toLowerCase(),
       name,
       icon: categoryIcons[name] || 'Zap',
       score: analysis.scores?.[name.toLowerCase()] || 70,
       maxScore: 100,
       issues,
     }));
 
     // Calculate totals
     const totalRevenueLoss = issuesWithRevenue.reduce((acc: number, i: any) => acc + i.revenueLoss, 0);
     const potentialRevenueGain = issuesWithRevenue.reduce((acc: number, i: any) => acc + i.revenueGain, 0);
 
     // Calculate overall score
     const scores = analysis.scores || {};
     const scoreValues = Object.values(scores).filter((v): v is number => typeof v === 'number');
     const overallScore = scoreValues.length > 0
       ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
       : 65;
 
     // Extract domain
     let domain = formattedUrl;
     try {
       domain = new URL(formattedUrl).hostname;
     } catch {
       domain = formattedUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
     }
 
     const result = {
       url: formattedUrl,
       domain,
       auditDate: new Date().toISOString(),
       overallScore,
       totalRevenueLoss,
       potentialRevenueGain,
       categories,
       issues: issuesWithRevenue,
       pageSpeed: scores.performance || 65,
       mobileScore: scores.mobile || 70,
       seoScore: scores.seo || 72,
       accessibilityScore: scores.accessibility || 75,
       securityScore: scores.security || 80,
       conversionScore: scores.conversion || 60,
       summary: analysis.summary || '',
     };
 
     console.log('Analysis complete, returning', issuesWithRevenue.length, 'issues');
 
     return new Response(
       JSON.stringify({ success: true, data: result }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   } catch (error) {
     console.error('[UNEXPECTED_ERROR] Analysis failed:', error);
     return genericError('An unexpected error occurred. Please try again.');
   }
 });