'use strict';
const {isObject} = require("@mars-cli/utils");
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
        // package的存储路径
        this.storePath = options.storePath;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
        console.log('Package constructor');
    }
    
    // package是否存在 
    exists(){

    }

    // 安装package
    install(){

    }

    // 更新package
    update(){

    }

    // 获取入口文件路径
    getRootFilePath(){

    }


}

module.exports = Package ;
