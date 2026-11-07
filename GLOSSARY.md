# Sales Tracking

The application helps a creator track products placed at outlets, compare sales and stock balances, and understand accrued earnings.

English terms are canonical in documentation and conversation. Russian terms are their UI labels.

## Language

| EN term | RU term                  | Avoid terms | Meaning |
| --- |--------------------------| --- | --- |
| Product catalog | Каталог штучек           | Product registry, global inventory, outlet inventory | The creator-maintained collection of products shared across all outlets. |
| Product | Штучка                   | Piece, item, goods, jewelry, SKU | A creator-defined kind of item used to group equivalent outlet listings. Each product has a unique canonical name. |
| Unit | штука                    | Piece, copy, instance | One physical example of a product. Units are counted but are not individually identified. |
| Outlet | Торговая точка           | Store, shop, retail point, location, partner | A uniquely named place that holds products on consignment and for which sales and stock balances are tracked separately. |
| Outlet code | Код точки                | Outlet name, source mapping | An optional, unique, changeable code by which report files identify an outlet. |
| Outlet listing | Позиция точки            | Outlet product, product, report row, SKU | An outlet-specific entry recorded under the name used by that outlet. Multiple outlet listings, including differently named listings from the same outlet, may represent the same product. |
| Product mapping | Сопоставление            | Match, binding, link | The association between an outlet listing and the product it represents. Many outlet listings may map to the same product. |
| Unmapped listing | Несопоставленная позиция | Unknown product, unmatched item | An outlet listing that has no product mapping. |
| Sales report | Отчёт                    | Inventory action, inventory state, reconciliation | Data from one outlet covering sales during a reporting period and the complete stock balances at its end. |
| Report file | Файл отчёта              | Sales report, import batch | A file containing sales and stock balance data for one reporting period and one or more outlets. |
| Reporting period | Отчётный период          | Month, cycle | The date interval covered by a sales report; it does not have to match a calendar month. |
| Sale | Продажа                  | Transaction, realization | The sale of one or more units recorded under an outlet listing at a particular time. |
| Stock balance | Остаток                  | Stock state, current number, inventory state | The number of units recorded under an outlet listing on a particular date. |
| Units sold | Продано, шт.             | Sales count, sold number, popularity | The number of product units sold during a selected period. |
| Outlet price | Цена в точке             | Product price, unit cost, actual cost | The listed price of one unit under an outlet listing in a sales report. It may differ between reports and may be corrected by editing a report. |
| Outlet share | Комиссия точки           | Outlet commission, outlet fee, margin | The portion of the listed value of sold units not accrued as earnings, including the outlet's commission, discounts, and other price adjustments. |
| Earnings | Заработано               | Revenue, profit, income, payout, amount received | The amount accrued to the creator from a sale after the outlet share; it does not imply that the money has been transferred. |
