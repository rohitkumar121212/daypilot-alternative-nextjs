import ViewDetailsComponent from "@/components/view-details/ViewDetails"

const ViewDetailsPage = async ({ params }: { params: Promise<{ bookingID: string }> }) => {
  const { bookingID } = await params
  return (
    <ViewDetailsComponent bookingId={bookingID} />
  )
}
export default ViewDetailsPage
