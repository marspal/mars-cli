'use strict';
module.exports = core;

const semver = require('semver');
var colors = require('colors/safe');
const pkg = require('../package.json');
const log = require('@mars-cli/log');
const constant = require('./const');
function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
    } catch(err){
        log.error(err.message);
    }
}

// 检测version
function checkPkgVersion(){
    log.notice('cli', pkg.version);
}

// 检测node版本号
function checkNodeVersion(){
    const currentVersion = process.version;
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    if(!semver.gte(currentVersion, lowestVersion)){
        throw new Error(colors.red(`mars-cli 需要安装 v${lowestVersion}以上版本的nodejs`));
    }
 
}

// semver
// npmlog
// import-local
// colors