# mars-cli
FE-架构师

### 第一部分 工程化开发

> 脚手架用到pkg
- semver
- npmlog
- import-local
- colors
- pkg-dir
- npminstall: 安装模块
- path-exists
- fs-extra
- dotenv
- command
- inquirer
- readline
- events
- mute-stream
- rxjs
- ansi-escapes
- egg.js
- @pick/cli-log
- vue-element-admin
- vue-cli
- user-home
- cli-spanner
- readline
- ejs
- glob
- kebab-case

### 使用方法
使用: mars-cli init --debug --targetPath /Users/andyxu/webspace/mars-cli/commands/init project-Name --force
--targetPath /Users/andyxu/webspace/mars-cli/commands/init

### 发布

lerna version 当前版本号
lerna changed 自上一次版本号后 哪些版本进行了变更
lerna diff commit之间的diff

git remote add origin url
git remote -v

默认情况: 需要指定远程origin master
git push origin master --set-upstream