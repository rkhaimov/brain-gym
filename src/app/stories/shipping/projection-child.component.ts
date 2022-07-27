import { Component, Input } from '@angular/core';
import { ProjectionChildProps } from './projection/projection.component';

@Component({
  template: '<h3>Hello world {{ data }}</h3>'
})
export class ProjectionChildComponent implements ProjectionChildProps {
  @Input() data!: string;
}
