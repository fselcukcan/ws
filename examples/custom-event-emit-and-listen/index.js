'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');

const { WebSocketServer } = require('../..');

const app = express();
app.use(express.static(path.join(__dirname, '/public')));

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', function (ws) {
  // make a dispatcher for message event which is the entry point of all events emitted from the client then register your event handlers
  ws.on("message", function (data) {
    const parsed = JSON.parse(data);
    const { eventName, payload } = parsed;
    ws.emit(eventName, payload);
  });
  
  // register your event handlers
  ws.on("someEventName", function (data) {
    console.log("someEventName event happened. data: ", data);
    ws.send(JSON.stringify({eventName: 'someEvent', payload: data}));
  });
  
  const id = setInterval(function () {
    ws.send(JSON.stringify({eventName: 'memoryUsage', payload: process.memoryUsage()}), function () {
      //
      // Ignore errors.
      //
    });
  }, 100);
  console.log('started client interval');

  ws.on('close', function () {
    console.log('stopping client interval');
    clearInterval(id);
  });
});

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});
