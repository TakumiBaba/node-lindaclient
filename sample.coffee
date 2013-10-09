Linda = require("./client").LindaClient
TupleSpace = require("./client").TupleSpace

linda = new Linda("linda.masuilab.org:10010")
ts    = new TupleSpace("takumibaba", linda)

linda.io.on "connect", ->
	ts.write [0, 1, 2]
	ts.read [0, 1, 2], (tuple, info)->
		console.log tuple, info

# linda.io.on "connect", ()->
# 	# ts.watch [0 ,1, 2], (tuple, info)=>
# 	# 	console.log tuple, info
# 	ts.write [0, 1, 2]
# 	tuple = ts.read [0,1,2], (tuple, info)->
# 		console.log tuple, info
# 	# linda.io.close()
# linda.connect()