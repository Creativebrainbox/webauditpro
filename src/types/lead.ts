export type UserType = 'store_owner' | 'agency';

export interface LeadFormData {
  full_name: string;
  email: string;
  whatsapp?: string;
  company_name?: string;
  store_url: string;
  user_type: UserType;
  agency_name?: string;
  agency_website?: string;
  agency_logo_url?: string;
}
