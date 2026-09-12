import { EditTechnicianForm } from '@/components/EditTechnicianForm';

export default function EditTechnicianPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <h1>Edit Technician</h1>
      <EditTechnicianForm id={params.id} />
    </main>
  );
}
