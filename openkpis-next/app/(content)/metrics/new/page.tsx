import EntityCreateForm from '@/components/forms/EntityCreateForm';

export const dynamic = 'force-dynamic';

export default function NewMetricPage() {
  return <EntityCreateForm entityType="metric" />;
}
