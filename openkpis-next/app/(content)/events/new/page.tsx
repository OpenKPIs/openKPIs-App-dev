import EntityCreateForm from '@/components/forms/EntityCreateForm';

export const dynamic = 'force-dynamic';

export default function NewEventPage() {
  return <EntityCreateForm entityType="event" />;
}
