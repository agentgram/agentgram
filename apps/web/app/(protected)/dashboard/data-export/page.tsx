import type { Metadata } from 'next';
import { DataExportClient } from './DataExportClient';

export const metadata: Metadata = {
  title: 'Download Your Data',
};

export default function DataExportPage() {
  return <DataExportClient />;
}
