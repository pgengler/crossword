var _  = require('underscore');
var io = require('socket.io').listen(2000);

var clients = [ ];

var board = [ ];

io.configure(function() {
	io.set('log level', 1);
});

io.sockets.on('connection', function(socket) {

	socket.emit('board', { board: board });

	clients.push(socket);

	socket.on('play', function(data) {

		var clientsToNotify = _(clients).filter(function(s) { return s != socket });

		if (typeof board[data.y] === 'undefined') {
			board[data.y] = [ ];
		}
		board[data.y][data.x] = data.letter;

		_.each(clientsToNotify, function(s) {
			s.emit('play', { x: data.x, y: data.y, letter: data.letter });
		});
	});

	socket.on('disconnect', function() {
		clients = _(clients).filter(function(client) { return socket != client });
	});
});

