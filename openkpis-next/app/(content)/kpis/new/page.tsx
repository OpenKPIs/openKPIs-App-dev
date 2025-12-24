import EntityCreateForm from '@/components/forms/EntityCreateForm';

export const dynamic = 'force-dynamic';

export default function NewKPIPage() {
  return <EntityCreateForm entityType="kpi" />;
}
