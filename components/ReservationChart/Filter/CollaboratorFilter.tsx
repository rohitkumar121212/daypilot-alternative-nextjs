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
      
      // Make dummy API call (replace with your actual endpoint)
      // const response = await apiFetch('/api/collaborator/change', {
      //   method: 'POST',
      //   body: JSON.stringify({ 
      //     collaboratorId: collaborator.id,
      //     collaboratorName: collaborator.name 
      //   })
      // })
      
      // console.log('Collaborator change API response:', response)
      
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