/* @flow */

import 'babel-polyfill';

document.addEventListener('DOMContentLoaded', function() {
    if (document.readyState === 'interactive') {
        main();
    }
});

function randInt(min: number, max: number): number {
    let range = max - min;
    if (range <= 0) {
        throw new Error('Invalid range.');
    }
    return Math.floor(Math.random() * range + min);
}

function main() {
    let displayContainer = document.getElementById('displayContainer');
    //let display = document.getElementById('display');
    displayContainer.style.backgroundColor = 'rgb(' +
        randInt(0,255) + ',' +
        randInt(0,255) + ',' +
        randInt(0,255) + ')';
}
