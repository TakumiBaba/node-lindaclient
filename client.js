// Generated by CoffeeScript 1.6.3
(function() {
  var EventEmitter, Linda, TupleSpace, WebSocket, moment,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  WebSocket = require("ws");

  EventEmitter = require("events").EventEmitter;

  moment = require("moment");

  Linda = (function(_super) {
    __extends(Linda, _super);

    Linda.prototype.session = "";

    Linda.prototype.connecting = false;

    function Linda(url, name) {
      this.message = __bind(this.message, this);
      this.io = new WebSocket("ws://" + url);
      this.io.on("open", this.open);
      this.io.on("message", this.message);
      this.io.on("close", this.close);
      this.ts = new TupleSpace(name, this);
    }

    Linda.prototype.open = function() {
      return this.connecting = true;
    };

    Linda.prototype.message = function(message, flags) {
      var json;
      json = JSON.parse(message);
      if (json.type === "__session_id") {
        this.session = json.data;
        return this.emit("connect");
      } else if (json.type.match(/^__linda/)) {
        return this.emit(json.type, json.data);
      }
    };

    Linda.prototype.close = function() {
      return this.connecting = false;
    };

    Linda.prototype.push = function(type, data) {
      return this.io.send(JSON.stringify({
        "type": type,
        "data": data,
        "session": this.session
      }));
    };

    return Linda;

  })(EventEmitter);

  TupleSpace = (function() {
    function TupleSpace(name, linda) {
      this.name = name;
      this.linda = linda;
      this.time = moment().format();
    }

    TupleSpace.prototype.write = function(tuple, opts) {
      if (typeof tuple !== 'object') {
        throw new Error("TupleSpace.write's Arguments[0] should be object");
      }
      opts = opts || {};
      return this.linda.push("__linda_write", [this.name, tuple, opts]);
    };

    TupleSpace.prototype.read = function(tuple, callback) {
      var cid,
        _this = this;
      if (typeof tuple !== 'object') {
        throw new Error("TupleSpace.read's Arguments[0] should be object");
      }
      if (typeof callback !== 'function') {
        throw new Error("TupleSpace.read's Arguments[1] should be callback function");
      }
      cid = this.callbackId();
      this.linda.once("__linda_read_callback_" + cid, function(data) {
        return callback(data.tuple, data.info);
      });
      return this.linda.push("__linda_read", [this.name, tuple, cid]);
    };

    TupleSpace.prototype.watch = function(tuple, callback) {
      var cid;
      if (typeof tuple !== 'object') {
        throw new Error("TupleSpace.watch's Arguments[0] should be object");
      }
      if (typeof callback !== 'function') {
        throw new Error("TupleSpace.watch's Arguments[1] should be callback function");
      }
      cid = this.callbackId();
      this.linda.once("__linda_watch_callback_" + cid, function(data) {
        return callback(data.tuple, data.info);
      });
      return this.linda.push("__linda_watch", [this.name, tuple, cid]);
    };

    TupleSpace.prototype.take = function(tuple, callback) {
      var cid;
      if (typeof tuple !== 'object') {
        throw new Error("TupleSpace.take's Arguments[0] should be object");
      }
      if (typeof callback !== 'function') {
        throw new Error("TupleSpace.take's Arguments[1] should be callback function");
      }
      cid = this.callbackId();
      this.linda.once("__linda_take_callback_" + cid, function(data) {
        return callback(data.tuple, data.info);
      });
      return this.linda.push("__linda_take", [this.name, tuple, cid]);
    };

    TupleSpace.prototype.callbackId = function() {
      return "" + (moment().diff(this.time)) + (moment().unix()) + "_" + (Math.random(1000000));
    };

    return TupleSpace;

  })();

  module.exports = Linda;

}).call(this);
