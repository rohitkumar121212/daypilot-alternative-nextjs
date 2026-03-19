// 'use client'
// import { useState } from 'react'

// type Collaborator = {
//   id: number
//   name: string
//   email: string
// }

// interface CollaboratorFilterProps {
//   collaborators: Collaborator[],
//   currentUserId: String
// }

// const CollaboratorFilter = ({ collaborators, currentUserId }: CollaboratorFilterProps) => {
//   const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)

//   return (
//     <div className="collaborator-filter">
//       <select
//         className="border border-gray-300 rounded-md p-2"
//         value={selectedCollaborator?.id || ''}
//         onChange={(e) => {
//           const collaborator = collaborators.find(
//             (c) => c.id === parseInt(e.target.value)
//           )
//           setSelectedCollaborator(collaborator || null)
//         }}
//       >
//         <option value="">All Collaborators</option>
//         {collaborators.map((collaborator) => (
//           <option key={collaborator.id} value={collaborator.id}>
//             {`${collaborator.name} - ${collaborator.email}`}
//           </option>
//         ))}
//       </select>
//     </div>
//   )
// }

// export default CollaboratorFilter

'use client'
import { useState, useEffect } from 'react'

type Collaborator = {
  id: number
  name: string
  email: string
}

interface CollaboratorFilterProps {
  collaborators: Collaborator[],
  currentUserId: string
}

const CollaboratorFilter = ({ collaborators, currentUserId }: CollaboratorFilterProps) => {

  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(() => {
    return collaborators.find(
      (c) => c.id === Number(currentUserId)
    ) || null
  })
  useEffect(() => {
  if (collaborators.length > 0) {
    const current = collaborators.find(
      (c) => c.id === Number(currentUserId)
    )
    setSelectedCollaborator(current || null)
  }
}, [collaborators, currentUserId])

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