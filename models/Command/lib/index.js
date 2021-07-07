'use strict';
const semver = require('semver');
const colors = require('colors');
const log = require('@mars-cli/log');

const LOWEST_NODE_VERSION = "12.0.0";
class Command {
    constructor(argv){
        log.verbose("Command Constructor", argv);
        if (!argv) {
            throw new Error("参数不能为空");
        }
        if (!Array.isArray(argv)) {
            throw new Error("参数必须为数组");
        }
        if (argv.length < 1) {
            throw new Error("参数列表不能为空");
        }
        this._argv = argv;
        // 创建chain实现异步的逻辑
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            // 检查node版本号
            chain = chain.then(() => this.checkNodeVersion());
            // 参数初始化
            chain = chain.then(() => this.initArgs());
            // 执行init
            chain = chain.then(() => this.init());
            // 执行exec
            chain = chain.then(() => this.exec());
            chain.catch(err => {
                log.error(err.message);
            })
        });
    }
    // 检测node版本号
    checkNodeVersion(){
        const currentVersion = process.version;
        const lowestVersion = LOWEST_NODE_VERSION;
        // 小于
        if(!semver.gte(currentVersion, lowestVersion)){
            throw new Error(colors.red(`mars-cli 需要安装 v${lowestVersion}以上版本的nodejs`));
        }
    }
    initArgs(){
        this._cmd = this._argv[this._argv.length - 1];
        this._argv = this._argv.slice(0, this._argv.length - 1);
    }
    init(){
        throw new Error("init方法必须被实现");
    }
    exec(){
        throw new Error("exec方法必须被实现");
    }
}

module.exports = Command;