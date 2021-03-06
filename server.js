var nconf = require('nconf');
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
var util = require('util');

nconf.argv();
nconf.file('config.js');
nconf.defaults({
  "host": "127.0.0.1",
  "port": "8000", 
  "redis-host": "127.0.0.1",
  "redis-port": "6379",
});

var client = redis.createClient(nconf.get("redis-port"), nconf.get("redis-host"));
var app = express();

app.use(bodyParser.text());

client.on("error", function(error) {
  console.log("Error " + error);
});

app.post('/:queue', function (req, res) {
  client.rpush(req.params.queue, req.body);
  res.status(200).end();
});

app.on('close', function() {
  client.quit();
});

app.listen(nconf.get("port"), nconf.get("host"));
console.log(util.format("Listening on %s:%s. Forwarding to %s:%s.", nconf.get("host"), nconf.get("port"), nconf.get("redis-host"), nconf.get("redis-port")));
