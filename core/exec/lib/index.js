'use strict';
const path = require("path");
const Package = require("@mars-cli/package");
const log = require('@mars-cli/log');
const SETTINGS = {
    init: '@imooc-cli/init'
};
const {exec: spwan} = require('@mars-cli/utils');

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
            // require(rootFile).call(null, Array.from(arguments));
            // 在Node子进程中调用
            // 1. cp.fork 2. cp.swan
            const args = Array.from(arguments);
            const cmd = args[args.length - 1];
            const o = Object.create(null);
            Object.keys(cmd).forEach(key => {
                if(cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent'){
                    o[key] = cmd[key];
                }
            });
            args[args.length - 1] = o;
            const code = `require('${rootFile}').call(null, ${JSON.stringify(args)});`;
            // windows cp.spawn('cmd', ['/c', 'node', '-e', code],)
            const child = spwan('node', ['-e', code], {
                cwd: process.cwd(),
                stdio: 'inherit'
            });
            child.on('error', (e) => {
                log.error(e.message);
                process.exit(1); 
            });
            child.on('exit', (e) => {
                log.verbose('命令执行成功:' + e);
                process.exit(e);
            })
            // child.stdout.on('data', function(thunk){
            //     console.log(thunk.toString());
            // });
            // child.stderr.on('data', function(thunk){
            //     console.log(thunk.toString());
            // });
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
