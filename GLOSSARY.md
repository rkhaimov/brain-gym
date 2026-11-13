# Sales Tracking

The application helps a creator track products placed at outlets, compare sales and stock balances, and understand accrued earnings.

English terms are canonical in documentation and conversation. Russian terms are their UI labels.

## Language

| EN term | RU term                  | Avoid terms | Meaning |
| --- |--------------------------| --- | --- |
| Product catalog | Каталог штучек           | Product registry, global inventory, outlet inventory | The creator-maintained collection of products shared across all outlets. |
| Product | Штучка                   | Piece, item, goods, jewelry, SKU | A creator-defined kind of item used to group equivalent Report listings. Each product has a unique canonical name. |
| Unit | штука                    | Piece, copy, instance | One physical example of a product. Units are counted but are not individually identified. |
| Outlet | Магазин                 | Store, shop, retail point, location, partner | A uniquely named place that holds products on consignment and for which sales and stock balances are tracked separately. |
| Report listing | Позиция отчёта            | Outlet listing, draft Product, report row, SKU | A globally identified exact name observed in Sales reports. The same exact name denotes the same thing across Outlets, while differently named Report listings may represent the same Product. |
| Product mapping | Сопоставление            | Match, binding, link | The association between a Report listing and the Product it represents. Many Report listings may map to the same Product. |
| Unmapped listing | Несопоставленная позиция | Unknown product, unmatched item | A Report listing that has no Product mapping. |
| Sales report | Отчёт                    | Inventory action, inventory state, reconciliation | Data from one outlet covering sales during a reporting period and the complete stock balances at its end. |
| Report file | Файл отчёта              | Sales report, import batch | A Твоя Полка workbook containing sales and stock balance data for one Reporting period and one or more Outlets. The parenthesized Outlet name in the workbook supplies exact Outlet identity during import. |
| Reporting period | Отчётный период          | Month, cycle | The date interval covered by a sales report; it does not have to match a calendar month. |
| Sale | Продажа                  | Transaction, realization | The sale of one or more units recorded under a Report listing at a particular time. |
| Stock balance | Остаток                  | Stock state, current number, inventory state | The number of units recorded under a Report listing on a particular date. |
| Units sold | Продано, шт.             | Sales count, sold number, popularity | The number of product units sold during a selected period. |
| Outlet price | Цена в магазине          | Product price, unit cost, actual cost | The listed price of one unit under a Report listing in a Sales report. It may differ between reports and may be corrected by editing a report. |
| Sales value | Сумма продаж            | Total price, selling price, revenue | The aggregate listed amount for all units in one sale before subtracting the outlet share. |
| Outlet share | Комиссия магазина        | Outlet commission, outlet fee, margin | The portion of a sale's sales value not accrued as earnings, including the outlet's commission, discounts, and other price adjustments. |
| Earnings | Заработано               | Revenue, profit, income, payout, amount received | The amount accrued to the creator from a sale after the outlet share; it does not imply that the money has been transferred. |
