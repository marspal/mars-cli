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

function sleep (ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function exec(command, args, options) {
    const  win32 = process.platform === 'win32';
    
    const cmd = win32 ? 'cmd' : command;
    const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
    
    return require('child_process').spawn(cmd, cmdArgs, options || {});
}

function execAsync(command, args, options) {
    return new Promise((resolve, reject) => {
        const child = exec(command, args, options);
        child.on('error', e => reject(e));
        child.on('exit', c => resolve(c));
    });
}

module.exports = {
    isObject,
    spinnerStart,
    sleep,
    exec,
    execAsync
};
