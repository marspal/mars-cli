'use strict';
const path = require('path');
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists').sync;
const fse = require('fs-extra')
const npminstall = require('npminstall');
const {isObject} = require("@mars-cli/utils");
const formatPath = require("@mars-cli/format-path");
const {getDefaultRegistry, getNpmLatestVersion} = require("@nars-cli/get-npm-info");

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
        this.storeDir = options.storeDir;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
        // package的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_');
    }

    async prepare(){
        // 创建目录
        if(this.storeDir && !pathExists(this.storeDir)){
            fse.mkdirpSync(this.storeDir);
        }
        if(this.packageVersion === 'latest'){
            this.packageVersion = await getNpmLatestVersion(this.packageName);
        }

        // _@imooc-cli_init@1.1.2@@imooc-cli
        // @imooc-cli/init 1.1.2
        // _@imooc-cli_init@1.1.2@@imooc-cli
    }

    get cacheFilePath(){
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
    }

    getLatestCacheFilePath(currentVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${currentVersion}@${this.packageName}`);
    }
    
    // 判断package是否存在 
    async exists () {
        if (this.storeDir) {
           await this.prepare(this.cacheFilePath);
           return pathExists(this.cacheFilePath);
        } else {
            return pathExists(this.targetPath);
        }
    }

    // 安装package
    async install(){
        await this.prepare();
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
    async update(){
        await this.prepare();
        // 判断最新版本是否已经存在
        // 1.获取最新的版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName);
        // 2.查询最新版本号对应的路径
        const latestFilePath = this.getLatestCacheFilePath(latestPackageVersion);
        // 3.如果不存在，则直接安装最新版本
        if(!pathExists(latestFilePath)){
            npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [{
                    name: this.packageName,
                    version: latestPackageVersion
                }]
            });
            this.packageVersion = latestPackageVersion;
        }
        return latestFilePath;
    }

    // 获取入口文件路径
    getRootFilePath(){
        function _getRootFile(targetPath){
            // 1. 获取package.json 所在目录 - pkg-dir
            const dir = pkgDir(targetPath);
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
        if(this.storeDir){
            return _getRootFile(this.cacheFilePath);
        } else {
            return _getRootFile(this.targetPath);
        }   
    }

}

module.exports = Package ;
