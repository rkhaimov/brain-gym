// Create sync 'To do' app, then convert it to async
// Implement adding, removing, editing, searching and filtering

// Added item should be cleared from input

import './global.css';
import { createElement } from './rendering/createElement';
import { renderUItoDOM } from './rendering/render';
import { ui$ } from './TodoApp';

renderUItoDOM(ui$);
