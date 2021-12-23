import { createTodoModel } from './model';
import { createView } from './view';

export const ui$ = createView(createTodoModel());
