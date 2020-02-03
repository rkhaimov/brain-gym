import { EmployeePartsFactory, IMembership, IPaymentClassification, IPaymentMethod } from './types';

export class Employee {
  private classification: IPaymentClassification;
  private membership: IMembership;
  private method: IPaymentMethod;

  constructor(createParts: EmployeePartsFactory) {
    const {classification, membership, method} = createParts(this);

    this.classification = classification;
    this.membership = membership;
    this.method = method;
  }
}
