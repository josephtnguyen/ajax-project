/* exported data */
var data = {
  homeName: '',
  homeTown: {
    lat: 33.7739,
    lon: -117.9415
  },
  holidaysDummy: null,
  days: [],
  weatherKey: '&appid=5ff45e05a8481e8ad44a0bc795ab4ace'
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
