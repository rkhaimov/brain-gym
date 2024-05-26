function openReviewForm(module: string) {
  switch (module) {
    case 'MY_DOCUMENTS_MODULE': {
      openPopup(
        Form(
          TextInput({ placeholder: 'Насколько понятным был документ' }),
          TextInput({
            placeholder: 'Опишите ваши впечатления от заполнения формы',
          }),
          TextInput({
            placeholder:
              'Перечислите поля документа, которые можно было-бы упростить',
          }),
          Button({ text: 'Отправить', onClick: sendReview })
        )
      );

      return;
    }
    case 'SUPPORT_MODULE': {
      openPopup(
        Form(
          TextInput({ placeholder: 'Насколько довольны качеством поддержки' }),
          TextInput({
            placeholder: 'Что понравилось',
          }),
          TextInput({
            placeholder: 'Что не понравилось',
          }),
          Button({ text: 'Отправить', onClick: sendReview })
        )
      );

      return;
    }
    default: {
      throw new Error('Unknown module was specified');
    }
  }
}

console.log(openReviewForm);

declare function openPopup(c: Component): void;

declare function sendReview(): void;

type Component = (...props: unknown) => Component;

declare const Button: Component;
declare const AsyncBuilder: Component;
declare const TextInput: Component;
declare const Text: Component;
declare const PasswordInput: Component;
declare const Form: Component;
