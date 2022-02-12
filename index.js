const express = require('express');
const socketIO = require('socket.io');
const redis = require('redis');


//Connect Redis Service
const redisUrl = process.env.REDIS_URL || 'redis://:pe168732acf2704566ee0f0e6a186053dd012b4a2ae3ca475da0c1a93a7651cb9@ec2-54-170-246-70.eu-west-1.compute.amazonaws.com:32230'
const redisClient = redis.createClient({url: redisUrl}); //On Heroku
//redisClient.connect();
redisClient.on('error', function (err) {
    try{
        console.log(err);
        console.log('Could not establish a connection with redis. ');
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
app.get("/", (req, res) => {
    res.send('hello world');
});

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




////Socket Setup
const io = socketIO(server);
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);