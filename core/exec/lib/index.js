'use strict';

const Package = require("@mars-cli/package");
const log = require('@mars-cli/log');
const SETTINGS = {
    init: '@mars-cli/init'
};

function exec() {
    const targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = "latest";
    console.log(cmdObj.name());

    const pkg = new Package({
        targetPath,
        packageName,
        packageVersion
    });

    console.log(pkg);

    // 1. targetPath -> modulePath
    // 2. modulePath -> Package(npm模块) 创新成一个通用的package
    // 3. Package.getRootFile(获取入口文件)
    // 4. Package.update / Package.install

    // 封装 -> 复用
}

module.exports = exec;
