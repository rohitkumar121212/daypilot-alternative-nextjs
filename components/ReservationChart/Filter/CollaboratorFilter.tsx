'use client'
import { useState } from 'react'

type Collaborator = {
  id: number
  name: string
  email: string
}

interface CollaboratorFilterProps {
  collaborators: Collaborator[]
}

const CollaboratorFilter = ({ collaborators }: CollaboratorFilterProps) => {
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)

  return (
    <div className="collaborator-filter">
      <select
        className="border border-gray-300 rounded-md p-2"
        value={selectedCollaborator?.id || ''}
        onChange={(e) => {
          const collaborator = collaborators.find(
            (c) => c.id === parseInt(e.target.value)
          )
          setSelectedCollaborator(collaborator || null)
        }}
      >
        <option value="">All Collaborators</option>
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