'use strict';
const log = require('npmlog');

// 判断debug模式
log.level = process.env.LOG_ENV ? process.env.LOG_ENV : 'info';
log.heading = 'mars';
log.addLevel('success', 2000, {fg: 'green', bold: true});

module.exports = log;
