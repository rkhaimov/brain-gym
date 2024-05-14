function openReviewForm(inputs: Component[]) {
  openPopup(
    Form(
      ...inputs,
      Button({
        text: 'Отправить',
        onClick: sendReview,
      })
    )
  );
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
