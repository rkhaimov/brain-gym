import { Employee } from './Employee';

export interface IPaymentClassification {
  isPayDay(): boolean;
  calculatePay(): number;
}

export interface IMembership {
  getFee(): number;
}

export interface IPaymentMethod {
  pay(sum: number): Promise<boolean>;
}

export type EmployeePartsFactory = (employee: Employee) => {
  classification: IPaymentClassification;
  method: IPaymentMethod;
  membership: IMembership;
};
