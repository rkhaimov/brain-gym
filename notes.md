# Общее

Haskell видится достаточно необычным языком, каждая конструкция в нём - это выражение. Скобки опускаются во имя большей
краткости, но при этом жертвуется изрядная доля прозрачности, особенно для новичков.

# Циклы

Циклы в языке заменяются обычными рекурсиями которые являются гораздо более гибкими конструктами и позволяют легко
разбить проблему на её составляющие:

```haskell
fibonacci n
    | n == 0 = 0
    | n == 1 = 1
    | otherwise = fibonacci (n - 1) + fibonacci (n - 2)
```

# Композиция

Для объединения функций используются специальные операторы, например `$`:

```haskell
main = print $ show $ fibonacci 10
```

`print` - создаёт экземпляр `IO`, который отвечает за выполнения сайд-эффекта. Ещё предстоит узнать как это происходит.
`show` - преобразует число в строку.

`$` объединяет функции на месте и возвращает результат.

## Point-free

haskell в некоторых случаях позволяет опускать прямую передачу аргументов функции, сокращая кол-во кода:

```haskell
makeGreeting = (<>) . (<> " ")
```

В некоторых случаях это помогает улучшить читаемость (но не в этом). Вот аналог на `ts`:

```ts
// (<> " ")
const prepend = (name: string) => name + " "

// (<>)
const join = (left: string) => (right: string) => left + right;

const makeGreeting = compose(join, prepend);
```

Все функции в haskell принимают ровно один аргумент, в случае если их больше, происходит преобразование *currying*:

```
// (a, b, c) => {}
// (a) => (b) => (c) => {}
```

Это сокращает кол-во возможных сигнатур функций и увеличивает вероятность их обобщения, а значит и простоту повторного
использования кода.

Point-free - другими словами это процесс превращения функций в идентичный экземпляр того, к чему идёт присваивание.

Прямое описание аргументов обычного необходимо при адаптации интерфейса. Адаптация становится избыточной в случае когда
сигнатуры становятся совместимыми.

Для того чтобы дополнительно подкрепить связанность, можно посмотреть на уже существующую функцию `flip`, которая просто
меняет аргументы местами:

```haskell
subtract x y = x - y

-- Swapped arguments
swappedSubtract = flip subtract
```

Если нужно поменять 2 и 3 аргументы местами, можно воспользоваться следующим:

```haskell
flip23 = (flip .)
```

И для 3 и 4:

```haskell
flip34 = ((flip .) .)
```

Опять же, без достаточной подготовки данный код выглядит мало понятным, однако благодаря такому свойству как
*referential transparency* его работу можно легко объяснить:

```haskell
-- ((flip .) .) example
-- (flip .) . example

-- Given example :: a -> b -> c -> d -> e

-- (flip .) . (a -> b -> c -> d -> e)

-- Given . :: (b -> c) -> (a -> b) -> a -> c

-- a -> flip . (b -> c -> d -> e)
-- a -> b -> flip (c -> d -> e)

-- Given flip :: (a -> b -> c) -> b -> a -> c

-- a -> b -> d -> c -> e
```

# Условия

В haskell имеются как обычные условия:

```haskell
printSmallNumber num =
  if num < 10
    then print num
    else print "the number is too big!"
```

Которые не отличаются от стандартных *conditional expression*. Так и специальные *guards*:

```haskell
guardSize num
  | num < 3 = "that's a small number"
  | num < 10 = "that's a medium number"
  | num < 100 = "that's a pretty big number"
  | num < 1000 = "wow, that's a giant number"
  | otherwise = "that's an unfathomably big number"
```

Это потенциально более гибкий конструкт чем обычный *conditional*. Особый интерес представляет *otherwise*, который
является обычным *alias* значения *true*.

# Переменные

Переменные объявляются в haskell двумя способами: через *let* и *where*. Отличие лишь в том, где определяются сами
значения.

Это даёт дополнительный контроль для разработчика при написании функции, например, чтобы опустить некоторые детали её
реализации.

```haskell
letWhereGreeting name place =
  let salutation = "Hello " <> name
      meetingInfo = location "Tuesday"
   in let date = 18
       in salutation <> " " <> meetingInfo <> show date
  where
    location day = "we met at " <> place <> " on a " <> day
```

## Hoisting

В ts нет явного разделения, однако интерпретатор реализует механизм всплытия разного рода объявлений. В частности,
*function declaration*.

## Composite

Здесь явно прослеживается одно из преимуществ структуры языка haskell, где всё является выражением.

```text
let {var_name} = {expression}
 in {expression}
```

Выражения можно вкладывать в выражения, открывая почти бесконечное разнообразие возможных конструкций.

Паттерн *composite* является чуть ли не одним из главных в ФП и ещё не один раз будет встречен по ходу изучения данного
языка.

# Списки

Списки в haskell представляют особый интерес, они не могут быть гетерогенными:

```haskell
badList = [[1,2,3],["one","two","three"]]
```

В ts поведение на самом деле аналогичное, разница лишь в том что компилятор сам находит общий тип с помощью оператора
объединения:

```ts
// number | string
const list = [1, 2, 3, 'one', 'two', 'three'];
```

С точки зрения множеств это гомогенный массив, ведь каждый его элемент входит в `number | string`. В haskell такой трюк
не пройдёт и он по всей видимости требует обёртки в отдельный generic контейнер.

## Partial функции

Первой *partial* функцией перед нами предстаёт *head*:

```haskell
head [1, 2]
-- Вернёт 1
```

*Partial* или частичные функции - это функции которые определены лишь для части значений своего домена. Другими словами,
можно найти такие значения, для которых данная процедура выбросит исключение. Это особенно интересно так как haskel
является функциональным языком программирования, однако в нём так просто можно использовать функцию, выполняющую
сайд-эффекты.

# Порядок аргументов

Рассмотрим `reduce` функцию в haskell:

```haskell
reduce mapper initial values =
  if null values
    then initial
    else
      let mapped = mapper initial (head values)
       in reduce mapper mapped (tail values)
```

Интерес представляет собой порядок аргументов, почему `values` находится на последнем месте? Так как он является самым
динамичным из всех. Расставляя параметры функции подобным образом, мы увеличиваем вероятность повторного использования
функции без явной передачи аргументов, как тут:

```haskell
isBalanced :: String -> Bool
isBalanced brackets =
  0 == count brackets
  where
    -- brackets аргумент можно игнорировать
    count = reduce (\count char -> if char == '(' then count + 1 else count - 1) 0
```

Тут же можно заметить и такую конструкцию:

```haskell
0 == count brackets
```

Оператор сравнения - бинарный и в то же самое время является коммутативным. Здесь интересно то, что константа с которой
происходит сравнение, находится слева, а не справа. Можно предположить что это не только стилистический приём, но и
также несколько вынужденная мера ввиду "бескобочности" языка:

```haskell
count brackets == 0
```

Тут уже не сразу ясно с чем происходит сравнение.

Выдержка:

**The general term in Haskell for these functions that accumulate a value while recursing through a structure are called
folds. **

# Функции над структурами

Ввиду особенностей языка стандартные функции преобразований имеют определённые нюансы в реализации.

Функция `map` имеет следующий вид:

```haskell
map' :: (a -> b) -> [a] -> [b]
map' mapper =
  foldr (onMap mapper) []
  where
    onMap f element acc = f element : acc
```

`foldr` является *right associative*, что совместимо с поведением функции трансформации. Так как аккумуляция выполняется
справа на лево (начиная с конца списка), то и создание нового массива на его основе не видится чем то сложным.

То же верно и для `filter`:

```haskell
filter' :: (a -> Bool) -> [a] -> [a]
filter' predicate =
  foldr (onMap predicate) []
  where
    onMap f element acc =
      if f element
        then element : acc
        else acc
```

Таким образом, `fold` является более фундаментальной функцией структуры, на базе которой можно создавать новые операции.

## Декларативность

Рассмотрим функцию:

```haskell
pairs :: [Int] -> [Int] -> [(Int, Int)]
pairs as bs =
  let as' = filter (`elem` bs) as
      bs' = filter odd bs
   in concatMap (\a -> map (\b -> (a, b)) bs') as'
```

Основная сложность исходит из того, что комбинируются несколько списков между собой. Трансформации, объединяются с
реструктуризацией.

Теперь рассмотрим иной формат записи:

```haskell
pairs :: [Int] -> [Int] -> [(Int, Int)]
pairs as bs = [(a, b) | a <- as, a `elem` bs, b <- bs, odd b]
```

Функция выглядит короче и декларативней. Минус лишь в том что с данной конструкцией нужно быть знакомым.

Недостаток нивелируется её универсальностью.

# Картежи и currying

Рассмотрим определение операции сложения:

```haskell
+ :: forall a. Num a => a -> a -> a
```

Функция принимает два аргумента (числа) и возвращает их сумму. Теперь применим функцию с примечательным названием
`uncurry`:

```haskell
-- sum :: forall a. Num a => (a, a) -> a
sum = uncurry (+) 
```

`a -> a` превратилось в `(a, a) -> a`. Это совершенно не случайно выглядит знакомым. Вторая версия функции по сути
является процедурой от двух аргументов. Технически в `haskell` нет таких функций, однако, благодаря равенству данных
конструкций можно обойти данное ограничение.

Из этого можно сделать вывод, функция от одного аргумента - это фундаментальная единица языка. Из которой рождается всё
дальнейшее многообразие:

![img.png](assets/life.png)

# Pattern-matching

`haskell` - удивительный язык, способный автоматически выводить типы исходя из реализации функции:

```haskell
-- id' :: p -> p
id' a = a
```

Переменная `a` может быть чем угодно.

А теперь:

```haskell
-- id' :: [a] -> a
id' a = head a
```

Функция `head` накладывает ограничения на возможные значения переменной.

Возьмём список, вот его характерные черты:

* Можно получить текущий элемент.
* Можно получить следующие элементы списка, если таковые есть.

Эти две простые операции можно описать простым интерфейсом:

```ts
type IList<T> = Maybe<{
  head: T;
  tail: IList<T>;
}>
```

```ts
/**
 * В haskell тип для list всплывёт исходя из операций над ним.
 * В данном случае операция (функция) одна countLength
 */
function main(list) {
  countLength(list);
}

function countLength(list: IList<T>) {
  return isNull(list) ? 0 : 1 + countLength(list.tail);
}
```

При выполнении нескольких операций одновременно, они объёдиняются:

```ts
// Тип считается как объединение операций (IList<unknown> & IList<number> === IList<number>)
function main(list) {
  countLength(list);
  calcSum(list);
}

function countLength(list: IList<T>) {
  return isNull(list) ? 0 : 1 + countLength(list.tail);
}

function calcSum(list: IList<number>) {
  return isNull(list) ? 0 : list.head + calcSum(list.tail);
}
```

Операция является паттерном которое должно соблюдать значение.

Паттерном может быть операция или значение определённого свойства:

```haskell
-- Данное условие сработает если переменная равна 0
matchNumber 0 = "zero"
-- Данное условие сработает во всех остальных случаях
matchNumber n = show n
-- Комбинация show и 0 накладывает контракт на первый аргумент matchNumber
```

# Lazy вычисления

В haskell большую роль играют ленивые вычисления.

Любое выражение представляется в виде специального объекта "trunk" и распаковывается (вычисляется) только при самом
чтении:

```haskell
'cycle ns = ns <> ('cycle ns)
```

В данном случае конкатенация (<>) соединяет список `ns` с правой частью, таким же бесконечным списком.

Вся функция 'cycle является ленивой и будет вычислена ровно до той степени, до которой это необходимо самой программе:

```haskell
-- Вычислит первые 10 элементов и вернёт 11-ый
'cycle !! 10
```

Другой, гораздо менее интуитивной под-функцией данного явления считается fold бесконечных списков:

```haskell
findFirst predicate lst =
  if null lst
    then []
    else findHelper (head lst) $ findFirst predicate (tail lst)
  where
    findHelper listElement maybeFound
      | predicate listElement = [listElement]
      | otherwise = maybeFound
```

На первый взгляд такой вызов `findFirst (>10) [1..]` не должен вернуть ничего, программа должна просто зависнуть, однако
в дело вступает lazy механизм:

* Выражение `findFirst predicate (tail lst)` будет обёрнуто в trunk
* Trunk будет передан в качестве второго аргумента в функцию `findHelper (head lst)`
* `maybeFound` внутри `findHelper` (он же trunk) будет распакован только в том случае, если не выполнится
  условие `predicate listElement` что соответствует заявленному `findFirst` поведению.

Для haskell функция выше идентична этому:

```haskell
findFirst predicate lst =
    if null lst
    then []
    else
        if predicate (head lst)
        then [head lst]
        else findFirst predicate (tail lst)
```

Для разработчиков такое поведение непривычно, ведь мы привыкли к строго определённому порядку выполнения выражений.

## Memo вычисления

Функция fib

```haskell
fib :: Int -> Int
fib 0 = 0
fib 1 = 1
fib n = fib (n - 1) + fib (n - 2)

fibs = map fib [0 ..]
```

Яркий пример того, как декларативный подход своей структурой дополняет реализацию функции.

Однако, у данного подхода есть недостаток - одни и те же вычисления выполняются повторно.

Функция fib интересна тем, что она естественным образом считается "от корня". То есть, для того чтобы получить значение
элемента на 100 позиции, нужно знать значения на всех предыдущих.

Это прекрасно реализуется с помощью lazy streams рассмотренных ранее:

```haskell
fibs :: [Int]
fibs = _fibs 0 1
  where
    _fibs :: Int -> Int -> [Int]
    _fibs fst snd = fst : _fibs snd (fst + snd)
```

Последний результат записывается в коллекцию, сокращая время выполнения. Благодаря абстрактной природе iterable
сущностей, нельзя магическим образом "прыгнуть" к какому-то элементу списка:

```haskell
fibs !! 50
```

Вместо этого, движок выполнит пошаговый обход всего списка, пока не встретит 50 по счёту элемент:

```typescript
while (!iterable.done) {
  const element = iterable.next();

  if (is50Element(element)) {
    return element;
  }
}
```

Во время этого обхода и будут подсчитаны все промежуточные значения fib.

![img.png](assets/fib-js.png)

# Типы

В мире без сайд-эффектов, сигнатуры функций занимают значительную часть поведения:

```haskell
identity :: a -> a
```

Всё что делает `identity` - возвращает переменную того же типа что и принимает. При условии отсутствия ограничений на
тип, а также сайд-эффектов - это становится очевидным только глядя на сигнатуру.

```haskell
--Сигнатура "кричит" о поведении функции
uncurry :: (a -> b -> c) -> (a, b) -> c

--В купе с названием, детали реализации уже становятся не важны
len :: [a] -> Int
```

## Void, Unit

Тип (как множество) содержит n элементов, где 0 <= n <= Infinity.

Выделяются такие множества:

```haskell
-- Не имеют конструктора и как следствие нельзя создать экземпляр множетсва 
data Void

-- Псевдо-haskell. Имеет конструктор без аргументов, следовательно возращает всегда один и тот же экземпляр (как singleton)
data () = ()

-- Определяет конструктор от Bool, следовательно возможно создание двух разных экземпляров
data CustomerInfo = CustomerInfo Bool
```

При этом, типы сравниваются номинально:

```haskell
data LeftType
data RightType

onLeft :: LeftType -> Int
onLeft left = onRight left;

onRight :: RightType -> Int
onRight right = undefined;

--Couldn't match expected type ‘RightType’ with actual type ‘LeftType’
```

## Связь синтаксиса и терминов

```typescript

/**
 * Функция без аргументов (но на самом деле от одного единственного, который singleton).
 * В haskell, unit тип отображается как ()
 */
const none = () => {/*...*/
}

/**
 * Функция от одного аргумента (значение которого может быть разным в пределах множества `а`).
 * В haskell это стандартный картеж от одного значения `(a)`
 */
const unary = (a) => {/*...*/
}
```

Функция, это преобразование значения в домене от `()` до n-мерного tuple `(a0, a1, ..., an)` до другого значения, в
потенциально более широком диапазоне (до universal множества `unknown`).

## Record

В haskell реализована возможность описания именованных картежей (record другими словами)

```haskell
data CustomerInfo = CustomerInfo
  { firstName :: String,
    lastName :: String,
    widgetCount :: Int,
    balance :: Int
  }
```

Структурно, количество элементов в модели растёт мультипликативно, с каждым новым свойством (product types).

При объявлении именованных полей, для них автоматически генерируются геттеры:

```haskell
customerGeorge =
  CustomerInfo
    { firstName = "George",
      lastName = "Bird",
      balance = 100,
      widgetCount = 10
    }
    
--lastName :: CustomerInfo -> String
name = lastName customerGeorge
```

Преимущество геттеров как отдельных функций заключается в том, что общая модель использует уже существующий базовый
объект в языке - чистую функцию:

```haskell
--Геттеры легко композировать и строить зависимые поведения
totalWidgetCount :: [CustomerInfo] -> Int
totalWidgetCount = sum . map widgetCount
```

Недостаток заключается в невозможности объявления двух одинаковых свойств в рамках разных структур:

```haskell
data CustomerInfo = CustomerInfo
  { firstName :: String,
    lastName :: String,
    widgetCount :: Int,
    balance :: Int
  }

data EmployeeInfo = EmployeeInfo
--ERROR: Multiple declarations of ‘firstName’
  { firstName :: String,
    lastName :: String,
    timezone :: String,
    contactInfo :: String
  }
```

Процедуры обновляющие структуры реализуются с помощью специальных фабрик

```haskell
emptyCart :: CustomerInfo -> CustomerInfo
emptyCart customer =
  customer
    { widgetCount = 0,
      balance = 0
    }
```

Специальный синтаксис создания новых экземпляров на базе старых идентичен object spread из js.

## Sum

Sum типы интересным образом совмещают пересечение типов и генерируемые геттеры:

```haskell
data Person
  = Customer
      { name :: String,
        balance :: Int
      }
  | Employee
      { name :: String,
        managerName :: String,
        salary :: Int
      }
```

Несмотря на наличие общего свойства name, ошибки не возникает так как возможно создать такой геттер, который
удовлетворяет `name :: Person -> String`.

Почему haskell не делает автоматически того же самого и для свойств, пересечённых для разных структур? Из-за того что в
таком случае их объединение нужно было бы объявлять в типе геттера?

И здесь опять проблема с глобальными геттерами:

```haskell
data Person
  = Customer
      { name :: String,
        balance :: Int
      }
  | Employee
      { name :: String,
        managerName :: String,
        salary :: Int
      }
      
balance :: Person -> Int
r =
  balance
    Employee
      { name = "John",
        managerName = "Marting",
        salary = 10
      }
```

Код выше выбросит runtime исключение. Почему haskell спокойно реализует геттеры как partial функции?

Данные проблемы решаются с помощью использования дополнительных обёрток, которые исключают наличие прямых геттеров:

```haskell

data CustomerInfo = CustomerInfo
  { customerName :: String,
    customerBalance :: Int
  }

data EmployeeInfo = EmployeeInfo
  { employeeName :: String,
    employeeManagerName :: String,
    employeeSalary :: Int
  }

data Person
  = Customer CustomerInfo
  | Employee EmployeeInfo

george =
  Customer $
    CustomerInfo
      { customerName = "Georgie Bird",
        customerBalance = 100
      }

porter =
  Employee $
    EmployeeInfo
      { employeeName = "Porter P. Pupper",
        employeeManagerName = "Remi",
        employeeSalary = 10
      }
```

Общие функции реализуются через отдельные методы:

```haskell
getPersonName :: Person -> String
getPersonName person =
  case person of
    Employee employee -> employeeName employee
    Customer customer -> customerName customer
```

В ООП языке структура выглядела бы гораздо проще (один базовый класс с общими полями и два наследника). В ts
используется модель с множествами (более низкий уровень) где пересечение вычисляется автоматически (не нужен явный
базовый класс).

## Тип как функция

Тип в haskell это функция над типами (type constructor), либо значение (type value)

```haskell
-- type constructor Either :: Type -> Type -> Type
Either

-- Поэтому возможен point free
-- AppValue Type -> Type
type AppValue = Either String

-- Однако runtime функции здесь не работают
type AppError = flip Either -- Ошибка
```

# Инкапсуляция

В haskell модульная система является относительно простой.

```haskell
module Utils (Name (..)) where

data Name = Name
  { value :: String
  }
```

Данная запись объявлет тип Name и экспортирует его (а также конструктор и геттер на значение).

Если расскрыть сахар выше, выходит:

```haskell
module Utils (Name (Name, value)) where

data Name = Name
  { value :: String
  }
```

Это означает, что можно объявлять приватные члены:

```haskell
module Utils (Name (Name)) where

-- Геттер для value не экспортируется.
-- Тем самым свойство становится приватным.
data Name = Name
  { value :: String
  }
```

Такая гибкость достигается засчёт обобщения (приведения методов объекта к уже существующим структурам - внешним
функциям).

Инкапсуляцию можно использовать и для умных конструкторов:

```haskell
module Utils (Name, createName) where

-- Представляет не пустую строку
data Name = Name
  { value :: String
  }

createName :: String -> Maybe Name
createName "" = Nothing
createName str = Just $ Name str
```

Таким образом, сохраняются инварианты типа Name, которые можно использовать в функциях над ним.

## Фантомные типы

```haskell
-- Тип без конструктора (пустое множество)
data Authenticated
data Unauthenticated

-- isAuthenticated это дженерик который по хорошему extends (Authenticated | Unauthenticated) 
data User isAuthenticated = User {
    userName :: String,
    userEmail :: String
}

-- Работает для всех пользователей
getUserName :: User isAuthenticated -> String
getUserName = userName

-- Работает только для авторизированных.
-- Сопоставляет по Authenticated который можно сделать приватным. 
getUserEmailAddress :: User Authenticated -> String
getUserEmailAddress = userEmailAddress
```

Способ интересный но есть ряд особенностей:

* В качестве дженерика можно передать любой тип User Int (бессмыслица)
* Усложняются методы над общим User
* Наличие уникальных для типов свойств (например, свойство которое есть в Unauthenticated но нет в Authenticated).
    * Вероятно стоит моделировать через Maybe, но в таком случае partial методы неизбежны

Решение ниже даёт более управляемое решение (хоть и несколько многословное)

```haskell
data UserBase = UserBase
  { userBaseName :: String
  }

data UnauthorizedUser = UnauthorizedUser
  { unauthorizedUserGuestID :: Int,
    unauthorizedUserBase :: UserBase
  }

data AuthorizedUser = AuthorizedUser
  { authorizedUserEmail :: String,
    authorizedUserBase :: UserBase
  }

data User = Unauthorized UnauthorizedUser | Authorized AuthorizedUser
```

В typescript фантомные типы можно попробовать описать с помощью `unique symbol` типов

```typescript
declare const _Unauthorized: unique symbol;
declare const _Authorized: unique symbol;

export type Unauthorized = typeof _Unauthorized;
export type Authorized = typeof _Authorized;
export type UnknownAuthState = Unauthorized | Authorized;

export type User<TAuthenticated extends UnknownAuthState> = {
  readonly authenticated: TAuthenticated;
};

export declare function findUserByName(name: string): User<Unauthorized> | undefined;

export declare function getUserName(user: User<UnknownAuthState>): string;

export declare function authenticate(user: User<UnknownAuthState>, password: string): User<Authorized> | undefined;

export declare function getUserEmail(user: User<Authorized>): string;
```

Важное отличие заключается в том что unique symbol описывает singleton множество, поэтому его значение нужно оставлять
приватным.

Соотношение дженериков обязано быть ковариантным (out) для корректной работы с обобщёнными методами опирающимися на
UnknownAuthState constraint.