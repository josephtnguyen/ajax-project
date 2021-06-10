/* exported data */
var data = {
  homeName: 'Garden Grove',
  homeTown: {
    lat: 33.7739,
    lon: -117.9415
  },
  holidaysDummy: null,
  days: []
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
