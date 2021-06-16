/* exported data */
var data = {
  homeTown: '',
  homeCoord: null,
  coords: {},
  holidaysDummy: null,
  days: [],
  weatherKey: '&appid=5ff45e05a8481e8ad44a0bc795ab4ace',
  colorCounter: 1,
  eventId: 1,
  editing: false,
  editingId: 0
};

var previousData = localStorage.getItem('calendar-data');
if (previousData) {
  data = JSON.parse(previousData);
}

window.addEventListener('beforeunload', handleSave);

function handleSave(event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('calendar-data', dataJSON);
}
