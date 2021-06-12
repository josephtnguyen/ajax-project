/* global data */
/* global CalendarDate, Weather, Coord, CalendarDay */

var today = new CalendarDate(new Date().getDate(), new Date().getMonth(), new Date().getFullYear());
var view = new CalendarDate(parseInt(today.day), today.month, today.year);

var holidays = [];
var weathers = {};

var $calendarMonthYear = document.querySelector('.header-month-year');
var $calendar = document.querySelector('.calendar-squares');
var $previousMonth = document.querySelector('.left-arrow-button');
var $nextMonth = document.querySelector('.right-arrow-button');
var $dateInfoDate = document.querySelector('.date-info-date');
var $dateInfoHoliday = document.querySelector('.date-info-holiday');
var $dateWeather = document.querySelector('.date-weather');

var $travelModal = document.querySelector('.travel-modal-container');
var $travelModalForm = document.querySelector('.travel-modal-form');
var $travelModalCancel = document.querySelector('.travel-button.cancel');
var $travelButton = document.querySelector('.add-travel');

$previousMonth.addEventListener('click', handlePrevious);
$nextMonth.addEventListener('click', handleNext);
$calendar.addEventListener('click', handleSelect);
$travelModalForm.addEventListener('submit', handleTravelSubmit);
$travelModalCancel.addEventListener('click', handleTravelCancel);
$travelButton.addEventListener('click', handleAddTravel);

getHomeTown(data);
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

  var squareId = '#' + event.target.closest('.square').id;

  generateSquares($calendar);
  populateCalendar(view);

  var $date = document.querySelector(squareId).children[0].children[0].children[0];

  $date.classList.add('selected');
  view.day = $date.textContent;
  populateDayBanner(view);
}

function handleTravelSubmit(event) {
  event.preventDefault();

  // record hometown if asking for hometown
  if (!data.homeTown) {
    $travelModalCancel.classList.remove('lighter-gray');
    $travelModal.classList.add('hidden');
    data.homeTown = $travelModalForm.children[1].children[0].children[0].children[2].children[2].value;
    getCoord(data.homeTown);
    $travelModalForm.reset();
    getHomeTown(data);
    return;
  }

  // if adding a travel destination, create a new day object
  var travel = $travelModalForm.children[1].children[0].children[0].children[2].children[2].value;
  var day = new CalendarDay(view, travel);
  // if the day already exists, modify the day instead
  for (var i = 0; i < data.days.length; i++) {
    if (data.days[i].date.isSameDay(view)) {
      day = data.days[i];
      day.travel = travel;
      break;
    }
  }
  data.days.push(day);

  // update the calendar
  generateSquares($calendar);
  populateCalendar(view);

  // if they are in the weather forecast range, update the weather
  // if ()

  $travelModal.classList.add('hidden');

  $travelModalForm.reset();
}

function handleTravelCancel(event) {
  event.preventDefault();

  if (event.target.matches('.lighter-gray')) {
    return;
  }

  $travelModal.classList.add('hidden');
  $travelModalForm.reset();

}

function handleAddTravel(event) {
  $travelModalForm.children[1].children[0].children[0].children[0].classList.remove('hidden');
  $travelModalForm.children[1].children[0].children[0].children[1].classList.add('hidden');
  $travelModalForm.children[1].children[0].children[0].children[2].children[0].classList.remove('hidden');
  $travelModalForm.children[1].children[0].children[0].children[2].children[1].classList.add('hidden');
  $travelModal.classList.remove('hidden');
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
  var currentTravel = { location: data.homeTown, style: 'travel-1' };
  for (var i = 0; i < $calendar.children.length; i++) {
    for (var j = 0; j < 7; j++) {
      var $square = $calendar.children[i].children[j];
      var currentDay = currentDate.getDate();
      var isCurrentMonth = true;
      if (currentDate.getMonth() !== calendarDate.month) {
        isCurrentMonth = false;
      }
      // see if we have any data on the current day
      var dayObj = null;
      for (var k = 0; k < data.days.length; k++) {
        if (data.days[k].date.day === currentDay.toString() && data.days[k].date.month === currentDate.getMonth() && data.days[k].date.year === currentDate.getFullYear()) {
          dayObj = data.days[k];
          break;
        }
      }

      generateHTMLCalendarDay($square, currentDay, isCurrentMonth, dayObj, currentTravel);
      currentDate.setDate(currentDay + 1);
    }
  }
}

function generateHTMLCalendarDay(square, day, isCurrentMonth, dayObj, currentTravel) {
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

  var weatherAdded = false;
  var weatherList = weathers[data.homeTown];
  if (weatherList) {
    if (view.isSameMonth(today)) {
      // get other weather if traveling
      if (dayObj) {
        if (dayObj.travel) {
          for (var location in weathers) {
            if (location === dayObj.travel) {
              weatherList = weathers[location];
              break;
            }
          }
        }
      }
      // find the correct day in weatherList and fill in the DOM
      for (i = 0; i < weatherList.length; i++) {
        if (weatherList[i].date.day === day && isCurrentMonth) {
          var $weatherIcon = document.createElement('img');
          $weatherIcon.className = 'calendar-date-weather-icon';
          $weatherIcon.setAttribute('src', weatherList[i].svg);

          var $weatherTemp = document.createElement('h3');
          $weatherTemp.className = 'calendar-date-weather-temp no-margin';
          $weatherTemp.textContent = weatherList[i].temp + '\u00B0';

          $headingSideDiv.append($weatherIcon);
          $headingSideDiv.append($weatherTemp);
          weatherAdded = true;
          break;
        }
      }
    }
  }

  // Travel
  if (dayObj) {
    if (dayObj.travel) {
      if (dayObj.travel !== currentTravel.location) {
        currentTravel.style = 'travel-' + (parseInt(currentTravel.style[7]) + 1);
        if (currentTravel.style[7] === '5') {
          currentTravel.style = 'travel-1';
        }
      }
      square.classList.add(currentTravel.style);
      $number.classList.add(currentTravel.style);

      // add text if no weather is present
      if (!weatherAdded) {
        var $travelDestination = document.createElement('p');
        $travelDestination.className = 'calendar-date-destination';
        $travelDestination.classList.add(currentTravel.style);
        $travelDestination.textContent = dayObj.travel;
        $headingSideDiv.append($travelDestination);
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
  var weatherList = weathers[data.homeTown];
  if (weatherList) {
    // see if we have any data on the current day
    var dayObj = null;
    for (var k = 0; k < data.days.length; k++) {
      if (data.days[k].date.isSameDay(calendarDate)) {
        dayObj = data.days[k];
        break;
      }
    }

    // if there is data, update the weatherList for the correct location
    if (dayObj) {
      if (dayObj.travel) {
        weatherList = weathers[dayObj.travel];
      }
    }

    for (i = 0; i < weatherList.length; i++) {
      if (weatherList[i].date.day === parseInt(calendarDate.day) && weatherList[i].date.month === calendarDate.month && weatherList[i].date.year === calendarDate.year) {
        generateBannerWeather($dateWeather, weatherList[i]);
        break;
      }
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
  var holidaysList = new XMLHttpRequest();
  var holidayKey = '?api_key=89c4f0216fb3240f31be20bc4f84aee739d99cda';
  var holidayCountry = '&country=US';
  var holidayYear = '&year=' + year;
  var holidayType = '&type=national';

  holidaysList.open('GET', 'https://calendarific.com/api/v2/holidays' + holidayKey + holidayCountry + holidayYear + holidayType);
  holidaysList.responseType = 'json';
  holidaysList.addEventListener('load', handleHolidays);
  holidays = data.holidaysDummy;
  // holidaysList.send();

  function handleHolidays(event) {
    holidays = holidaysList.response.response.holidays;
    data.holidaysDummy = holidays;
  }
}

function getWeather(coord) {
  var weather = new XMLHttpRequest();
  var weatherKey = data.weatherKey;
  var weatherUnits = '&units=imperial';
  var weatherLocation = '?lat=' + coord.lat + '&lon=' + coord.lon;

  weather.open('GET', 'https://api.openweathermap.org/data/2.5/onecall' + weatherLocation + weatherUnits + weatherKey);
  weather.responseType = 'json';
  weather.addEventListener('load', handleWeather);
  weather.send();

  function handleWeather(event) {
    var weatherList = weather.response.daily;
    var finalData = [];
    for (var i = 0; i < weatherList.length; i++) {
      var weatherData = weatherList[i];
      var weatherObj = new Weather(
        new CalendarDate(today.day + i, today.month, today.year),
        coord.location,
        weatherData.weather[0].main,
        Math.trunc(weatherData.temp.day),
        Math.trunc(weatherData.temp.max),
        Math.trunc(weatherData.temp.min)
      );
      finalData.push(weatherObj);
    }
    weathers[coord.location] = finalData;
    populateDayBanner(today);
    generateSquares($calendar);
    populateCalendar(today);
  }
}

function getAllWeather() {
  getWeather(data.homeCoord);

  // get all travel locations
  var locations = new Set();
  for (var i = 0; i < data.days.length; i++) {
    if (data.days[i].travel) {
      locations.add(data.days[i].travel);
    }
  }

  // get coords for all locations
  var locationsList = [...locations];
  for (i = 0; i < locationsList.length; i++) {
    getCoord(locationsList[i]);
  }

  // get weather for all coords
  for (var location in data.coords) {
    getWeather(data.coords[location]);
  }
}

function getHomeTown(data) {
  if (!data.homeTown) {
    $travelModalCancel.classList.add('lighter-gray');
    $travelModal.classList.remove('hidden');
  } else {
    getAllWeather();
  }
}

function getCoord(locationName) {
  var coord = new XMLHttpRequest();
  var weatherKey = data.weatherKey;
  var weatherUnits = '&units=imperial';
  var weatherLocation = '?q=' + locationName;

  coord.open('GET', 'https://api.openweathermap.org/data/2.5/weather' + weatherLocation + weatherUnits + weatherKey);
  coord.responseType = 'json';
  coord.addEventListener('load', handleCoord);
  coord.send();

  function handleCoord(event) {
    if (locationName === data.homeTown) {
      data.homeCoord = new Coord(coord.response.coord.lat, coord.response.coord.lon);
    } else {
      data.coords[locationName] = new Coord(coord.response.coord.lat, coord.response.coord.lon, locationName);
    }
  }
}
