export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          business_name: string | null;
          avatar_url: string | null;
          subdomain: string;
          plan: "free" | "pro";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          business_name?: string | null;
          avatar_url?: string | null;
          subdomain: string;
          plan?: "free" | "pro";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          business_name?: string | null;
          avatar_url?: string | null;
          subdomain?: string;
          plan?: "free" | "pro";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          notes: string | null;
          tags: string[];
          total_revenue: number;
          status: "active" | "inactive" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          notes?: string | null;
          tags?: string[];
          total_revenue?: number;
          status?: "active" | "inactive" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          notes?: string | null;
          tags?: string[];
          total_revenue?: number;
          status?: "active" | "inactive" | "archived";
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          price_cents: number;
          currency: string;
          type: "service" | "pack" | "digital" | "lead_magnet";
          status: "draft" | "active" | "archived";
          image_url: string | null;
          slug: string | null;
          short_description: string;
          long_description: string | null;
          features: string[];
          delivery_time_days: number | null;
          thumbnail_url: string | null;
          is_featured: boolean;
          category: string;
          sales_count: number;
          form_schema_json: Json;
          mode: "checkout" | "contact";
          delivery_type: "file" | "url" | "message" | "none";
          delivery_file_path: string | null;
          delivery_url: string | null;
          cta_label: string;
          stripe_price_id: string | null;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string;
          price_cents: number;
          currency?: string;
          type: "service" | "pack" | "digital" | "lead_magnet";
          status?: "draft" | "active" | "archived";
          image_url?: string | null;
          slug?: string | null;
          short_description?: string;
          long_description?: string | null;
          features?: string[];
          delivery_time_days?: number | null;
          thumbnail_url?: string | null;
          is_featured?: boolean;
          category?: string;
          sales_count?: number;
          form_schema_json?: Json;
          mode?: "checkout" | "contact";
          delivery_type?: "file" | "url" | "message" | "none";
          delivery_file_path?: string | null;
          delivery_url?: string | null;
          cta_label?: string;
          stripe_price_id?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string;
          price_cents?: number;
          currency?: string;
          type?: "service" | "pack" | "digital" | "lead_magnet";
          status?: "draft" | "active" | "archived";
          image_url?: string | null;
          slug?: string | null;
          short_description?: string;
          long_description?: string | null;
          features?: string[];
          delivery_time_days?: number | null;
          thumbnail_url?: string | null;
          is_featured?: boolean;
          category?: string;
          sales_count?: number;
          form_schema_json?: Json;
          mode?: "checkout" | "contact";
          delivery_type?: "file" | "url" | "message" | "none";
          delivery_file_path?: string | null;
          delivery_url?: string | null;
          cta_label?: string;
          stripe_price_id?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          product_id: string | null;
          title: string;
          description: string;
          amount: number;
          status: "new" | "brief_received" | "in_progress" | "in_review" | "validated" | "delivered" | "invoiced" | "paid" | "cancelled" | "refunded" | "dispute";
          priority: "low" | "normal" | "high" | "urgent";
          deadline: string | null;
          stripe_payment_id: string | null;
          paid: boolean;
          notes: string | null;
          checklist: Json;
          tags: string[];
          status_id: string | null;
          custom_fields: Json;
          briefing: string | null;
          resources: Json;
          category: string | null;
          external_ref: string | null;
          group_id: string | null;
          group_index: number | null;
          group_total: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          product_id?: string | null;
          title: string;
          description: string;
          amount: number;
          status?: "new" | "brief_received" | "in_progress" | "in_review" | "validated" | "delivered" | "invoiced" | "paid" | "cancelled" | "refunded" | "dispute";
          priority?: "low" | "normal" | "high" | "urgent";
          deadline?: string | null;
          stripe_payment_id?: string | null;
          paid?: boolean;
          notes?: string | null;
          checklist?: Json;
          tags?: string[];
          status_id?: string | null;
          custom_fields?: Json;
          briefing?: string | null;
          resources?: Json;
          category?: string | null;
          external_ref?: string | null;
          group_id?: string | null;
          group_index?: number | null;
          group_total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          product_id?: string | null;
          title?: string;
          description?: string;
          amount?: number;
          status?: "new" | "brief_received" | "in_progress" | "in_review" | "validated" | "delivered" | "invoiced" | "paid" | "cancelled" | "refunded" | "dispute";
          priority?: "low" | "normal" | "high" | "urgent";
          deadline?: string | null;
          stripe_payment_id?: string | null;
          paid?: boolean;
          notes?: string | null;
          checklist?: Json;
          tags?: string[];
          status_id?: string | null;
          custom_fields?: Json;
          briefing?: string | null;
          resources?: Json;
          category?: string | null;
          external_ref?: string | null;
          group_id?: string | null;
          group_index?: number | null;
          group_total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          order_id: string | null;
          invoice_number: string;
          amount: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          due_date: string | null;
          paid_at: string | null;
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          order_id?: string | null;
          invoice_number: string;
          amount: number;
          tax_rate?: number;
          tax_amount?: number;
          total: number;
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          due_date?: string | null;
          paid_at?: string | null;
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          order_id?: string | null;
          invoice_number?: string;
          amount?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          due_date?: string | null;
          paid_at?: string | null;
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "done";
          priority: "low" | "normal" | "high" | "urgent";
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id?: string | null;
          title: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "done";
          priority?: "low" | "normal" | "high" | "urgent";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string | null;
          title?: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "done";
          priority?: "low" | "normal" | "high" | "urgent";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity?: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          order_id?: string;
          service_id?: string;
          quantity?: number;
          unit_price?: number;
        };
      };
      order_submissions: {
        Row: {
          id: string;
          order_id: string;
          form_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          form_data?: Json;
          created_at?: string;
        };
        Update: {
          form_data?: Json;
        };
      };
      // ── Site Builder tables ──
      sites: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          name: string;
          status: "draft" | "published";
          theme: Json;
          settings: Json;
          seo: Json;
          nav: Json | null;
          footer: Json | null;
          custom_domain: string | null;
          is_private: boolean;
          password_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          name: string;
          status?: "draft" | "published";
          theme?: Json;
          settings?: Json;
          seo?: Json;
          nav?: Json | null;
          footer?: Json | null;
          custom_domain?: string | null;
          is_private?: boolean;
          password_hash?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          status?: "draft" | "published";
          theme?: Json;
          settings?: Json;
          seo?: Json;
          nav?: Json | null;
          footer?: Json | null;
          custom_domain?: string | null;
          is_private?: boolean;
          password_hash?: string | null;
        };
      };
      site_pages: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          title: string;
          is_home: boolean;
          sort_order: number;
          status: "draft" | "published";
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          slug: string;
          title: string;
          is_home?: boolean;
          sort_order?: number;
          status?: "draft" | "published";
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
        };
        Update: {
          slug?: string;
          title?: string;
          is_home?: boolean;
          sort_order?: number;
          status?: "draft" | "published";
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          published_at?: string | null;
        };
      };
      site_blocks: {
        Row: {
          id: string;
          page_id: string;
          type: string;
          sort_order: number;
          content: Json;
          style: Json;
          settings: Json;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          type: string;
          sort_order?: number;
          content?: Json;
          style?: Json;
          settings?: Json;
          visible?: boolean;
        };
        Update: {
          type?: string;
          sort_order?: number;
          content?: Json;
          style?: Json;
          settings?: Json;
          visible?: boolean;
        };
      };
      site_published_snapshots: {
        Row: {
          id: string;
          site_id: string;
          page_id: string;
          snapshot: Json;
          published_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          page_id: string;
          snapshot: Json;
        };
        Update: {
          snapshot?: Json;
        };
      };
      site_assets: {
        Row: {
          id: string;
          site_id: string;
          path: string;
          type: "image" | "video" | "file";
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          path: string;
          type: "image" | "video" | "file";
          metadata?: Json;
        };
        Update: {
          path?: string;
          type?: "image" | "video" | "file";
          metadata?: Json;
        };
      };
      site_product_links: {
        Row: {
          id: string;
          site_id: string;
          product_id: string;
          display_config: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          product_id: string;
          display_config?: Json;
        };
        Update: {
          display_config?: Json;
        };
      };
      leads: {
        Row: {
          id: string;
          site_id: string;
          name: string | null;
          email: string;
          phone: string | null;
          source: string | null;
          message: string | null;
          fields: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          name?: string | null;
          email: string;
          phone?: string | null;
          source?: string | null;
          message?: string | null;
          fields?: Json;
        };
        Update: {
          name?: string | null;
          email?: string;
          phone?: string | null;
          source?: string | null;
          message?: string | null;
          fields?: Json;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          site_id: string;
          type: string;
          page_slug: string | null;
          data: Json;
          visitor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          type: string;
          page_slug?: string | null;
          data?: Json;
          visitor_id?: string | null;
        };
        Update: {
          type?: string;
          page_slug?: string | null;
          data?: Json;
          visitor_id?: string | null;
        };
      };
      // ── Custom Workflow tables ──
      order_boards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          is_default?: boolean;
        };
        Update: {
          name?: string;
          is_default?: boolean;
        };
      };
      order_statuses: {
        Row: {
          id: string;
          board_id: string;
          slug: string;
          name: string;
          color: string;
          view: "production" | "cash";
          position: number;
          is_archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          slug?: string;
          name: string;
          color?: string;
          view?: "production" | "cash";
          position?: number;
          is_archived?: boolean;
        };
        Update: {
          slug?: string;
          name?: string;
          color?: string;
          view?: "production" | "cash";
          position?: number;
          is_archived?: boolean;
        };
      };
      order_fields: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          label: string;
          field_type: string;
          options: Json;
          is_required: boolean;
          is_visible_on_card: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key: string;
          label: string;
          field_type?: string;
          options?: Json;
          is_required?: boolean;
          is_visible_on_card?: boolean;
          position?: number;
        };
        Update: {
          key?: string;
          label?: string;
          field_type?: string;
          options?: Json;
          is_required?: boolean;
          is_visible_on_card?: boolean;
          position?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      fn_upsert_client: {
        Args: { p_user_id: string; p_name: string; p_email: string; p_phone?: string };
        Returns: string;
      };
      fn_public_checkout: {
        Args: {
          p_site_id: string;
          p_product_id: string;
          p_name: string;
          p_email: string;
          p_phone?: string;
          p_message?: string;
          p_form_data?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenient aliases
export type Profile = Tables<"profiles">;
export type ClientRecord = Tables<"clients">;
export type ProductRow = Tables<"products">;
export type OrderRecord = Tables<"orders">;
export type InvoiceRecord = Tables<"invoices">;
export type Task = Tables<"tasks">;
export type SiteRecord = Tables<"sites">;
export type SitePageRecord = Tables<"site_pages">;
export type SiteBlockRecord = Tables<"site_blocks">;
export type SiteSnapshotRecord = Tables<"site_published_snapshots">;
export type SiteAssetRecord = Tables<"site_assets">;
export type SiteProductLinkRecord = Tables<"site_product_links">;
export type OrderItemRecord = Tables<"order_items">;
export type OrderSubmissionRecord = Tables<"order_submissions">;
export type LeadRecord = Tables<"leads">;
export type AnalyticsEventRecord = Tables<"analytics_events">;
