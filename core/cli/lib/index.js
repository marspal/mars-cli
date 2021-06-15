'use strict';
module.exports = core;

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const pathExists = require('path-exists').sync;
const pkg = require('../package.json');
const log = require('@mars-cli/log');
const constant = require('./const');

let args, config, userHome;
function core() {
    try {
        checkPkgVersion();
        checkNodeVersion();
        // checkRoot();
        checkUserHome();
        checkInputArgs();
        log.verbose('debug', 'test debug log');
        checkEnv();
    } catch(err){
        log.error(err.message);
    }
}

// 检查环境变量: 存放信息
function checkEnv(){
    // dotenv
    const dotenv = require('dotenv');
    const dotenvPath = path.resolve(userHome, '.env');
    if(pathExists(dotenvPath)){
        // config = dotenv
        config = dotenv.config({
            path: dotenvPath
        });
    }
    createDefaultConfig();
    log.verbose('环境变量', process.env.CLI_HOME_PATH);
}

function createDefaultConfig(){
    const cliConfig = {
        home: userHome
    };
    if(process.env.CLI_HOME){
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else{
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 检查入参, 设计debug模式
function checkInputArgs(){
    // minimist
    const minimist = require('minimist');
    args = minimist(process.argv.slice(2));
    checkArgs();
}

function checkArgs(){
    if(args.debug){
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}

// 检查用户主目录
function checkUserHome() {
    // user-home
    // path-exists
    const os = require("os");
    userHome = os.homedir();
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在'));
    }
}

// 检查Root启动
function checkRoot() {
    // root-check使用降级使用
    // console.log(process.geteuid());
    const rootCheck = require('root-check');
    rootCheck();
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