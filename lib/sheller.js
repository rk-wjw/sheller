/**
 * @description 执行本地或远程命令
 * @author RK
 */
var ssh = require('./base/ssh.js');
var _ = require('./base/lodash.js');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var Path = require('path');

function Sheller(config, logger){
    this.logger = logger||console;
    this._exec = exec;
    this.tasks = {};//当前已定义的任务池
    this.options = {};//定义的任务全局参数
    this._sshPool = {};//建立的ssh连接
    config ? this.loadTasks(config) : '';
} 

Sheller.prototype = {
    constructor : Sheller,
    //执行本地命令
    execLocal: function (command, cwd, callback){
        var self = this, logger = this.logger;
        var options = {
            encoding: "utf8"
        };
        if (typeof cwd === 'function') {
            callback = cwd;
        } else {
            options.cwd = cwd;
        }
        callback = callback || _.noop;
        var child = self._exec(command, options);
        var result = {
                data: '',
                error: ''
            };
        var _callback = function (err, data){
            _callback = _.noop;
            callback(err, data);
        };
        child.stdout.on('data', function (data) {
            result.data += data;
            logger.info((data + '').trim());
        });

        child.stderr.on('data', function (data) {
            result.error += data;
            logger.info((data + '').trim());
        });

        child.on('close', function (code) {
            _callback(result.error, result.data);
        });
        child.on('error', function (err) {
            logger.info(err);
            _callback(err, result);
        });
    },
    //获得一个远程连接，用于执行远程命令
    getssh: function (name, cfg){
        var result = this._sshPool[name] || new ssh(cfg);
        if(result){
            this._sshPool[name] = result;
            return result;
        }
        return null;
    },
    //加载任务配置
    loadTasks: function (config, flag){
        var confJson = {}, self = this;
        if(flag) self.clear();
        if(typeof config === 'string'){
            var configPath = Path.resolve(config);
            if(fs.existsSync(configPath)){
                delete require.cache[require.resolve(configPath)];
                confJson = require(configPath);
            }
        }else if(typeof config === "object"){
            confJson = config;
        }
        self.options = _.merge(self.options, confJson.options);
        for(var k in confJson){
            if(k !== "options" && confJson[k].task){
                self.tasks[k] = confJson[k];
            }
        }
    },
    //从加载任务中的按顺序执行指定的任务
    execTask: function (arr, opts, callback){
        var self = this; logger = this.logger;
        var tasks = arr || [];
        callback = callback || _.noop;
        if(typeof opts === 'function'){
            callback = opts;
            opts = {};
        }
        
        if(tasks.length > 0){
            async.mapSeries(tasks, function (k, cb){
                var item = self.tasks[k];
                logger.info("***exec task: " + k + "***");
                if(item){
                    var options = _.merge(self.options, item.options||{});
                    var task = item.task;
                    self.execSingleTask({
                        "options": options,
                        "task": task
                    },cb);
                }else{
                    logger.error("task `" + k + "` not found!");
                }
            }, callback);        
        }
    },
    /**
    *@执行单个任务
    *@param cfg: {
        options:{
            //任务中需要的一些参数
        },
        task: [
            {
                id: 可选，命令唯一标示
                command: 需要执行的命令
                remote: 可选，指定远程执行的服务器
                after: function(result){
                    //可选 对命令返回的结果进行处理加工
                    return result;
                }
            }
        ]
    }
    *@return callback(err, data) data为一个数组，依次存放每个任务命令的结果
    */
    execSingleTask: function (cfg, cb){
        var self = this, logger = this.logger;
        var task = cfg.task;
        var options = cfg.options;
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
            "logger": logger,
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
                    }else{
                        if(typeof after === 'function'){
                            ret = after.apply(obj, [data]);
                        }
                        item.ret = ret;
                        obj.prev = item;
                        callback(null, ret);
                    }
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
                var sshConn = self.getssh(remote, remoteObj);
                workPath = remoteObj.workPath;
                if (sshConn) {
                    workPath ? command = "cd " + workPath + "; " + command : '';
                    sshConn.exec(command, _cb);
                } else {
                    _cb("ssh object error~!");
                }
            } else {
                logger.info("LOCAL: " + command);
                self.execLocal(command, workPath, _cb);
            }
        }, cb);
    },
    clear: function (){
        this.tasks = {};
        this.options = {};
    }
}

module.exports = new Sheller();
