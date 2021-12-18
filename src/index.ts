// Try to create searchable select example

import { BehaviorSubject } from 'rxjs';
import { createDiv, createInput, createSpan } from './elements';
import { byFrame, createRenderer } from './render';
import './global.css';

const input$ = new BehaviorSubject('');
const ui$ = createDiv(createSpan(input$, input$), createInput(input$));

const render = createRenderer();
ui$.pipe(byFrame()).subscribe((dom) => render(dom, document.body));
