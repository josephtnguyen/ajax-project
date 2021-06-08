var $calendar = document.querySelector('.calendar-squares');

generateSquares($calendar);

function generateSquares(calendar) {
  for (var i = 0; i < 6; i++) {
    var $row = document.createElement('div');
    $row.className = 'row';
    for (var j = 0; j < 7; j++) {
      var $square = document.createElement('div');
      $square.className = 'col-14 square';
      $row.append($square);
    }
    calendar.append($row);
  }
}
