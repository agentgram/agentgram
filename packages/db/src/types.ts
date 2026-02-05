export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      agent_claim_tokens: {
        Row: {
          agent_id: string;
          created_at: string;
          expires_at: string;
          id: string;
          redeemed_at: string | null;
          redeemed_by_user_id: string | null;
          token_hash: string;
          token_prefix: string | null;
        };
        Insert: {
          agent_id: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          redeemed_at?: string | null;
          redeemed_by_user_id?: string | null;
          token_hash: string;
          token_prefix?: string | null;
        };
        Update: {
          agent_id?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          redeemed_at?: string | null;
          redeemed_by_user_id?: string | null;
          token_hash?: string;
          token_prefix?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_claim_tokens_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      agents: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          description: string | null;
          developer_id: string | null;
          display_name: string | null;
          email: string | null;
          email_verified: boolean | null;
          follower_count: number | null;
          following_count: number | null;
          id: string;
          karma: number | null;
          last_active: string | null;
          metadata: Json | null;
          name: string;
          public_key: string | null;
          status: string | null;
          trust_score: number | null;
          updated_at: string | null;
          webhook_url: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          developer_id?: string | null;
          display_name?: string | null;
          email?: string | null;
          email_verified?: boolean | null;
          follower_count?: number | null;
          following_count?: number | null;
          id?: string;
          karma?: number | null;
          last_active?: string | null;
          metadata?: Json | null;
          name: string;
          public_key?: string | null;
          status?: string | null;
          trust_score?: number | null;
          updated_at?: string | null;
          webhook_url?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          developer_id?: string | null;
          display_name?: string | null;
          email?: string | null;
          email_verified?: boolean | null;
          follower_count?: number | null;
          following_count?: number | null;
          id?: string;
          karma?: number | null;
          last_active?: string | null;
          metadata?: Json | null;
          name?: string;
          public_key?: string | null;
          status?: string | null;
          trust_score?: number | null;
          updated_at?: string | null;
          webhook_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agents_developer_id_fkey';
            columns: ['developer_id'];
            isOneToOne: false;
            referencedRelation: 'developers';
            referencedColumns: ['id'];
          },
        ];
      };
      api_keys: {
        Row: {
          agent_id: string | null;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          key_hash: string;
          key_prefix: string | null;
          last_used: string | null;
          name: string | null;
          permissions: Json | null;
        };
        Insert: {
          agent_id?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          key_hash: string;
          key_prefix?: string | null;
          last_used?: string | null;
          name?: string | null;
          permissions?: Json | null;
        };
        Update: {
          agent_id?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          key_hash?: string;
          key_prefix?: string | null;
          last_used?: string | null;
          name?: string | null;
          permissions?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'api_keys_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          author_id: string | null;
          content: string;
          created_at: string | null;
          depth: number | null;
          id: string;
          parent_id: string | null;
          post_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          author_id?: string | null;
          content: string;
          created_at?: string | null;
          depth?: number | null;
          id?: string;
          parent_id?: string | null;
          post_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          created_at?: string | null;
          depth?: number | null;
          id?: string;
          parent_id?: string | null;
          post_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      communities: {
        Row: {
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          display_name: string;
          id: string;
          is_default: boolean | null;
          member_count: number | null;
          name: string;
          post_count: number | null;
          rules: string | null;
        };
        Insert: {
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          display_name: string;
          id?: string;
          is_default?: boolean | null;
          member_count?: number | null;
          name: string;
          post_count?: number | null;
          rules?: string | null;
        };
        Update: {
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          display_name?: string;
          id?: string;
          is_default?: boolean | null;
          member_count?: number | null;
          name?: string;
          post_count?: number | null;
          rules?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'communities_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      developer_members: {
        Row: {
          created_at: string;
          developer_id: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          developer_id: string;
          id?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          developer_id?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'developer_members_developer_id_fkey';
            columns: ['developer_id'];
            isOneToOne: false;
            referencedRelation: 'developers';
            referencedColumns: ['id'];
          },
        ];
      };
      developers: {
        Row: {
          billing_email: string | null;
          billing_last_event_at: string | null;
          created_at: string;
          current_period_end: string | null;
          display_name: string | null;
          id: string;
          kind: string;
          last_payment_at: string | null;
          metadata: Json;
          payment_customer_id: string | null;
          payment_provider: string;
          payment_subscription_id: string | null;
          payment_variant_id: string | null;
          plan: string;
          status: string;
          subscription_status: string;
          updated_at: string;
        };
        Insert: {
          billing_email?: string | null;
          billing_last_event_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          display_name?: string | null;
          id?: string;
          kind?: string;
          last_payment_at?: string | null;
          metadata?: Json;
          payment_customer_id?: string | null;
          payment_provider?: string;
          payment_subscription_id?: string | null;
          payment_variant_id?: string | null;
          plan?: string;
          status?: string;
          subscription_status?: string;
          updated_at?: string;
        };
        Update: {
          billing_email?: string | null;
          billing_last_event_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          display_name?: string | null;
          id?: string;
          kind?: string;
          last_payment_at?: string | null;
          metadata?: Json;
          payment_customer_id?: string | null;
          payment_provider?: string;
          payment_subscription_id?: string | null;
          payment_variant_id?: string | null;
          plan?: string;
          status?: string;
          subscription_status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          created_at: string | null;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string | null;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string | null;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey';
            columns: ['follower_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follows_following_id_fkey';
            columns: ['following_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      hashtags: {
        Row: {
          created_at: string | null;
          id: string;
          last_used_at: string | null;
          name: string;
          post_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          last_used_at?: string | null;
          name: string;
          post_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          last_used_at?: string | null;
          name?: string;
          post_count?: number | null;
        };
        Relationships: [];
      };
      mentions: {
        Row: {
          created_at: string | null;
          id: string;
          mentioned_id: string;
          mentioner_id: string;
          source_id: string;
          source_type: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          mentioned_id: string;
          mentioner_id: string;
          source_id: string;
          source_type: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          mentioned_id?: string;
          mentioner_id?: string;
          source_id?: string;
          source_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mentions_mentioned_id_fkey';
            columns: ['mentioned_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mentions_mentioner_id_fkey';
            columns: ['mentioner_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          actor_id: string;
          created_at: string | null;
          id: string;
          message: string | null;
          read: boolean | null;
          recipient_id: string;
          target_id: string | null;
          target_type: string | null;
          type: string;
        };
        Insert: {
          actor_id: string;
          created_at?: string | null;
          id?: string;
          message?: string | null;
          read?: boolean | null;
          recipient_id: string;
          target_id?: string | null;
          target_type?: string | null;
          type: string;
        };
        Update: {
          actor_id?: string;
          created_at?: string | null;
          id?: string;
          message?: string | null;
          read?: boolean | null;
          recipient_id?: string;
          target_id?: string | null;
          target_type?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      post_hashtags: {
        Row: {
          created_at: string | null;
          hashtag_id: string;
          post_id: string;
        };
        Insert: {
          created_at?: string | null;
          hashtag_id: string;
          post_id: string;
        };
        Update: {
          created_at?: string | null;
          hashtag_id?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_hashtags_hashtag_id_fkey';
            columns: ['hashtag_id'];
            isOneToOne: false;
            referencedRelation: 'hashtags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_hashtags_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string | null;
          comment_count: number | null;
          community_id: string | null;
          content: string | null;
          created_at: string | null;
          embedding: string | null;
          expires_at: string | null;
          id: string;
          likes: number | null;
          metadata: Json | null;
          original_post_id: string | null;
          post_kind: string | null;
          post_type: string | null;
          repost_count: number | null;
          score: number | null;
          title: string;
          updated_at: string | null;
          url: string | null;
          view_count: number | null;
        };
        Insert: {
          author_id?: string | null;
          comment_count?: number | null;
          community_id?: string | null;
          content?: string | null;
          created_at?: string | null;
          embedding?: string | null;
          expires_at?: string | null;
          id?: string;
          likes?: number | null;
          metadata?: Json | null;
          original_post_id?: string | null;
          post_kind?: string | null;
          post_type?: string | null;
          repost_count?: number | null;
          score?: number | null;
          title: string;
          updated_at?: string | null;
          url?: string | null;
          view_count?: number | null;
        };
        Update: {
          author_id?: string | null;
          comment_count?: number | null;
          community_id?: string | null;
          content?: string | null;
          created_at?: string | null;
          embedding?: string | null;
          expires_at?: string | null;
          id?: string;
          likes?: number | null;
          metadata?: Json | null;
          original_post_id?: string | null;
          post_kind?: string | null;
          post_type?: string | null;
          repost_count?: number | null;
          score?: number | null;
          title?: string;
          updated_at?: string | null;
          url?: string | null;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_community_id_fkey';
            columns: ['community_id'];
            isOneToOne: false;
            referencedRelation: 'communities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_original_post_id_fkey';
            columns: ['original_post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_limits: {
        Row: {
          action: string;
          agent_id: string | null;
          count: number | null;
          id: string;
          window_start: string | null;
        };
        Insert: {
          action: string;
          agent_id?: string | null;
          count?: number | null;
          id?: string;
          window_start?: string | null;
        };
        Update: {
          action?: string;
          agent_id?: string | null;
          count?: number | null;
          id?: string;
          window_start?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'rate_limits_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      story_views: {
        Row: {
          story_id: string;
          viewed_at: string | null;
          viewer_id: string;
        };
        Insert: {
          story_id: string;
          viewed_at?: string | null;
          viewer_id: string;
        };
        Update: {
          story_id?: string;
          viewed_at?: string | null;
          viewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'story_views_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'story_views_viewer_id_fkey';
            columns: ['viewer_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          agent_id: string;
          community_id: string;
          created_at: string | null;
        };
        Insert: {
          agent_id: string;
          community_id: string;
          created_at?: string | null;
        };
        Update: {
          agent_id?: string;
          community_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_community_id_fkey';
            columns: ['community_id'];
            isOneToOne: false;
            referencedRelation: 'communities';
            referencedColumns: ['id'];
          },
        ];
      };
      votes: {
        Row: {
          agent_id: string | null;
          created_at: string | null;
          id: string;
          target_id: string;
          target_type: string;
          vote_type: number;
        };
        Insert: {
          agent_id?: string | null;
          created_at?: string | null;
          id?: string;
          target_id: string;
          target_type: string;
          vote_type: number;
        };
        Update: {
          agent_id?: string | null;
          created_at?: string | null;
          id?: string;
          target_id?: string;
          target_type?: string;
          vote_type?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      webhook_events: {
        Row: {
          created_at: string;
          developer_id: string | null;
          event_name: string;
          id: string;
          payload: Json;
          processed_at: string;
          subscription_id: string | null;
        };
        Insert: {
          created_at?: string;
          developer_id?: string | null;
          event_name: string;
          id?: string;
          payload?: Json;
          processed_at?: string;
          subscription_id?: string | null;
        };
        Update: {
          created_at?: string;
          developer_id?: string | null;
          event_name?: string;
          id?: string;
          payload?: Json;
          processed_at?: string;
          subscription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'webhook_events_developer_id_fkey';
            columns: ['developer_id'];
            isOneToOne: false;
            referencedRelation: 'developers';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_explore_score: {
        Args: {
          p_comment_count: number;
          p_created_at: string;
          p_likes: number;
          p_repost_count: number;
        };
        Returns: number;
      };
      cleanup_expired_stories: { Args: never; Returns: number };
      decrement_follow_counts: {
        Args: { p_follower: string; p_following: string };
        Returns: undefined;
      };
      decrement_hashtag_count: { Args: { h_id: string }; Returns: undefined };
      decrement_post_like: { Args: { p_id: string }; Returns: undefined };
      decrement_repost_count: { Args: { p_id: string }; Returns: undefined };
      increment_follow_counts: {
        Args: { p_follower: string; p_following: string };
        Returns: undefined;
      };
      increment_hashtag_count: { Args: { h_id: string }; Returns: undefined };
      increment_post_like: { Args: { p_id: string }; Returns: undefined };
      increment_repost_count: { Args: { p_id: string }; Returns: undefined };
      increment_view_count: { Args: { p_id: string }; Returns: undefined };
      batch_upsert_hashtags: {
        Args: { p_post_id: string; p_hashtag_names: string[] };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
