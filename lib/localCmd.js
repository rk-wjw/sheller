/**
 *@description 执行本地命令
 *@author RK
 *注意：win下需要修改cmd编码和字体，设置方法：
在命令行：chcp 65001
然后设置字体为：Lucida Console
 */
var exec = require('child_process').exec;

function cmd() {
    this._exec = exec;
    this.logger = console;
}

cmd.prototype = {
    constructor : cmd,
    exec : function (command, cwd, cb) {
        var self = this, logger = this.logger;
        var options = {
            encoding : 'utf8'
        };
        if (typeof cwd === 'function') {
            cb = cwd;
        } else {
            options.cwd = cwd;
        }
        self._exec(command, options, function (error, stdout, stderr) {
            if (error || stderr) {
                cb(error || stderr);
            } else {
                var result = stdout;
                logger.info(result);
                cb(null, result);
            }
        });
    }
};

module.exports = new cmd();
