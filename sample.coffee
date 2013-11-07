Linda = require("./client")

linda = new Linda "linda.masuilab.org:10010", "takumibaba"

linda.on "connect", ->
  linda.ts.write [0, 1, 2]
  linda.ts.read [0, 1, 2], (tuple, info)->
    console.log tuple, info