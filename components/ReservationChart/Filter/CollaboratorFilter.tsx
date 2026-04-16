'use client'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/utils/apiRequest'

type Collaborator = {
  id: number
  name: string
  email: string
}

interface CollaboratorFilterProps {
  collaborators: Collaborator[],
  currentUserId: string,
  onRefreshData?: () => void
}

const CollaboratorFilter = ({ collaborators, currentUserId, onRefreshData }: CollaboratorFilterProps) => {

  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(() => {
    return collaborators.find(
      (c) => c.id === Number(currentUserId)
    ) || null
  })

  // Handle collaborator change with API call and data refresh
  const handleCollaboratorChange = async (collaboratorId: string) => {
    try {
      const collaborator = collaborators.find(
        (c) => c.id === parseInt(collaboratorId)
      )
      
      if (!collaborator) return
      
      console.log('Changing collaborator to:', collaborator.name)
      const payload = {
        content_type: (collaborator.id).toString(),
        response_version: 'v1'
      }
      
      try{
        const isDevelopment = process.env.NODE_ENV === 'development'
        const url = isDevelopment
          ? '/api/proxy/collab-admin-session'
          : 'https://aperfectstay.ai/collab_admin_session/'
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        })

        const data = await response.json()
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
      
      // Trigger data refresh
      console.log('Triggering data refresh after collaborator change...')
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
        {collaborators.map((collaborator) => (
          <option key={collaborator.id} value={collaborator.id}>
            {`${collaborator.name} - ${collaborator.email}`}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CollaboratorFilter