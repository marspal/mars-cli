'use strict';

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
}

function spinnerStart(msg, spinnerString = '|/-\\') {
    const Spinner = require('cli-spinner').Spinner;
    const spinner = new Spinner(msg);
    spinner.setSpinnerString(spinnerString);
    spinner.start();
    return spinner;
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
    isObject,
    spinnerStart,
    sleep
};
