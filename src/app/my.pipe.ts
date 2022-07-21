import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date',
})
export class MyPipe implements PipeTransform {
  transform(value: Date) {
    return value.toJSON();
  }
}
