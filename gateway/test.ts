import { Employee } from '../employee/Employee';

interface IEmployeeRepository {
  getAll(dateFrom: string, dateTo: string): Promise<Employee[]>;
}
