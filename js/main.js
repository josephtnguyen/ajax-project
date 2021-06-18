/* global data, gsap */
/* global CalendarDate, Weather, Coord, CalendarDay, CalendarEvent, EventTime */

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
var $travelButton = document.querySelector('.add-travel');
var $travelModalInput = document.querySelector('.travel-modal-container .modal-input');
var $travelModalCancel = document.querySelector('.travel-button.cancel');

var $eventModalTypeSelectors = document.querySelectorAll('button.event-modal-view');
var $eventModalTimes = document.querySelectorAll('select.event-modal-time');
var $eventModalIcons = document.querySelectorAll('.event-modal-input-icons .modal-icon');
var $eventModal = document.querySelector('.event-modal-container');
var $eventModalForm = document.querySelector('.event-modal-form');
var $eventButton = document.querySelector('.add-event');
var $eventModalCancel = document.querySelector('.event-button.cancel');
var $eventModalTypeDiv = document.querySelector('.event-modal-buttons');
var $eventModalDate = document.querySelector('.event-modal-date');
var $eventModalNone = document.querySelector('button.event-modal-time');
var $eventModalInput = document.querySelector('.event-modal-container .modal-input');
var $eventModalDelete = document.querySelector('.event-modal-delete-div');
var $checklist = document.querySelector('.checklist-div > ul');

$previousMonth.addEventListener('click', handlePrevious);
$nextMonth.addEventListener('click', handleNext);
$calendar.addEventListener('click', handleSelect);

$travelButton.addEventListener('click', handleTravelAdd);
$travelModalCancel.addEventListener('click', handleTravelCancel);
$travelModalForm.addEventListener('submit', handleTravelSubmit);
$travelModalForm.addEventListener('keydown', handleTravelSubmit);

$eventButton.addEventListener('click', handleEventAdd);
$eventModalCancel.addEventListener('click', handleEventCancel);
$eventModalTypeDiv.addEventListener('click', handleEventTypeSelection);
$eventModalNone.addEventListener('click', handleEventNoTime);
$eventModalDelete.addEventListener('click', handleEventDelete);
$eventModalForm.addEventListener('submit', handleEventSubmit);
$eventModalForm.addEventListener('keydown', handleEventSubmit);
$checklist.addEventListener('click', handleEventEdit);

getHomeTown(data);
getHolidays(today.year);
refreshApp(today);

// Event Handlers
function handlePrevious(event) {
  if (view.month === 0) {
    view.month = 11;
    view.year--;
  } else {
    view.month--;
  }
  view.day = 1;
  refreshApp(view, 'left');
}

function handleNext(event) {
  if (view.month === 11) {
    view.month = 0;
    view.year++;
  } else {
    view.month++;
  }
  view.day = 1;
  refreshApp(view, 'right');
}

function handleSelect(event) {
  if (!event.target.closest('.square')) {
    return;
  }
  var $square = event.target.closest('.square');
  if (!$square.children[0].children[0].children[0].matches('.black')) {
    return;
  }

  view.day = parseInt($square.children[0].children[0].children[0].textContent);
  refreshApp(view);
}

function handleTravelSubmit(event) {
  if (event.key !== 'Enter') {
    return;
  }
  event.preventDefault();
  // record hometown if asking for hometown
  if (!data.homeTown) {
    hideTravelModal();

    $travelModalCancel.classList.remove('lighter-gray');
    data.homeTown = $travelModalInput.value;
    getCoord(data.homeTown);
    $travelModalForm.reset();
    return;
  }

  // if adding a travel destination, create a new day object
  var travel = $travelModalInput.value;
  // get weather for new location
  getCoord(travel);
  var day = new CalendarDay({ ...view }, travel);
  Object.setPrototypeOf(day.date, CalendarDate.prototype);
  // if the day already exists, modify the day instead
  if (data.days.length === 0) {
    data.days.push(day);
  }
  for (var i = 0; i < data.days.length; i++) {
    if (data.days[i].date.isSameDay(view)) {
      day = data.days[i];
      day.travel = travel;
      break;
    }
    if (i === data.days.length - 1) {
      data.days.push(day);
      break;
    }
  }

  // update the calendar
  refreshApp(view);

  hideTravelModal();

  $travelModalForm.reset();
}

function handleTravelCancel(event) {
  event.preventDefault();

  if (event.target.matches('.lighter-gray')) {
    return;
  }

  hideTravelModal();
  $travelModalForm.reset();
}

function handleTravelAdd(event) {
  $travelModalForm.children[1].children[0].children[0].children[0].classList.remove('hidden');
  $travelModalForm.children[1].children[0].children[0].children[1].classList.add('hidden');
  $travelModalForm.children[1].children[0].children[0].children[2].children[0].classList.remove('hidden');
  $travelModalForm.children[1].children[0].children[0].children[2].children[1].classList.add('hidden');

  showTravelModal();
}

function handleEventAdd(event) {
  $eventModalTypeSelectors[0].classList.add('modal-selected');
  $eventModalIcons[0].classList.remove('hidden');
  $eventModalInput.setAttribute('placeholder', 'New Event');
  $eventModalInput.setAttribute('value', '');
  $eventModalNone.classList.remove('modal-selected');
  $eventModalDelete.classList.add('hidden');
  for (var i = 1; i < $eventModalTypeSelectors.length; i++) {
    $eventModalTypeSelectors[i].classList.remove('modal-selected');
    $eventModalIcons[i].classList.add('hidden');
  }

  setEventModalTime(new EventTime('7', '00', 'pm'));

  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $eventModalDate.children[0].textContent = months[view.month];
  $eventModalDate.children[1].textContent = view.day;
  $eventModalDate.children[2].textContent = view.year;

  showEventModal();
}

function handleEventCancel(event) {
  event.preventDefault();
  data.editing = false;
  hideEventModal();
  $eventModalForm.reset();
}

function handleEventTypeSelection(event) {
  event.preventDefault();

  if (!event.target.matches('button')) {
    return;
  }

  var placeholders = [
    'New Event',
    'Whose Birthday?',
    'New Hangout',
    'New Meeting'
  ];
  for (var i = 0; i < $eventModalTypeSelectors.length; i++) {
    if (event.target === $eventModalTypeSelectors[i]) {
      $eventModalTypeSelectors[i].classList.add('modal-selected');
      $eventModalIcons[i].classList.remove('hidden');
      $eventModalInput.setAttribute('placeholder', placeholders[i]);
      if (!data.editing) {
        if (event.target.matches('.birthday')) {
          $eventModalNone.classList.add('modal-selected');
        } else {
          $eventModalNone.classList.remove('modal-selected');
        }
      }
    } else {
      $eventModalTypeSelectors[i].classList.remove('modal-selected');
      $eventModalIcons[i].classList.add('hidden');
    }
  }
}

function handleEventNoTime(event) {
  event.preventDefault();

  if ($eventModalNone.classList.contains('modal-selected')) {
    $eventModalNone.classList.remove('modal-selected');
  } else {
    $eventModalNone.classList.add('modal-selected');
  }
}

function handleEventSubmit(event) {
  if (event.key !== 'Enter') {
    return;
  }
  event.preventDefault();

  // create a CalendarDay
  var day = new CalendarDay({ ...view });
  Object.setPrototypeOf(day.date, CalendarDate.prototype);
  // if a CalendarDay already exists, modify it instead
  if (data.days.length === 0) {
    data.days.push(day);
  }
  for (var i = 0; i < data.days.length; i++) {
    if (data.days[i].date.isSameDay(view)) {
      day = data.days[i];
      break;
    }
    if (i === data.days.length - 1) {
      data.days.push(day);
      break;
    }
  }

  // find the CalendarEvent type
  var type = 'event';
  for (i = 0; i < $eventModalTypeSelectors.length; i++) {
    if ($eventModalTypeSelectors[i].matches('.modal-selected')) {
      type = $eventModalTypeSelectors[i].textContent.toLowerCase();
      break;
    }
  }

  // find the time if available
  var time = null;
  if (!$eventModalNone.classList.contains('modal-selected')) {
    time = new EventTime($eventModalTimes[0].value, $eventModalTimes[1].value, $eventModalTimes[2].value);
  }

  // create a CalendarEvent or update current event
  if (data.editing) {
    for (i = 0; i < day.events.length; i++) {
      if (day.events[i].id === data.editingId) {
        day.events[i] = new CalendarEvent(type, $eventModalInput.value, time, data.editingId);
        data.editing = false;
        break;
      }
    }
  } else {
    var calendarEvent = new CalendarEvent(type, $eventModalInput.value, time, data.eventId);
    data.eventId++;
    day.events.push(calendarEvent);
  }

  // sort the events of the day
  day.events.sort((a, b) => a.weight - b.weight);

  generateSquares($calendar);
  populateCalendar(view);
  populateChecklist(view);

  if (event.submitter) {
    if (event.submitter.matches('.event-button.save')) {
      hideEventModal();
    }
  } else if (event.key === 'Enter') {
    hideEventModal();
  }

  $eventModalForm.reset();
  $eventModalInput.setAttribute('value', '');
}

function handleEventEdit(event) {
  if (!event.target.closest('button')) {
    return;
  }

  // find the day to edit
  var day;
  for (var i = 0; i < data.days.length; i++) {
    if (view.isSameDay(data.days[i].date)) {
      day = data.days[i];
      break;
    }
  }

  // find the event to edit
  var eventListing;
  var eventId = parseInt(event.target.closest('.row').getAttribute('data-id'));
  data.editingId = eventId;
  for (i = 0; i < day.events.length; i++) {
    if (day.events[i].id === eventId) {
      eventListing = day.events[i];
      break;
    }
  }

  // if the radio button was clicked, check/uncheck it instead
  if (event.target.closest('.event-radio-button')) {
    eventListing.checked = !eventListing.checked;
    refreshApp(view);
    return;
  }

  // open the modal and populate it with the proper inputs
  data.editing = true;
  var placeholders = [
    'New Event',
    'Whose Birthday?',
    'New Hangout',
    'New Meeting'
  ];
  for (i = 0; i < $eventModalTypeSelectors.length; i++) {
    if ($eventModalTypeSelectors[i].matches('.' + eventListing.type)) {
      $eventModalTypeSelectors[i].classList.add('modal-selected');
      $eventModalIcons[i].classList.remove('hidden');
      $eventModalInput.setAttribute('placeholder', placeholders[i]);
    } else {
      $eventModalTypeSelectors[i].classList.remove('modal-selected');
      $eventModalIcons[i].classList.add('hidden');
    }
  }
  $eventModalInput.setAttribute('value', eventListing.input);
  // populate time
  if (eventListing.time) {
    setEventModalTime(eventListing.time);
    $eventModalNone.classList.remove('modal-selected');
  } else {
    $eventModalNone.classList.add('modal-selected');
  }
  // update date
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $eventModalDate.children[0].textContent = months[view.month];
  $eventModalDate.children[1].textContent = view.day;
  $eventModalDate.children[2].textContent = view.year;

  $eventModalDelete.classList.remove('hidden');
  showEventModal();
}

function handleEventDelete(event) {
  event.preventDefault();

  if (!event.target.closest('.event-modal-delete')) {
    return;
  }

  var searching = true;
  for (var i = 0; i < data.days.length; i++) {
    for (var j = 0; j < data.days[i].events.length; j++) {
      if (data.days[i].events[j].id === data.editingId) {
        data.days[i].events.splice(j, 1);
        searching = false;
        break;
      }
    }
    if (!searching) {
      break;
    }
  }

  data.editing = false;
  generateSquares($calendar);
  populateCalendar(view);
  populateChecklist(view);
  hideEventModal();
  $eventModalInput.setAttribute('value', '');
  $eventModalForm.reset();
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

function populateCalendar(calendarDate, fromX = 0, fromOpacity = 1) {
  // update header
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $calendarMonthYear.children[0].textContent = months[calendarDate.month];
  $calendarMonthYear.children[1].textContent = calendarDate.year;
  gsap.from($calendarMonthYear, { duration: 0.25, x: fromX, opacity: fromOpacity });

  // start on the first day of the month
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
      gsap.from($square, { duration: 0.25, x: fromX, opacity: fromOpacity });
      var dateOfSquare = new CalendarDate(
        currentDate.getDate(),
        currentDate.getMonth(),
        currentDate.getFullYear()
      );
      var isCurrentMonth = true;
      if (dateOfSquare.month !== calendarDate.month) {
        isCurrentMonth = false;
      }
      // see if we have any data on the current day
      var dayObj = null;
      for (var k = 0; k < data.days.length; k++) {
        if (dateOfSquare.isSameDay(data.days[k].date)) {
          dayObj = data.days[k];
          break;
        }
      }

      generateHTMLCalendarDay($square, dateOfSquare, isCurrentMonth, dayObj, currentTravel);
      currentDate.setDate(dateOfSquare.day + 1);
    }
  }
}

function generateHTMLCalendarDay(square, dateObj, isCurrentMonth, dayObj, currentTravel) {
  var $heading = document.createElement('div');
  $heading.className = 'row';

  // Number
  var $numberDiv = document.createElement('div');
  $numberDiv.className = 'col-33-lg middle';

  var $number = document.createElement('button');
  $number.className = 'date';
  if (isCurrentMonth) {
    $number.classList.add('black');
    if (dateObj.day === today.day && view.month === today.month) {
      $number.classList.add('current-day');
    }
  } else {
    $number.classList.add('light-gray');
    $number.classList.add('not-clickable');
  }
  if (dateObj.isSameDay(view)) {
    $number.classList.add('selected');
  }
  $number.textContent = dateObj.day;

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
      for (var i = 0; i < weatherList.length; i++) {
        if (weatherList[i].date.day === dateObj.day && isCurrentMonth) {
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
  var travelAdded = false;
  if (dayObj) {
    if (dayObj.travel) {
      if (dayObj.travel !== data.homeTown) {
        travelAdded = true;
        if (dayObj.travel !== currentTravel.location) {
          currentTravel.location = dayObj.travel;
          var nextStyleIndex = parseInt(currentTravel.style[7]) + 1;
          currentTravel.style = 'travel-' + nextStyleIndex;
          if (nextStyleIndex === 5) {
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
          $headingSideDiv.classList.remove('calendar-date-weather-heading');
          $headingSideDiv.classList.add('calendar-date-text-heading');
          $headingSideDiv.append($travelDestination);
        }
      } else {
        dayObj.travel = '';
      }
    }
  }

  // Holiday
  for (i = 0; i < holidays.length; i++) {
    var viewingMonth = view.month;
    var viewingDay = dateObj.day;
    if (!isCurrentMonth && dateObj.day > 15) {
      viewingMonth--;
    } else if (!isCurrentMonth && dateObj.day < 15) {
      viewingMonth++;
    }
    if (holidays[i].date.datetime.month - 1 === viewingMonth && holidays[i].date.datetime.day === viewingDay) {
      $number.classList.add('pink');
      // add text if no weather or travel plans are present
      if (!weatherAdded && !travelAdded) {
        var $holidayName = document.createElement('p');
        $holidayName.className = 'calendar-date-holiday pink';
        $holidayName.textContent = holidays[i].name;
        $headingSideDiv.classList.remove('calendar-date-weather-heading');
        $headingSideDiv.classList.add('calendar-date-text-heading');
        $headingSideDiv.append($holidayName);
      }
      break;
    }
  }

  // Events
  var $body = document.createElement('div');
  $body.className = 'row';

  var $listDiv = document.createElement('div');
  $listDiv.className = 'col-100 calendar-date-events-div';

  var $list = document.createElement('ul');

  if (dayObj) {
    for (i = 0; i < 4; i++) {
      if (!dayObj.events[i]) {
        break;
      }
      var $li = document.createElement('li');
      $li.className = 'calendar-date-event';

      var $icon = document.createElement('img');
      $icon.className = 'calendar-date-event-icon';
      $icon.setAttribute('src', dayObj.events[i].svg);

      var $text = document.createElement('p');
      $text.className = 'calendar-date-event-text';
      $text.textContent = dayObj.events[i].input;

      $list.append($li);
      $li.append($icon);
      $li.append($text);
    }
  }

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
  var dayObj = null;
  if (weatherList) {
    // see if we have any data on the current day
    for (i = 0; i < data.days.length; i++) {
      if (data.days[i].date.isSameDay(calendarDate)) {
        dayObj = data.days[i];
        break;
      }
    }

    // if there is data, update the weatherList for the correct location
    if (dayObj) {
      if (dayObj.travel) {
        weatherList = weathers[dayObj.travel];
      }
    }

    if (weatherList) {
      for (i = 0; i < weatherList.length; i++) {
        if (weatherList[i].date.day === parseInt(calendarDate.day) && weatherList[i].date.month === calendarDate.month && weatherList[i].date.year === calendarDate.year) {
          generateBannerWeather($dateWeather, weatherList[i]);
          break;
        }
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

function setEventModalTime(time) {
  var timeComponents = ['hour', 'minute', 'ampm'];
  for (var i = 0; i < $eventModalTimes.length; i++) {
    for (var j = 0; j < $eventModalTimes[i].children.length; j++) {
      if (time[timeComponents[i]] === $eventModalTimes[i].children[j].value) {
        $eventModalTimes[i].children[j].setAttribute('selected', '');
      } else {
        $eventModalTimes[i].children[j].removeAttribute('selected');
      }
    }
  }
}

function populateChecklist(calendarDate) {
  if (data.days.length === 0) {
    return;
  }
  // if the current day has no data, return
  $checklist.innerHTML = '';
  var day;
  for (var i = 0; i < data.days.length; i++) {
    if (data.days[i].date.isSameDay(calendarDate)) {
      day = data.days[i];
      break;
    }
    if (i === data.days.length - 1) {
      return;
    }
  }

  // sort the events of the day
  day.events.sort((a, b) => a.weight - b.weight);

  // populate checklist
  for (i = 0; i < day.events.length; i++) {
    var $li = document.createElement('li');
    $li.className = 'row';
    $li.setAttribute('data-id', day.events[i].id);

    var $eventTextDiv = document.createElement('div');
    $eventTextDiv.className = 'col-75 event-text-div';

    var $checkButton = document.createElement('button');
    $checkButton.className = 'event-radio-button';
    if (day.events[i].checked) {
      $checkButton.classList.add('checked');
      $checkButton.classList.add('middle');
      var $checkImg = document.createElement('img');
      $checkImg.setAttribute('src', 'images/check.svg');
      $checkImg.className = 'check';
      $checkButton.append($checkImg);
    }

    var $icon = document.createElement('img');
    $icon.className = 'event-icon';
    $icon.setAttribute('src', day.events[i].svg);

    var $text = document.createElement('p');
    $text.className = 'event-text';
    $text.textContent = day.events[i].input;

    var $eventTimeEdit = document.createElement('div');
    $eventTimeEdit.className = 'col-25 event-time-edit-div';

    var $time = document.createElement('p');
    $time.className = 'event-time';
    if (day.events[i].time) {
      $time.textContent = day.events[i].time.hour + ':' + day.events[i].time.minute + day.events[i].time.ampm.toUpperCase();
    }

    var $edit = document.createElement('button');
    $edit.className = 'event-edit middle';

    var $editImage = document.createElement('img');
    $editImage.setAttribute('src', 'images/edit.svg');

    $checklist.append($li);
    $li.append($eventTextDiv);
    $li.append($eventTimeEdit);
    $eventTextDiv.append($checkButton);
    $eventTextDiv.append($icon);
    $eventTextDiv.append($text);
    $eventTimeEdit.append($time);
    $eventTimeEdit.append($edit);
    $edit.append($editImage);
  }
}

function refreshApp(calendarDate, from = null) {
  generateSquares($calendar);
  if (from) {
    if (from === 'left') {
      populateCalendar(calendarDate, -100, 0);
    } else if (from === 'right') {
      populateCalendar(calendarDate, 100, 0);
    }
  } else {
    populateCalendar(calendarDate);
  }
  populateDayBanner(calendarDate);
  populateChecklist(calendarDate);
}

function showTravelModal() {
  gsap.fromTo($travelModal, { opacity: 0 }, { duration: 0.25, opacity: 1 });
  gsap.fromTo($travelModalForm, { opacity: 0, y: 500 }, { duration: 0.25, opacity: 1, y: 0 });
  $travelModal.classList.remove('hidden');
}

function hideTravelModal() {
  gsap.fromTo($travelModal, { opacity: 1 }, { duration: 0.25, opacity: 0 });
  gsap.fromTo($travelModalForm, { opacity: 1, y: 0 }, {
    duration: 0.25,
    opacity: 0,
    y: 500,
    onComplete: function () {
      $travelModal.classList.add('hidden');
    }
  });
}

function showEventModal() {
  gsap.fromTo($eventModal, { opacity: 0 }, { duration: 0.25, opacity: 1 });
  gsap.fromTo($eventModalForm, { opacity: 0, y: 500 }, { duration: 0.25, opacity: 1, y: 0 });
  $eventModal.classList.remove('hidden');
}

function hideEventModal() {
  gsap.fromTo($eventModal, { opacity: 1 }, { duration: 0.25, opacity: 0 });
  gsap.fromTo($eventModalForm, { opacity: 1, y: 0 }, {
    duration: 0.25,
    opacity: 0,
    y: 500,
    onComplete: function () {
      $eventModal.classList.add('hidden');
    }
  });
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
  holidaysList.send();

  function handleHolidays(event) {
    holidays = holidaysList.response.response.holidays;
    data.holidaysDummy = holidays;
    refreshApp(view);
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

function getAllWeather() {
  getWeather(data.homeCoord);

  // get all travel locations
  var locations = new Set();
  for (var i = 0; i < data.days.length; i++) {
    if (data.days[i].travel) {
      locations.add(data.days[i].travel);
    }
  }

  // get coords for all locations, which will then get the weather
  var locationsList = [...locations];
  for (i = 0; i < locationsList.length; i++) {
    getCoord(locationsList[i]);
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
      getAllWeather();
    } else {
      data.coords[locationName] = new Coord(coord.response.coord.lat, coord.response.coord.lon, locationName);
      getWeather(data.coords[locationName]);
    }
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
    refreshApp(view);
  }
}
