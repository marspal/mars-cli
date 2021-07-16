const request = require("@mars-cli/request");

async function getProjectTemplate() {
    return request({
        url: '/project/template'
    });
}

module.exports = getProjectTemplate;