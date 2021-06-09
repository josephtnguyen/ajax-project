var today = {
  day: new Date().getDate(),
  month: new Date().getMonth(),
  year: new Date().getFullYear()
};

var view = {
  day: today.day,
  month: today.month,
  year: today.year
};

var $calendarMonthYear = document.querySelector('.header-month-year');
var $calendar = document.querySelector('.calendar-squares');
var $previousMonth = document.querySelector('.left-arrow-button');
var $nextMonth = document.querySelector('.right-arrow-button');

$previousMonth.addEventListener('click', handlePrevious);
$nextMonth.addEventListener('click', handleNext);

generateSquares($calendar);
populateCalendar(today.month, today.year);

// Event Handlers
function handlePrevious(event) {
  if (view.month === 0) {
    view.month = 11;
    view.year--;
  } else {
    view.month--;
  }
  generateSquares($calendar);
  populateCalendar(view.month, view.year);
}

function handleNext(event) {
  if (view.month === 11) {
    view.month = 0;
    view.year++;
  } else {
    view.month++;
  }
  generateSquares($calendar);
  populateCalendar(view.month, view.year);
}

// General Functions
function generateSquares(calendar) {
  calendar.innerHTML = '';
  for (var i = 0; i < 6; i++) {
    var $row = document.createElement('div');
    $row.className = 'row';
    for (var j = 0; j < 7; j++) {
      var $square = document.createElement('div');
      $square.className = 'col-14 square';
      $square.setAttribute('id', i * 10 + j);
      $row.append($square);
    }
    calendar.append($row);
  }
}

function populateCalendar(month, year) {
  // update header
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $calendarMonthYear.children[0].textContent = months[month];
  $calendarMonthYear.children[1].textContent = year;

  // fill in calendar
  var thisMonth = new Date(year, month, 1);
  // wind back to Sunday
  var firstDay = thisMonth.getDay();
  for (var dayOfWeek = firstDay; dayOfWeek > 0; dayOfWeek--) {
    thisMonth.setDate(thisMonth.getDate() - 1);
  }

  // loop through all squares
  for (var i = 0; i < $calendar.children.length; i++) {
    for (var j = 0; j < 7; j++) {
      var $square = $calendar.children[i].children[j];
      var currentDay = thisMonth.getDate();
      var isCurrentMonth = true;
      if (thisMonth.getMonth() !== month) {
        isCurrentMonth = false;
      }
      generateHTMLCalendarDay($square, currentDay, isCurrentMonth);
      thisMonth.setDate(currentDay + 1);
    }
  }

}

function generateHTMLCalendarDay(square, day, isCurrentMonth) {
  var $heading = document.createElement('div');
  $heading.className = 'row';

  // Number
  var $numberDiv = document.createElement('div');
  $numberDiv.className = 'col-33-lg middle';

  var $number = document.createElement('button');
  $number.className = 'date';
  if (isCurrentMonth) {
    $number.classList.add('black');
    if (day === today.day && view.month === today.month) {
      $number.classList.add('current-day');
    }
  } else {
    $number.classList.add('light-gray');
  }
  $number.textContent = day;

  // Location/Weather
  var $headingSideDiv = document.createElement('div');
  $headingSideDiv.className = 'col-66-lg mobile-hidden date-heading';

  // Events
  var $body = document.createElement('div');
  $body.className = 'row mobile-hidden';

  var $listDiv = document.createElement('div');
  $listDiv.className = 'col-100';

  var $list = document.createElement('ul');
  $list.className = 'events';

  square.append($heading);
  square.append($body);
  $heading.append($numberDiv);
  $heading.append($headingSideDiv);
  $numberDiv.append($number);
  $body.append($listDiv);
  $listDiv.append($list);

}
// function populateCalendarDay(dayObject) {
// }

// // OOP Objects
// function CalendarDay() {
//   this.date = null;

//   this.weather = null;

//   this.holiday = null;
//   this.travel = null;

//   this.birthdays = [];
//   this.meetings = [];
//   this.hangouts = [];
//   this.events = [];
// }

// function CalendarEvent(type, input, time = null) {
//   this.type = type;
//   this.input = input;
//   if (time) {
//     this.time = time;
//   }
//   if (type === 'birthday') {
//     this.input = input.capitalize() + "'s Birthday";
//   }
// }
