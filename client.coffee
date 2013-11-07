WebSocket       = require("ws")
EventEmitter    = require("events").EventEmitter
moment          = require("moment")

class Linda extends EventEmitter
  session: ""
  connecting: false

  constructor: (url, name)->
    @io = new WebSocket "ws://#{url}"
    @io.on "open", @open
    @io.on "message", @message
    @io.on "close", @close
    @ts = new TupleSpace name, @

  open: ->
    @connecting = true

  message: (message, flags)=>
    json = JSON.parse(message)
    if json.type is "__session_id"
      @session = json.data
      @emit "connect"
    else if json.type.match /^__linda/
      @emit json.type, json.data

  close: ->
    @connecting = false

  push: (type, data)->
    @io.send JSON.stringify {"type": type, "data": data, "session": @session}  

class TupleSpace

  constructor: (@name, @linda)->
    @time = moment().format()

  write: (tuple, opts)->
    throw new Error("TupleSpace.write's Arguments[0] should be object") if typeof tuple isnt 'object'
    opts = opts || {}
    @linda.push "__linda_write", [@name, tuple, opts]

  read: (tuple, callback)->
    throw new Error("TupleSpace.read's Arguments[0] should be object") if typeof tuple isnt 'object'
    throw new Error("TupleSpace.read's Arguments[1] should be callback function") if typeof callback isnt 'function'
    cid = @callbackId()
    @linda.once "__linda_read_callback_#{cid}", (data)=>
      callback data.tuple, data.info
    @linda.push "__linda_read", [@name, tuple, cid]

  watch: (tuple, callback)->
    throw new Error("TupleSpace.watch's Arguments[0] should be object") if typeof tuple isnt 'object'
    throw new Error("TupleSpace.watch's Arguments[1] should be callback function") if typeof callback isnt 'function'
    cid = @callbackId()
    @linda.once "__linda_watch_callback_#{cid}", (data)->
      callback data.tuple, data.info
    @linda.push "__linda_watch", [@name, tuple, cid]

  take: (tuple, callback)->
    throw new Error("TupleSpace.take's Arguments[0] should be object") if typeof tuple isnt 'object'
    throw new Error("TupleSpace.take's Arguments[1] should be callback function") if typeof callback isnt 'function'
    cid = @callbackId()
    @linda.once "__linda_take_callback_#{cid}", (data)->
      callback data.tuple, data.info
    @linda.push "__linda_take", [@name, tuple, cid]
 
  callbackId: ()->
    "#{moment().diff(@time)}#{moment().unix()}_#{Math.random(1000000)}"

module.exports = Linda