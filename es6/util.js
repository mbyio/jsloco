/* @flow */

export function mapValues<U>(o: {[key: any]: U}): Array<U> {
    let out = [];
    let name;
    for (name in o) {
        out.push(o[name]);
    }
    return out;
}
