type Transaction = {
  commit(): ShouldCommit;
  rollback(): ShouldCommit;
};

type Store = Map<string, string>;

type TransactionState = Mutations[];
type Mutations = (store: Store) => void;

type ShouldCommit = boolean;

class KVStore {
  private transactions: TransactionState[] = [];
  private _store = new Map<string, string>();

  begin(fn: (transaction: Transaction) => ShouldCommit): void {
    try {
      const transaction: TransactionState = [];

      this.transactions.push(transaction);

      const commit = fn({
        commit: () => true,
        rollback: () => false,
      });

      if (commit) {
        this.commit(transaction);
      }
    } finally {
      this.transactions.pop();
    }
  }

  get(key: string): string | undefined {
    return this.store().get(key);
  }

  set(key: string, value: string): void {
    const transaction = this.transactions.at(-1);

    if (transaction === undefined) {
      this._store.set(key, value);
    } else {
      transaction.push((store) => store.set(key, value));
    }
  }

  delete(key: string): void {
    const transaction = this.transactions.at(-1);

    if (transaction === undefined) {
      this._store.delete(key);
    } else {
      transaction.push((store) => store.delete(key));
    }
  }

  private store() {
    const copy = new Map(this._store);

    this.transactions.flat().forEach((mutate) => mutate(copy));

    return copy;
  }

  private commit(transaction: TransactionState) {
    const parent = this.transactions.at(-2);

    if (parent === undefined) {
      this._store = this.store();
    } else {
      parent.push(...transaction);
    }
  }
}

function main(store: KVStore) {
  store.begin((transaction) => {
    store.set("a", "2");
    store.get("a");

    return transaction.rollback();
  });
}
