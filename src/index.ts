function assert<T extends boolean>(condition: T): asserts condition {
  if (condition) {
    return;
  }

  throw new Error('Assertion has failed');
}

type Person = {
  useValueFor(product: Product): number;
};

// * Полезность существует только относительно потребностей
function createPerson(...needs: [Product, number][]): Person {
  return {
    useValueFor: (product) => {
      const found = needs.find(([p]) => p.name === product.name);

      if (found) {
        return product.useValue(found[1]);
      }

      return 0;
    },
  };
}

// Товар
type Product = {
  name: string;
  // Товар полезен. Полезным его делают потребительные стоимости
  // Тело товара и есть его стоимость, т. к. не имеет смысла без последнего
  useValue(needs: number): number;
  // Товар можно обменять на другие товары. В таком случае потр. стоимости одного рода
  // обмениваются на потр. стоимости другого
  exchangeValue(): number;
};

// Кажется что меновая стоимость имеет смысл только относительно другого товара
// и не присуща товару как самостоятельной единице
function toExchangeQuantities(left: Product, right: Product): [number, number] {
  // x * l = r
  // x = r / l
  return [right.exchangeValue() / left.exchangeValue(), 1];
}

function createProduct(name: string, ev: number): Product {
  return {
    name,
    useValue: (needs) => needs,
    exchangeValue: () => ev,
  };
}

function productTimes(product: Product, times: number): Product {
  return {
    name: product.name,
    useValue: (needs) => needs * times,
    exchangeValue: () => product.exchangeValue() * times,
  };
}

// Пока не понятно что скрывается за этим числом
const wheat = createProduct('wheat', 10);
const iron = createProduct('iron', 50);
const gold = createProduct('gold', 100);

// Заметим, что потр. и мен. стоимости могут быть разными
const person = createPerson([wheat, 10], [gold, 5], [iron, 20]);

// Но меновые стоимости можно вычислить без участия человека
// Это подтверждает наличие в 10 центнерах пшена и одном центнере золота чего-то равного
// 10 пшено === 1 золото
// 5 пшено === 1 железа -> 10 пшено === 2 железа ->
// -> 10 пшено === 2 железа === 1 золото
// 1. Меновые стоимости выражают нечто равное (что можно сравнивать в абсолюте)
// 2. За меновой стоимостью должно иметься известное содержание
// 3. Потребительская стоимость не имеет никакого значения при обмене
console.log(toExchangeQuantities(wheat, gold));
console.log(toExchangeQuantities(wheat, iron));
console.log(toExchangeQuantities(iron, gold));

// * В деньгах, меновая стоимость устанавливается вручную
function createMoney(ev: number): Product {
  return {
    name: 'money',
    useValue: () => 0,
    exchangeValue: () => ev,
  };
}

const money_100 = createMoney(100);

// Между пшеницей на 100 марок и золотом на туже сумму нет никакой разницы или различимости
// с точки зрения мен стоимости
const wheat_10 = productTimes(wheat, 10);
console.log(toExchangeQuantities(money_100, gold));
console.log(toExchangeQuantities(money_100, wheat_10));

// Но с точки зрения потребления, разница может быть существенной
console.log(person.useValueFor(wheat_10));
console.log(person.useValueFor(gold));

// Без потреб стоимости, все что у нас остается - факт того что товар это продукт труда
// Т. е. продукт израсходования чел раб силы
type LaborProduct = {}

// Move next
