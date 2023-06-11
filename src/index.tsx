type GetAllUsers = () => Promise<User[]>;

function UsersList(getAllUsers: GetAllUsers) {
  const query = useQuery(getAllUsers);

  if (query.loading) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      {query.response.map((it) => (
        <span>{it.name}</span>
      ))}
    </div>
  );
}

const getAllUsersMock: GetAllUsers = async () => [{ name: 'Vasiliy' }, { name: 'Fedor' }];

declare function getAllUsersImplementation(): Promise<{
  content: User[];
  success: true;
}>;

declare function useQuery<T>(
  query: () => Promise<T>
): { loading: true } | { loading: false; response: T };

type User = { name: string };
