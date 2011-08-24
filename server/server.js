var _  = require('underscore');
var io = require('socket.io').listen(2000);

var clients = [ ];

io.sockets.on('connection', function(socket) {

	clients.push(socket);

	socket.on('play', function(data) {

		var clientsToNotify = _.filter(clients, function(s) { return s != socket });

		_.each(clientsToNotify, function(s) {
			s.emit('play', { x: data.x, y: data.y, letter: data.letter });
		});
	});
});
