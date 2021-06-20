'use strict';

module.exports = init;

function init(projectName, options, command) {
    console.log('init', projectName, options, process.env.CLI_TARGET_PATH);
}
