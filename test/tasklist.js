module.exports = {
    "options": {
        //blog7所在路径
        "localWorkPath" : "E://workspace/sina_blog/",
        //测试机
        "rs110" : {
            "host" : "10.210.227.110",
            "username" : "wangqiang1",
            "password" : "123456",
            "workPath" : "/data1/nginx/htdocs/online"
        },
        //打包服务器
        "rs133" : {
            "host" : "10.210.213.133",
            "username" : "wangqiang1",
            "password" : "123456"
        }
    },
    "task1": {
        "options": {
            "localWorkPath" : "E://workspace/",
        },
        "task": [
            {
                "command": "cd"
            },{
                "command": "pwd",
                "remote": "rs133"
            },{
                "command": function (prev){
                    console.info(prev);
                    console.info(this);
                    return "skip"
                }
            }
        ]    
    },
    "task2": {
        "options": {
        
        },
        "task": [
            {
                "command": "cd"
            },{
                "command": "pwd",
                "remote": "rs133",
                "after": function (data){
                    console.log(data);
                    console.log(this);
                    return {name:"wjw"};
                }
            },{
                "command": function (prev){
                    console.info(prev);
                    console.info(this);
                    return "exit"
                }
            },{
                "command": "ls -l",
                "remote": "rs133"
            }
        ]
    } 
};