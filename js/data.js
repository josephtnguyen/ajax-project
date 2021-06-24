/* exported data */
let data = {
  homeTown: '',
  homeCoord: null,
  coords: {},
  holidaysDummy: null,
  days: [],
  weatherKey: '&appid=2518c4e728699f8725f31dbf2865f2ff',
  colorCounter: 1,
  eventId: 1,
  editing: false,
  editingId: 0
};

const previousData = localStorage.getItem('calendar-data');
if (previousData) {
  data = JSON.parse(previousData);
}

window.addEventListener('beforeunload', handleSave);

function handleSave(event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('calendar-data', dataJSON);
}
