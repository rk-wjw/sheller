# sheller
[![Build Status](https://travis-ci.org/RK-WJW/sheller.svg?branch=master)](https://travis-ci.org/RK-WJW/sheller)
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

---

### 文档
1.  `sheller.execLocal` 执行本地命令的方法    
    -   参数：
        -   command [String] 命令字符串    
        -   cwd [String] 可选，当前路径    
        -   callback [Function] 可选，回调函数，第一个参数为错误信息，第二个参数为命令结果    
2.  `sheller.execSingleTask` 执行单个命令任务    
    -   参数：
        -   cfg [Object] 任务配置对象
        -   callback [Function] 回调函数，第一个参数为错误信息，第二个参数为命令任务结果数组    
    -   cfg格式：
    ```javascript
    {
        options:{},//参数配置，可选
        task:[] //命令配置，具体参考下方例子
    }
    ```
3.  `sheller.loadTasks` 加载任务配置
    -   参数：config [Object/String] json对象或配置文件路径字符串
              flag [Boolean] true/false 默认false merge/cover
    -   配置文件格式：
    ```javascript
    module.exports = {
        "options": {
            //......
        },
        "task1": {
            "options": {
                //......
            },
            "task": [
                //......
            ]    
        },
        "task2": {
            //......
        } 
    };
    ```
4.  `sheller.execTask` 执行已加载的任务
    -   参数：
        -   arr [Array] 需要执行的任务名数组，按指定数组顺序执行
        -   callback [Function] 回调函数，第一个参数为错误信息，第二个参数为命令任务结果数组
5.  `sheller.getssh` 获得一个ssh远程的连接对象
    -   参数：
        -   name [String] 远程连接的名称（自定义），可为空
        -   cfg [Object] 远程机信息，包含地址、用户名及密码
    -   cfg格式：
    ```javascript    
    {
        "host" : "",//ip地址
        "username" : "",//用户名
        "password" : "",//密码
        "workPath" : ""//执行路径，可选
    }
    ```
    -   连接对象有两个方法：
        -   exec： 执行命令，参数command、callback
        -   close: 关闭连接
6. `sheller.clear` 清除当前已加载的任务和配置。

---

### Usage Examples
```javascript
var sheller = require('sheller');
//执行本地命令
sheller.execLocal("echo test", function (err, data){
        if(err){
            console.log(err);
        }else{
            console.log(data);//test
        }
    });
//执行单个命令任务
sheller.execSingleTask({
        options: {
            "testParam": "test"
        },
        task: [
            {
                command: "echo [%= testParam %]",
                after: function (data){
                    return data.replace(/(^\s+)|(\s+$)/, '');
                }
            }
        ]
    }, function (err, data){
        if(err){
            console.log(err);
        }else{
            console.log(data);//["test"]
        }
    });
//加载配置文件
sheller.loadTasks("./tasklist.js");
//执行任务
sheller.execTask(["task1"], function (err, data){
        if(err){
            console.log(err);
        }else{
            console.log(data);//result array
        }
    });
```
配置文件tasklist.js
```javascript
module.exports = {
    "options": {
        //本地命令执行路径
        // "localWorkPath" : "E://workspace/",
        //远程机
        "rs110" : {
            "host" : "100.100.100.110",
            "username" : "test110",
            "password" : "123456",
            "workPath" : "/data1/nginx/htdocs/online"
        },
        "rs112" : {
            "host" : "100.100.100.112",
            "username" : "test112",
            "password" : "123456"
        },
        "testParam": "test sheller"
    },
    "task1": {
        "options": {
            // "localWorkPath" : "E://workspace/",
            name: "test options"
        },
        "task": [
            {
                "command": "echo test"
            },{
                "id": "test1",
                "command": "echo test1"
            },{
                "command": "echo test2",
                "after": function (data){
                    return {
                        data: data.replace(/(^\s+)|(\s+$)/, ''),
                        status: 1
                    };
                }
            },{
                "command": function (prev){
                    console.log(prev.ret.status == 1);//true
                    console.log(this.getResult("test1"));//test1
                    console.log(this.getResult());//test
                    console.log(this.getResult(2));//test2
                    console.log(this.options.name);//test options
                    console.log(this.task[0].command);//echo test                    
                    console.log(this.task[0].ret);//test
                    return "exit";
                }
            },{
                command: "echo test end",//不会执行，因为上个命令exit退出了
                remote: "rs110"
            }
        ]    
    },
    "task2": {
        "options": {
        
        },
        "task": [
            {
                "command": "cd"
            }
        ]
    } 
};
```
---

### License

MIT license
