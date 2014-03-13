# Elroy Websocket Reconnect

`npm install elroy-ws-reconnect`

```js
var wsr = require('elroy-ws-reconnect');

var client = new wsr('ws://localhost:3000/events');

// send data over connection if connected, if not is buffered until
// the connection is made.
client.send(JSON.stringify({cmd : 'subscribe',name : '_logs'}));

client.on('connect',function(socket){
  // called every time the connection is made
  console.log('connected...');
});

client.on('message',function(data){
  // on every message received
  console.log(data);
});

// close the client when done
//client.close();

```
