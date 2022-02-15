const express = require('express');
const socketIO = require('socket.io');
const redis = require('redis');


//Connect Redis Service
const HEROKU_redisUrl = process.env.REDIS_URL || 'redis://:pe168732acf2704566ee0f0e6a186053dd012b4a2ae3ca475da0c1a93a7651cb9@ec2-54-170-246-70.eu-west-1.compute.amazonaws.com:32230'
const REDIS_PORT = 15027;
const REDIS_HOST = "redis-15027.c293.eu-central-1-1.ec2.cloud.redislabs.com"; // This is the IP address of your DigitalOcean droplet
const REDIS_USERNAME = "";
const REDIS_PASSWORD = "8H2SX6lx8Duc1Nbktgbe0AFsA1f6ozxm"; // This is the password we created above for our Redis database.
const REDIS_URL = `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;

const redisClient = redis.createClient({legacyMode: true, url: REDIS_URL});
(async () => {
    await redisClient.connect();
})();
redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ');
    console.log(err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

//const jsonCache = new JSONCache(redis)

//App Setup
var app = express();
const port = process.env.PORT || 5000;
var server = app.listen(port, function(){
    console.log(`listining request to port ${port}`);
});

const INDEX = '/index.html';

//Route Setup
app.get("/", (req, res) => {
    redisClient.set('checkUp', "online");
    res.sendFile(INDEX, { root: __dirname })
});

app.get("/drivers", (req, res) => {
    var allDrivers = [];
    redisClient.keys('*', function (err, keys) {
        if (err) return console.log(err);
        console.log(keys);
        //const resulto = await jsonCache.get(keys);
        //allDrivers.push(resulto);
        allDrivers.push(keys);
    });
    var jsonDrivers = JSON.stringify(allDrivers);
    console.log(allDrivers);
    res.send(jsonDrivers);
});



////Socket Setup
const io = socketIO(server, {
    maxHttpBufferSize: 100000000,
    connectTimeout: 5000,
    transports:['websocket','polling'],
    pingInterval: 25 * 1000,
    pingTimeout: 5000,
    allowEIO3: true,
    cors: {
        origin: "https://coolboda-ws.herokuapp.com:"+port,
        methods: ["GET", "POST"],
    }
});
io.on('connection', function(socket){
    console.log("Made socket connection");
    
    socket.on("RequestAccess", function (data) {
        console.log(data);
        redisClient.set(socket.id, "online");
        //jsonCache.set(socket.id, data);
        io.to(socket.id).emit("getID", socket.id);
    });

    socket.on("disconnect", () => {
        redisClient.del(socket.id);
        console.log("user disconnected");
    });
})

//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
setInterval(() => io.emit('isalive', '?'), 60000);