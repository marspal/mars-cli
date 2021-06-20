'use strict';
const urlJoin = require("url-join");
const axios = require("axios");
const semver = require('semver');

async function getNpmInfo(npmName, registry) {
    // url-join
    // semver
    // axios
    if(!npmName){
        return null;
    }
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName);
    return axios.get(npmInfoUrl).then(response => {
        if(response.status === 200){
            return response.data;
        }
        return null;
    }).catch(err => {
        return Promise.reject(err);
    });
}

function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

async function getNpmVersions(npmName, registry){
    const data = await getNpmInfo(npmName, registry);
    if(data){
        return Object.keys(data.versions);
    } 
    return [];
}

// 获取满足条件的versions
function getNpmSemverVersions(baseVesion, versions) {
    return versions
        .filter(version => semver.satisfies(version, `^${baseVesion}`))
        .sort((a,b) => semver.gt(b, a) ? 1 : -1);
}

// 获取满足的条件的version
async function getNpmSemverVersion(baseVesion, npmName, registry){
    const versions = await getNpmVersions(npmName, registry);
    const newVersions = getNpmSemverVersions(baseVesion, versions);
    if(newVersions && newVersions.length){
        return newVersions[0]
    }
    return null;
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion
};
