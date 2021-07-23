'use strict';

const fs = require('fs');
const path = require('path');
const inrequirer = require('inquirer');
const fse = require('fs-extra');
const ejs = require('ejs');
const glob = require('glob');
const semver = require('semver');
const Command = require("@mars-cli/command");
const log = require("@mars-cli/log");
const getProjectTemplate = require("./getProjectTemplate");
const Package = require('@mars-cli/package');
const {sleep, spinnerStart, execAsync} = require('@mars-cli/utils');

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';
const WHITE_COMMAND = ['npm', 'cnpm'];
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
                this.projectInfo = projectInfo;
                // 2. 下载模板
                await this.downloadTemplate()
                // 3. 安装模板
                await this.installTemplate();
            }
        } catch (e) {
            log.error(e.message);
            if (process.env.LOG_LEVEL === 'verbose') {
                console.error(e);
            }
        }  
    }

    async installTemplate() {
        if (this.templateInfo) {
            if (!this.templateInfo.type) {
                this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
            }
            if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
                await this.installNormalTemplate();
            } else if(this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
                await this.installCustomTemplate();
            } else {
                throw new Error('无法识别项目类型');
            }
        } else {
            throw new Error('模板信息不存在');
        }
    }

    checkCommand(command) {
        if(WHITE_COMMAND.includes(command)){
            return command;
        }
        return null;
    }

    async execCommand(command, errMsg) {
        let ret;
        if (command) {
            const cmdArr = command.split(' ');
            const cmd = this.checkCommand(cmdArr[0]);
            if (!cmd) {
                throw new Error('命令不存在');
            }
            const args = cmdArr.slice(1);
            ret = await execAsync(cmd, args, {
                stdio: 'inherit',
                cwd: process.cwd()
            });
        }
        if (ret !== 0) {
            throw new Error(errMsg);
        }
    }

    async ejsRender (options) {
        const dir = process.cwd();
        const projectInfo = this.projectInfo;
        return new Promise((resolve, reject) => {
            glob("**", {
                cwd: dir,
                ignore: options.ignore,
                nodir: true
            }, (err, files) => {
                if (err) reject(err);
                Promise.all(files.map(file => {
                    const filePath = path.resolve(dir, file);
                    return new Promise((resolve1, reject1) => {
                        ejs.renderFile(filePath, projectInfo, {}, (err, result) => {
                            if (err) reject1(err);
                            else {
                                fse.writeFileSync(filePath, result);
                                resolve1(result);
                            }
                        });
                    });
                })).then(() => {
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    async installNormalTemplate() {
        let spinner = spinnerStart("正在安装模板");
        await sleep();
        try {
            const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
            const targetPath = process.cwd();
    
            fse.ensureDirSync(templatePath);
            fse.ensureDirSync(targetPath);
            fse.copySync(templatePath, targetPath);
        } catch (e) {
            throw e;
        } finally {
            spinner.stop(true);
        }
        const templateIgnore = this.templateInfo.ignore || [];
        const ignore = ['**/node_modules/**', ...templateIgnore];
        await this.ejsRender({
            ignore
        });
        const {installCommand, startCommand} = this.templateInfo;
        // 依赖安装
        await this.execCommand(installCommand, '依赖安装失败!');
        // 启动命令执行
        await this.execCommand(startCommand, '启动命令执行失败!');
    }

    async installCustomTemplate() {
        // 查询自定义的入口文件
        if (await this.templateNpm.exists()) {
            const rootFile = this.templateNpm.getRootFilePath();
            if (fs.existsSync(rootFile)) {
                log.notice('开始执行自定义模板');
                const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
                console.log(this.projectInfo, 'this.projectInfo');
                const options = {
                    templateInfo:this.templateInfo,
                    projectInfo: this.projectInfo,
                    sourcePath: templatePath,
                    targetPath: process.cwd()
                };
                const code = `require('${rootFile}')(${JSON.stringify(options)})`;
                log.verbose('code', code);
                await execAsync('node', ['-e', code], {
                    stdio: 'inherit',
                    cwd: process.cwd()
                });
                log.success('自定义模板安装成功');
            } else {
                throw new Error("自定义模板入口文件不存在!");
            }
        }
    }

    async downloadTemplate() {
        // 1. 通过项目模板API获取项目模板信息
        // 1.1 egg.js搭建一套后端管理系统
        // 1.2 npm 存储项目模板(vue-cli/vue-element-admin)
        // 1.3 将项目模板信息存储到mongoDB中
        // 1.4 通过egg.js获取mongodb 数据并且通过API返回

        const {projectTemplate} = this.projectInfo;
        const templateInfo = this.template.find(item => item.npmName === projectTemplate);
        const userHome = os.homedir();
        const targetPath = path.resolve(userHome, '.mars-cli', 'template');
        const storeDir = path.resolve(userHome, '.mars-cli', 'template', 'node_modules');
        const {version, npmName} = templateInfo;
        this.templateInfo = templateInfo;
        const npmPkg = new Package({
            targetPath,
            storeDir,
            packageName: npmName,
            packageVersion: version
        });
        this.templateNpm = npmPkg;
        if (! await npmPkg.exists()) {
            const spinner = spinnerStart('正在下载模板...');
            await sleep();
            try {
                await npmPkg.install();
            } catch (err) {
                throw err;
            } finally {
                spinner.stop(true);
                if(await npmPkg.exists()) {
                    log.success('模板下载成功');
                }
            }  
        } else {
            const spinner = spinnerStart('正在更新模板...');
            await sleep();
            try {
                await npmPkg.update();
            } catch (err) {
                throw err;
            } finally {
                spinner.stop(true);
                if(await npmPkg.exists()) {
                    log.success("模板更新成功");
                }
            }
        }
    }

    async prepare(){
        // 0. 判断项目模板是否存在
        const template = await getProjectTemplate();
        if (!template || template.length === 0) {
            throw new Error('项目模板不存在');
        }
        this.template = template;
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
        function isValidName(name) {
            return /^[a-zA-Z]([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(name)
        }
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

        let isProjectNameValid = false;
        if (isValidName(this.projectName)) {
            isProjectNameValid = true;
            projectInfo.projectName = this.projectName;
        }

        log.verbose('初始化类型type: ',  type);
        this.template = this.template.filter(template => template.tag.includes(type))
        const title = type === TYPE_PROJECT ? '项目' : '组件';
        const projectPromt = [];
        const projectNamePrompt = {
            type: "input",
            name: "projectName",
            message: `请输入${title}名称`,
            default: "",
            validate: function(v){
                // 首字符必须是字母
                // 尾字符必须为字母和数字、不能为字符
                // 字符仅允许-_
                var done = this.async();
                setTimeout(function() {
                    if (!isValidName(v)) {
                        done(`请输入正确的${title}名称。`);
                        return;
                    }
                    done(null, true);
                }, 0);
            },
            filter: function(v){
                return v;
            }
        };
        if (!isProjectNameValid) {
            projectPromt.push(projectNamePrompt);
        }
        projectPromt.push({
            type: "input",
            name: "projectVersion",
            message: `请输入${title}版本号`,
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
        }, {
            type: 'list',
            name: 'projectTemplate',
            message: `清选择${title}模板`,
            choices: this.createProjectTemplateChoice()
        });
        
        if (type === TYPE_PROJECT) {
            // 4. 获取项目的基本信息
            const project = await inrequirer.prompt(projectPromt);
            projectInfo = {
                ...projectInfo,
                type,
                ...project
            };
        } else if(type === TYPE_COMPONENT) {
            const desciptionPromt = {
                type: "input",
                name: "componentDescription",
                message: "请输入组件描述信息",
                default: "",
                validate: function(v){
                    // 首字符必须是字母
                    // 尾字符必须为字母和数字、不能为字符
                    // 字符仅允许-_
                    var done = this.async();
                    setTimeout(function() {
                        if (!v) {
                            done('组件描述信息不能为空');
                            return;
                        }
                        done(null, true);
                    }, 0);
                }
            };
            projectPromt.push(desciptionPromt);
            const component = await inrequirer.prompt(projectPromt);

            projectInfo = {
                ...projectInfo,
                type,
                ...component
            };
        }
        if (projectInfo.projectName) {
            projectInfo.name = projectInfo.projectName;
            projectInfo.className = require('kebab-case')(projectInfo.projectName).replace(/^-/, "");
        }
        if (projectInfo.projectVersion) {
            projectInfo.version = projectInfo.projectVersion;
        }
        if (projectInfo.componentDescription) {
            projectInfo.description = projectInfo.componentDescription;
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

    createProjectTemplateChoice() {
        return this.template.map(item => ({
            name: item.name,
            value: item.npmName
        }));
    }
}


function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
