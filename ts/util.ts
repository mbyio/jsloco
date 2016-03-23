/*
 * A type that allows you to use an object as a map.
 */
interface StringMap<T> {
    [K: string]: T;
}

/*
 * A type that allows you to use an object as a map (and only accepts numbers as
 * keys).
 */
interface NumberMap<T> {
    [K: number]: T;
}
