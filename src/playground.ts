import { EditCosts, weightedEditDistance } from "./weighted-edit-distance";

const unitCosts: EditCosts<string> = {
  insert: () => 1,
  delete: () => 1,
  replace: () => 1,
};

const costs: EditCosts<string> = {
  insert: (value) => (value === "B" ? 1 : 5),
  delete: () => 4,
  replace: () => 3,
};

console.log(weightedEditDistance(["A", "A"], ["B", "A", "A"], costs));
