var sheller = require('../lib/sheller.js');
var assert = require('assert');

describe("sheller", function (){
    describe("#execLocal", function (){
        it("command `echo test` should return test", function (done){
            sheller.execLocal("echo test", function (err, data){
                assert.ok(err);
                assert.equal(data, "test");
                done();
            });
        });
    });
    
    
});