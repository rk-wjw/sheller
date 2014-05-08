var sheller = require('../lib/sheller.js');
var assert = require('assert');
var path = require('path');

describe("sheller", function (){
    describe("#execLocal", function (){
        it("command `echo test` should return test", function (done){
            sheller.execLocal("echo test", function (err, data){
                assert.ok(!err);
                assert.equal(data.replace(/(^\s+)|(\s+$)/,''), "test");
                done();
            });
        });
    });
    
    describe("#execSingleTask", function (){
        it("should be completed successfully", function (done){
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
                assert.ok(!err);
                assert.equal(data[0], "test");
                done();
            });
        });
    });
    
    describe("#getssh", function (){
        it.skip("getssh skip test", function (){
            //
        });
    });
    
    describe("#loadTasks", function (){
        it("Should be successfully loaded config file", function (){
            sheller.loadTasks(path.join(__dirname,"./tasklist.js"));
            assert.equal(sheller.options.testParam, "test sheller");
        });
    });
    
    
    describe("#execTask", function (){
        it("should be completed successfully", function (done){
            sheller.execTask(["task1"], function (err, data){
                assert.equal(err, "exit");
                done();
            });
        });
    });
});