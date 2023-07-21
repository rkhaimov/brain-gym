type GetAllUsers = () => Promise<User[]>

function UserList(getAllUsers: GetAllUsers) {
  const users = useQuery(getAllUsers);

  if (users.loading) {
    return <span>Loading</span>;
  }

  return <List of={users.data} />;
}

function getAllUsers(): Promise<User[]> {
  return get('api/v1/users');
}

console.log(UserList);

declare const List: React.FC<{ of: User[] }>;

type User = {
  name: string;
};

declare function useQuery<T>(request: () => Promise<T>): {
  loading: boolean;
  data: T;
};

declare function get<T>(url: string): Promise<T>;
