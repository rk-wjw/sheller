/**
 * @description 远程连接服务并执行命令
 * @author RK
 */

var Connection = require('ssh2');

function ssh(host, port, username, password) {
    if (typeof host === "object") {
        var options = host;
        host = options.host;
        port = options.port;
        username = options.username;
        password = options.password;
    }
    this.host = host;
    this.port = port || 22;
    this.username = username;
    this.password = password;
    this.connection = null;
    this.status = 0;
    this.logger = console;
    this.STATUS_MESSAGE = {
        "S0" : {
            message : "连接尚未初始化完成"
        },
        "S1" : {
            message : "连接初始化完成"
        },
        "S-2" : {
            message : "连接错误"
        },
        "S-1" : {
            message : "参数错误或缺失"
        },
    };
    this.init();
}

ssh.prototype = {
    constructor : ssh,
    //初始化，建立连接
    init : function () {
        var self = this;
        if (self.host && self.username) {
            var c = self.connection = new Connection();
            c.on("ready", function () {
                self.status = 1;
            });
            c.on('error', function (err) {
                self.status = -2;
                self.STATUS_MESSAGE["S-2"].error = err;
            });
            c.on('end', function () {
                self.status = 2;
            });
            c.on('close', function (had_error) {
                self.status = 2;
            });
            c.connect({
                host : self.host,
                port : self.port,
                username : self.username,
                password : self.password
            });
        } else {
            self.status = -1;
        }
    },
    //执行远程命令
    exec : function (command, cb) {
        var self = this, logger = this.logger;
        var args = Array.prototype.slice.call(arguments, 0);
        switch (self.status) {
        case 0:
            setTimeout(function () {
                self.exec.apply(self, args);
            }, 1000);
            break;
        case 1:
            _exec();
            break;
        default:
            cb(self.STATUS_MESSAGE["S" + self.status] || "未知错误");
        }

        function _exec() {
            var result = '';
            self.connection.exec(command, function (err, stream) {
                if (err) {
                    cb(err);
                } else {
                    stream.on('data', function (data, extended) {
                        result += data;
                        logger.info(data + '');
                    });
                    stream.on('end', function () {
                        cb(null, result);
                    });
                    /*
                    stream.on('exit', function(code, signal) {
                    // logger.info('Stream: exit, code: ' + code + ', signal: ' + signal);
                    });
                    stream.on('close', function() {
                    // logger.info('Stream: close~!');
                    });
                     */
                }
            });
        }
    },
    //关闭远程连接
    close : function () {
        this.connection.end();
    }
};

module.exports = ssh;
