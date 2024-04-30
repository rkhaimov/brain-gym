import './modules';

import { openReviewForm } from '@app/reviews';

interface Iterable<T> {
  iterator(): {
    next(): { done: true } | { done: false; value: T };
  };
}

function a(input: Iterable<string>) {}

function MyDocumentsPage() {
  const onReviewStart = () =>
    openReviewForm([
      TextInput({ placeholder: 'Насколько понятным был документ' }),
      TextInput({
        placeholder: 'Опишите ваши впечатления от заполнения формы',
      }),
      TextInput({
        placeholder:
          'Перечислите поля документа, которые можно было-бы упростить',
      }),
    ]);

  //<editor-fold desc="Отрисовка страницы Мои документы">
  return onReviewStart;
  //</editor-fold>
}

console.log(MyDocumentsPage);

type Component = (...props: unknown) => Component;

declare const Button: Component;
declare const AsyncBuilder: Component;
declare const TextInput: Component;
declare const Text: Component;
declare const PasswordInput: Component;
declare const Form: Component;
