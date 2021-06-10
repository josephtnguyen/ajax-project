var today = new CalendarDate(new Date().getDate(), new Date().getMonth(), new Date().getFullYear());
var view = new CalendarDate(parseInt(today.day), today.month, today.year);

var $calendarMonthYear = document.querySelector('.header-month-year');
var $calendar = document.querySelector('.calendar-squares');
var $previousMonth = document.querySelector('.left-arrow-button');
var $nextMonth = document.querySelector('.right-arrow-button');
var $dateInfoDate = document.querySelector('.date-info-date');
var $dateInfoHoliday = document.querySelector('.date-info-holiday');
var $dateWeather = document.querySelector('.date-weather');

var holidays = null;
var weathers = null;

$previousMonth.addEventListener('click', handlePrevious);
$nextMonth.addEventListener('click', handleNext);
$calendar.addEventListener('click', handleSelect);

getHolidays(today.year);
getWeather(data.homeTown);
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

  var squareId = '#' + event.target.closest('.square').id;

  generateSquares($calendar);
  populateCalendar(view);

  var $date = document.querySelector(squareId).children[0].children[0].children[0];

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
    $number.classList.add('not-clickable');
  }
  $number.textContent = day;

  // Holiday
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

  // Location/Weather
  var $headingSideDiv = document.createElement('div');
  $headingSideDiv.className = 'col-66-lg calendar-date-weather-heading';

  if (view.month === today.month && view.year === today.year) {
    for (i = 0; i < weathers.length; i++) {
      if (weathers[i].date.day === day && isCurrentMonth) {
        var $weatherIcon = document.createElement('img');
        $weatherIcon.className = 'calendar-date-weather-icon';
        $weatherIcon.setAttribute('src', weathers[i].svg);

        var $weatherTemp = document.createElement('h3');
        $weatherTemp.className = 'calendar-date-weather-temp no-margin';
        $weatherTemp.textContent = weathers[i].temp + '\u00B0';

        $headingSideDiv.append($weatherIcon);
        $headingSideDiv.append($weatherTemp);
        break;
      }
    }
  }

  // Events
  var $body = document.createElement('div');
  $body.className = 'row';

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
  $dateInfoHoliday.textContent = '';
  for (var i = 0; i < holidays.length; i++) {
    if (holidays[i].date.datetime.month - 1 === calendarDate.month && holidays[i].date.datetime.day === parseInt(calendarDate.day)) {
      $dateInfoHoliday.textContent = holidays[i].name;
      break;
    }
  }

  // update weather
  $dateWeather.innerHTML = '';
  for (i = 0; i < weathers.length; i++) {
    if (weathers[i].date.day === parseInt(calendarDate.day) && weathers[i].date.month === calendarDate.month && weathers[i].date.year === calendarDate.year) {
      generateBannerWeather($dateWeather, weathers[i]);
      break;
    }
  }

}

function generateBannerWeather(weatherDiv, weather) {
  var $icon = document.createElement('img');
  $icon.className = 'date-weather-icon';
  $icon.setAttribute('src', weather.svg);

  var $mainTemp = document.createElement('h1');
  $mainTemp.className = 'date-weather-main-temp';
  $mainTemp.textContent = weather.temp + '\u00B0';

  var $sideTemp = document.createElement('div');
  $sideTemp.className = 'date-weather-side-temp';

  var $high = document.createElement('p');
  $high.className = 'no-margin';
  $high.textContent = 'High: ' + weather.max + '\u00B0';

  var $low = document.createElement('p');
  $low.className = 'no-margin';
  $low.textContent = 'Low: ' + weather.min + '\u00B0';

  weatherDiv.append($icon);
  weatherDiv.append($mainTemp);
  weatherDiv.append($sideTemp);
  $sideTemp.append($high);
  $sideTemp.append($low);
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

function getWeather(location) {
  weathers = new XMLHttpRequest();
  var weatherKey = '&appid=5ff45e05a8481e8ad44a0bc795ab4ace';
  var weatherUnits = '&units=imperial';
  var weatherLocation = '?lat=' + location.lat + '&lon=' + location.lon;

  weathers.open('GET', 'https://api.openweathermap.org/data/2.5/onecall' + weatherLocation + weatherUnits + weatherKey);
  weathers.responseType = 'json';
  weathers.addEventListener('load', handleWeather);
  weathers.send();

  function handleWeather(event) {
    // weather = weather.response;
    var weatherList = weathers.response.daily;
    var finalData = [];
    for (var i = 0; i < weatherList.length; i++) {
      var data = weatherList[i];
      // var dateTime = new Date(data.dt);
      var weatherObj = new Weather(
        // new CalendarDate(dateTime.getDate(), dateTime.getMonth(), dateTime.getFullYear()),
        new CalendarDate(today.day + i, today.month, today.year),
        data.weather[0].main,
        Math.trunc(data.temp.day),
        Math.trunc(data.temp.max),
        Math.trunc(data.temp.min)
      );
      finalData.push(weatherObj);
    }
    weathers = finalData;
    populateDayBanner(today);
    generateSquares($calendar);
    populateCalendar(today);
  }
}

// OOP Objects
function CalendarDate(day, month, year) {
  this.day = day;
  this.month = month;
  this.year = year;
}

function Weather(calendarDate, forecast, temp, max, min) {
  this.date = calendarDate;
  this.forecast = forecast;
  this.temp = temp;
  this.max = max;
  this.min = min;
  this.svg = '';

  if (forecast === 'Clear') {
    this.svg = 'images/sun.svg';
  } else if (forecast === 'Clouds') {
    this.svg = 'images/cloud.svg';
  } else if (forecast === 'Rain') {
    this.svg = 'images/cloud-with-rain.svg';
  } else if (forecast === 'Snow') {
    this.svg = 'images/cloud-with-snow.svg';
  }
}
