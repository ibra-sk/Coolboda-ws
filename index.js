const express = require('express');
const socket = require('socket.io');
const redis = require('redis');


//Connect Redis Service

const client = redis.createClient({url: process.env.REDIS_URL}); //On Heroku
//const redisClient = redis.createClient({url:'redis://:pe168732acf2704566ee0f0e6a186053dd012b4a2ae3ca475da0c1a93a7651cb9@ec2-54-170-246-70.eu-west-1.compute.amazonaws.com:32230'});
redisClient.connect();
redisClient.on('error', function (err) {
    try{
        console.log(typeof(err));
        console.log('Could not establish a connection with redis. ' + err);
    }catch  (error) {
        console.log(error);
    }
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});


//App Setup
var app = express();

const port = process.env.PORT || 5000;
var server = app.listen(port, function(){
    console.log(`listining request to port ${port}`);
});

//Route Setup
app.get("/drivers", (req, res) => {
    //res.status(200).text("list of driver");
    //res.send('hello world');
    
    redisClient.keys('*', function (err, keys) {
        if (err) return console.log(err);
        
        let allDrivers = [];
        for(var i = 0, len = keys.length; i < len; i++) {
            allDrivers.push(key[i]);
            res.send(allDrivers);
        }
    });   
});




function User(socketId, MID, myName, myStatus, myPhone) {
    this.id = socketId;
    this.mid = MID;
    this.status = myStatus;
    this.username = myName;
    this.phone = myPhone;
    
    this.getId = function () {
        return this.id;
    };
    this.getMID = function () {
        return this.mid;
    };
    this.getName = function () {
        return this.username;
    };
    this.getPhone = function () {
        return this.phone;
    };
    this.getStatus = function () {
        return this.status;
    };
    this.setStatus = function (newStatus) {
        this.status = newStatus;
    }
}

var userMap = new Map();


////Socket Setup
var io = socket(server, {
    cors: {
        origin: "https://coolboda-ws.herokuapp.com/",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: false
    },
    allowEIO3: true
});


io.on('connection', function(socket){
    console.log("Made socket connection");

    socket.on("new user", function (data) {
        socket.userId = data;
        //activeUsers.add(data);
        redisClient.set(socket.userId, "online");
        io.emit("new user", socket.userId);
    });

    socket.on("disconnect", () => {
        //activeUsers.delete(socket.userId);
        redisClient.del(socket.userId);
        io.emit("user disconnected", socket.userId);
    });
})