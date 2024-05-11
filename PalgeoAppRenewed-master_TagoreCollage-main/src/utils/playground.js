// const activities = [
//   {
//     staffCode: '001',
//     instituteId: 30405,
//     activity: 'Travel Check - In',
//     travelCheckInType: 1,
//     geoLocatioName:
//       '7/260, Satya Nagar, Lakshmi Nagar, Kovilambakkam, Chennai, Tamil Nadu 600117, India',
//     capturedTime: '2022-03-09T09:13:33.307',
//     distance: null,
//     coordinates: {
//       latitude: 12.9393286,
//       longitude: 80.184213,
//     },
//     subject: null,
//     fileUrls: null,
//     routeDistance: 0.0,
//     tripIdentifier: '001-Wed Mar 09 2022 17:02:60 GMT+0530 (IST)',
//   },
//   {
//     staffCode: '001',
//     instituteId: 30405,
//     activity: 'Travel Check - In',
//     travelCheckInType: 1,
//     geoLocatioName:
//       '7/260, Satya Nagar, Lakshmi Nagar, Kovilambakkam, Chennai, Tamil Nadu 600117, India',
//     capturedTime: '2022-03-09T09:13:33.307',
//     distance: null,
//     coordinates: {
//       latitude: 12.9393286,
//       longitude: 80.184213,
//     },
//     subject: null,
//     fileUrls: null,
//     routeDistance: 0.0,
//     tripIdentifier: '001-Wed Mar 09 2022 17:02:60 GMT+0530 (IST)',
//   },
//   {
//     staffCode: '001',
//     instituteId: 30405,
//     activity: 'Travel Check - In',
//     travelCheckInType: 1,
//     geoLocatioName:
//       '7/260, Satya Nagar, Lakshmi Nagar, Kovilambakkam, Chennai, Tamil Nadu 600117, India',
//     capturedTime: '2022-03-09T09:13:33.307',
//     distance: null,
//     coordinates: {
//       latitude: 12.9393286,
//       longitude: 80.184213,
//     },
//     subject: null,
//     fileUrls: null,
//     routeDistance: 0.0,
//     tripIdentifier: '001-Wed Mar 09 2022 19:02:56 GMT+0530 (IST)',
//   },
//   {
//     staffCode: '001',
//     instituteId: 30405,
//     activity: 'Travel Check - In',
//     travelCheckInType: 1,
//     geoLocatioName:
//       '7/260, Satya Nagar, Lakshmi Nagar, Kovilambakkam, Chennai, Tamil Nadu 600117, India',
//     capturedTime: '2022-03-09T09:13:33.307',
//     distance: null,
//     coordinates: {
//       latitude: 12.9393286,
//       longitude: 80.184213,
//     },
//     subject: null,
//     fileUrls: null,
//     routeDistance: 0.0,
//     tripIdentifier: '001-Wed Mar 09 2022 19:02:56 GMT+0530 (IST)',
//   },
// ];
// const groupByKey = (array, key) => {
//   return array.reduce((hash, obj) => {
//     if (obj[key] === undefined) return hash;
//     return Object.assign(hash, {
//       [obj[key]]: (hash[obj[key]] || []).concat(obj),
//     });
//   }, {});
// };
// const trips = groupByKey(activities, 'tripIdentifier');
// console.log('tripsGrouping ==', trips);
// var moment = require('moment');
// const checkIn = moment('9:00 am');
// const checkOut = moment('5:00 pm');
// const now = moment().isBetween(checkIn, checkOut);
// console.log(now);

// var dt = new Date(); //current Date that gives us current Time also

// var startTime = '09:00:00';
// var endTime = '16:00:00';

// var s = startTime.split(':');
// var dt1 = new Date(
//   dt.getFullYear(),
//   dt.getMonth(),
//   dt.getDate(),
//   parseInt(s[0]),
//   parseInt(s[1]),
//   parseInt(s[2]),
// );

// var e = endTime.split(':');
// var dt2 = new Date(
//   dt.getFullYear(),
//   dt.getMonth(),
//   dt.getDate(),
//   parseInt(e[0]),
//   parseInt(e[1]),
//   parseInt(e[2]),
// );

// console.log(
//   dt >= dt1 && dt <= dt2
//     ? 'Current time is between startTime and endTime'
//     : 'Current time is NOT between startTime and endTime',
// );
// //console.log ('dt = ' + dt  + ',  dt1 = ' + dt1 + ', dt2 =' + dt2)

// const a = 'd8:0f:99:51:73:77';

// // const ab = new Date().toISOString();
// // console.log(ab);
// const num = '200.00';

// console.log(Number(num));
// function* gen() {
//   console.log(yield 1);
//   console.log(yield 2);
//   console.log(yield 3);
// }
// const iterator = gen();
// console.log(iterator.next('a').value);
// console.log(iterator.next('b').value);
// console.log(iterator.next('c').value);

// 'use strict';
// let green;
// grnee = false;
// console.log(grnee);

// let x = ['1', '2', '15', '-7', '300'];
// console.log(x.sort());

// const f = n => (n <= 1 ? 1 : n * f(n - 1));

// console.log(f(4));

// const promises = [3, 2, 1].map(
//   d =>
//     new Promise(resolve => {
//       setTimeout(() => {
//         resolve(d);
//       }, d * 1000);
//     }),
// );
// Promise.race(promises).then(val => console.log(val));

// const nums = [1, 2, 3];

// const a = 'ate';
// const b = 'art';

// for (let i = 0; i < a.length; i++) {
//   for (let j = 0; j < b.length; j++) {
//     if (a.charAt(i) == b.charAt(j)) {
//       console.log('1');
//     }
//   }
// }
