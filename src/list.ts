// Either empty or not
type List<T> = Either<void, [T, List<T>]>;

declare function createEmptyList<T>(): List<T>;

declare function followedBy<T>(element: T, origin: List<T>): List<T>;

