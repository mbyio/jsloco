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
 * Lets us use the Function.name feature (which is now supported in basically
 * all browsers but technically only works in ES6).
 */
interface Function {
    name: string;
}

function ASSERT_ARRAY(v: Array<any>) {
    if (!Array.isArray(v)) {
        throw new Error("Expected an array.");
    }
}

function ASSERT_STRING(v: string) {
    // Note: this doesn't handle a lot of cases, such as the use of the `new
    // String` constructor. Check the lodash source for a more accurate way of
    // doing it.
    if (typeof v !== "string") {
        throw new Error("Expected a string.");
    }
}

function ASSERT_DEFINED(v: any) {
    if (v == null) {
        throw new Error("Expected a defined value.");
    }
}
