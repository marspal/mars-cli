'use strict';

const fs = require('fs');
const path = require('path');
const inrequirer = require('inquirer');
const fse = require('fs-extra');
const semver = require('semver');
const Command = require("@mars-cli/command");
const log = require("@mars-cli/log");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose("projectName: ", this.projectName);
        log.verbose("force: ", this.force);
    }
    async exec() {
        try {
            // 1. 准备阶段
            const projectInfo = await this.prepare();
            if (projectInfo) {
                log.verbose('projectInfo: ', projectInfo);
                // 2. 下载模板
                this.downloadTemplate()
            }
            
            // 3. 安装模板
        } catch (e) {
            log.error(e.message);
        }  
    }

    downloadTemplate() {
        // 1. 通过项目模板API获取项目模板信息
        // 1.1 egg.js搭建一套后端管理系统
        // 1.2 npm 存储项目模板
        // 1.3 将项目模板信息存储到mongoDB中
        // 1.4 通过egg.js获取mongodb 数据并且通过API返回
    }

    async prepare(){
        const localPath = process.cwd();
        // 1. 当前目录是否为空
        if(!this.isDirEmpty(localPath)) {
            // 1.1询问是否继续创建
            let ifContinue = false;
            if(!this.force) {
                ifContinue = (await inrequirer.prompt({
                    type: "confirm",
                    name: "ifContinue",
                    message: "当前项目不为空, 是否继续创建?",
                    default: false
                })).ifContinue;
                if(!ifContinue) {
                    return;
                }
            }

            if (ifContinue || this.force) {
                // 2. 是否启动强制更新: 清空目录
                const {confirmDelete} = await inrequirer.prompt({
                    type: "confirm",
                    name: "confirmDelete",
                    message: "是否清空当前目录下的文件",
                    default: false
                });
                if (confirmDelete) {
                    // 清空目录
                    fse.emptyDirSync(localPath);
                }
            }
        }
        
        // return 项目的基本信息 object
        return this.getProjectInfo();
    }

    async getProjectInfo() {
        let projectInfo = {};
        // 3. 选择项目或者组件
        const {type} = await inrequirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                {
                    name: '项目',
                    value: TYPE_PROJECT,
                },
                {
                    name: '组件',
                    value: TYPE_COMPONENT,
                },
            ]
        });
        log.verbose('初始化类型type: ',  type);
        if (type === TYPE_PROJECT) {
            // 4. 获取项目的基本信息
            const project = await inrequirer.prompt([{
                type: "input",
                name: "projectName",
                message: "请输入项目名称",
                default: "",
                validate: function(v){
                    // 首字符必须是字母
                    // 尾字符必须为字母和数字、不能为字符
                    // 字符仅允许-_
                    var done = this.async();
                    setTimeout(function() {
                        if (!/^[a-zA-Z]([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)) {
                            done('请输入正确的项目名称。');
                            return;
                        }
                        done(null, true);
                    }, 0);
                },
                filter: function(v){
                    return v;
                }
            }, {
                type: "input",
                name: "projectVersion",
                message: "请输入项目版本号",
                default: "1.0.0",
                validate: function(v){
                    // 版本号校验
                    var done = this.async();
                    setTimeout(function() {
                        if (!(!!semver.valid(v))) {
                            // Pass the return value in the done callback
                            done('请输入合法的版本号。');
                            return;
                        }
                        done(null, true);
                    }, 0);
                },
                filter: function(v){
                    if (!!(semver.valid(v))) {
                        return semver.valid(v);
                    } else {
                        return v;
                    }
                }
            }]);
            projectInfo = {
                type,
                ...project
            };
        } else if(type === TYPE_COMPONENT) {

        }
        return projectInfo;
    }

    isDirEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter((file) => (
            !file.startsWith(".") && !['node_modules'].includes(file)
        ));
        return !fileList || fileList.length <= 0;
    }
}


function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
