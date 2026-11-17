// Contrato de las migraciones versionadas. Regenerar/revisar con Supabase CLI.
import type { StaffRole } from "@/features/auth/domain/roles";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type AdminRecordRow = { id: string; kind: "category" | "product" | "content"; parent_id: string | null; payload: Json; published: boolean; version: number; updated_at: string };
export type StaffRow = { user_id: string; role: StaffRole; display_name: string; active: boolean; created_at: string };
export type StaffAccount = StaffRow & { email: string };
export type AuditRow = { id: string; actor_id: string | null; entity: string; record_id: string; action: string; before_data: Json; after_data: Json; created_at: string };
type Table<Row, Insert, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      staff_members: Table<StaffRow, { user_id: string; role: StaffRole; display_name?: string; active?: boolean; created_at?: string }>;
      admin_records: Table<AdminRecordRow, { id?: string; kind: AdminRecordRow["kind"]; parent_id?: string | null; payload: Json; published?: boolean; version?: number; updated_at?: string }>;
      admin_audit: Table<AuditRow, never, never>;
    };
    Views: Record<never, never>;
    Functions: {
      admin_save_record: { Args: { p_id: string; p_kind: string; p_parent_id: string | null; p_payload: Json; p_published: boolean; p_version: number }; Returns: string };
      admin_delete_record: { Args: { p_id: string; p_version: number }; Returns: undefined };
      admin_list_staff: { Args: Record<string, never>; Returns: StaffAccount[] };
      admin_set_staff: { Args: { p_email: string; p_name: string; p_role: string; p_active: boolean }; Returns: undefined };
      admin_log_upload: { Args: { p_path: string; p_size: number; p_mime: string }; Returns: undefined };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
