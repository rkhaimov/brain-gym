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

function createCompositeProduct(
  name: string,
  lp: LaborProduct,
  ...products: Product[]
) {
  return createProduct(
    name,
    createLaborProduct(lp.quantity() + productExchanges(...products))
  );
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

function productExchanges(...products: Product[]): number {
  return products.reduce((a, b) => a + b.exchangeValue(), 0);
}

// Кажется что меновая стоимость имеет смысл только относительно другого товара
// и не присуща товару как самостоятельной единице
function toExchangeQuantities(left: Product, right: Product): [number, number] {
  // Ценности товаров относятся друг к другу как отношение их lp
  return [right.exchangeValue() / left.exchangeValue(), 1];
}

// * В деньгах, меновая стоимость устанавливается вручную
function createMoney(ev: number): Product {
  return {
    name: 'money',
    useValue: () => 0,
    exchangeValue: () => ev,
  };
}

// Рабочая сила это тоже товар, который капиталист приобретает
// Мен стоимость раб силы есть кол-во времени затрачиваемое на её воспроизводство
// Рабочая сила создается поддержанием жизни индивидуума
// Итого, стоимость раб силы есть стоимость средств существования,
// необходимых для поддержания жизни её владельца
//
// Отметим что сами средства сущ рабочей силы зависят от окружающей среды,
// культуры и условий класса свободных рабочих
function createLaborForce(...needs: Product[]): Product {
  return createProduct(
    'рабочая сила',
    createLaborProduct(productExchanges(...needs))
  );
}

const feed = createProduct('продовольствие', createLaborProduct(3));
const clothes = createProduct('одежда', createLaborProduct(1));
const fuel = createProduct('топливо', createLaborProduct(1));
const medicine = createProduct('медицина', createLaborProduct(1));

const laborForce = createLaborForce(feed, clothes, fuel, medicine);

const cotton = createProduct('хлопок', createLaborProduct(1));
const cotton_10 = productQtyTimes(cotton, 10);
// Раб время на производство средств делится на время производства данного товара (пряжи)
// * Это называется износом товара
const meansOfProductionUsage = createProduct(
  'изнашивание средств производства',
  createLaborProduct(2)
);

// Пряжа включает труд + хлопок + износ
const yarn = createCompositeProduct(
  'пряжа',
  // Рабочему требуется 12 часов, для того чтобы сделать пряжу
  createLaborProduct(12),
  cotton_10,
  meansOfProductionUsage
);

// Всего в продукте заключено 24 часа
console.log(yarn.exchangeValue());

// Предположим что 12 золота включают в себя 24 рабочих часа
const gold_12 = createProduct('золото', createLaborProduct(24));

// Из чего следует что в 1 у е пряди заключено 2 раб дня или 12 золотых монет
console.log(toExchangeQuantities(yarn, gold_12));
