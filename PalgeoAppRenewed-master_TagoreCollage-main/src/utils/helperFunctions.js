import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import Const from '../components/common/Constants';
import RNLocation from 'react-native-location';
import axios from 'axios';
import Geocoder from 'react-native-geocoding';
import moment from 'moment';
import WifiManager from 'react-native-wifi-reborn';
import {
  GOOGLE_MAPS_APIKEY,
  GOOGLE_MAPS_APIKEY_IOS,
  isIOS,
} from './configs/Constants';
//import GoogleFit, {Scopes} from 'react-native-google-fit';
import BleManager from 'react-native-ble-manager';
import GPSState from 'react-native-gps-state';
import NetInfo from '@react-native-community/netinfo';
import { Alert, AppState } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { PermissionsAndroid } from 'react-native';
import { tokenApi } from './apis';
import BackgroundGeolocation from 'react-native-background-geolocation';
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';

var geolib = require('geolib');

export const getAssignedLocations = async () => {
  try {
    const institute_id = await AsyncStorage.getItem('institute_id');
    const user_id = await AsyncStorage.getItem('user_id');
    console.log('institute_id and user_id', institute_id, user_id);
    if (user_id && institute_id) {
      const response = await fetch(
        Const + 'api/Staff/information/' + institute_id + '/' + user_id,
        {
          method: 'GET',
          headers: {
            Accept: 'text/plain',
            'content-type': 'application/json-patch+json',
          },
        },
      );
      const json = await response.json();
      if (json.status) {
        const locations = json.assignedLocations.filter(
          assLoc => assLoc.type === 'Circle',
        );
        console.log('locations', locations.length);
        await AsyncStorage.setItem('locations', JSON.stringify(locations));
        return json.assignedLocations;
      }
    }
  } catch (error) {
    console.log(error, 'error to add boundaries');
    return error;
  }
};
export const getBeaconLocations = async () => {
  try {
    const institute_id = await AsyncStorage.getItem('institute_id');
    const user_id = await AsyncStorage.getItem('user_id');
    console.log('institute_id and user_id', institute_id, user_id);
    if (user_id && institute_id) {
      const response = await fetch(
        Const + 'api/Staff/information/' + institute_id + '/' + user_id,
        {
          method: 'GET',
          headers: {
            Accept: 'text/plain',
            'content-type': 'application/json-patch+json',
          },
        },
      );
      const json = await response.json();
      if (json.status) {
        const locations = json.assignedLocations.filter(
          assLoc => assLoc.type === 'beacon',
        );

        return locations;
      }
    }
  } catch (error) {
    console.log(error, 'error to add boundaries');
    return error;
  }
};

export const getWifiLocations = async () => {
  try {
    const institute_id = await AsyncStorage.getItem('institute_id');
    const user_id = await AsyncStorage.getItem('user_id');
    //console.log('institute_id and user_id', institute_id, user_id);
    if (user_id && institute_id) {
      const response = await fetch(
        Const + 'api/Staff/information/' + institute_id + '/' + user_id,
        {
          method: 'GET',
          headers: {
            Accept: 'text/plain',
            'content-type': 'application/json-patch+json',
          },
        },
      );
      //console.log('resonse', JSON.stringify(response, null, 2));
      const json = await response.json();
      if (json.status) {
        const locations = json.assignedLocations.filter(
          assLoc => assLoc.type === 'wifi',
        );
        return locations;
      }
    }
  } catch (error) {
    console.log(error, 'error to add boundaries');
    return error;
  }
};

export const addBoundaries = async (user_id, institute_id) => {
  if (user_id) {
    try {
      const response = await fetch(
        Const + 'api/Staff/information/' + institute_id + '/' + user_id,
        {
          method: 'GET',
          headers: {
            Accept: 'text/plain',
            'content-type': 'application/json-patch+json',
          },
        },
      );
      const json = await response.json();
      if (json.status) {
        console.log('LOCATIONS ==>', json.assignedLocations.length);

        const locations = json.assignedLocations.filter(
          location =>
            location.accessLocation !== 'Travel Check In' &&
            location.type === 'Circle',
        );
        const wifiLocations = json.assignedLocations.filter(
          location => location.type === 'wifi',
        );
        console.log('wifiLocations', wifiLocations);
        const geofences = locations.map(geofence => {
          return {
            identifier: geofence.id.toString(),
            radius: geofence.radius,
            latitude: geofence.coordinates[0].latitude,
            longitude: geofence.coordinates[0].longitude,
            notifyOnEntry: true,
            notifyOnExit: true,
            loiteringDelay: 3000,
            notifyOnDwell: true,
            extras: {
              route_id: geofence.id,
            },
          };
        });
        if (locations.length > 0) {
          BackgroundGeolocation.addGeofences(geofences)
            .then(success => console.log(success))
            .catch(e => console.log(e));
        }
        console.log("=============================================")
        console.log('filteredLocations', locations);
        await AsyncStorage.setItem('locations', JSON.stringify(locations));
        await AsyncStorage.setItem(
          'wifiLocations',
          JSON.stringify(wifiLocations),
        );
        await AsyncStorage.setItem(
          'locationsAll',
          JSON.stringify(json.assignedLocations),
        );
      }
    } catch (error) {
      console.log(error, 'error to add boundaries');
      return;
    }
  }
};

export const addTask = () => {
  const INTERVAL = 60000 * 5;
  RNLocation.configure({
    distanceFilter: 0, // Meters
    desiredAccuracy: {
      ios: 'best',
      android: 'balancedPowerAccuracy',
    },
    // Android only
    androidProvider: 'auto',
    interval: INTERVAL, // Milliseconds
    fastestInterval: INTERVAL, // Milliseconds
    maxWaitTime: 5000, // Milliseconds
    // iOS Only
    activityType: 'other',
    allowsBackgroundLocationUpdates: false,
    headingFilter: 1, // Degrees
    headingOrientation: 'portrait',
    pausesLocationUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: false,
  });
  let locationSubscription = null;
  let locationTimeout = null;
  // if (run) {
  if (ReactNativeForegroundService.is_task_running('taskid')) return;
  //}
  ReactNativeForegroundService.add_task(
    async () => {
      RNLocation.requestPermission({
        ios: 'whenInUse',
        android: {
          detail: 'fine',
        },
      })
        .then(async granted => {
          // if has permissions try to obtain location with RN location
          if (granted) {
            locationSubscription && locationSubscription();
            locationSubscription = RNLocation.subscribeToLocationUpdates(
              async position => {
                console.log('pos', position);
                const gpsCount = await AsyncStorage.getItem('gpsCount');
                const status = await GPSState.getStatus();
                console.log('background status_GPS', status);
                console.log('Location Permissions: ', granted);
                if (status === 3 || status === 4) {
                  console.log('Permission is  given');
                  AsyncStorage.setItem('gpsCount', '0');
                } else {
                  if (gpsCount === '0') {
                    if (AppState.currentState === 'active') {
                      Alert.alert(
                        'Refresh GPS services',
                        'It is recommended that you refresh your GPS services. Do you want to open location settings?',
                        [
                          {
                            text: 'Open Settings',
                            onPress: () => GPSState.openLocationSettings(),
                          },
                          { text: 'Later', onPress: () => { } },
                        ],
                        { cancelable: true },
                      );
                    } else {
                      GPSState.openLocationSettings();
                    }
                    if (AppState.currentState === 'background') {
                      return;
                    }
                    try {
                      const StaffNo = await AsyncStorage.getItem('user_id');
                      const institute_id = await AsyncStorage.getItem(
                        'institute_id',
                      );

                      axios
                        .post(Const + 'api/Staff/MobileGpsOnOrOff', {
                          StaffCode: StaffNo,
                          InstituteId: Number(institute_id),
                          IsGpsOn: false,
                          // status === GPSState.NOT_DETERMINED ||
                          // status === GPSState.DENIED ||
                          // status === GPSState.RESTRICTED
                          //   ? false
                          //   : true,
                        })
                        .then(response =>
                          AsyncStorage.setItem('gpsCount', '1'),
                        );
                    } catch (error) {
                      console.log('error_NET_ON_GPSERROR ==>', error);
                    }
                  }
                }
                locationSubscription();
                locationTimeout && clearTimeout(locationTimeout);

                const task = ReactNativeForegroundService.get_task('taskid');
                if (task && AppState.currentState !== 'active') {
                  await update_task();
                }
                let count = await AsyncStorage.getItem('count');
                const StaffNo = await AsyncStorage.getItem('user_id');
                const institute_id = await AsyncStorage.getItem('institute_id');
                const locations = JSON.parse(
                  await AsyncStorage.getItem('locations'),
                );
                //console.log('locations', locations);

                // New method for entry and exit triggers:
                // check 1:
                let checkedInLocation = await AsyncStorage.getItem('geo_id');
                const geoLocation = await AsyncStorage.getItem('geo_location');
                const isFaceRequired = await AsyncStorage.getItem(
                  'isFaceRequired',
                );
                const bearer_token = await AsyncStorage.getItem('bearer_token');
                const device_token = await AsyncStorage.getItem('device_token');
                const checked_out = (await getStatus(
                  bearer_token,
                  StaffNo,
                  institute_id,
                ))
                  ? 'no'
                  : 'yes';
                const current_travel_checkin = await AsyncStorage.getItem(
                  'current_travel_checkin',
                );
                const running_status = await AsyncStorage.getItem(
                  'running_status',
                );
                const coordinates = JSON.parse(
                  await AsyncStorage.getItem('coordinates'),
                );
                const googleFit = await AsyncStorage.getItem('googleFit');
                const radius = await AsyncStorage.getItem('radius');
                let idealCount = await AsyncStorage.getItem('idealCount');
                const distanceIdeal = await AsyncStorage.getItem(
                  'distanceIdeal',
                );
                const CheckInIdealTime = await AsyncStorage.getItem(
                  'CheckInIdealTime',
                );
                const TravelCheckInIdealTime = await AsyncStorage.getItem(
                  'TravelCheckInIdealTime',
                );
                const startIdealTime = await AsyncStorage.getItem(
                  'startIdealTime',
                );
                const IsCheckInIdeal = await AsyncStorage.getItem(
                  'IsCheckInIdeal',
                );
                const IsTravelCheckInIdeal = await AsyncStorage.getItem(
                  'IsTravelCheckInIdeal',
                );

                const checkInType = await AsyncStorage.getItem('checkInType');

                if (geoLocation === 'Travel Check In') {
                  checkedInLocation = '';
                }
                if (
                  geoLocation &&
                  geoLocation.startsWith('Beacon') &&
                  AppState.currentState !== 'active'
                ) {
                  setTimeout(() => {
                    BleManager.stopScan().then(() => {
                      // Success code
                      console.log('Scan stopped');
                      BleManager.getDiscoveredPeripherals()
                        .then(beacons => {
                          let headers = {
                            'Content-Type': 'application/json; charset=utf-8',
                            Authorization:
                              'Basic OGZjMzY1Y2MtN2MwYi00MTc4LWFlNmMtMWE0NzkxYzQ3ZTIz',
                          };

                          let endpoint =
                            'https://onesignal.com/api/v1/notifications';

                          let params = {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({
                              app_id: 'cb52438d-c790-46e4-83de-effe08725aff',
                              contents: {
                                en:
                                  'You have successfully entered the beacon: ' +
                                  beacons[0].name,
                              },
                              include_player_ids: [device_token],
                              headings: { en: 'Palgeo' },
                              content_available: true,
                            }),
                          };

                          if (beacon_id !== beacons[0].id) {
                            fetch(endpoint, params).then(res => {
                              //nothing to do
                            });
                          }
                        })
                        .catch(e => console.log('errrrrr', e));
                    });
                  }, 5000);
                  BleManager.scan([], 5, true)
                    .then(() => {
                      console.log('scanning in background ...');
                    })
                    .catch(e => console.log(e));
                }

                console.log('GEO_ID_CHECKED_IN ==>', checkedInLocation);
                // alert(
                //   'CURRENT_Location ==>' +
                //     geoLocation +
                //     '(' +
                //     checkedInLocation +
                //     ')' +
                //     'with accuracy ' +
                //     position[0].accuracy.toString(),
                // );

                // alert('Accuracy ==>' + position[0].accuracy);

                if (checked_out === 'no') {
                  //const status = await GPSState.getStatus();

                  // }

                  console.log(
                    'googleFit ==>',
                    googleFit,
                    IsCheckInIdeal,
                    IsTravelCheckInIdeal,
                  );
                  if (
                    googleFit === 'true' &&
                    (IsCheckInIdeal === 'true' ||
                      IsTravelCheckInIdeal === 'true')
                  ) {
                    // GoogleFit.getDailySteps().then((steps) =>{
                    //     const value = steps.find(step => step.source === 'com.google.android.gms:estimated_steps')
                    //     console.log('value', value.steps)

                    // })
                    let statusTravel =
                      current_travel_checkin === 'running' ? true : false;
                    let time = 0;
                    const THRESHOLD_DISTANCE = 50;
                    if (current_travel_checkin === 'running') {
                      if (IsTravelCheckInIdeal === 'true') {
                        time = TravelCheckInIdealTime;
                      }
                    } else {
                      if (IsCheckInIdeal === 'true') {
                        time = CheckInIdealTime;
                      }
                    }
                    console.log('time ==', time);
                    var start = new Date();
                    start.setUTCHours(0, 0, 0, 0);

                    var end = new Date(start.getTime());
                    end.setUTCHours(23, 59, 59, 999);
                    const opt = {
                      startDate: start,
                      endDate: end,
                      // startDate: moment().format('YYYY-MM-DDT00:00:00.000Z'), // required
                      // endDate: moment().format('YYYY-MM-DDT23:59:59.999Z'), // required
                      //bucketUnit: "MINUTE", // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
                      //bucketInterval: 1, // optional - default 1.
                    };
                    console.log('options', opt);
                    try {
                      const distanceArray =
                        await GoogleFit.getDailyDistanceSamples(opt);
                      const { distance } = distanceArray[0];
                      console.log('dis ==', distance);
                      idealCount = Number(idealCount) + 1;
                      console.log('idealCount ==', idealCount);

                      if (idealCount === 1)
                        await AsyncStorage.setItem(
                          'startIdealTime',
                          new Date().toUTCString(),
                        );
                      await AsyncStorage.setItem(
                        'idealCount',
                        idealCount.toString(),
                      );
                      if (!distanceIdeal) {
                        await AsyncStorage.setItem(
                          'distanceIdeal',
                          distance.toString(),
                        );
                        return;
                      }
                      console.log('distanceIdeal ==', distanceIdeal);
                      //await AsyncStorage.setItem('distanceIdeal', distance.toString())
                      let diff = Number(distance) - Number(distanceIdeal);
                      if (diff >= THRESHOLD_DISTANCE) {
                        if (Number(idealCount) >= time) {
                          const endIdealTime = new Date().toUTCString();
                          await AsyncStorage.setItem('idealCount', '0');
                          await AsyncStorage.removeItem('distanceIdeal');
                          const status = await updateIdleTime(
                            StaffNo,
                            institute_id,
                            startIdealTime,
                            endIdealTime,
                            idealCount,
                            statusTravel,
                          );
                          console.log('status', status);
                        } else {
                          await AsyncStorage.setItem('idealCount', '0');
                          await AsyncStorage.removeItem('distanceIdeal');
                        }
                      }
                    } catch (e) {
                      console.log(e);
                    }
                  }
                }

                // if (Number(position[0].accuracy) >= 40) {
                //   return;
                // }

                const coordinatess = {
                  latitude: parseFloat(position[0].latitude),
                  longitude: parseFloat(position[0].longitude),
                  accuracy: parseFloat(position[0].accuracy),
                };
                // if(checked_out !== 'yes'){
                await AsyncStorage.setItem(
                  'userCurrentLocation',
                  JSON.stringify(coordinatess),
                );
                console.log('coordinates ==', coordinatess);
                const json = await staffCurrentLocation(
                  bearer_token,
                  institute_id,
                  StaffNo,
                  coordinatess,
                );
                console.log('json_location_current', json);
                // }
                if (current_travel_checkin == 'running') {
                  // if (Number(position[0].accuracy) >= 40) {
                  //   return;
                  // }
                  const travelLoc = await travelCheckCurrentLocation(
                    bearer_token,
                    institute_id,
                    StaffNo,
                    coordinatess,
                  );
                  console.log('travelCheckin location updated');
                  const travelLocations = JSON.parse(
                    await AsyncStorage.getItem('travelLocations'),
                  );
                  if (travelLocations?.length > 0) {
                    travelLocations.forEach(async location => {
                      console.log('travel==>', location);
                      console.log('current==>', position[0]);
                      // const distance = geolib.getDistance(
                      //   {
                      //     latitude: parseFloat(position[0].latitude),
                      //     longitude: parseFloat(position[0].longitude),
                      //   },
                      //   {
                      //     latitude: parseFloat(location.latitude),
                      //     longitude: parseFloat(location.longitude),
                      //   },
                      // );
                      const point = geolib.isPointWithinRadius(
                        {
                          latitude: parseFloat(position[0].latitude),
                          longitude: parseFloat(position[0].longitude),
                        },
                        {
                          latitude: parseFloat(location.latitude),
                          longitude: parseFloat(location.longitude),
                        },
                        100,
                      );
                      console.log('object', point);
                      //console.log('distance', distance);
                      if (!point) {
                        return;
                        // alert(
                        //   'You are not in location ' +
                        //     location.accessLocation,
                        // );
                      }
                      //alert('You entered your appointed location');

                      let headers = {
                        'Content-Type': 'application/json; charset=utf-8',
                        Authorization:
                          'Basic OGZjMzY1Y2MtN2MwYi00MTc4LWFlNmMtMWE0NzkxYzQ3ZTIz',
                      };

                      let endpoint =
                        'https://onesignal.com/api/v1/notifications';

                      let params = {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify({
                          app_id: 'cb52438d-c790-46e4-83de-effe08725aff',
                          contents: {
                            en:
                              'You have successfully entered the location ' +
                              location.address,
                          },
                          include_player_ids: [device_token],
                          headings: { en: 'Palgeo' },
                          content_available: true,
                        }),
                      };

                      fetch(endpoint, params).then(res => {
                        const locations = travelLocations.filter(
                          loc => loc.id !== location.id,
                        );
                        AsyncStorage.setItem(
                          'travelLocations',
                          JSON.stringify(locations),
                        );
                      });

                      // OneSignal.postNotification(
                      //   jsonString,
                      //   (success) => {
                      //     console.log('Success:', success);
                      //   },
                      //   (error) => {
                      //     console.log('Error:', error);
                      //   },
                      // );
                    });
                  }
                }

                // if (checked_out === 'no' && checkInType === 'beacon') {
                //   await BleManager.start();
                //   await BleManager.scan([], 5, true);
                //   BleManager.connect('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX')
                //     .then(() => {
                //       // Success code
                //       console.log('Connected');
                //     })
                //     .catch(error => {
                //       // Failure code
                //       // API call for exit
                //       console.log(error);
                //     });

                //   return;
                // }

                if (checkedInLocation == '' || !checkedInLocation) {
                  if (locations?.length > 0) {
                    locations.forEach(async location => {
                      const marginedRadius =
                        Number(position[0].accuracy) >= Number(location.radius)
                          ? Number(location.radius) +
                          Number(position[0].accuracy)
                          : Number(location.radius);
                      const point = geolib.isPointWithinRadius(
                        {
                          latitude: parseFloat(position[0].latitude),
                          longitude: parseFloat(position[0].longitude),
                        },
                        {
                          latitude: parseFloat(
                            location.coordinates[0].latitude,
                          ),
                          longitude: parseFloat(
                            location.coordinates[0].longitude,
                          ),
                        },
                        marginedRadius,
                      );
                      console.log('object', point);
                      if (!point) {
                        return;
                        // alert(
                        //   'You are not in location ' +
                        //     location.accessLocation,
                        // );
                      }
                      await AsyncStorage.setItem(
                        'geo_id',
                        location.id.toString(),
                      );
                      await AsyncStorage.setItem(
                        'geo_location',
                        location.accessLocation,
                      );
                      await AsyncStorage.setItem(
                        'coordinates',
                        JSON.stringify(location.coordinates),
                      );
                      await AsyncStorage.setItem(
                        'radius',
                        location.radius.toString(),
                      );

                      if (isFaceRequired === 'false') {
                        let uploadData1 = new FormData();

                        //uploadData.append('file', {uri: '', name: 'photo.png', type: 'image/png'});
                        //uploadData.append('file', uri);
                        uploadData1.append('StaffNo', StaffNo);
                        uploadData1.append('File', '');
                        uploadData1.append('InstituteId', institute_id);
                        uploadData1.append('FaceValidationMandatory', false);
                        uploadData1.append(
                          'AccessLocationId',
                          Number(location.id),
                        );
                        try {
                          const response = await axios({
                            method: 'post',
                            url: Const + 'api/Staff/StaffFaceCheckIn',
                            data: uploadData1,
                            headers: { 'Content-Type': 'multipart/form-data' },
                          });
                          const json = response.data;
                          console.log('CHECKIN', json);
                          if (json.status) {
                            await AsyncStorage.setItem('checked_out', 'no');
                            await AsyncStorage.setItem('count', '0');
                            await AsyncStorage.setItem('gpsCount', '0');
                            await AsyncStorage.setItem(
                              'actualCheckInTime',
                              new Date().toLocaleTimeString(),
                            );
                            let headers = {
                              'Content-Type': 'application/json; charset=utf-8',
                              Authorization:
                                'Basic OGZjMzY1Y2MtN2MwYi00MTc4LWFlNmMtMWE0NzkxYzQ3ZTIz',
                            };

                            let endpoint =
                              'https://onesignal.com/api/v1/notifications';

                            let params = {
                              method: 'POST',
                              headers: headers,
                              body: JSON.stringify({
                                app_id: 'cb52438d-c790-46e4-83de-effe08725aff',
                                contents: {
                                  en: json.message,
                                },
                                include_player_ids: [device_token],
                                headings: { en: 'Auto Check In!!' },
                                content_available: true,
                              }),
                            };

                            fetch(endpoint, params).then(res => {
                              //
                            });
                            return;
                          }
                          return alert(json.message);
                        } catch (e) {
                          console.log('error', e);
                          return;
                        }
                      }
                      // alert('You entered the geofence ' + location.accessLocation);
                      //alert('My request to enter API run...');
                      if (checked_out === 'no' && isFaceRequired === 'true') {
                        try {
                          const response = await fetch(
                            Const + 'api/Staff/StaffInOrOutAfterCheckIn',
                            {
                              method: 'POST',
                              headers: {
                                Accept: 'application/json, text/plain',
                                'Content-Type': 'application/json-patch+json',
                              },
                              body: JSON.stringify({
                                StaffCode: StaffNo,
                                InstituteId: Number(institute_id),
                                IsOutside: false,
                                GeoLocationId: location.id,
                              }),
                            },
                          );
                          const json = await response.json();
                          if (json?.status) {
                            return;
                            // alert(
                            //   'You entered the geofence ' +
                            //     location.accessLocation,
                            // );
                          }
                        } catch (error) {
                          console.log(error);
                          return;
                        }
                      }
                    });
                  }
                  return;
                }
                const marginedRadius =
                  Number(position[0].accuracy) >= Number(radius)
                    ? Number(radius) + Math.round(Number(position[0].accuracy))
                    : Number(radius);
                //alert('I ran for checking exit');
                const point =
                  position?.length > 0 &&
                  geolib.isPointWithinRadius(
                    {
                      latitude: parseFloat(position[0].latitude),
                      longitude: parseFloat(position[0].longitude),
                    },
                    {
                      latitude: parseFloat(coordinates[0].latitude),
                      longitude: parseFloat(coordinates[0].longitude),
                    },
                    marginedRadius,
                  );
                console.log('Initial check ==>', point);
                if (point === null) {
                  return;
                }
                if (point) {
                  return;
                  // alert(
                  //   'You are inside your checked in location ' +
                  //     geoLocation,
                  // );
                }
                count = Number(count) + 1;
                await AsyncStorage.setItem('count', count.toString());
                if (count == 2 && !geoLocation.startsWith('Beacon')) {
                  await AsyncStorage.setItem('geo_id', '');
                  await AsyncStorage.setItem('coordinates', JSON.stringify([]));
                  await AsyncStorage.setItem('radius', '');
                  await AsyncStorage.setItem('geo_location', '');
                  await AsyncStorage.setItem('count', '0');
                  //alert('My request to exit API run...');
                  if (isFaceRequired === 'false') {
                    let uploadData1 = new FormData();

                    uploadData1.append('StaffNo', StaffNo);
                    uploadData1.append('File', '');
                    uploadData1.append('InstituteId', institute_id);
                    uploadData1.append('FaceValidationMandatory', false);
                    uploadData1.append(
                      'AccessLocationId',
                      Number(checkedInLocation),
                    );

                    try {
                      const response = await axios({
                        method: 'post',
                        url: Const + 'api/Staff/StaffFaceCheckOut',
                        data: uploadData1,
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      const json = response.data;
                      // alert(
                      //   'api/Staff/StaffFaceCheckOut :' + JSON.stringify(json),
                      // );
                      if (json.status) {
                        await AsyncStorage.setItem('checked_out', 'yes');
                        if (AppState.currentState === 'active') {
                          return alert(json.message);
                        }
                        let headers = {
                          'Content-Type': 'application/json; charset=utf-8',
                          Authorization:
                            'Basic OGZjMzY1Y2MtN2MwYi00MTc4LWFlNmMtMWE0NzkxYzQ3ZTIz',
                        };

                        let endpoint =
                          'https://onesignal.com/api/v1/notifications';

                        let params = {
                          method: 'POST',
                          headers: headers,
                          body: JSON.stringify({
                            app_id: 'cb52438d-c790-46e4-83de-effe08725aff',
                            contents: {
                              en: json.message,
                            },
                            include_player_ids: [device_token],
                            headings: { en: 'Auto Check Out!!' },
                            content_available: true,
                          }),
                        };

                        fetch(endpoint, params).then(res => {
                          //
                        });
                        return;
                      }
                      return alert(json.message);
                    } catch (e) {
                      console.log('error', e);
                      return alert(`Error ${e}`);
                    }
                  }
                  if (checked_out === 'no' && isFaceRequired === 'true') {
                    try {
                      const response = await fetch(
                        Const + 'api/Staff/StaffInOrOutAfterCheckIn',
                        {
                          method: 'POST',
                          headers: {
                            Accept: 'application/json, text/plain',
                            'Content-Type': 'application/json-patch+json',
                          },
                          body: JSON.stringify({
                            StaffCode: StaffNo,
                            InstituteId: Number(institute_id),
                            IsOutside: true,
                            GeoLocationId: Number(checkedInLocation),
                          }),
                        },
                      );
                      const json = await response.json();
                      if (json?.status) {
                        return alert('You exited the location: ' + geoLocation);
                      }
                      return;
                    } catch (error) {
                      console.log(error);
                      return;
                    }
                  }
                }
              },
            );
          } else {
            locationSubscription && locationSubscription();
            locationTimeout && clearTimeout(locationTimeout);
            alert('no permissions to obtain location');
          }
        })
        .catch(error => alert(error.toString()));
    },
    {
      delay: 1000,
      onLoop: true,
      taskId: 'taskid',
      onError: e => console.log('Error logging:', e),
    },
  );
};

export const autoCheckInOrCheckOut = async (
  user_id,
  institute_id,
  location,
  device_token,
) => {
  const checkin = location.action === 'ENTER';
  const checkout = location.action === 'EXIT';
  const url = checkin
    ? 'api/Staff/StaffFaceCheckIn'
    : checkout
      ? 'api/Staff/StaffFaceCheckOut'
      : '';
  let uploadData1 = new FormData();
  uploadData1.append('StaffNo', user_id);
  uploadData1.append('File', '');
  uploadData1.append('InstituteId', institute_id);
  uploadData1.append('FaceValidationMandatory', false);
  uploadData1.append('AccessLocationId', Number(location.identifier));
  try {
    const response = await axios({
      method: 'post',
      url: Const + url,
      data: uploadData1,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const json = response.data;
    console.log('CHECKIN', json);
    if (json.status) {
      await AsyncStorage.setItem('checked_out', 'no');
      await AsyncStorage.setItem('count', '0');
      await AsyncStorage.setItem('gpsCount', '0');
      await AsyncStorage.setItem(
        'actualCheckInTime',
        new Date().toLocaleTimeString(),
      );
      let headers = {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: 'Basic OGZjMzY1Y2MtN2MwYi00MTc4LWFlNmMtMWE0NzkxYzQ3ZTIz',
      };

      let endpoint = 'https://onesignal.com/api/v1/notifications';

      let params = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          app_id: 'cb52438d-c790-46e4-83de-effe08725aff',
          contents: {
            en: json.message,
          },
          include_player_ids: [device_token],
          headings: { en: 'Auto Check In!!' },
          content_available: true,
        }),
      };

      fetch(endpoint, params).then(res => {
        //
      });
      return;
    }
    return alert(json.message);
  } catch (e) {
    console.log('error', e);
    return;
  }
};

export const notifyOnEntryExit = async (user_id, institute_id, geofence) => {
  const outside = geofence.action === 'EXIT';

  try {
    const res = await tokenApi();
    const response = await res.post('api/Staff/StaffInOrOutAfterCheckIn', {
      StaffCode: user_id,
      InstituteId: Number(institute_id),
      IsOutside: outside,
      GeoLocationId: Number(geofence.identifier),
    });
    const json = await response.json();
    if (json?.status) {
      return;
      // alert(
      //   'You entered the geofence ' +
      //     location.accessLocation,
      // );
    }
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getStatus = async (bearer_token, StaffNo, institute_id) => {
  //console.log(bearer_token, institute_id, StaffNo)
  return fetch(Const + 'api/Staff/IsCheckedInNew', {
    method: 'POST',
    withCredentials: true,
    credentials: 'include',
    headers: {
      Authorization: bearer_token,
      Accept: 'text/plain',
      'Content-Type': 'application/json-patch+json',
    },
    body: JSON.stringify({
      staffCode: StaffNo,
      instituteId: Number(institute_id),
    }),
  })
    .then(response => response.json())
    .then(async json => {
      //console.log('jOSN=-==', json);
      if (json && json.isCheckedIn) {
        return true;
      }
      return false;
    })
    .catch(e => console.log('[get_Status_error]', e));
};

export const staffCurrentLocation = async (
  institute_id,
  StaffNo,
  coordinates,
) => {
  try {
    const res = await tokenApi();
    const response = await res.post(
      'api/GeoFencing/addOrUpdate/stafflocation',
      {
        InstituteId: institute_id,
        StaffCode: StaffNo,
        Coordinates: coordinates,
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const travelCheckCurrentLocation = async (
  institute_id,
  StaffNo,
  coordinates,
  uuid,
  odometer,
) => {
  try {
    const res = await tokenApi();
    console.log('body', {
      InstituteId: institute_id,
      StaffCode: StaffNo,
      Coordinates: coordinates,
      TripIdentitfier: uuid,
      //Address,
      IsCheckIn: false,
      IsCheckOut: false,
      Distance: odometer,
    });
    const response = await res.post('api/GeoFencing/travelcheckin', {
      InstituteId: institute_id,
      StaffCode: StaffNo,
      Coordinates: coordinates,
      TripIdentitfier: uuid,
      //Address,
      IsCheckIn: false,
      IsCheckOut: false,
      Distance: odometer,
      // IsIdeal: idealValue,
    });
    const json_1 = await response.json();
    return json_1;
  } catch (error) {
    return error;
  }
};

export const compareTwoTime = (t1, t2) => {
  let time1 = moment(t1, 'h:mma');
  let time2 = moment(t2, 'h:mma');
  if (time1.isSameOrAfter(time2)) {
    return true;
  }
  return false;
};

export const loginAPI = async () => {
  try {
    const mobileNumber = await AsyncStorage.getItem('mobile');
    const mpin = await AsyncStorage.getItem('mpin');
    const response = await axios.post(
      Const + 'api/Security/Mobilelogin',
      {
        mobileNumber,
        mpin,
      },
      {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      },
    );
    const json = response.data;
    console.log('LOGIN_RESPONSE_UPDATE', json.isAuthenticated);
    if (json.isAuthenticated) {
      await AsyncStorage.setItem('menus', JSON.stringify(json.menus));
      //await AsyncStorage.setItem('app_status', this.state.app_status);
      await AsyncStorage.setItem('user_id', json.staffNumber);
      await AsyncStorage.setItem('bearer_token', json.bearerToken);
      await AsyncStorage.setItem('institute_id', json.instituteId.toString());
      await AsyncStorage.setItem('org_id', json.organisationId.toString());
      await AsyncStorage.setItem(
        'driving_type',
        json.travelPreference.toString(),
      );
      await AsyncStorage.setItem(
        'start_time',
        json.staffTravelStartTime.toString(),
      );
      await AsyncStorage.setItem(
        'profile_pic',
        json.profilePic ? json.profilePic : '',
      );
      await AsyncStorage.setItem(
        'base64Data',
        json.profilePicBase64 ? json.profilePicBase64 : '',
      );
      if (json.isTravelCheckInAvailable) {
        await AsyncStorage.setItem('travel_check_in', 'yes');
      } else {
        await AsyncStorage.setItem('travel_check_in', 'no');
      }
      if (json.isQrCheckIn) {
        await AsyncStorage.setItem('qrCheckin', 'true');
      } else {
        await AsyncStorage.setItem('qrCheckin', 'false');
      }
      if (json.isQrCheckOut) {
        await AsyncStorage.setItem('qrCheckout', 'true');
      } else {
        await AsyncStorage.setItem('qrCheckout', 'false');
      }
      if (json.isFaceAuthenticationRequired) {
        await AsyncStorage.setItem('isFaceRequired', 'true');
      } else {
        await AsyncStorage.setItem('isFaceRequired', 'false');
      }
      await addBoundaries(json.staffNumber, json.instituteId);
    }
  } catch (e) {
    console.log('error', e);
  }
};

export const imageSizeBasedOnCameraPixel = pixel => {
  if (pixel >= 13) {
    return {
      width: 80,
      height: 80,
    };
  }
  return {
    width: 300,
    height: 300,
  };
};

export const update_task = async () => {
  const actualCheckInTime = await AsyncStorage.getItem('actualCheckInTime');
  return await ReactNativeForegroundService.update({
    id: 144,
    title: 'Palgeo GeoAttendance App',
    message: `You checked in at ${actualCheckInTime}`,
  });
};

export const updateIdleTime = async (
  StaffCode,
  InstituteId,
  StartTime,
  EndTime,
  IdealMinutes,
  IsTravelCheckIn,
) => {
  const data = {
    StartTime,
    EndTime,
    IdealMinutes,
    StaffCode,
    InstituteId,
    IsTravelCheckIn,
  };
  const response = await axios.post(
    Const + 'api/Staff/UpdateIdealTimeActivity',
    data,
  );
  const json = response.data;
  return json.status;
};

export const getUserInfo = async (user_id, institute_id) => {
  const url = `${Const}api/Staff/information/${institute_id}/${user_id}`;
  try {
    const response = await axios.get(url);
    const { data } = response;
    return data.staffInformation;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const validatePointWithinCircle = (center, point) => {
  const radius =
    Number(point.accuracy) <= 10
      ? Number(center.radius)
      : Number(center.radius) + Number(point.accuracy);
  console.log('radius ==', radius);
  const check = geolib.isPointWithinRadius(
    {
      latitude: point.latitude,
      longitude: point.longitude,
    },
    {
      latitude: center.coordinates[0].latitude,
      longitude: center.coordinates[0].longitude,
    },
    radius || 100,
  );
  return check;
};

export const setupGoogleFit = async () => {
  const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      Scopes.FITNESS_ACTIVITY_WRITE,
      Scopes.FITNESS_LOCATION_READ,
    ],
  };
  try {
    const authResult = await GoogleFit.authorize(options);
    if (authResult.success) {
      alert('Google fit registration success!!');
      AsyncStorage.setItem('googleFit', 'true');
      GoogleFit.startRecording((call, dataTypes = ['step', 'distance']) => {
        console.log('call', call);
      });
    } else {
      AsyncStorage.setItem('googleFit', 'false');
      return alert(authResult.message);
    }
  } catch (e) {
    alert('Google fit not configured');
  }
};

export const arrayWithoutDuplicates = (array, key) => {
  const uniques = Object.values(
    array.reduce((a, c) => {
      a[c[key]] = c;
      return a;
    }, {}),
  );
  return uniques;
};

export const getFileExtention = fileUrl => {
  // To get the file extension
  return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
};

export const checkPermission = async fileUrl => {
  // Function to check the platform
  // If Platform is Android then check for permissions.

  if (Platform.OS === 'ios') {
    return true;
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'Application needs access to your storage to download File',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Start downloading
        return true;
        downloadFile(fileUrl);
        console.log('Storage Permission Granted.');
      } else {
        // If permission denied then show alert
        return false;
        Alert.alert('Error', 'Storage Permission Not Granted');
      }
    } catch (err) {
      console.log('++++' + err);
      return false;
      // To handle permission related exception
    }
  }
};

export const downloadFile = fileUrl => {
  let date = new Date();
  // File URL which we want to download
  let FILE_URL = fileUrl.split(' ').join('');
  // Function to get extention of the file url
  let file_ext = getFileExtention(FILE_URL);

  file_ext = '.' + file_ext[0];
  console.log('file_ext', FILE_URL);
  // config: To get response by passing the downloading related options
  // fs: Root directory path to download
  const { config, fs } = RNFetchBlob;
  let RootDir =
    Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
  let options = {
    fileCache: true,
    addAndroidDownloads: {
      path:
        RootDir +
        '/file_' +
        Math.floor(date.getTime() + date.getSeconds() / 2) +
        file_ext,
      description: 'downloading file...',
      notification: true,
      // useDownloadManager works with Android only
      useDownloadManager: true,
    },
  };
  return config(options)
    .fetch('GET', FILE_URL)
    .then(res => {
      // Alert after successful downloading
      console.log('res -> ', JSON.stringify(res));
      return res;
    })
    .catch(e => console.log({e}));
};

export const fileViewer = async fileUrl => {
  const check = await checkPermission(fileUrl);
  if (!check) {
    return;
  }
  try {
    const download = await downloadFile(fileUrl);
    console.log('download', JSON.parse(download));
    return download;
  } catch (e) {
    return false;
  }
};

export const groupByKey = (array, key) => {
  return array.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});
};

export const showErrorMsg = e => {
  const error = JSON.stringify(e);
  const { message } = JSON.parse(error);
  if (message.includes('503')) {
    return alert('Server under maintainance. Please try after some time');
  }
  return alert('Something went wrong. Please try after some time');
};

export const getLocationAddress = async coordinates => {
  const { latitude, longitude } = coordinates;
  return Geocoder.from(latitude, longitude).then(json => {
    const { results } = json;
    const filteredResults = results.filter(
      e => !e.formatted_address.includes('+'),
    );
    return filteredResults;
  });
};

export const asyncStorageDataFetch = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    alert(e.message);
  }
};
export const asyncStorageDataSet = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    //return value;
  } catch (e) {
    alert(e.message);
  }
};

export const checkinByWifi = async (
  wifi,
  checked_out,
  user_id,
  institute_id,
  checkInOrOutTime,
  offlineBody,
) => {
  console.log('offlineBODY', offlineBody);
  if (offlineBody && checked_out === 'yes') {
    return;
  }
  const url = `api/Staff/StaffFace${checked_out === 'no' ? 'CheckOut' : 'CheckIn'
    }`;

  const geo_id = await asyncStorageDataFetch('geo_id');

  let uploadData = new FormData();
  uploadData.append('StaffNo', user_id);
  uploadData.append('InstituteId', institute_id);
  uploadData.append('FaceValidationMandatory', false);
  //uploadData.append('Time', checkInOrOutTime);
  uploadData.append('AccessLocationId', wifi ? wifi.id : Number(geo_id));
  const body = offlineBody ? offlineBody : uploadData;
  console.log('body', body);
  try {
    const res = await tokenApi();
    const response = await res.post(url, body);
    const { data } = response;
    console.log('url', url);
    console.log('data', data);
    if (!data.status) {
      return alert(data.message);
    }
    if (checked_out === 'no' && offlineBody) {
      await AsyncStorage.removeItem('wifiCheckOutBody');
    }
    if (checked_out === 'yes') {
      await asyncStorageDataSet('wifiPressed', 'yes');
      await asyncStorageDataSet('checked_out', 'no');
      await asyncStorageDataSet('geo_id', wifi.id.toString());
    }
    if (checked_out === 'no') {
      await asyncStorageDataSet('checked_out', 'yes');
    }
    alert(data.message);
  } catch (e) {
    if (e.message.includes('Network')) {
      await asyncStorageDataSet('wifiCheckOutBody', JSON.stringify(body));
    }
    console.log('error', e.message);
  }
};

export const trackWifi = async () => {
  try {
    const checked_out = await asyncStorageDataFetch('checked_out');
    // const checkInTime = await asyncStorageDataFetch('shedcheckInTime');
    // const checkOutTime = await asyncStorageDataFetch('shedcheckOutTime');

    console.log('checked_out', checked_out);
    const user_id = await asyncStorageDataFetch('user_id');
    const institute_id = await asyncStorageDataFetch('institute_id');
    const { type, details } = await NetInfo.fetch();

    //Checking for wifi connection
    const isWifiConnected = type === 'wifi';
    console.log('isWifiCpnnect', isWifiConnected);
    if (!isWifiConnected) {
      // if checked in and network type !== wifi,, try to check out
      if (checked_out === 'no') {
        return checkinByWifi(
          null,
          'no',
          user_id,
          institute_id,
          new Date().toISOString(),
        );
      }
      return alert('Please turn on mobile wifi.');
    }

    //if wifi is connected
    const wifiLocations = await getWifiLocations();
    const ssid = details.bssid;
    console.log('ssid', ssid.toUpperCase());
    const findMatch = wifiLocations.find(
      wifi => wifi.wifiSsid === ssid.toUpperCase(),
    );
    console.log('findMatch', findMatch);
    if (!findMatch && checked_out === 'no') {
      return checkinByWifi(
        null,
        'no',
        user_id,
        institute_id,
        new Date().toISOString(),
      );
    }
    if (findMatch && (checked_out === 'yes' || !checked_out)) {
      checkinByWifi(
        findMatch,
        'yes',
        user_id,
        institute_id,
        new Date().toISOString(),
      );
    }
  } catch (error) {
    console.log('error_wifi_exception', e.message);
  }
};

export const inBetween = (startTime, endTime) => {
  var dt = new Date(); //current Date that gives us current Time also

  var s = startTime.split(':');
  var dt1 = new Date(
    dt.getFullYear(),
    dt.getMonth(),
    dt.getDate(),
    parseInt(s[0]),
    parseInt(s[1]),
    parseInt(s[2]),
  );

  var e = endTime.split(':');
  var dt2 = new Date(
    dt.getFullYear(),
    dt.getMonth(),
    dt.getDate(),
    parseInt(e[0]),
    parseInt(e[1]),
    parseInt(e[2]),
  );

  if (dt >= dt1 && dt <= dt2) {
    return true;
  }
  return false;
};

export const disableBatteryOptimization = async () => {
  if (!isIOS) {
    RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then(
      isEnabled => {
        if (isEnabled) {
          RNDisableBatteryOptimizationsAndroid.openBatteryModal();
        }
      },
    );
  }
};
