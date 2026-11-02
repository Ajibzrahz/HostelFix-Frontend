import { RoomsPanel } from '@/components/hostel-ui'

export default async function RoomsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RoomsPanel hostelId={id} />
}
