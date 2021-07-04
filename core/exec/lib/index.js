'use strict';
const path = require("path");
const Package = require("@mars-cli/package");
const log = require('@mars-cli/log');
const SETTINGS = {
    init: '@imooc-cli/init'
};

const CACHE_DIR = "dependencies";

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = '';
    let pkg;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    // 每一个命令对一个npm包
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

        if(await pkg.exists()){
            // 更新pkg
            await pkg.update();
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
        try {
            // 在当前子进程中调用
            require(rootFile).call(null, Array.from(arguments));
        } catch(err){
            log.error(err.message);
        }
    }

    // 1. targetPath -> modulePath
    // 2. modulePath -> Package(npm模块) 创新成一个通用的package
    // 3. Package.getRootFile(获取入口文件)
    // 4. Package.update / Package.install

    // 封装 -> 复用
}

module.exports = exec;
