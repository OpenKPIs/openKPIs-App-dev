import EntityCreateForm from '@/components/forms/EntityCreateForm';

export const dynamic = 'force-dynamic';

export default function NewDashboardPage() {
  return <EntityCreateForm entityType="dashboard" />;
}
