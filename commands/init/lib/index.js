'use strict';

const Command = require("@mars-cli/command");

class InitCommand extends Command {

}


function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
