module.exports = {
    "options": {
        //本地命令执行路径
        // "localWorkPath" : "E://workspace/sina_blog/",
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