var events = require('events')
  , util = require('util')
  , inject = require('reconnect-core')
  , ws = require('ws');

var reconnect = inject(function(host,options) {
  var c = new ws(host,options);
  c.on('open',c.emit.bind(c,'connect'));
  c.end = c.close;
  return c;
});

module.exports = wsr;
function wsr(host,options){
  var self = this;

  // Instance of transport
  this._conn = null;

  // buffer data sent when offline.
  this._buffer = [];

  this._reconnector = reconnect()
  .on('connect',self._startConnection.bind(this))
  .on('disconnect',self._stopConnection.bind(this))
  .connect(host,options);

  events.EventEmitter(this);
}

util.inherits(wsr,events.EventEmitter);

wsr.prototype.send = function(data) {
  if(this._conn)
    this._sendToTransport(data);
  else
    this._buffer.push(data);
};

wsr.prototype.close = function() {
  this._reconnector.reconnect = false;
  this._reconnector.disconnect();
};

wsr.prototype._sendToTransport = function(data) {
  this._conn.send(data,function(err){
    if(err)
      console.error('websocket:',err);
  });
};

wsr.prototype._stopConnection = function() {
  this._conn = null;
  this.emit('disconnect');
};

wsr.prototype._startConnection = function(conn) {
  this._conn = conn;
  this._conn.on('message', this.emit.bind(this,'message'));
  this._clearBuffer();
  var args = ['connect'].concat(arguments);
  this.emit('connect',conn);
};

wsr.prototype._clearBuffer = function() {
  while(this._buffer.length > 0 && this._conn)
    this._sendToTransport(this._buffer.shift());
};
