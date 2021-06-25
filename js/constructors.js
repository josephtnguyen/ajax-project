/* global data */
/* exported CalendarDate, Weather, Coord, CalendarDay, CalendarEvent, EventTime */

function CalendarDate(day, month, year) {
  this.day = day;
  this.month = month;
  this.year = year;
}

CalendarDate.prototype.isSameDay = function (calendarDate) {
  if (this.year === calendarDate.year && this.month === calendarDate.month && this.day.toString() === calendarDate.day.toString()) {
    return true;
  } else {
    return false;
  }
};

CalendarDate.prototype.isSameMonth = function (calendarDate) {
  if (this.year === calendarDate.year && this.month === calendarDate.month) {
    return true;
  } else {
    return false;
  }
};

function Weather(calendarDate, location, description, temp, max, min) {
  this.date = calendarDate;
  this.location = location;
  this.description = description;
  this.temp = temp;
  this.max = max;
  this.min = min;
  this.svg = '';

  if (description === 'Clear') {
    this.svg = 'images/sun.svg';
  } else if (description === 'Clouds') {
    this.svg = 'images/cloud.svg';
  } else if (description === 'Rain') {
    this.svg = 'images/cloud-with-rain.svg';
  } else if (description === 'Snow') {
    this.svg = 'images/cloud-with-snow.svg';
  }
}

function Coord(lat, lon, location = data.homeTown) {
  this.location = location;
  this.lat = lat;
  this.lon = lon;
}

function CalendarDay(calendarDate, travel = '') {
  this.date = calendarDate;
  this.travel = travel;

  this.events = [];
}

function CalendarEvent(type, input, time, id) {
  this.type = type;
  this.input = input;
  this.time = time;
  this.checked = false;
  this.weight = 0;
  this.id = id;

  if (time) {
    let timeValue = 0;
    timeValue += parseInt(time.minute);
    if (time.hour !== '12') {
      timeValue += parseInt(time.hour) * 100;
    }
    if (time.ampm === 'pm') {
      timeValue += 1200;
    }
    this.weight = timeValue * 10;
  } else if (type !== 'birthday') {
    this.weight += 100000;
  }

  if (type === 'birthday') {
    this.weight += 1;
    this.svg = 'images/birthday.svg';
  } else if (type === 'meeting') {
    this.weight += 2;
    this.svg = 'images/group.svg';
  } else if (type === 'hangout') {
    this.weight += 3;
    this.svg = 'images/friends.svg';
  } else if (type === 'event') {
    this.weight += 4;
    this.svg = 'images/calendar.svg';
  }

}

function EventTime(hour, minute, ampm) {
  this.hour = hour;
  this.minute = minute;
  this.ampm = ampm;
}

// add prototypes back to days
for (let i = 0; i < data.days.length; i++) {
  Object.setPrototypeOf(data.days[i], CalendarDay.prototype);
  Object.setPrototypeOf(data.days[i].date, CalendarDate.prototype);
}
