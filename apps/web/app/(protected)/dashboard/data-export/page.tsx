import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { DataExportClient } from './DataExportClient';

export const metadata: Metadata = {
  title: 'Download Your Data',
};

export default async function DataExportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier: string = 'free';

  if (user) {
    const { data: member } = await supabase
      .from('developer_members')
      .select('developer_id')
      .eq('user_id', user.id)
      .single();

    if (member) {
      const { data: dev } = await supabase
        .from('developers')
        .select('plan')
        .eq('id', (member as { developer_id: string }).developer_id)
        .single();

      if (dev) {
        currentTier = (dev as { plan: string }).plan ?? 'free';
      }
    }
  }

  return <DataExportClient currentTier={currentTier} />;
}
