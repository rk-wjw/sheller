/**
 * @description 执行本地或远程命令
 * @author RK
 */
var lcmd = require('./localCmd.js');
var ssh = require('./ssh.js');
var async = require('async');
var _ = require('./lodash.js');

function sheller(){
    this.logger = console;
} 

sheller.prototype = {
    constructor : sheller,
    //执行本地命令
    execLocalCmd: function (){
        lcmd.exec.apply(lcmd, arguments);
    },
    //获得一个远程连接，用于执行远程命令
    getssh: function (host, port, username, password){
        return new ssh(host, port, username, password);
    },
    //执行一系列任务
    execTask: function (cfg, cb){
        var self = this, logger = this.logger;
        var task = cfg.task;
        var options = cfg.options;
        var sshArray = {};
        //用于外部使用提供的对象
        var obj = {
            "options" : options,
            "task" : task,
            "getResult": function (id){
                id = id || 0;
                if(typeof id === 'number'){
                    return task[id].ret;
                }
                for(var i = 0; i < task.length; i++){
                    var item = task[i];
                    if(id == item.id){
                        return item.ret;
                    }
                }
            },
            "prev": null
        };
        //按顺序执行
        async.mapSeries(task, function (item, callback) {
            var remote = item.remote;
            var workPath = options.localWorkPath;
            var command = item.command;
            var after = item.after;
            
            var _cb = (function (item) {
                return function (err, data) {
                    var ret = data;
                    if(err){
                        item.error = err;
                        callback(err, data);
                    }
                    if(typeof after === 'function'){
                        ret = after.apply(obj, [data]);
                    }
                    item.ret = ret;
                    obj.prev = item;
                    callback(null, ret);
                };
            })(item);

            if (typeof command === 'function') {
                command = command.apply(obj, [obj.prev]);
            }
            command = command.replace(/\[(%=\s?[^%]*\s?%)\]/g, "<$1>");
            command = _.template(command, options);
            //命令为exit时终止任务
            if(command === "exit"){
                _cb("exit");
                return;
            }
            //命令为skip时跳过任务
            if(command === "skip"){
                _cb(null, "skip");
                return;
            }
            
            if (remote && options[remote]) {
                logger.info("REMOTE " + remote + ": " + command);
                var remoteObj = options[remote];
                var sshConn = sshArray[remote] || new ssh(remoteObj);
                workPath = remoteObj.workPath;
                if (sshConn) {
                    sshArray[remote] = sshConn;
                    if (workPath) {
                        command = "cd " + workPath + "; " + command;
                    }
                    sshConn.exec(command, _cb);
                } else {
                    _cb("ssh object error~!");
                }
            } else {
                logger.info("LOCAL: " + command);
                lcmd.exec(command, workPath, _cb);
            }
        }, cb);
    },
}

module.exports = new sheller();
