#!/usr/bin/env node

const {program} = require("commander");
const pkg = require("../package.json");

// program
//     .version(pkg.version)
//     .option("-d, --debug", "output extra debugging")
//     .option("-s --small", "small pizza size")
//     .option("-p|--pizza-type <type>", 'flavour of pizza');

// program.parse(process.argv);

program
  .version(pkg.version)
  .option('-d, --debug', 'output extra debugging')
  .option('-s, --small', 'small pizza size')
  .option('-p, --pizza-type <type>', 'flavour of pizza')
  .option('-c|cheese <type>', 'add the specified type of cheese', 'blue')
  .option('--no-sauce', 'Remove sause')
  .option('--foo', '测试', 'false')
  .option('-b --bar [value]', '函数测试')
program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {
      console.log('clone command called')
  });

program
  .command('start <service>', 'start named service')
  .command('stop [service]', 'stop named service, or all if no name supplied')

program
    .arguments('<username> [password]')
    .description('test command', {
        username: 'user to login',
        password: 'password for user, is required'
    })
    .action((username, password) => {
        console.log('username:', username);
        console.log('environment', password || 'no password given');
    });

program
  .command('install [name]', 'install one or more packages')
  .command('search [query]', 'search with optional query')
  .command('update', 'update installed packages', { executableFile: 'myUpdateSubCommand' })
  .command('list', 'list packages installed', { isDefault: true });

program.parse(process.argv);
const options = program.opts();

if(options.debug) console.log(options);
// program.args
console.log(options);

