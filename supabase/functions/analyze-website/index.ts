 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
 
 Deno.serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { url } = await req.json();
 
     if (!url) {
       return new Response(
         JSON.stringify({ success: false, error: 'URL is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
     if (!firecrawlKey) {
       return new Response(
         JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const lovableKey = Deno.env.get('LOVABLE_API_KEY');
     if (!lovableKey) {
       return new Response(
         JSON.stringify({ success: false, error: 'Lovable API key not configured' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Format URL
     let formattedUrl = url.trim();
     if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
       formattedUrl = `https://${formattedUrl}`;
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
       console.error('Firecrawl error:', scrapeData);
       return new Response(
         JSON.stringify({ success: false, error: scrapeData.error || 'Failed to scrape website' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
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
       console.error('AI Gateway error:', aiError);
       return new Response(
         JSON.stringify({ success: false, error: 'Failed to analyze website' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
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
       console.error('Failed to parse AI response:', parseError);
       console.error('Raw AI content:', aiContent.substring(0, 500));
       return new Response(
         JSON.stringify({ success: false, error: 'Failed to parse analysis results' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
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
     console.error('Error analyzing website:', error);
     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
     return new Response(
       JSON.stringify({ success: false, error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });