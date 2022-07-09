function assert<T extends boolean>(condition: T): asserts condition {
  if (condition) {
    return;
  }

  throw new Error('Assertion has failed');
}

type WithPrice = {
  price(): number;
};

function priceJoin(left: WithPrice, right: WithPrice): WithPrice {
  return {
    price: () => left.price() + right.price(),
  };
}

function priceEq(left: WithPrice, right: WithPrice): boolean {
  return left.price() === right.price();
}

function priceLess(left: WithPrice, right: WithPrice): boolean {
  return left.price() < right.price();
}

function priceGreater(left: WithPrice, right: WithPrice): boolean {
  return left.price() > right.price();
}

function priceMulti(price: WithPrice, by: number): WithPrice {
  return {
    price: () => price.price() * by,
  };
}

// Сырье и вспомогательные материалы, машины, аппараты и здания
type MeansOfProduction = WithPrice;

function createMeansOfProduction(product: Product): MeansOfProduction {
  return {
    price: () => product.price(),
  };
}

// Земельная рента
type FieldRent = WithPrice;

// Не понятно от чего зависит цена ренты, пока скажем от продукта
function createFieldRent(product: Product): MeansOfProduction {
  return {
    price: () => product.price(),
  };
}

// Фабрикант
type Product = WithPrice;

// Себестоимость фабриканта складывается из стоимости сырья, земли и зарплаты
function createProduct(
  mop: MeansOfProduction,
  fr: FieldRent,
  s: Salary
): WithPrice {
  return {
    price: () => mop.price() + fr.price() + s.price(),
  };
}

// ?
function createJustProduct(price: number): Product {
  return {
    price: () => price,
  };
}

// Капитал
type Capital = WithPrice;

// Капитал состоит из товаров (деньги это тоже товар)
function createCapital(product: Product): Capital {
  return {
    price: () => product.price(),
  };
}

// Зарплата
type Salary = WithPrice;

// Зарплата зависит от спроса на раб. силу. Спрос зависит от величины капитала?
function createSalary(capital: Capital): Salary {
  return {
    price: () => capital.price(),
  };
}

function toFinalProduct(product: Product): Product {
  return createJustProduct(product.price() + product.price() * 0.1);
}

const product_0 = createProduct(
  createMeansOfProduction(createJustProduct(25)),
  createFieldRent(createJustProduct(25)),
  createSalary(createCapital(createJustProduct(50)))
);

// Себестоимость товара со всеми издержками
console.log(product_0.price());

// Но продаст капиталист за
console.log(toFinalProduct(product_0).price());
// Но откуда взялись лишние
console.log(toFinalProduct(product_0).price() - product_0.price());

// Для того чтобы с этим разобраться, необходимо понять, каким образом происходит обмен.

// У каждого индивида есть свои потребности. Исходя из них и формируется цена
type WithEstimate = {
  estimate(product: Product): Product;
};

function estimateFromPairs(...pairs: [Product, Product][]): WithEstimate {
  return {
    estimate: (product) => {
      const l = pairs.find(([p]) => p === product);

      if (l) {
        return l[1];
      }

      const r = pairs.find(([_, p]) => p === product);

      if (r) {
        return r[0];
      }

      throw new Error('Unknown product');
    },
  };
}

// У человека есть товар (например деньги) и потребности
type Person = WithEstimate & {
  product: Product;
  mapProduct(f: (p: Product) => Product): Person;
};

function createPerson(product: Product, estimate: WithEstimate): Person {
  return {
    estimate: estimate.estimate,
    product,
    mapProduct: (f) => createPerson(f(product), estimate),
  };
}

// Первая теория гласит следующее
function exchange(
  buyer: Person,
  seller: Person
): [Person, Person] | 'NOT_A_DEAL' {
  // В сделке нет смысла если ценности продукта для покупателя и продавца одинаковы
  // Т. к. при обмене не произойдет выгоды
  if (
    priceEq(buyer.estimate(seller.product), seller.estimate(seller.product))
  ) {
    return 'NOT_A_DEAL';
  }

  // В сделке также нет смысла если у покупателя нет денег на товар
  if (priceLess(buyer.product, seller.estimate(seller.product))) {
    return 'NOT_A_DEAL';
  }

  // Цена продукта для покупателя должна быть меньше чем цена, которую требует продавец
  // Иначе при обмене не будет выгоды для покупателя
  if (
    priceGreater(
      seller.estimate(seller.product),
      buyer.estimate(seller.product)
    )
  ) {
    return 'NOT_A_DEAL';
  }

  // Себестоимость товара у продавца должна быть меньше чем его продаваемая стоимость
  // Иначе в сделке нет смысла
  if (
    priceEq(seller.estimate(seller.product), seller.product) ||
    priceLess(seller.estimate(seller.product), seller.product)
  ) {
    return 'NOT_A_DEAL';
  }

  // Для покупателя, сделка выгодна только в случае если ценность товара больше чем продаваемая цена
  assert(
    priceGreater(
      buyer.estimate(seller.product),
      seller.estimate(seller.product)
    )
  );

  // Для продавца, сделка выгодна только в случае если продаваемая ценность товара больше чем его себестоимость
  assert(priceGreater(seller.estimate(seller.product), seller.product));

  // Тогда и только тогда произойдет обмен с увеличением цены
  return [
    buyer.mapProduct(() => buyer.estimate(seller.product)),
    seller.mapProduct(() => seller.estimate(seller.product)),
  ];
}

const MONEY = {
  100: createJustProduct(100),
  110: createJustProduct(110),
  120: createJustProduct(120),
};

// Таким образом, каждый старается отдать меньшее и получить большее
const bread_0 = createJustProduct(100);

// Покупатель оценивает один хлеб в 120 марок
// Если цена хлеба действительно будет таковой, тогда одно из:
// 1. Покупатель не сможет его купить
// 2. Покупатель сможет его купить, но тогда в обмене не будет смысла т. к. не появится выгода
const buyer_0 = createPerson(
  MONEY['110'],
  estimateFromPairs([bread_0, MONEY['120']])
);

// Продавец оценивает один хлеб в 110 марок
// Если цена хлеба будет равна его себестоимости, то в таком случае в обмене не будет смысла т. к. не появится выгода
const seller_0 = createPerson(
  bread_0,
  estimateFromPairs([bread_0, MONEY['110']])
);

const result_0 = exchange(buyer_0, seller_0);
assert(Array.isArray(result_0));
const [buyer_1, seller_1] = result_0;

// После сделки получаем что покупатель приобрел в ценности 10 марок
console.log(buyer_1.product.price());

// И продавец также, получил 10 единиц прибыли
console.log(seller_1.product.price());

// До сделки, общая сумма продуктов составляла
console.log(priceJoin(buyer_0.product, seller_0.product).price());

// Но после, она увеличилась до
console.log(priceJoin(buyer_1.product, seller_1.product).price());

// Действительно, если каждая сделка будет осуществляться по обоюдным интересам
// то в таком случае итоговая сумма продуктов увеличится на сумму этих прибылей
// Сомнительно, что такое увеличение может поддерживаться бесконечно.
// В какой-то момент времени система должна прийти к такому состоянию,
// где не будет ни одной возможной сделки с сохранением указанных преимуществ

// Вторая теория гласит что товар продается по цене превосходящей его себестоимость
const bread_1 = createJustProduct(100);

const seller_2 = createPerson(
  bread_1,
  estimateFromPairs([bread_1, priceMulti(bread_1, 1.1)])
);

const bread_2 = seller_2.estimate(seller_2.product);
const seller_3 = createPerson(
  bread_2,
  estimateFromPairs([bread_2, priceMulti(bread_2, 1.1)])
);

const bread_3 = seller_3.estimate(seller_3.product);
const seller_4 = createPerson(
  bread_3,
  estimateFromPairs([bread_3, priceMulti(bread_3, 1.1)])
);

// Если каждый будет увеличивать покупаемую стоимость товара, то имеет место конечная сделка где
console.log(seller_2.estimate(seller_2.product).price());
console.log(seller_4.estimate(seller_4.product).price());
// Что означает что seller_4 должен снизить стоимость до предлагаемых 110
// либо seller_2 достать дополнительные 23 марки
