(function() {
  var EventEmitter, Linda, RocketIO, TupleSpace, moment,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require("events").EventEmitter;

  moment = require("moment");

  RocketIO = require("rocketio-client");

  Linda = (function(_super) {
    __extends(Linda, _super);

    Linda.prototype.session = "";

    function Linda(url, name) {
      this.io = new RocketIO(url);
      this.io.connect();
    }

    Linda.prototype.push = function(type, data) {
      return this.io.push(type, data);
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
      if (typeof tuple !== "object") {
        throw new Error("TupleSpace::write args[0] should be object");
      }
      opts = opts || {};
      return this.linda.push("__linda_write", [this.name, tuple, opts]);
    };

    TupleSpace.prototype.read = function(tuple, callback) {
      var cid,
        _this = this;
      if (typeof tuple !== "object") {
        throw new Error("TupleSpace::read args[0] should be object");
      }
      if (typeof callback !== "function") {
        throw new Error("TupleSpace::read args[1] should be callback function");
      }
      cid = this.callbackId();
      this.linda.io.once("__linda_read_callback_" + cid, function(data) {
        return callback(data.tuple, data.info);
      });
      return this.linda.push("__linda_read", [this.name, tuple, cid]);
    };

    TupleSpace.prototype.watch = function(tuple, callback) {
      var cid;
      if (typeof tuple !== 'object') {
        throw new Error("TupleSpace::watch args[0] should be object");
      }
      if (typeof callback !== 'function') {
        throw new Error("TupleSpace::watch args[1] should be callback function");
      }
      cid = this.callbackId();
      this.linda.io.on("__linda_watch_callback_" + cid, function(data) {
        return callback(data.tuple, data.info);
      });
      return this.linda.push("__linda_watch", [this.name, tuple, cid]);
    };

    TupleSpace.prototype.take = function(tuple, callback) {
      var cid;
      if (typeof tuple !== 'object') {
        throw new Error("TupleSpace::take args[0] should be object");
      }
      if (typeof callback !== 'function') {
        throw new Error("TupleSpace::take args[1] should be callback function");
      }
      cid = this.callbackId();
      this.linda.io.once("__linda_take_callback_" + cid, function(data) {
        return callback(data.tuple, data.info);
      });
      return this.linda.push("__linda_take", [this.name, tuple, cid]);
    };

    TupleSpace.prototype.callbackId = function() {
      return "" + (moment().diff(this.time)) + (moment().unix()) + "_" + (Math.random(1000000));
    };

    return TupleSpace;

  })();

  module.exports = {
    Linda: Linda,
    TupleSpace: TupleSpace
  };

}).call(this);
