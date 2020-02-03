import { Employee } from '../employee/Employee';

class Payment {
  employee: Employee;

  isPayDay() {
    return this.employee.classification.isPayDay();
  }

  pay() {
    const sum = this.employee.classification.calculatePay();
    const fee = this.employee.membership.getFee();

    return this.employee.method.pay(sum - fee);
  }
}