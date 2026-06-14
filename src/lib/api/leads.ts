import { supabase } from '@/integrations/supabase/client';
import { LeadFormData } from '@/types/lead';
import { AuditResult } from '@/types/audit';
import { getOpportunityLevel } from '@/lib/opportunity';

export async function saveLeadAndNotify(lead: LeadFormData, result: AuditResult) {
  const opportunity_level = getOpportunityLevel(result.overallScore);
  try {
    await supabase.functions.invoke('save-lead', {
      body: {
        lead,
        audit_score: result.overallScore,
        opportunity_level,
        report_id: result.reportId ?? null,
        domain: result.domain,
      },
    });
  } catch (e) {
    console.error('save-lead failed', e);
  }
}

export async function createPendingLead(lead: LeadFormData) {
  // Insert immediately on submit so we never lose a lead
  const { data, error } = await supabase
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
    })
    .select('id')
    .single();
  if (error) {
    console.error('createPendingLead', error);
    return null;
  }
  return data?.id ?? null;
}
