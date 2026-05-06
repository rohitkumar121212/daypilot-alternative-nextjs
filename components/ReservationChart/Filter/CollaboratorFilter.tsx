'use client'
import { useState, useEffect } from 'react'
import { fetchUtils } from '@/utils/fetchUtils'

type Collaborator = {
  id: number
  name: string
  email: string
}

interface CollaboratorFilterProps {
  collaborators: Collaborator[],
  currentUserId: string,
  onRefreshData?: () => void
  onCollaboratorChange: (id: string | number) => void
}

const CollaboratorFilter = ({ collaborators, currentUserId, onRefreshData, onCollaboratorChange }: CollaboratorFilterProps) => {

  const [collaboratorsList, setCollaboratorsList] = useState<Collaborator[]>(collaborators)
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(() => {
    return collaborators.find((c) => c.id === Number(currentUserId)) || null
  })

  // Handle collaborator change with API call and data refresh
  const handleCollaboratorChange = async (collaboratorId: string) => {
    try {
      const collaborator = collaboratorsList.find(
        (c) => c.id === parseInt(collaboratorId)
      )
      
      if (!collaborator) return
      
      console.log('Changing collaborator to:', collaborator.name)
      const payload = {
        content_type: (collaborator.id).toString(),
        response_version: 'v1'
      }
      
      try{
        const url = process.env.NODE_ENV === 'development'
          ? '/api/proxy/collab-admin-session'
          : 'https://aperfectstay.ai/collab_admin_session/'
        const { data } = await fetchUtils.post(url, payload)
        console.log('Collaborator admin session updated successfully:', data)
        
        if (data.success) {
          const bookingId = data.data?.reservation_id
          // console.log('Cancel booking successfully for booking ID:', bookingId)
          // if (bookingId) {
          //   window.location.href = `/aperfect-pms/booking/${bookingId}/view-details`
          // } else {
          //   onClose()
          // }
        } else {
          alert(data.error || 'Failed to update collaborator admin session')
        }
      } catch (error) {
        console.error('Failed to update collaborator admin session:', error)
      }
      // Update local state
      setSelectedCollaborator(collaborator)
      
      onCollaboratorChange(collaborator.id)
      onRefreshData?.()
      
    } catch (error) {
      console.error('Failed to change collaborator:', error)
      // You might want to show a toast notification here
    }
  }
//   useEffect(() => {
//   if (collaborators.length > 0) {
//     const current = collaborators.find(
//       (c) => c.id === Number(currentUserId)
//     )
//     setSelectedCollaborator(current || null)
//   }
// }, [collaborators, currentUserId])

  return (
    <div className="collaborator-filter">
      <select
        className="border border-gray-300 rounded-md p-2"
        value={selectedCollaborator?.id || ''}
        onChange={(e) => handleCollaboratorChange(e.target.value)}
      >
        {collaboratorsList.map((collaborator) => (
          <option key={collaborator.id} value={collaborator.id}>
            {`${collaborator.name} - ${collaborator.email}`}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CollaboratorFilter