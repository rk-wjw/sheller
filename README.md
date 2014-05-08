# sheller
[![Build Status](https://travis-ci.org/RK-WJW/grunt-shelltask.svg)](https://travis-ci.org/RK-WJW/grunt-shelltask)
[![依赖模块状态](https://david-dm.org/RK-WJW/grunt-shelltask.png)](http://david-dm.org/RK-WJW/grunt-shelltask)
[![浏览数](https://sourcegraph.com/api/repos/github.com/RK-WJW/grunt-shelltask/counters/views.png?no-count)](https://sourcegraph.com/github.com/RK-WJW/grunt-shelltask)


sheller一个用于执行本地和远程服务器命令的nodejs模块。可执行本地命令，可连接远程服务器执行远程机的命令，也可以
通过配置顺序执行一系列的命令（本地和远程），像一个shell脚本一样，但这里只需要命令一条条配置出来就行，而且可以依赖前面执行的命令结果，帮你完成一系列任务的自动化处理。   

>grunt插件 [grunt-shelltask](https://github.com/RK-WJW/grunt-shelltask)

---

### 下载安装
```bash
npm install sheller
```