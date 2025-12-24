import EntityCreateForm from '@/components/forms/EntityCreateForm';

export const dynamic = 'force-dynamic';

export default function NewDimensionPage() {
  return <EntityCreateForm entityType="dimension" />;
}
