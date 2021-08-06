/* global data, gsap */
/* global CalendarDate, Weather, Coord, CalendarDay, CalendarEvent, EventTime */

const todaysDate = new Date();
const today = new CalendarDate(todaysDate.getDate(), todaysDate.getMonth(), todaysDate.getFullYear());
const view = new CalendarDate(parseInt(today.day), today.month, today.year);

let holidays = [];
const weathers = {};

const $calendarMonthYear = document.querySelector('.header-month-year');
const $calendar = document.querySelector('.calendar-squares');
const $previousMonth = document.querySelector('.left-arrow-button');
const $nextMonth = document.querySelector('.right-arrow-button');
const $dateInfoDate = document.querySelector('.date-info-date');
const $dateInfoHoliday = document.querySelector('.date-info-holiday');
const $dateInfoTravel = document.querySelector('.date-info-travel');
const $dateWeather = document.querySelector('.date-weather');

const $travelModal = document.querySelector('.travel-modal-container');
const $travelModalForm = document.querySelector('.travel-modal-form');
const $travelButton = document.querySelector('.add-travel');
const $travelModalInput = document.querySelector('.travel-modal-container .modal-input');
const $travelModalCancel = document.querySelector('.travel-button.cancel');
const $travelModalSave = document.querySelector('.travel-button.save');

const $eventModalTypeSelectors = document.querySelectorAll('button.event-modal-view');
const $eventModalTimes = document.querySelectorAll('select.event-modal-time');
const $eventModalIcons = document.querySelectorAll('.event-modal-input-icons .modal-icon');
const $eventModal = document.querySelector('.event-modal-container');
const $eventModalForm = document.querySelector('.event-modal-form');
const $eventButton = document.querySelector('.add-event');
const $eventModalCancel = document.querySelector('.event-button.cancel');
const $eventModalSave = document.querySelector('.event-button.save');
const $eventModalTypeDiv = document.querySelector('.event-modal-buttons');
const $eventModalDate = document.querySelector('.event-modal-date');
const $eventModalNone = document.querySelector('button.event-modal-time');
const $eventModalInput = document.querySelector('.event-modal-container .modal-input');
const $eventModalDelete = document.querySelector('.event-modal-delete-div');
const $checklist = document.querySelector('.checklist-div > ul');

$previousMonth.addEventListener('click', handlePrevious);
$nextMonth.addEventListener('click', handleNext);
$calendar.addEventListener('click', handleSelect);

$travelButton.addEventListener('click', handleTravelAdd);
$travelModalCancel.addEventListener('click', handleTravelCancel);
$travelModalForm.addEventListener('submit', handleTravelSubmit);
$travelModalForm.addEventListener('keydown', handleTravelEnter);

$eventButton.addEventListener('click', handleEventAdd);
$eventModalCancel.addEventListener('click', handleEventCancel);
$eventModalSave.addEventListener('click', handleEventSave);
$eventModalTypeDiv.addEventListener('click', handleEventTypeSelection);
$eventModalNone.addEventListener('click', handleEventNoTime);
$eventModalDelete.addEventListener('click', handleEventDelete);
$eventModalForm.addEventListener('submit', handleEventSubmit);
$eventModalForm.addEventListener('keydown', handleEventEnter);
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
  refreshApp(view, 'left', true);
}

function handleNext(event) {
  if (view.month === 11) {
    view.month = 0;
    view.year++;
  } else {
    view.month++;
  }
  view.day = 1;
  refreshApp(view, 'right', true);
}

function handleSelect(event) {
  if (!event.target.closest('.square')) {
    return;
  }
  const $square = event.target.closest('.square');
  const $calendarNumber = $square.querySelector('.date');
  if (!$calendarNumber.matches('.black')) {
    return;
  }

  view.day = parseInt($calendarNumber.textContent);
  refreshApp(view, null, true);
}

function handleTravelEnter(event) {
  if (event.key !== 'Enter') {
    return;
  }
  event.preventDefault();
  const pseudoEvent = event;
  pseudoEvent.submitter = $travelModalSave;
  handleTravelSubmit(pseudoEvent);
}

function handleTravelSubmit(event) {
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
  const travel = $travelModalInput.value;
  // get weather for new location
  getCoord(travel);
  let day = new CalendarDay({ ...view }, travel);
  Object.setPrototypeOf(day.date, CalendarDate.prototype);
  // if the day already exists, modify the day instead
  if (data.days.length === 0) {
    data.days.push(day);
  }
  for (let i = 0; i < data.days.length; i++) {
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
  const $destinationQuestion = $travelModalForm.querySelector('.destination-question');
  const $destinationIcon = $travelModalForm.querySelector('.destination-icon');
  const $hometownQuestion = $travelModalForm.querySelector('.hometown-question');
  const $hometownIcon = $travelModalForm.querySelector('.hometown-icon');

  $destinationQuestion.classList.remove('hidden');
  $destinationIcon.classList.remove('hidden');
  $hometownQuestion.classList.add('hidden');
  $hometownIcon.classList.add('hidden');

  showTravelModal();
}

function handleEventAdd(event) {
  $eventModalTypeSelectors[0].classList.add('modal-selected');
  $eventModalIcons[0].classList.remove('hidden');
  $eventModalInput.setAttribute('placeholder', 'New Event');
  $eventModalInput.setAttribute('value', '');
  $eventModalNone.classList.remove('modal-selected');
  $eventModalDelete.classList.add('hidden');
  for (let i = 1; i < $eventModalTypeSelectors.length; i++) {
    $eventModalTypeSelectors[i].classList.remove('modal-selected');
    $eventModalIcons[i].classList.add('hidden');
  }

  setEventModalTime(new EventTime('7', '00', 'pm'));

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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

  const placeholders = [
    'New Event',
    'Whose Birthday?',
    'New Hangout',
    'New Meeting'
  ];
  for (let i = 0; i < $eventModalTypeSelectors.length; i++) {
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

function handleEventEnter(event) {
  if (event.key !== 'Enter') {
    return;
  }
  event.preventDefault();
  const pseudoEvent = event;
  pseudoEvent.submitter = $eventModalSave;
  handleEventSubmit(pseudoEvent);
}

function handleEventSave(event) {
  event.preventDefault();
  const pseudoEvent = event;
  pseudoEvent.submitter = $eventModalSave;
  handleEventSubmit(pseudoEvent);
}

function handleEventSubmit(event) {
  event.preventDefault();

  // create a CalendarDay
  let day = new CalendarDay({ ...view });
  Object.setPrototypeOf(day.date, CalendarDate.prototype);
  // if a CalendarDay already exists, modify it instead
  if (data.days.length === 0) {
    data.days.push(day);
  }
  for (let i = 0; i < data.days.length; i++) {
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
  let type = 'event';
  for (const $selector of $eventModalTypeSelectors) {
    if ($selector.matches('.modal-selected')) {
      type = $selector.textContent.toLowerCase();
      break;
    }
  }

  // find the time if available
  let time = null;
  if (!$eventModalNone.classList.contains('modal-selected')) {
    time = new EventTime($eventModalTimes[0].value, $eventModalTimes[1].value, $eventModalTimes[2].value);
  }

  // create a CalendarEvent or update current event
  if (data.editing) {
    for (let calendarEvent of day.events) {
      if (calendarEvent.id === data.editingId) {
        calendarEvent = new CalendarEvent(type, $eventModalInput.value, time, data.editingId);
        data.editing = false;
        break;
      }
    }
  } else {
    const calendarEvent = new CalendarEvent(type, $eventModalInput.value, time, data.eventId);
    data.eventId++;
    day.events.push(calendarEvent);
  }

  // sort the events of the day
  day.events.sort((a, b) => a.weight - b.weight);

  refreshApp(view, null, true);

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
  let day;
  for (const calendarDay of data.days) {
    if (view.isSameDay(calendarDay.date)) {
      day = calendarDay;
      break;
    }
  }

  // find the event to edit
  let eventListing;
  const eventId = parseInt(event.target.closest('.row').getAttribute('data-id'));
  data.editingId = eventId;
  for (const calendarEvent of day.events) {
    if (calendarEvent.id === eventId) {
      eventListing = calendarEvent;
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
  const placeholders = [
    'New Event',
    'Whose Birthday?',
    'New Hangout',
    'New Meeting'
  ];
  for (let i = 0; i < $eventModalTypeSelectors.length; i++) {
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
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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

  let searching = true;
  for (let i = 0; i < data.days.length; i++) {
    for (let j = 0; j < data.days[i].events.length; j++) {
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
  refreshApp(view, null, true);
  hideEventModal();
  $eventModalInput.setAttribute('value', '');
  $eventModalForm.reset();
}

// General Functions
function generateSquares(calendar) {
  calendar.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const $row = document.createElement('div');
    $row.className = 'row';
    for (let j = 0; j < 7; j++) {
      const $square = document.createElement('div');
      $square.className = 'col-14 square';
      $row.append($square);
    }
    calendar.append($row);
  }
}

function populateCalendar(calendarDate, fromX = 0, fromOpacity = 1) {
  // update header
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $calendarMonthYear.children[0].textContent = months[calendarDate.month];
  $calendarMonthYear.children[1].textContent = calendarDate.year;
  gsap.from($calendarMonthYear, { duration: 0.25, x: fromX, opacity: fromOpacity });

  // start on the first day of the month
  const currentDate = new Date(calendarDate.year, calendarDate.month, 1);
  // wind back to Sunday
  const firstDay = currentDate.getDay();
  for (let dayOfWeek = firstDay; dayOfWeek > 0; dayOfWeek--) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // loop through all squares
  const currentTravel = { location: data.homeTown, style: 'travel-1' };
  for (let i = 0; i < $calendar.children.length; i++) {
    for (let j = 0; j < 7; j++) {
      const $square = $calendar.children[i].children[j];
      gsap.from($square, { duration: 0.25, x: fromX, opacity: fromOpacity });
      const dateOfSquare = new CalendarDate(
        currentDate.getDate(),
        currentDate.getMonth(),
        currentDate.getFullYear()
      );
      let isCurrentMonth = true;
      if (dateOfSquare.month !== calendarDate.month) {
        isCurrentMonth = false;
      }
      // see if we have any data on the current day
      let dayObj = null;
      for (const calendarDay of data.days) {
        if (dateOfSquare.isSameDay(calendarDay.date)) {
          dayObj = calendarDay;
          break;
        }
      }

      generateHTMLCalendarDay($square, dateOfSquare, isCurrentMonth, dayObj, currentTravel);
      currentDate.setDate(dateOfSquare.day + 1);
    }
  }
}

function generateHTMLCalendarDay(square, dateObj, isCurrentMonth, dayObj, currentTravel) {
  const $heading = document.createElement('div');
  $heading.className = 'row';

  // Number
  const $numberDiv = document.createElement('div');
  $numberDiv.className = 'col-33-lg middle';

  const $number = document.createElement('button');
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
  const $headingSideDiv = document.createElement('div');
  $headingSideDiv.className = 'col-66-lg calendar-date-weather-heading';

  let weatherAdded = false;
  let weatherList = weathers[data.homeTown];
  if (weatherList) {
    if (view.isSameMonth(today)) {
      // get other weather if traveling
      if (dayObj) {
        if (dayObj.travel) {
          for (const location in weathers) {
            if (location === dayObj.travel) {
              weatherList = weathers[location];
              break;
            }
          }
        }
      }
      // find the correct day in weatherList and fill in the DOM
      for (let i = 0; i < weatherList.length; i++) {
        if (weatherList[i].date.day === dateObj.day && isCurrentMonth) {
          const $weatherIcon = document.createElement('img');
          $weatherIcon.className = 'calendar-date-weather-icon';
          $weatherIcon.setAttribute('src', weatherList[i].svg);

          const $weatherTemp = document.createElement('h3');
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
  let travelAdded = false;
  if (dayObj) {
    if (dayObj.travel) {
      if (dayObj.travel !== data.homeTown) {
        travelAdded = true;
        if (dayObj.travel !== currentTravel.location) {
          currentTravel.location = dayObj.travel;
          const nextStyleIndex = parseInt(currentTravel.style[7]) + 1;
          currentTravel.style = 'travel-' + nextStyleIndex;
          if (nextStyleIndex === 5) {
            currentTravel.style = 'travel-1';
          }
        }
        square.classList.add(currentTravel.style);
        $number.classList.add(currentTravel.style);

        // add text if no weather is present
        if (!weatherAdded) {
          const $travelDestination = document.createElement('p');
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
  for (let i = 0; i < holidays.length; i++) {
    const viewingDay = dateObj.day;
    let viewingMonth = view.month;
    if (!isCurrentMonth && dateObj.day > 15) {
      viewingMonth--;
    } else if (!isCurrentMonth && dateObj.day < 15) {
      viewingMonth++;
    }
    if (holidays[i].date.datetime.month - 1 === viewingMonth && holidays[i].date.datetime.day === viewingDay) {
      $number.classList.add('pink');
      // add text if no weather or travel plans are present
      if (!weatherAdded && !travelAdded) {
        const $holidayName = document.createElement('p');
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
  const $body = document.createElement('div');
  $body.className = 'row';

  const $listDiv = document.createElement('div');
  $listDiv.className = 'col-100 calendar-date-events-div';

  const $list = document.createElement('ul');

  if (dayObj) {
    for (let i = 0; i < 4; i++) {
      if (!dayObj.events[i]) {
        break;
      }
      const $li = document.createElement('li');
      $li.className = 'calendar-date-event';

      const $icon = document.createElement('img');
      $icon.className = 'calendar-date-event-icon';
      $icon.setAttribute('src', dayObj.events[i].svg);

      const $text = document.createElement('p');
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

function populateDayBanner(calendarDate, fromX = 0, fromOpacity = 1) {
  // update Date Info
  gsap.from($dateInfoDate, { duration: 0.25, x: fromX, opacity: fromOpacity });
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $dateInfoDate.children[0].textContent = months[calendarDate.month];
  $dateInfoDate.children[1].textContent = calendarDate.day;
  $dateInfoDate.children[2].textContent = calendarDate.year;

  // update holiday
  gsap.from($dateInfoHoliday, { duration: 0.25, x: fromX, opacity: fromOpacity });
  $dateInfoHoliday.textContent = '';
  for (const holiday of holidays) {
    if (holiday.date.datetime.month - 1 === calendarDate.month && holiday.date.datetime.day === parseInt(calendarDate.day)) {
      $dateInfoHoliday.textContent = holiday.name;
      break;
    }
  }

  // update travel
  gsap.from($dateInfoTravel, { duration: 0.25, x: fromX, opacity: fromOpacity });
  $dateInfoTravel.textContent = '';
  for (const calendarDay of data.days) {
    if (calendarDay.date.isSameDay(calendarDate)) {
      $dateInfoTravel.textContent = calendarDay.travel;
      break;
    }
  }

  // update weather
  gsap.from($dateWeather, { duration: 0.25, x: fromX, opacity: fromOpacity });
  $dateWeather.innerHTML = '';
  let weatherList = weathers[data.homeTown];
  let dayObj = null;
  if (weatherList) {
    // see if we have any data on the current day
    for (const calendarDay of data.days) {
      if (calendarDay.date.isSameDay(calendarDate)) {
        dayObj = calendarDay;
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
      for (const weather of weatherList) {
        if (weather.date.day === parseInt(calendarDate.day) && weather.date.month === calendarDate.month && weather.date.year === calendarDate.year) {
          generateBannerWeather($dateWeather, weather);
          break;
        }
      }
    }
  }

}

function generateBannerWeather(weatherDiv, weather) {
  const $icon = document.createElement('img');
  $icon.className = 'date-weather-icon';
  $icon.setAttribute('src', weather.svg);

  const $mainTemp = document.createElement('h1');
  $mainTemp.className = 'date-weather-main-temp';
  $mainTemp.textContent = weather.temp + '\u00B0';

  const $sideTemp = document.createElement('div');
  $sideTemp.className = 'date-weather-side-temp';

  const $high = document.createElement('p');
  $high.className = 'no-margin';
  $high.textContent = 'High: ' + weather.max + '\u00B0';

  const $low = document.createElement('p');
  $low.className = 'no-margin';
  $low.textContent = 'Low: ' + weather.min + '\u00B0';

  weatherDiv.append($icon);
  weatherDiv.append($mainTemp);
  weatherDiv.append($sideTemp);
  $sideTemp.append($high);
  $sideTemp.append($low);
}

function setEventModalTime(time) {
  const timeComponents = ['hour', 'minute', 'ampm'];
  for (let i = 0; i < $eventModalTimes.length; i++) {
    for (let j = 0; j < $eventModalTimes[i].children.length; j++) {
      if (time[timeComponents[i]] === $eventModalTimes[i].children[j].value) {
        $eventModalTimes[i].children[j].setAttribute('selected', '');
      } else {
        $eventModalTimes[i].children[j].removeAttribute('selected');
      }
    }
  }
}

function populateChecklist(calendarDate, fromX = 0, fromOpacity = 1) {
  if (data.days.length === 0) {
    return;
  }
  // if the current day has no data, return
  $checklist.innerHTML = '';
  let day;
  for (let i = 0; i < data.days.length; i++) {
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
  let waitTime = 0;
  for (let i = 0; i < day.events.length; i++) {
    const $li = document.createElement('li');
    gsap.from($li, { duration: 0.25, x: fromX, opacity: fromOpacity, delay: waitTime });
    waitTime += 0.05;
    $li.className = 'row';
    $li.setAttribute('data-id', day.events[i].id);

    const $eventTextDiv = document.createElement('div');
    $eventTextDiv.className = 'col-75 event-text-div';

    const $checkButton = document.createElement('button');
    $checkButton.className = 'event-radio-button';
    if (day.events[i].checked) {
      $checkButton.classList.add('checked');
      $checkButton.classList.add('middle');
      const $checkImg = document.createElement('img');
      $checkImg.setAttribute('src', 'images/check.svg');
      $checkImg.className = 'check';
      $checkButton.append($checkImg);
    }

    const $icon = document.createElement('img');
    $icon.className = 'event-icon';
    $icon.setAttribute('src', day.events[i].svg);

    const $text = document.createElement('p');
    $text.className = 'event-text';
    $text.textContent = day.events[i].input;

    const $eventTimeEdit = document.createElement('div');
    $eventTimeEdit.className = 'col-25 event-time-edit-div';

    const $time = document.createElement('p');
    $time.className = 'event-time';
    if (day.events[i].time) {
      $time.textContent = day.events[i].time.hour + ':' + day.events[i].time.minute + day.events[i].time.ampm.toUpperCase();
    }

    const $edit = document.createElement('button');
    $edit.className = 'event-edit middle';

    const $editImage = document.createElement('img');
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

function refreshApp(calendarDate, calendarDirection = null, newSelection) {
  generateSquares($calendar);

  if (calendarDirection) {
    if (calendarDirection === 'left') {
      populateCalendar(calendarDate, -100, 0);
    } else if (calendarDirection === 'right') {
      populateCalendar(calendarDate, 100, 0);
    } else {
      populateCalendar(calendarDate);
    }
  } else {
    populateCalendar(calendarDate);
  }

  if (newSelection) {
    populateDayBanner(calendarDate, 100, 0);
    populateChecklist(calendarDate, 100, 0);
  } else {
    populateDayBanner(calendarDate);
    populateChecklist(calendarDate);
  }
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
  const holidaysList = new XMLHttpRequest();
  const holidayKey = '?api_key=89c4f0216fb3240f31be20bc4f84aee739d99cda';
  const holidayCountry = '&country=US';
  const holidayYear = '&year=' + year;
  const holidayType = '&type=national';

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
  const locations = new Set();
  for (let i = 0; i < data.days.length; i++) {
    if (data.days[i].travel) {
      locations.add(data.days[i].travel);
    }
  }

  // get coords for all locations, which will then get the weather
  const locationsList = [...locations];
  for (let i = 0; i < locationsList.length; i++) {
    getCoord(locationsList[i]);
  }
}

function getCoord(locationName) {
  const coord = new XMLHttpRequest();
  const weatherKey = data.weatherKey;
  const weatherUnits = '&units=imperial';
  const weatherLocation = '?q=' + locationName;

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
  const weather = new XMLHttpRequest();
  const weatherKey = data.weatherKey;
  const weatherUnits = '&units=imperial';
  const weatherLocation = '?lat=' + coord.lat + '&lon=' + coord.lon;

  weather.open('GET', 'https://api.openweathermap.org/data/2.5/onecall' + weatherLocation + weatherUnits + weatherKey);
  weather.responseType = 'json';
  weather.addEventListener('load', handleWeather);
  weather.send();

  function handleWeather(event) {
    const weatherList = weather.response.daily;
    const finalData = [];
    for (let i = 0; i < weatherList.length; i++) {
      const weatherData = weatherList[i];
      const weatherObj = new Weather(
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
