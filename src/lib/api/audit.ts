 import { supabase } from '@/integrations/supabase/client';
 import { AuditResult } from '@/types/audit';
 
 export interface AuditResponse {
   success: boolean;
   data?: AuditResult;
   error?: string;
 }
 
 export const auditApi = {
   async analyzeWebsite(url: string): Promise<AuditResponse> {
     const { data, error } = await supabase.functions.invoke('analyze-website', {
       body: { url },
     });
 
     if (error) {
       console.error('Audit API error:', error);
       return { success: false, error: error.message };
     }
 
     if (!data.success) {
       return { success: false, error: data.error || 'Analysis failed' };
     }
 
     return { success: true, data: data.data };
   },
 };