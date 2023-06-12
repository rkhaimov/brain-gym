interface IRepository {
  getAllAdministrators(max: number): Promise<NonEmptyArray<Admin>>;

  deleteAdministratorById(id: Admin['id']): Promise<void>;
}

type Admin = {
  id: number;
};

type NonEmptyArray<T> = {};
