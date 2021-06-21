'use strict';
const path = require('path');
const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');
const {isObject} = require("@mars-cli/utils");
const formatPath = require("@mars-cli/format-path");
const {getDefaultRegistry} = require("@nars-cli/get-npm-info");

class Package {
    constructor(options){
        if (!options) {
            throw new Error('Package类的options参数不能为空');
        }
        if (!isObject(options)) {
            throw new Error('Package类的options必须为Object对象');
        }
        // 初始化参数
        // package的路径
        this.targetPath = options.targetPath;
        // 缓存package的存储路径
        // this.storePath = options.storePath;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
    }
    
    // package是否存在 
    exists(){

    }

    // 安装package
    install(){
        return npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName,
                version: this.packageVersion
            }]
        });
    }

    // 更新package
    update(){

    }

    // 获取入口文件路径
    getRootFilePath(){
        // 1. 获取package.json 所在目录 - pkg-dir
        const dir = pkgDir(this.targetPath);
        if (dir) {
            // 2. 读取package.json - require() js/json/node
            const pkgFile = require(path.join(dir, 'package.json'));
            // 3. main/lib - path
            if (pkgFile && pkgFile.main) {
                // 4. 路径兼容(macOs/windows)
                return formatPath(path.resolve(dir, pkgFile.main));
            }
        }
        return null;   
    }

}

module.exports = Package ;
