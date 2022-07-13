function assert<T extends boolean>(condition: T): asserts condition {
  if (condition) {
    return;
  }

  throw new Error('Assertion has failed');
}

// Рабочая сила это тоже товар, который капиталист приобретает
type LaborForce = Product;

// Мен стоимость раб силы есть кол-во времени затрачиваемое на её воспроизводство
// Рабочая сила создается поддержанием жизни индивидуума
// Итого, стоимость раб силы есть стоимость средств существования,
// необходимых для поддержания жизни её владельца
//
// Отметим что сами средства сущ рабочей силы зависят от окружающей среды,
// культуры и условий класса свободных рабочих
function createHBLaborForce(...needs: Product[]): LaborForce {
  // 1 час равен одной единицы Общественно необходимого рабочего времени
  // * 12 часов есть один раб день
  const hoursInDay = 12;

  assert(productsJoinMany(...needs).exchangeValue() <= hoursInDay);

  return {
    name: 'Труд',
    exchangeValue: () => hoursInDay,
  };
}

function createLaborForceFromEV(ev: number): LaborForce {
  return {
    name: 'Труд',
    exchangeValue: () => ev,
  };
}

// Товар
type Product = {
  name: string;
  // Товар можно обменять на другие товары. В таком случае потр. стоимости одного рода
  // обмениваются на потр. стоимости другого
  exchangeValue(): number;
};

// Ценность товара (мен стоимость) определяется кол-вом lp рабочего
// времени потребного на его производство
function createProduct(name: string, lp: LaborForce): Product {
  return {
    name,
    exchangeValue: () => lp.exchangeValue(),
  };
}

function createCompositeProduct(
  name: string,
  lp: LaborForce,
  ...products: Product[]
) {
  return createProduct(name, productsJoinMany(lp, ...products));
}

function productsJoin(left: Product, right: Product): Product {
  return {
    name: left.name + ' & ' + right.name,
    exchangeValue: () => left.exchangeValue() + right.exchangeValue(),
  };
}

function productTimesH(product: Product, times: number): Product {
  return {
    ...product,
    name: `(${product.name})x${times}`,
    exchangeValue: () => product.exchangeValue() * times,
  };
}

function productsJoinMany(...products: Product[]): Product {
  return products.reduce((a, b) => productsJoin(a, b));
}

// Кажется что меновая стоимость имеет смысл только относительно другого товара
// и не присуща товару как самостоятельной единице
function toExchangeQuantities(left: Product, right: Product): number {
  // Ценности товаров относятся друг к другу как отношение их lp
  return right.exchangeValue() / left.exchangeValue();
}

// * В деньгах, меновая стоимость устанавливается вручную
function createMoney(ev: number): Product {
  return {
    name: 'money',
    exchangeValue: () => ev,
  };
}

const gold = createProduct('золото', createLaborForceFromEV(2));
// Предположим: в одной марке заключено 2 раб часа
console.log(gold.exchangeValue());

// Сырье для воспроизводства труда
const feed = createProduct('продовольствие', createLaborForceFromEV(3));
const clothes = createProduct('одежда', createLaborForceFromEV(1));
const fuel = createProduct('топливо', createLaborForceFromEV(1));
const medicine = createProduct('медицина', createLaborForceFromEV(1));
const salary = productsJoinMany(feed, clothes, fuel, medicine);

const lf = createHBLaborForce(feed, clothes, fuel, medicine);

// Для воспроизведения раб силы требуется 3 марки
console.log(toExchangeQuantities(gold, salary));
// 3 марки воспроизводят труд в 12 часов или 6 марок!
// Где 3 марки доп марки и есть прибавочная стоимость
console.log(toExchangeQuantities(gold, lf));

const mpu = createProduct('износ', createLaborForceFromEV(2));
const cotton_10 = productTimesH(
  createProduct('хлопок', createLaborForceFromEV(1)),
  10
);

const cotton_per_hour = productTimesH(cotton_10, 1 / 12);
const mpu_per_hour = productTimesH(mpu, 1 / 12);
const salary_per_hour = productTimesH(salary, 1 / 12);
const lf_per_hour = productTimesH(lf, 1 / 12);

// В час работник производит
const yarn_per_hour = createCompositeProduct(
  'пряжа',
  lf_per_hour,
  cotton_per_hour,
  mpu_per_hour
);

// В час капиталист платит
console.log(
  productsJoinMany(
    salary_per_hour,
    cotton_per_hour,
    mpu_per_hour
  ).exchangeValue()
);

// В час капиталист получает
// где 1 час труда включен в сырье и износ
// и 1 час труда есть работа человека из которой оплачивается только половина
console.log(yarn_per_hour.exchangeValue());

// Рабочий день считается рабочим если по итогу 12 часов получается
const yarn_day = productTimesH(yarn_per_hour, 12);
console.log(yarn_day.exchangeValue());

// Или 12 марок
console.log(toExchangeQuantities(gold, yarn_day));

// Но капиталист заплатит только 9 марок
// где 3 марки и есть прибавочная стоимость, образованная трудом работника
console.log(
  toExchangeQuantities(
    gold,
    productsJoinMany(
      productTimesH(salary_per_hour, 12),
      productTimesH(cotton_per_hour, 12),
      productTimesH(mpu_per_hour, 12)
    )
  )
);
