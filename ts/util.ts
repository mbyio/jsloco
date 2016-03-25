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

/*
 * Let's us use the Function.name feature (which is now supported in basically
 * all browsers but technically only works in ES6.
 */
interface Function {
    name: string;
}
