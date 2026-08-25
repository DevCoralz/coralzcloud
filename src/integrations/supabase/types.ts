export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          referral_email: string | null;
          is_verified: boolean;
          is_admin: boolean;
          auth_code: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          referral_email?: string | null;
          is_verified?: boolean;
          is_admin?: boolean;
          auth_code?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          referral_email?: string | null;
          is_verified?: boolean;
          is_admin?: boolean;
          auth_code?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      phone_numbers: {
        Row: {
          id: string;
          country: string;
          service: string;
          number: string;
          sms_code: string | null;
          is_admin_added: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          country: string;
          service: string;
          number: string;
          sms_code?: string | null;
          is_admin_added?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          country?: string;
          service?: string;
          number?: string;
          sms_code?: string | null;
          is_admin_added?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Functions: {
      get_user_email_by_auth_code: {
        Args: { auth_code: string };
        Returns: { email: string };
      };
      check_referral_email_exists: {
        Args: { referral_email: string };
        Returns: boolean;
      };
    };
  };
};
