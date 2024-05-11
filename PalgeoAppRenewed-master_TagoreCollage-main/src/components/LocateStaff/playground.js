var moment = require('moment');

var gmtInTime = moment.utc('2021-02-05 5:45:57.867', 'YYYY-MM-DD HH:mm:ss');
var time_in = gmtInTime.local().format('h:mm A');
console.log(time_in);

var date = new Date('2021-02-05 5:45:57.867 UTC').toLocaleTimeString();
console.log(date);

// const listOfTags = [
//   {id: 1, label: 'Hello', sorting: 0},
//   {id: 2, label: 'World', sorting: 1},
//   {id: 3, label: 'Hello', sorting: 4},
//   {id: 4, label: 'Sunshine', sorting: 5},
//   {id: 5, label: 'Hello', sorting: 6},
// ];

// const uniques = Object.values(
//   listOfTags.reduce((a, c) => {
//     a[c.label] = c;
//     return a;
//   }, {}),
// );

// console.log(uniques);
