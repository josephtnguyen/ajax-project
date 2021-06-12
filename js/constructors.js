/* global data */
/* exported CalendarDate, Weather, Coord, CalendarDay */

function CalendarDate(day, month, year) {
  this.day = day;
  this.month = month;
  this.year = year;
}

CalendarDate.prototype.isSameDay = function (calendarDate) {
  if (this.year === calendarDate.year && this.month === calendarDate.month && this.day === calendarDate.day) {
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

  this.birthdays = [];
  this.meetings = [];
  this.hangouts = [];
  this.events = [];
}

// add prototypes back to days
for (var i = 0; i < data.days.length; i++) {
  Object.setPrototypeOf(data.days[i].date, CalendarDate.prototype);
}
