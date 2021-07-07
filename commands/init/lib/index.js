'use strict';

const fs = require('fs');
const path = require('path');
const Command = require("@mars-cli/command");
const log = require("@mars-cli/log");

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose("projectName: ", this.projectName);
        log.verbose("force: ", this.force);
    }
    exec() {
        try {
            // 1. 准备阶段
            this.prepare();
            // 2. 下载模板
            // 3. 安装模板
        } catch (e) {
            log.error(e.message);
        }  
    }

    prepare(){
        // 1. 当前目录是否为空
        if(!this.isCwdEmpty()) {
            // 1.1询问是否继续创建
        }
        console.log(ret);
        // 2. 是否启动强制更新
        // 3. 选择项目或者组件
        // 4. 获取项目的基本信息
    }

    isCwdEmpty() {
        const localPath = process.cwd();
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter((file) => (
            !file.startsWith(".") && ['node_modules'].includes(file)
        ));
        return !fileList || fileList.length <= 0;
    }
}


function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
