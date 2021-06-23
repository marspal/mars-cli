'use strict';
const semver = require('semver');
const colors = require('colors');

const LOWEST_NODE_VERSION = "14.0.0";
class Command {
    constructor(argv){
        // console.log("Command Constructor", argv);
        this._argv = argv;
        // 创建chain实现异步的逻辑
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            // 检查node版本号
            chain = chain.then(() => this.checkNodeVersion());
            chain.catch(err => {
                console.log(err.message);
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
    init(){
        throw new Error("init方法必须被实现");
    }
    exec(){
        throw new Error("exec方法必须被实现");
    }
}

module.exports = Command;