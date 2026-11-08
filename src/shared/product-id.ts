const productIdBrand: unique symbol = Symbol('ProductId');

export type ProductId = Readonly<{
  [productIdBrand]: true;
  value: string;
}>;

export function createProductId(value: string): ProductId {
  return { [productIdBrand]: true, value };
}

export function productIdToString(productId: ProductId): string {
  return productId.value;
}
