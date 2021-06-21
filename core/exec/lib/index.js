'use strict';
const path = require("path");
const Package = require("@mars-cli/package");
const log = require('@mars-cli/log');
const SETTINGS = {
    init: '@mars-cli/init'
};

const CACHE_DIR = "dependencies";

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    let storeDir = '';
    let pkg;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = "latest";

    if (!targetPath) {
        // 生成缓存路径
        targetPath = path.resolve(homePath, CACHE_DIR);
        storeDir = path.resolve(targetPath, "node_modules");
        log.verbose("targetPath", targetPath);
        log.verbose("storeDir", storeDir);
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        });

        if(pkg.exists()){
            // 更新pkg
        } else {
            // 安装pkg
           await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        });
    }
    const rootFile = pkg.getRootFilePath();
    if (rootFile) {
        require(rootFile).apply(null, arguments);
    }

    // 1. targetPath -> modulePath
    // 2. modulePath -> Package(npm模块) 创新成一个通用的package
    // 3. Package.getRootFile(获取入口文件)
    // 4. Package.update / Package.install

    // 封装 -> 复用
}

module.exports = exec;
