var today = new CalendarDate(new Date().getDate(), new Date().getMonth(), new Date().getFullYear());
var view = new CalendarDate(today.day, today.month, today.year);

var $calendarMonthYear = document.querySelector('.header-month-year');
var $calendar = document.querySelector('.calendar-squares');
var $previousMonth = document.querySelector('.left-arrow-button');
var $nextMonth = document.querySelector('.right-arrow-button');
var $dateInfoDate = document.querySelector('.date-info-date');
var $dateInfoHoliday = document.querySelector('.date-info-holiday');

var holidays = null;

$previousMonth.addEventListener('click', handlePrevious);
$nextMonth.addEventListener('click', handleNext);
$calendar.addEventListener('click', handleSelect);

getHolidays(today.year);
generateSquares($calendar);
populateCalendar(today);
populateDayBanner(today);

// Event Handlers
function handlePrevious(event) {
  if (view.month === 0) {
    view.month = 11;
    view.year--;
  } else {
    view.month--;
  }
  generateSquares($calendar);
  populateCalendar(view);
}

function handleNext(event) {
  if (view.month === 11) {
    view.month = 0;
    view.year++;
  } else {
    view.month++;
  }
  generateSquares($calendar);
  populateCalendar(view);
}

function handleSelect(event) {
  if (!event.target.closest('.square')) {
    return;
  }
  if (!event.target.closest('.black')) {
    return;
  }

  var dateId = '#' + event.target.closest('.square').id;

  generateSquares($calendar);
  populateCalendar(view);

  var $date = document.querySelector(dateId).children[0].children[0].children[0];

  $date.classList.add('selected');
  view.day = $date.textContent;
  populateDayBanner(view);
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
      $square.setAttribute('id', 'p' + (i * 10 + j));
      $row.append($square);
    }
    calendar.append($row);
  }
}

function populateCalendar(calendarDate) {
  // update header
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $calendarMonthYear.children[0].textContent = months[calendarDate.month];
  $calendarMonthYear.children[1].textContent = calendarDate.year;

  // fill in calendar
  var currentDate = new Date(calendarDate.year, calendarDate.month, 1);
  // wind back to Sunday
  var firstDay = currentDate.getDay();
  for (var dayOfWeek = firstDay; dayOfWeek > 0; dayOfWeek--) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // loop through all squares
  for (var i = 0; i < $calendar.children.length; i++) {
    for (var j = 0; j < 7; j++) {
      var $square = $calendar.children[i].children[j];
      var currentDay = currentDate.getDate();
      var isCurrentMonth = true;
      if (currentDate.getMonth() !== calendarDate.month) {
        isCurrentMonth = false;
      }
      generateHTMLCalendarDay($square, currentDay, isCurrentMonth);
      currentDate.setDate(currentDay + 1);
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
  for (var i = 0; i < holidays.length; i++) {
    var viewingMonth = view.month;
    var viewingDay = day;
    if (!isCurrentMonth && day > 15) {
      viewingMonth--;
    } else if (!isCurrentMonth && day < 15) {
      viewingMonth++;
    }
    if (holidays[i].date.datetime.month - 1 === viewingMonth && holidays[i].date.datetime.day === viewingDay) {
      $number.classList.add('pink');
      break;
    }
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

function populateDayBanner(calendarDate) {
  // update Date Info
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $dateInfoDate.children[0].textContent = months[calendarDate.month];
  $dateInfoDate.children[1].textContent = calendarDate.day;
  $dateInfoDate.children[2].textContent = calendarDate.year;

  // update holiday
  for (var i = 0; i < holidays.length; i++) {
    if (holidays[i].date.datetime.month - 1 === calendarDate.month && holidays[i].date.datetime.day === parseInt(calendarDate.day)) {
      $dateInfoHoliday.textContent = holidays[i].name;
      break;
    }
  }
}

// AJAX Functions
function getHolidays(year) {
  holidays = new XMLHttpRequest();
  var holidayKey = '?api_key=89c4f0216fb3240f31be20bc4f84aee739d99cda';
  var holidayCountry = '&country=US';
  var holidayYear = '&year=' + year;
  var holidayType = '&type=national';

  holidays.open('GET', 'https://calendarific.com/api/v2/holidays' + holidayKey + holidayCountry + holidayYear + holidayType);
  holidays.responseType = 'json';
  holidays.addEventListener('load', handleHolidays);
  holidays = data.holidaysDummy;
  // holidays.send();

  function handleHolidays(event) {
    holidays = holidays.response.response.holidays;
  }
}

// OOP Objects
// function CalendarDay(calendarDate) {
//   this.date = calendarDate;

//   this.weather = null;

//   this.holiday = null;
//   this.travel = null;

//   this.birthdays = [];
//   this.meetings = [];
//   this.hangouts = [];
//   this.events = [];
// }

function CalendarDate(day, month, year) {
  this.day = day;
  this.month = month;
  this.year = year;
}

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
