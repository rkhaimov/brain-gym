# Категории для тренировки

* чат
* лента
* карта
* редактор
* dashboard
* real-time UI
* high-load список
* файловое хранилище
* система уведомлений
* голос/видео конфа

(Нужно пройти все)

Паттерны по MF?
Паттерны по хранилищам?

# Основные характеристики

Правильность - инварианты, транзакционность, валидации, мисматч по бэк версиям
Надёжность - что произойдёт если части системы откажут (offline-first, queued mutations, идемпотентность)
Производительность - система достаточно быстро отвечает и потребляет оптимальное кол-во ресурсов (TTFB, FCP, LCP, INP, CLS)
Безопасность - могут ли злоумышленники использовать систему не по назначению
Масштабируемость - ожидаемые векторы роста системы (данные, пользователи, частота деплоя, вызовы API, размеры бандла)
Поддерживаемость - могут ли инженеры легко изменять программу (дислокация изменений (SOLID), тесты, рефакторинг)
Observability - можем ли мы отслеживать поведение системы (отслеживание ошибок, производительность, breadcrumbs, structured logs, что важно отслеживать)
Простота - есть ли в системе избыточные конструкты
Модульность - могут ли части системы развиваться независимо
Evolvability - может ли система адаптироваться под неизвестное будущее (какие требования могут измениться, какие части тяжелее изменить)

# Основные паттерны по оптимизации

## SSR / SSG

Рендеринг уходит на сервер, хорошо подойдёт под кейсы где важен первый экран

Трейдофф: hydration плохо влияет на INP + несколько усложняет саму разработку

Что можно улучшить: partial hydration, materialize data, RSC + selective hydration

## Code splitting

Хороший способ уменьшить размер бандла

Трейдофф: может создавать водопады запросов при неправильном разбиении (лучше делить на части с разными ответственностями)

## Lazy loading

Отлично подходит для bellow the fold контента, картинок, редакторов, графиков, карт. Они являются browser runtime heavy.

Трейдофф: может страдать LCP, стоит загружать видимый контент как можно скорее, если это возможно

## Preload / preconnect / fetch priority

Полезно для контроля приорита загрузки ресурсов

Трейдофф: легко ошибиться + это хинты а не прямые инструкции

## Image optimization

Обычно приносит наибольшую пользу. Помогает LCP, сокращает объём трафика.

Трейдофф: сложнее пайплайн, респонсив размеры, webp фолбэки, CDN трансформации, инвалидация кэша

Приоритет на LCP изображение

## Reducing JavaScript

Одна из важнейших техник оптимизации INP и LCP.

Трейдофф: может страдать UI/UX, сложнее архитектура решения

## Web Workers

Подходит для прямого оффлоада главного потока. Улучшает INP

Трейдофф: есть кост на передачу данных, увеличивает кост на управление стейтом

## Virtualization/Incremental rendering

Подойдёт для отображения больших объёмов данных которые не все помещаются на экран

Трейдофф: доступность, browser find, восстановление скролла, динамичный размер контента, keyboard navigation

## CLS prevention

CLS в основном про резервирование пространства

Трейдофф: предсказуемый лейаут, сложности со шрифтами и прочими async ресурсами.

## CSR

Хорошо применим в высокоинтерактивных приложениях. Проще инфраструктура, быстрее навигация

Трейдофф: ухудшается большинство метрик (LCP, INP, SEO)

## Service Workers

Слой между клиентом и сервером, кэширует запросы, оффлайн режим, prefetch ассетов

Трейдофф: увеличивает сложность решения, инвалидация, версионирование частей (FE, BE, API, ассеты)

# Фундаментальные правила оптимизации

If something can be avoided, then do not do it (Elimination)
If something can be done later, then do it later (Deferral)
If it must be done, do it only once (Caching)
If it must be done now, do it with less (Compression & Reduction)
Move the work closer to the user (Proximity)
Do things at the same time (Parallelism)
Do it before it is needed (Prediction)
Do not block the visual path (Prioritization)

# Фундаментальные правила безопасности

If it does not need access, do not give it access (Least Privilege)
If it can be hidden, do not expose it (Attack Surface Reduction)
If it comes from outside, do not trust it (Input Validation & Sanitization)
If you do not need it, do not store it (Data Minimization)
If it moves or sits, lock it up (Defense in Depth & Encryption)
If it fails, fail safely (Secure Failure)
If it happens, write it down (Auditability)

