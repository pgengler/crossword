var _  = require('underscore');
var io = require('socket.io').listen(2000);

var clients = [ ];

io.configure(function() {
	io.set('log level', 1);
});

io.sockets.on('connection', function(socket) {

	clients.push(socket);

	socket.on('play', function(data) {

		var clientsToNotify = _(clients).filter(function(s) { return s != socket });

		_.each(clientsToNotify, function(s) {
			s.emit('play', { x: data.x, y: data.y, letter: data.letter });
		});
	});

	socket.on('disconnect', function() {
		clients = _(clients).filter(function(client) { return socket != client });
	});
});

