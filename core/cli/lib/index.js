'use strict';
module.exports = core;

const path = require('path');
const {Command} = require('commander');
const semver = require('semver');
const colors = require('colors/safe');
const pathExists = require('path-exists').sync;
const log = require('@mars-cli/log');
const init = require('@mars-cli/init');
const exec = require('@mars-cli/exec');
const pkg = require('../package.json');
const constant = require('./const');



let args, config, userHome;
let program = new Command();
async function core() {
    try {
        // 准备工作
        await prepare();
        // 注册命令
        registerCommand();
    } catch(err){
        log.error(err.message, '==');
    }
}

function registerCommand(){
    program
        .name(Object.keys(pkg.bin)[0])
        .usage("<command> [options]")
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');
    
    program.on('option:debug', function(){
        if(program.opts().debug){
            process.env.LOG_LEVEL = 'verbose';
        } else {
            process.env.LOG_LEVEL = 'info';
        }
        log.level = process.env.LOG_LEVEL;
        log.verbose('test');
    });

    program.on('option:targetPath', function(){
        process.env.CLI_TARGET_PATH = program.opts().targetPath;
    });

    program
        .command("init [projectName]")
        .option("-f,--force", "是否强制性清空内容")
        .action(exec);

    program.on('command:*', function(obj){
        const availableCommands = program.commands.map(cmd => cmd.name());
        console.log(colors.red('未知命令: ' + obj[0]));
        if(availableCommands.length){
            console.log(colors.red('可用命令：' + availableCommands.join(',')));
        }
    });

    program.parse(process.argv);

    if(program.args && program.args.length < 1){
        program.outputHelp();
    }
}

async function prepare(){
    checkPkgVersion();
    checkNodeVersion();
    // checkRoot();
    checkUserHome();
    // checkInputArgs();
    checkEnv();
    await checkoutGlobalUpdate();
}

// 检查当前版本是最新版本
async function checkoutGlobalUpdate(){
    // 1.获取当前的版本号和名称
    const npmName = pkg.name;
    const currentVersion = pkg.version;
    // 2.根据pkgName获取cli包的类型
    const {getNpmSemverVersion} = require("@mars-cli/get-npm-info");
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
    if(lastVersion && semver.gt(lastVersion, currentVersion)){
        log.warn(colors.yellow(`请手动更新 ${npmName}, 当前版本：${currentVersion}, 最新版本：${lastVersion}
            更新命令：npm install -g ${npmName}
        `));
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

// 检测node版本号
function checkNodeVersion(){
    const currentVersion = process.version;
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    // 小于
    if(!semver.gte(currentVersion, lowestVersion)){
        throw new Error(colors.red(`mars-cli 需要安装 v${lowestVersion}以上版本的nodejs`));
    }
}

// 检测version
function checkPkgVersion(){
    log.notice('cli', pkg.version);
}
