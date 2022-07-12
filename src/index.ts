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

// Без потреб стоимости, все что у нас остается - факт того что товар это продукт труда
// Т. е. продукт израсходования чел раб силы
type LaborProduct = {
  quantity(): number;
};

// 1 час равен одной единицы Общественно необходимого рабочего времени
function createLaborProduct(hours: number): LaborProduct {
  return {
    quantity: () => hours,
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

// Ценность товара (мен стоимость) определяется кол-вом lp рабочего
// времени потребного на его производство
function createProduct(name: string, lp: LaborProduct): Product {
  const product: Product = {
    name,
    useValue: (needs) => {
      // Если вещь представляет собой мен стоимость, то также обязана быть и потреб стоимость
      if (product.exchangeValue() > 0) {
        assert(needs > 0);
      }

      return needs;
    },
    exchangeValue: () => lp.quantity(),
  };

  return product;
}

function productQtyTimes(product: Product, times: number): Product {
  return {
    ...product,
    useValue: (needs) => needs * times,
    exchangeValue: () => product.exchangeValue() * times,
  };
}

function productLPTimes(product: Product, times: number): Product {
  return {
    ...product,
    exchangeValue: () => product.exchangeValue() * times,
  };
}

// Кажется что меновая стоимость имеет смысл только относительно другого товара
// и не присуща товару как самостоятельной единице
function toExchangeQuantities(left: Product, right: Product): [number, number] {
  // Ценности товаров относятся друг к другу как отношение их lp
  return [right.exchangeValue() / left.exchangeValue(), 1];
}

// 10 часов требуется на изготовление одной у е пшеницы
const wheat = createProduct('wheat', createLaborProduct(10));
const iron = createProduct('iron', createLaborProduct(50));
const gold = createProduct('gold', createLaborProduct(100));

// Заметим, что потреб и мен стоимости могут быть разными
const person_0 = createPerson([wheat, 10], [gold, 5], [iron, 20]);

// 10 пшено === 1 золото
// 5 пшено === 1 железа -> 10 пшено === 2 железа ->
// -> 10 пшено === 2 железа === 1 золото
// Товары, в которых воплощены одинаковый кол-ва труда, имеют одинаковую ценность
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
const wheat_10 = productQtyTimes(wheat, 10);
console.log(toExchangeQuantities(money_100, gold));
console.log(toExchangeQuantities(money_100, wheat_10));

// Но с точки зрения потребления, разница может быть существенной
console.log(person_0.useValueFor(wheat_10));
console.log(person_0.useValueFor(gold));

// Ценность товара изменяется в зависимости от производительности труда
const fast_gold = productLPTimes(gold, 1 / 2);
// Теперь за тот же объем золота можно обменять только 5 пшеницы вместо 10
console.log(toExchangeQuantities(wheat, fast_gold));

// Вещь, в некоторых случаях, может обладать только потреб стоимостью
const air = createProduct('air', createLaborProduct(0));
console.log(air.exchangeValue());
