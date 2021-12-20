// Try to create searchable select example

import { times } from 'lodash-es';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';
import { byFrame } from './byFrame';
import './global.css';
import { createDiv, createH1, createInput } from './elements';
import { createRenderer } from './render';

const input$ = new BehaviorSubject('');

const ui$ = createDiv({
  children: [
    createInput({ onInput: input$, children: [] }),
    input$.pipe(
      map((value) => parseInt(value)),
      switchMap((count) =>
        createDiv({
          children: times(count, (index) =>
            createH1({ children: [of(`${index}`)] })
          ),
        })
      )
    ),
  ],
});

const render = createRenderer();
const main = document.createElement('main');
document.body.appendChild(main);

ui$.pipe(byFrame()).subscribe((dom) => render(dom, main));
