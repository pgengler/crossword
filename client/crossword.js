var ACROSS = 1, DOWN = 2;

var direction = ACROSS;

var keys = {
	LEFT_ARROW:  37,
	RIGHT_ARROW: 39,
	UP_ARROW:    38,
	DOWN_ARROW:  40,

	BACKSPACE:   8,
	DELETE:      46
};

var socket = initSocket();

$(function() {

	addNumbers();
	$(window).resize(addNumbers);

	$('ol li').click(function() {
		select($('td[position='+$(this).attr('value')+']'));
		direction = $(this).closest('div').attr('id') == 'across' ? ACROSS : DOWN;
		highlight();
	});

	$('td').not('.unused').click(function() {
		select($(this));
		highlight();
	});

	$(document).keydown(function(event) {
		var handled = false;

		if ($('td.selected').length == 0) {
			return;
		}

		var oldDirection = direction;

		switch (event.keyCode) {
			case keys.LEFT_ARROW:
				direction = ACROSS;
				if (oldDirection == direction) {
					selectPrevHorizontal(true);
				}
				handled = true;
				break;

			case keys.RIGHT_ARROW:
				direction = ACROSS;
				if (oldDirection == direction) {
					selectNextHorizontal(true);
				}
				handled = true;
				break;

			case keys.UP_ARROW:
				direction = DOWN;
				if (oldDirection == direction) {
					selectPrevVertical(true);
				}
				handled = true;
				break;

			case keys.DOWN_ARROW:
				direction = DOWN;
				if (oldDirection == direction) {
					selectNextVertical(true);
				}
				handled = true;
				break;

			case keys.DELETE:
				$('td.selected').text('');
				handled = true;
				break;

			case keys.BACKSPACE:
				var $cell = $('td.selected');
				$cell.text('');
				notifyPlay($cell.data('x'), $cell.data('y'), '');
				selectPrev(false);
				handled = true;
				break;
		}

		if (handled) {
			highlight();
			event.stopPropagation();
			event.preventDefault();
			return false;
		}
	});

	$(document).keypress(function(event) {
		if (event.ctrlKey || event.altKey || !isAlpha(event.which)) {
			return;
		}
		var $curr = $('td.selected');
		var letter = String.fromCharCode(event.which).toUpperCase();

		var x = $curr.data('x');
		var y = $curr.data('y');

		playLetter(x, y, letter);
		notifyPlay(x, y, letter);

		selectNext(true);
		highlight();
	});
});

function select($element)
{
	$('.selected').removeClass('selected');
	$element.addClass('selected');
}

function highlight()
{
	$('.active').removeClass('active');

	if (direction == ACROSS) {
		highlightHorizontal();
	} else {
		highlightVertical();
	}
}

function highlightVertical()
{
	var $element = $('td.selected');

	var $row      = $element.parent('tr');
	var $tbody    = $row.parent('tbody');
	var rowIndex  = $tbody.children().index($row);
	var cellIndex = $row.children().index($element);
	var numRows   = $tbody.children().length;

	var upRowIndex = rowIndex - 1;
	while (upRowIndex >= 0) {
		var $elem = $tbody.find('tr:eq('+upRowIndex+')').find('td:eq('+cellIndex+')');
		if ($elem.hasClass('unused')) {
			break;
		}
		$elem.addClass('active');
		upRowIndex--;
	}

	var downRowIndex = rowIndex + 1;
	while (downRowIndex < numRows) {
		var $elem = $tbody.find('tr:eq('+downRowIndex+')').find('td:eq('+cellIndex+')');
		if ($elem.hasClass('unused')) {
			break;
		}
		$elem.addClass('active');
		downRowIndex++;
	}
}

function highlightHorizontal()
{
	var $element = $('td.selected');

	var prev = $element.prev();
	while (prev.length && !prev.hasClass('unused')) {
		prev.addClass('active');
		prev = prev.prev();
	}

	var next = $element.next();
	while (next.length && !next.hasClass('unused')) {
		next.addClass('active');
		next = next.next();
	}
}

function selectPrev(crossBoundaries)
{
	if (direction == ACROSS) {
		selectPrevHorizontal(crossBoundaries);
	} else {
		selectPrevVertical(crossBoundaries);
	}
}

function selectPrevVertical(crossBoundaries)
{
	var $curr = $('td.selected');

	// Get row's index in table
	var $row = $curr.parent('tr');
	var rowIndex = $row.parent('tbody').children().index($row);

	// Get index in row
	var cellIndex = $curr.parent('tr').children().index($curr);

	do {
		if (rowIndex == 0) {
			return;
		}

		// Now get cell in the row above
		var $aboveRow = $curr.closest('tbody').find('tr:eq(' + --rowIndex + ')');
		var $aboveCell = $aboveRow.find('td:eq(' + cellIndex + ')');

		if (!crossBoundaries && $aboveCell.hasClass('unused')) {
			return;
		}
	} while ($aboveCell.hasClass('unused'));

	select($aboveCell);
}

function selectPrevHorizontal(crossBoundaries)
{
	var $curr = $('td.selected');
	var $prev = $curr.prev();

	if (crossBoundaries) {
		while ($prev.length && $prev.hasClass('unused')) {
			$prev = $prev.prev();
		}
	} else {
		if ($prev.hasClass('unused')) {
			return;
		}
	}


	if ($prev.length) {
		select($prev);
	}
}

function selectNext(crossBoundaries)
{
	if (direction == ACROSS) {
		selectNextHorizontal(crossBoundaries);
	} else {
		selectNextVertical(crossBoundaries);
	}
}

function selectNextVertical(crossBoundaries)
{
	var $curr = $('td.selected');

	// Get row's index in table
	var $row = $curr.parent('tr');
	var rowIndex = $row.parent('tbody').children().index($row);

	var numRows = $row.parent('tbody').children().length;

	// Get index in row
	var cellIndex = $curr.parent('tr').children().index($curr);

	do {
		if (rowIndex + 1 == numRows) {
			return;
		}

		// Now get cell in the row above
		var $belowRow = $curr.closest('tbody').find('tr:eq(' + (++rowIndex) + ')');
		var $belowCell = $belowRow.find('td:eq(' + cellIndex + ')');

		if (!crossBoundaries && $belowCell.hasClass('unused')) {
			return;
		}
	} while ($belowCell.hasClass('unused'));

	select($belowCell);
}

function selectNextHorizontal(crossBoundaries)
{
	var $curr = $('td.selected');
	var $next = $curr.next();

	if (crossBoundaries) {
		while ($next.length && $next.hasClass('unused')) {
			$next = $next.next();
		}
	} else {
		if ($next.hasClass('unused')) {
			return;
		}
	}


	if ($next.length) {
		select($next);
	}
}

function isAlpha(charCode)
{
	if (charCode >= 65 && charCode <= 90) {
		// uppercase letter
		return true;
	} else if (charCode >= 97 && charCode <= 122) {
		// lowercase letter
		return true;
	}
	return false;
}

function addNumbers()
{
	var counter = 1;

	$('.number').remove();

	$('tr').each(function() {
		var row = $(this);
		row.find('td').each(function() {
			var cell = $(this);

			if (cell.hasClass('unused')) {
				return;
			}

			var x = row.children().index(cell);
			var y = row.parent('tbody').children().index(row);

			cell.data('x', x);
			cell.data('y', y);

			var $prevHorizontal = cell.prev();
			var $prevVertical   = row.prev().find('td:eq('+x+')');
			if (($prevHorizontal.length == 0 || $prevHorizontal.hasClass('unused')) || ($prevVertical.length == 0 || $prevVertical.hasClass('unused'))) {
				var $number = $('<span class="number"/>').text(counter).appendTo($('body'));
				$number.position({
					of:     cell,
					my:     'left top',
					at:     'left top',
					offset: '4px'
				});
				cell.attr('position', counter);
				counter++;
			}
		});
	});
}

function initSocket()
{
	var socket = io.connect('http://192.168.1.95:2000');
	socket.on('play', function(data) {
		playLetter(data.x, data.y, data.letter);
	});

	return socket;
}

function playLetter(x, y, letter)
{
	var $cell = $('#board').find('tr:eq('+y+')').find('td:eq('+x+')');

	$cell.text(letter);
}

function notifyPlay(x, y, letter)
{
	if (socket) {
		socket.emit('play', { x: x, y: y, letter: letter });
	}
}
