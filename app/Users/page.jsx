


async function UsersPage() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users', {
    cache: 'no-store', // always fresh data
  })
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function UsersPage() {
  const users = await UsersPage();

  return (

    <div>
      <h1>Users List</h1>
      {users.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}

    </div>
  )


}