import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  PermissionsAndroid,
  AppState,
  Alert,
} from 'react-native';
import ProgressCircle from 'react-native-progress-circle';
import AppIntroSlider from 'react-native-app-intro-slider';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//mport {Root} from 'native-base';
import MainNavigator from './src/Navigation/MainNavigator';
import SplashScreen from 'react-native-splash-screen';
import VersionNumber from 'react-native-version-number';
import Const from './src/components/common/Constants';
import AskForUpdate from './src/components/common/AskForUpdate';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Geolocation from 'react-native-geolocation-service';
import * as RootNavigation from './src/components/RootNavigation';
import GPSState from 'react-native-gps-state';
import axios from 'axios';
import OneSignal from 'react-native-onesignal';
import {
  getTrackingStatus,
  requestTrackingPermission,
  TrackingStatus,
} from 'react-native-tracking-transparency';
//import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import VersionCheck from 'react-native-version-check';
import {
  //addTask,
  asyncStorageDataFetch,
  autoCheckInOrCheckOut,
  checkinByWifi,
  getStatus,
  getWifiLocations,
  inBetween,
  notifyOnEntryExit,
  staffCurrentLocation,
  trackWifi,
  travelCheckCurrentLocation,
} from './src/utils/helperFunctions';
import AskForPermissions from './src/components/common/AskForPermissions';

var moment = require('moment');
//const geolib = require('geolib');
import {slides} from './src/utils/arrays';
//import {Root} from 'native-base';
import LottieView from 'lottie-react-native';
import {Colors} from './src/utils/configs/Colors';
import {Icon} from 'react-native-elements/dist/icons/Icon';
//import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';
import {isIOS} from './src/utils/configs/Constants';
import {Linking} from 'react-native';
import {BackHandler} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import AnimatedLoader from './src/components/common/AnimatedLoader';
import {LogBox} from 'react-native';
import {tokenApi} from './src/utils/apis';
import BackgroundGeolocation from 'react-native-background-geolocation';
//import ReactNativeForegroundService from '@supersami/rn-foreground-service';
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRealApp: false,
      appIntro: '',
      newVersionRequired: false,
      inactive: true,
      position: {},
      bearer_token: '',
      show: false,
      isSubscribed: null,
      locationPermissions: false,
      gpsInfo: [],
      netInfo: {},
      isOn: true,
      multiple: 1,
      splash: true,
    };
    this.subscriptions = [];
    this.ConfigureOneSignal();
  }

   getCurrentDate=()=>{
    return new Date().toLocaleString();//format: d-m-y;
  }

  ConfigureOneSignal = async () => {
    /* O N E S I G N A L   S E T U P */
    OneSignal.setAppId('cb52438d-c790-46e4-83de-effe08725aff');
    OneSignal.setLogLevel(6, 0);
    OneSignal.setRequiresUserPrivacyConsent(false);
    OneSignal.promptForPushNotificationsWithUserResponse(response => {
      console.log('Prompt response:', response);
    });

    /* O N E S I G N A L  H A N D L E R S */
    OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
      this.onReceived(notifReceivedEvent);
      console.log(
        'OneSignal: notification will show in foreground:',
        notifReceivedEvent,
      );
    });
    OneSignal.setNotificationOpenedHandler(notification => {
      this.onOpened(notification);
      console.log('OneSignal: notification opened:', notification);
    });
    OneSignal.setInAppMessageClickHandler(event => {
      console.log('OneSignal IAM clicked:', event);
    });
    OneSignal.addEmailSubscriptionObserver(event => {
      console.log('OneSignal: email subscription changed: ', event);
    });
    OneSignal.addSubscriptionObserver(event => {
      console.log('OneSignal: subscription changed:', event);
      this.setState({isSubscribed: event.to.isSubscribed});
    });
    OneSignal.addPermissionObserver(event => {
      console.log('OneSignal: permission changed:', event);
    });

    setTimeout(async () => {
      const deviceState = await OneSignal.getDeviceState();
      let userId = deviceState.userId;
      console.log('device -===', deviceState);
      await AsyncStorage.setItem(
        'device_token',
        userId ? userId : '',
      );
   }, 8000);

    // Comment by : Vrushali 
    // ====================
    // const deviceState = await OneSignal.getDeviceState();
    // console.log('device -===', deviceState);
    // await AsyncStorage.setItem(
    //   'device_token',
    //   deviceState.userId ? deviceState.userId : '',
    // );
    // ==========================

    // this.setState({
    //     isSubscribed : deviceState.isSubscribed
    // });
  };

  askForPermissions = async () => {
    if (Platform.OS == 'android') {
      if (Platform.Version <= 28 && Platform.Version >= 22) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Attention',
            message: 'Palgeo needs access to your location in background',
          },
        );
        console.log('Android  Location permission granted?' + granted);
        if (granted) {
          const enabled = await WifiManager.isEnabled();
          if (!enabled) WifiManager.setEnabled(true);
          //await this.setupGoogleFit();
          await AsyncStorage.setItem('locationPermissions', 'yes');
          this.setState({locationPermissions: true}, () => {
            console.log('prmissions is true');
            //addTask();
          });
        } else {
          alert('Permission to access location denied');
        }
        return;
      }
      if (Platform.Version <= 29 && Platform.Version > 28) {
        const granted = await PermissionsAndroid.requestMultiple(
          [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          ],

          {
            title: 'Attention',
            message: 'Palgeo needs access to your location in background',
          },
        );
        console.log('Android  Location permission granted?' + granted);
        if (granted) {
          const enabled = await WifiManager.isEnabled();
          if (!enabled) WifiManager.setEnabled(true);
          //await this.setupGoogleFit();
          await AsyncStorage.setItem('locationPermissions', 'yes');
          this.setState({locationPermissions: true}, () => {
            console.log('prmissions is true');
            //addTask();
          });
        }
        return;
      }
      if (Platform.Version >= 30) {
        const grantedWhileUsingApp = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Attention',
            message: 'Palgeo needs access to your location while using the app',
          },
        );

        console.log(
          'Android  Location permission granted?' + grantedWhileUsingApp,
        );
        if (grantedWhileUsingApp) {
          Alert.alert(
            'Background location permission',
            'Allow location permission to get location updates in background',
            [
              {
                text: 'Open Settings',
                onPress: async () => {
                  const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                  );
                  if (granted) {
                    const enabled = await WifiManager.isEnabled();
                    if (!enabled) WifiManager.setEnabled(true);
                    //await this.setupGoogleFit();
                    await AsyncStorage.setItem('locationPermissions', 'yes');
                    this.setState({locationPermissions: true}, () => {
                      console.log('prmissions is true');
                      //addTask();
                    });
                  }
                },
              },
              {
                text: 'Cancel',
                onPress: () => {},
              },
            ],
            {cancelable: false},
          );
        }
      } else {
        alert('Permission to access location denied');
      }
    } else if (Platform.OS == 'ios') {
      Geolocation.requestAuthorization('always');
    }
  };

  checkInternet = async state => {
    console.log('Network_State', state);

    // let currentState = this.state.isOn;
    // if (currentState !== state.isConnected) {
    //   currentState = state.isConnected;
    // }
    // const StaffNo = await AsyncStorage.getItem('user_id');
    // const institute_id = await AsyncStorage.getItem('institute_id');
    // const checked_out = await AsyncStorage.getItem('checked_out');
    // const bodyOffline = await AsyncStorage.getItem('offlineBody');
    // //console.log('StaffNo', StaffNo);
    // console.log('Is connected?', currentState);
    // this.setState({isOn: state.isConnected});
    // if (JSON.parse(bodyOffline) !== null) {
    //   try {
    //     const res = await tokenApi();
    //     const response = await res.post(
    //       'api/Leave/OfflineAttendanceRequest',
    //       bodyOffline,
    //     );
    //     const {data} = response;
    //     console.log('data', data);
    //     if (!data.status) {
    //       return alert(data.message);
    //     }
    //     alert('Request submitted successfully!');
    //     await AsyncStorage.removeItem('offlineBody');
    //   } catch (e) {
    //     alert('Offline Attendance error: ' + e.message);
    //   }
    // }
    // //console.log('Is InternetReachable?', state.isInternetReachable);
    // //console.log('Is wifi?', state.isWifiEnabled);
    // if (checked_out === 'yes' || !checked_out) {
    //   return;
    // }

    // if (!currentState) {
    //   // if (AppState.currentState === 'active') {
    //   //   Alert.alert(
    //   //     'Attention',
    //   //     'You should never turn off your internet connection during login hours!',
    //   //     [{text: 'OK', onPress: () => {}, style: 'cancel'}],
    //   //     {cancelable: true},
    //   //   );
    //   // }
    //   console.log('I ran without internet connection dude!!');
    //   let temp = {
    //     AccessTime: new Date().toUTCString(),
    //     IsOn: currentState,
    //     StaffCode: StaffNo,
    //   };
    //   await AsyncStorage.setItem('netInfo', JSON.stringify(temp)).then(() =>
    //     this.setState({netInfo: temp}),
    //   );
    //   //return;
    // } else {
    //   if (currentState && StaffNo && institute_id) {
    //     const gpsInfo = JSON.parse(await AsyncStorage.getItem('gpsInfo'));
    //     if (gpsInfo?.length > 0) {
    //       try {
    //         return axios
    //           .post(Const + 'api/Staff/MobileGpsOnOrOffOffline', {
    //             StaffCode: StaffNo,
    //             InstituteId: Number(institute_id),
    //             Data: gpsInfo,
    //           })
    //           .then(response => {
    //             this.setState({gpsInfo: []});
    //             AsyncStorage.setItem('gpsInfo', JSON.stringify([]));
    //             console.log('response ==>', response.data);
    //             return;
    //             //this.unsubscribe();
    //           })
    //           .catch(err => console.log('error_GPS', err));
    //       } catch (error) {
    //         console.log('error_GPS_INFO ==>', error);
    //       }
    //     } else {
    //       const netInfo = JSON.parse(await AsyncStorage.getItem('netInfo'));
    //       let t = netInfo;
    //       console.log('nnetInfo ==>', t);
    //       if (netInfo === {} || !netInfo) {
    //         return;
    //       } else {
    //         if (netInfo && netInfo != {}) {
    //           let temp1 = {
    //             AccessTime: new Date().toUTCString(),
    //             IsOn: true,
    //             StaffCode: StaffNo,
    //           };
    //           console.log('I ran dude!');
    //           try {
    //             return axios
    //               .post(Const + 'api/Staff/MobileInternetOnOrOff', {
    //                 StaffCode: StaffNo,
    //                 InstituteId: Number(institute_id),
    //                 Data: [netInfo, temp1],
    //               })
    //               .then(async response => {
    //                 // console.log('netinfo', netInfo);
    //                 this.setState({netInfo: {}});
    //                 await AsyncStorage.setItem('netInfo', JSON.stringify({}));
    //                 // const netInfo2 = JSON.parse(
    //                 //   await AsyncStorage.getItem('netInfo'),
    //                 // );
    //                 // console.log('netinfo_after', netInfo2);
    //                 console.log(response.data);
    //               })
    //               .catch(error => console.log('error', error));
    //           } catch (error) {
    //             console.log('error_NETINFO ==>', error);
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  };

  checkGPSOffline = async status => {
    this.setState({gpsState: status});
    const StaffNo = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    //console.log('GPS_state', status);
    if (status === 1 || status === 2) {
      if (AppState.currentState === 'active') {
        Alert.alert(
          'Attention',
          'You should never turn off your GPS connection during login hours!',
          [{text: 'OK', onPress: () => {}, style: 'cancel'}],
          {cancelable: true},
        );
      }
    }
    if (!this.state.isOn) {
      this.setState(
        {
          gpsInfo: [
            ...this.state.gpsInfo,
            {
              AccessTime: new Date().toUTCString(),
              IsGpsOn: status == 1 || status == 2 ? false : true,
              StaffCode: StaffNo,
            },
          ],
        },
        () => {
          const uniques = Object.values(
            this.state.gpsInfo.reduce((a, c) => {
              a[c.AccessTime] = c;
              return a;
            }, {}),
          );
          AsyncStorage.setItem('gpsInfo', JSON.stringify(uniques));
          return console.log('GPS)INFO', uniques);
        },
      );
      return;
    }
    switch (status) {
      case GPSState.NOT_DETERMINED:
        alert(
          'Please allow the location services for proper functioning of the app.',
        );
        break;

      case GPSState.RESTRICTED:
        GPSState.openLocationSettings();
        break;

      case GPSState.DENIED:
        alert(
          'Sorry, Palgeo will not work properly without location services being activated.',
        );
        break;

      case GPSState.AUTHORIZED_ALWAYS:
        //TODO do something amazing with you app
        break;

      case GPSState.AUTHORIZED_WHENINUSE:
        //TODO do something amazing with you app
        break;
    }
    console.log('change in gps state');
    if (status !== this.state.gpsState) {
      try {
        axios
          .post(Const + 'api/Staff/MobileGpsOnOrOff', {
            StaffCode: StaffNo,
            InstituteId: Number(institute_id),
            IsGpsOn: status == 1 || status == 2 ? false : true,
          })
          .then(response => console.log('JSON_GPS', response.data));
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  postOfflineAttendance = async () => {
    const bodyOffline = await AsyncStorage.getItem('offlineBody');
    if (JSON.parse(bodyOffline) !== null) {
      try {
        const res = await tokenApi();
        const response = await res.post(
          'api/Leave/OfflineAttendanceRequest',
          bodyOffline,
        );
        const {data} = response;
        console.log('data', data);
        if (!data.status) {
          return alert(data.message);
        }
        alert('Request submitted successfully!');
        await AsyncStorage.removeItem('offlineBody');
      } catch (e) {
        alert('Offline Attendance error: ' + e.message);
      }
    }
  };

  async componentDidMount() {
    //igonore logs
    LogBox.ignoreLogs([]);
    let isIgnoring =
      await BackgroundGeolocation.deviceSettings.isIgnoringBatteryOptimizations();
    console.log('isIgnoring ===', isIgnoring);

    //ignore exception crashes in iOS
    console.reportErrorsAsExceptions = false;
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    //update APP on or off status
    await this.updateStatus(true, new Date());
    const trackingPermissions = await AsyncStorage.getItem(
      'trackingPermissions',
    );
    const isFaceRequired = await AsyncStorage.getItem('isFaceRequired');
    const wifiLocations = await getWifiLocations();
    // const uid = await AsyncStorage.getItem('uuid');
    this.setState({
      trackingPermissions: trackingPermissions === 'yes' ? true : false,
    });
    // ReactNativeForegroundService.add_task(() => trackWifi(), {
    //   delay: 1000,
    //   onLoop: true,
    //   taskId: 'taskid',
    //   onError: e => console.log('Error logging:', e),
    // });

    //background-geolocation listeners
    this.subscriptions.push(
      BackgroundGeolocation.onProviderChange(async event => {
        const user_id_latest = await AsyncStorage.getItem('user_id');
        const institute_id_latest = await AsyncStorage.getItem('institute_id');
        const checked_out_latest = await AsyncStorage.getItem('checked_out');
        console.log('[onProviderChange]', event);
        if (!event.enabled) {
          alert('Please enable location services');
        }
        if (checked_out_latest === 'yes' || !checked_out_latest) return;
        try {
          axios.post(Const + 'api/Staff/MobileGpsOnOrOff', {
            StaffCode: user_id_latest,
            InstituteId: Number(institute_id_latest),
            IsGpsOn: event.enabled,
          });
        } catch (error) {
          if (error.message.includes('Network')) {
            this.setState(
              {
                gpsInfo: [
                  ...this.state.gpsInfo,
                  {
                    AccessTime: new Date().toUTCString(),
                    IsGpsOn: event.enabled,
                    StaffCode: user_id_latest,
                  },
                ],
              },
              () => {
                const uniques = Object.values(
                  this.state.gpsInfo.reduce((a, c) => {
                    a[c.AccessTime] = c;
                    return a;
                  }, {}),
                );
                AsyncStorage.setItem('gpsInfo', JSON.stringify(uniques));
                return console.log('GPS)INFO', uniques);
              },
            );
          }
          console.log('error', error.message);
        }
      }),
    );

    this.subscriptions.push(
      BackgroundGeolocation.onConnectivityChange(async event => {
        console.log('[onConnectivityChange]', event);
        const currentState = event.connected;
        const checked_out_latest = await AsyncStorage.getItem('checked_out');
        const user_id_latest = await AsyncStorage.getItem('user_id');
        const institute_id_latest = await AsyncStorage.getItem('institute_id');
        const netInfo = JSON.parse(await AsyncStorage.getItem('netInfo'));
        const wifiCheckOutBody = JSON.parse(
          await AsyncStorage.getItem('wifiCheckOutBody'),
        );
        console.log('wifiBdoy', wifiCheckOutBody);
        if (wifiCheckOutBody && currentState) {
          checkinByWifi(
            null,
            'no',
            user_id_latest,
            institute_id_latest,
            '',
            wifiCheckOutBody,
          );
        }
        this.setState({isOn: currentState});
        if (checked_out_latest === 'yes' || !checked_out_latest) {
          return;
        }
        let temp1 = {
          AccessTime: new Date().toUTCString(),
          IsOn: currentState,
          StaffCode: user_id_latest,
        };
        try {
          await axios.post(Const + 'api/Staff/MobileInternetOnOrOff', {
            StaffCode: user_id_latest,
            InstituteId: Number(institute_id_latest),
            Data: netInfo ? [netInfo, temp1] : [temp1],
          });
          this.setState({netInfo: null});
          await AsyncStorage.removeItem('netInfo');
          await this.postOfflineAttendance();
        } catch (error) {
          if (error.message.includes('Network')) {
            await AsyncStorage.setItem('netInfo', JSON.stringify(temp1));
          }
        }
      }),
    );
    this.subscriptions.push(
      BackgroundGeolocation.onHeartbeat(
        async location => {
          console.log('[onHeartBeat]:'+this.getCurrentDate());
          console.log('[onHeartBeat] Event: App.js:');
          
          const wifiLocations = JSON.parse(
            await asyncStorageDataFetch('wifiLocations'),
          );

          //console.log('wifiLocations length', wifiLocations);
          if (wifiLocations?.length > 0) {
            const shedcheckInTime = moment
              .utc(wifiLocations[0].checkInTime, 'HH:mm:ss')
              .local()
              .format('HH:mm:ss');
            const shedcheckOutTime = moment
              .utc(wifiLocations[0].checkOutTime, 'HH:mm:ss')
              .local()
              .format('HH:mm:ss');
            // const shedcheckInTime = await asyncStorageDataFetch(
            //   'shedcheckInTime',
            // );
            // const shedcheckOutTime = await asyncStorageDataFetch(
            //   'shedcheckOutTime',
            // );
            console.log('I ran', shedcheckInTime, shedcheckOutTime);
            if (!shedcheckInTime && !shedcheckOutTime) {
              return;
            }
            var startTime = shedcheckInTime;
            var endTime = shedcheckOutTime;

            const inBetweenTime = inBetween(startTime, endTime);
            if (inBetweenTime) {
              console.log('I ran inBwtween', inBetweenTime);
              await trackWifi();
            }
          }

          // if (trackInBackground === 'true') {
          //   staffCurrentLocation(institute_id, user_id, location.coords);
          // }
          // if (current_travel_checkin === 'running') {
          //   travelCheckCurrentLocation(
          //     institute_id,
          //     user_id,
          //     location.coords,
          //     uuid,
          //     location.odometer,
          //   );
          // }
        },
        error => {
          console.log('[onLocation] ERROR:', error);
        },
      ),
    );
    // this.subscriptions.push(
    //   BackgroundGeolocation.onHeartbeat((event) => {
    //     console.log("[onHeartbeat]2 ", event);
      
    //     // You could request a new location if you wish.
    //     BackgroundGeolocation.getCurrentPosition({
    //       samples: 1,
    //       persist: true
    //     }).then((location) => {
    //       console.log("[getCurrentPosition] ", location);
    //     });
    //   })
    // );
    this.subscriptions.push(
      BackgroundGeolocation.onLocation(
        async location => {
          console.log("=============================================");
          console.log('[onLocation]', JSON.stringify(location, null, 2));
          const wifiLocations = await getWifiLocations();
          console.log('wifiLocations length', wifiLocations.length);

          if (wifiLocations.length > 0) {
            const shedcheckInTime = moment
              .utc(wifiLocations[0].checkInTime, 'HH:mm:ss')
              .local()
              .format('HH:mm:ss');
            const shedcheckOutTime = moment
              .utc(wifiLocations[0].checkOutTime, 'HH:mm:ss')
              .local()
              .format('HH:mm:ss');
            // const shedcheckInTime = await asyncStorageDataFetch(
            //   'shedcheckInTime',
            // );
            // const shedcheckOutTime = await asyncStorageDataFetch(
            //   'shedcheckOutTime',
            // );
            console.log('I ran');
            if (!shedcheckInTime && !shedcheckOutTime) {
              return;
            }
            var startTime = shedcheckInTime;
            var endTime = shedcheckOutTime;

            const inBetweenTime = inBetween(startTime, endTime);
            if (inBetweenTime) {
              await trackWifi();
            }
          }

          // if (trackInBackground === 'true') {
          //   staffCurrentLocation(institute_id, user_id, location.coords);
          // }
          // if (current_travel_checkin === 'running') {
          //   travelCheckCurrentLocation(
          //     institute_id,
          //     user_id,
          //     location.coords,
          //     uuid,
          //     location.odometer,
          //   );
          // }
        },
        error => {
          console.log('[onLocation] ERROR:', error);
        },
      ),
    );

    this.subscriptions.push(
      BackgroundGeolocation.onMotionChange(event => {
        console.log('[onMotionChange]', event);
      }),
    );

    this.subscriptions.push(
      BackgroundGeolocation.onHttp(event => {
        console.log('[onHttp]', event);
      }),
    );
    this.subscriptions.push(
      BackgroundGeolocation.onGeofence(async event => {
        const user_id = await AsyncStorage.getItem('user_id');
        const institute_id = await AsyncStorage.getItem('institute_id');
        const checked_out = await AsyncStorage.getItem('checked_out');
        const device_token = await AsyncStorage.getItem('device_token');

        const isFaceRequired = await AsyncStorage.getItem('isFaceRequired');
        console.log('[onGeoFence]', event.identifier, event.action);
        if (checked_out === 'no' && isFaceRequired === 'true') {
          notifyOnEntryExit(user_id, institute_id, event);
        }
        if (isFaceRequired === 'false') {
          autoCheckInOrCheckOut(user_id, institute_id, event, device_token);
        }
      }),
    );

    //gps change listeners
    // GPSState.addListener(status => {
    //   console.log('GPS_state', status);
    //   if (checked_out === 'no') {
    //     this.checkGPSOffline(status);
    //   }
    // });

    //netInfo listeners
    //this.unsubscribe = NetInfo.addEventListener(this.checkInternet);

    //get tracking permissions from storage(iOS)

    // ready the background-geolocation plugin
    const state = await BackgroundGeolocation.ready({
      // Debug
      isMoving: true,
      stopOnStationary: isFaceRequired === 'false' ? false : true,

      reset: true,
      debug: false,
      //logLevel: BackgroundGeolocation.LOG_LEVEL_INFO,
      // transistorAuthorizationToken: bearer_token,
      // Geolocation
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,

      geofenceModeHighAccuracy: true,
      distanceFilter:
        isFaceRequired === 'false' && wifiLocations.length > 0 ? 10 : 150,
      locationUpdateInterval: 1000,
      disableElasticity: true,
      heartbeatInterval: 60,
      preventSuspend: true,
      locationUpdateInterval: 1000,
      stopTimeout: 5,
      notification: {
        title: 'Palgeo Geofence Attendance App',
        text: '',
      },
      foregroundService: true,
      // Permissions
      locationAuthorizationRequest: 'Always',
      locationAuthorizationAlert: {
        titleWhenNotEnabled: 'Location-services not enabled',
        titleWhenOff: 'Location-services OFF',
        instructions:
          "You must enable 'Always' in location-services to enable Palgeo track your location",
        cancelButton: 'Cancel',
        settingsButton: 'Settings',
      },
      backgroundPermissionRationale: {
        title:
          "Allow Palgeo to access this device's location even when closed or not in use.",
        message:
          'In order to track your activity in the background, please enable "Allow all the time" permission.',
        positiveAction: 'Change to Allow all the time',
        negativeAction: 'Cancel',
      },
      // HTTP & Persistence
      //url: 'https://insproplus.com/palgeoapi/api/GeoFencing/travelcheckinbatch',
      // extras: {
      //   institute_id: num,
      //   staffCode: user_id,
      //   tripIdentitfier: uid,
      //   isCheckIn: false,
      //   isCheckOut: false,
      // },
      headers: {
        Authorization: 'Bearer ' + bearer_token,
      },
      httpRootProperty: 'locations',
      locationTemplate:
        '{"coordinates": {"latitude": <%= latitude %>, "longitude": <%= longitude %>, "accuracy": <%= accuracy %>}, "distance": <%= odometer %>}',
      autoSync: true,
      autoSyncThreshold: 5,
      maxDaysToPersist: 14,
      batchSync: true,
      maxBatchSize: 10,
      // Application
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
    });
    // }
    if (isIOS) {
      SplashScreen.hide();
    }
    AsyncStorage.getItem('locationPermissions').then(locationPermissions => {
      console.log('locationPermissions ==>', locationPermissions);
      this.setState({locationPermissions}, () => {
        if (
          this.state.locationPermissions === 'yes' ||
          this.state.locationPermissions
        ) {
          console.log('permissions granted');
        }
      });
    });

    //check for new app update
    //this.checkUpdateVersion();

    AsyncStorage.getItem('appIntro').then(appIntro => {
      this.setState({appIntro: appIntro});
    });
  }

  successLocation = position => {
    this.setState({position});
    console.log('accuracy_watch', position.coords);
  };

  errorLocation = error => console.log(error);

  async componentWillUnmount() {
    await this.updateStatus(false, new Date());
    //AppState.removeListener('change', this.checkUserActivity);
    // BackgroundGeolocation.removeAllListeners();
    this.subscriptions.forEach(subscription => subscription.remove());
    // if (this.unsubscribe) {
    //   this.unsubscribe();
    //   this.unsubscribe = null;
    // }
    // GPSState.removeListener(() => {
    //   console.log('GPS_state');
    // });
  }
  updateStatus = async (app_state_now, time) => {
    //console.log('app_status_now', app_state_now, new Date(time).toUTCString());
    const checked_out = await AsyncStorage.getItem('checked_out');
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    const StaffNo = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    const isFaceRequired = await AsyncStorage.getItem('isFaceRequired');
    //const app_status = await AsyncStorage.getItem('app_status');
    if (isFaceRequired === 'true') {
      if (checked_out === 'yes' || !checked_out) {
        return;
      }
      if (checked_out === 'no') {
        try {
          fetch(Const + 'api/Staff/UpdateStaffMobileAppActiveInactiveStatus', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + bearer_token,
              Accept: 'application/json, text/plain',
              'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify({
              StaffCode: StaffNo,
              InstituteId: Number(institute_id),
              IsActive: app_state_now,
              UpdateTime: new Date(time).toUTCString(),
            }),
          }).then(() => AsyncStorage.setItem('app_status', 'active'));
        } catch (error) {
          console.log('error', error);
        }
      }
      return;
    }
    if (isFaceRequired === 'false') {
      try {
        fetch(Const + 'api/Staff/UpdateStaffMobileAppActiveInactiveStatus', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + bearer_token,
            Accept: 'application/json, text/plain',
            'Content-Type': 'application/json-patch+json',
          },
          body: JSON.stringify({
            StaffCode: StaffNo,
            InstituteId: Number(institute_id),
            IsActive: app_state_now,
            UpdateTime: new Date(time).toUTCString(),
          }),
        }).then(() => AsyncStorage.setItem('app_status', 'active'));
      } catch (error) {
        console.log('error', error);
      }
      return;
    }
  };

  onIds(device) {
    try {
      AsyncStorage.setItem('device_token', device.userId);
      console.log('[device_token]', device.userId);
    } catch (e) {
      console.log(e);
    }
  }
  async onReceived(notification) {
    //console.warn('Notification received: ', notification);
    try {
      const response = await fetch(Const + 'api/MobileApp/UpdateNotification', {
        method: 'POST',
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify({
          NotificationId: notification.notificationId,
          IsReceived: true,
          IsRead: false,
        }),
      });
      //RootNavigation.navigate('CircularList', {data: 'push'});
    } catch (error) {
      console.log('error', error);
    }
  }
  async onOpened(openResult) {
    console.log('opened', openResult);
    try {
      const response = await fetch(Const + 'api/MobileApp/UpdateNotification', {
        method: 'POST',
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify({
          NotificationId: openResult.notificationId,
          IsReceived: true,
          IsRead: true,
        }),
      });
      RootNavigation.navigate('CircularList', {data: 'push'});
    } catch (error) {
      console.log('error', error);
    }
  }

  _renderItem = ({item}) => {
    return (
      <View style={styles.slide}>
        <View>
          <LottieView
            style={{width: '100%'}}
            resizeMode={'contain'}
            source={item.image}
            autoPlay
            loop
          />
        </View>
        <View style={styles.headingContainer}>
          <Image
            source={require('./src/assets/ic_launcher_round.png')}
            style={{
              width: 40,
              height: 40,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
          />
          <Text style={styles.heading}>{item.title}</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{item.text}</Text>
        </View>
      </View>
    );
  };
  _onDone = async () => {
    if (isIOS) {
      this.askForTrackingPermissions();
    }
    try {
      await AsyncStorage.setItem('appIntro', 'done');
      this.setState({showRealApp: true, appIntro: 'done'});
    } catch (e) {
      console.log(e);
    }
  };

  checkUpdateVersion = () => {
    VersionCheck.needUpdate().then(async res => {
      console.log('update needed ==>', res.isNeeded);
      if (res.isNeeded) {
        this.setState({newVersionRequired: true});
      } else {
        this.setState({newVersionRequired: false});
      }
    });
  };
  renderDoneButton = () => {
    return (
      <ProgressCircle
        percent={33.33 * 3}
        radius={30}
        borderWidth={3}
        color="#108B1D"
        shadowColor="#CCCCCC"
        bgColor="#fff">
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: Colors.button[0],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="arrow-right" type="feather" size={20} color={'white'} />
        </View>
      </ProgressCircle>
      // <View style={styles.nextContainer}>
      //   <Text style={styles.next}>Next</Text>
      // </View>
    );
  };
  renderNextButton = () => {
    const {multiple} = this.state;
    console.log('I ran', multiple);
    return (
      <ProgressCircle
        percent={33.33 * multiple}
        radius={30}
        borderWidth={3}
        color="#108B1D"
        shadowColor="#CCCCCC"
        bgColor="#fff">
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: Colors.button[0],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="arrow-right" type="feather" size={20} color={'white'} />
        </View>
      </ProgressCircle>
      // <View style={styles.nextContainer}>
      //   <Text style={styles.next}>Next</Text>
      // </View>
    );
  };
  renderPrevButton = () => {
    return (
      <View style={styles.nextContainer1}>
        <Text style={styles.next}>Back</Text>
      </View>
    );
  };

  goToPlayStore = async () => {
    const url = await VersionCheck.getStoreUrl();
    console.log('url', url);
    //const oldUrl = 'market://details?id=' + VersionNumber.bundleIdentifier;
    Linking.openURL(url)
      .catch(e =>
        alert('Something went wrong while updating the app. Please try again.'),
      )
      .then(success => this.setState({newVersionRequired: false}));
  };

  askForTrackingPermissions = async () => {
    const check = await getTrackingStatus();
    console.log('checkTrackingStatus', check);
    this.setState({trackingPermissions: true});
    if (check === 'not-determined') {
      const status = await requestTrackingPermission();
      console.log('status', status);

      if (status === 'authorized' || status === 'unavailable') {
        await AsyncStorage.setItem('trackingPermissions', 'yes');
        Geolocation.requestAuthorization('always').then(async res => {
          console.log('ress===', res);
          if (res === 'denied') {
            return await AsyncStorage.setItem('locationPermissionsIos', 'no');
          }
          await AsyncStorage.setItem('locationPermissionsIos', 'yes');
          console.log('permissions given for ios');
        });
      } else {
        await AsyncStorage.setItem('trackingPermissions', 'yes');
        alert('Tracking permission denied.');
      }
    }
    if (check === 'authorized' || check === 'unavailable') {
      await AsyncStorage.setItem('trackingPermissions', 'yes');
      const res_1 = await Geolocation.requestAuthorization('always');
      if (res_1 === 'denied') {
        return await AsyncStorage.setItem('locationPermissionsIos', 'no');
      }
      await AsyncStorage.setItem('locationPermissionsIos', 'yes');
      console.log('permissions given for ios');
    }
  };

  render() {
    //console.log('app on mount', AppState.currentState);
    if (this.state.newVersionRequired) {
      return (
        <AskForUpdate
          goToPlayStore={this.goToPlayStore}
          onClose={() => this.setState({newVersionRequired: false})}
        />
      );
    }

    if (!this.state.locationPermissions && Platform.OS === 'android') {
      return (
        <AskForPermissions
          onPress={this.askForPermissions}
          onPressCancel={() => {
            this.setState({locationPermissions: false});
            BackHandler.exitApp();
          }}
        />
      );
    }

    if (this.state.appIntro == 'done') {
      return (
        <NavigationContainer ref={RootNavigation.navigationRef}>
          {/* <Root> */}

          <MainNavigator />
          {/* </Root> */}
        </NavigationContainer>
      );
      //console.log('done')
    } else if (this.state.appIntro == '') {
      return (
        <View style={{flex: 1, backgroundColor: '#ffffff'}}>
          <StatusBar backgroundColor="#ffffff" hidden />
          <Image
            source={require('./src/assets/ic_bg.png')}
            style={styles.introBg}
          />
          <View style={{flex: 1, marginBottom: hp('15')}}>
            <AppIntroSlider
              renderItem={this._renderItem}
              data={slides}
              onDone={this._onDone}
              activeDotStyle={{backgroundColor: '#f05760'}}
              dotStyle={{backgroundColor: '#f9bcbf'}}
              // onNext={(cur, prev) =>
              //   this.setState({
              //     multiple:
              //       cur > prev
              //         ? this.state.multiple + 1
              //         : this.state.multiple - 1,
              //   })
              // }
              onSlideChange={(cur, prev) =>
                this.setState({
                  multiple:
                    cur > prev
                      ? this.state.multiple + 1
                      : this.state.multiple - 1,
                })
              }
              showDoneButton={true}
              showNextButton={true}
              showPrevButton={true}
              renderDoneButton={this.renderDoneButton}
              renderNextButton={this.renderNextButton}
              renderPrevButton={this.renderPrevButton}
            />
          </View>
        </View>
      );
    } else {
      return (
        <View style={{flex: 1, backgroundColor: '#ffffff'}}>
          <StatusBar backgroundColor="#ffffff" hidden />
          <Image
            source={require('./src/assets/ic_bg.png')}
            style={styles.introBg}
          />
          <View style={{flex: 1, marginBottom: hp('15')}}>
            <AppIntroSlider
              renderItem={this._renderItem}
              data={slides}
              onDone={this._onDone}
              activeDotStyle={{backgroundColor: '#f05760'}}
              dotStyle={{backgroundColor: '#f9bcbf'}}
              showDoneButton={true}
              showNextButton={true}
              showPrevButton={true}
              renderDoneButton={this.renderDoneButton}
              renderNextButton={this.renderNextButton}
              renderPrevButton={this.renderPrevButton}
              onSlideChange={(cur, prev) =>
                this.setState({
                  multiple:
                    cur > prev
                      ? this.state.multiple + 1
                      : this.state.multiple - 1,
                })
              }
              // onNext={(cur, prev) =>
              //   this.setState({
              //     multiple:
              //       cur > prev
              //         ? this.state.multiple + 1
              //         : this.state.multiple - 1,
              //   })
              // }
            />
          </View>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '30%',
  },
  heading: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: Colors.button[0],
    textAlign: 'center',
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#555a6d',
    textAlign: 'center',
  },
  descriptionContainer: {
    marginLeft: '10%',
    marginRight: '10%',
  },
  headingContainer: {
    marginTop: '7%',
  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  next: {
    fontFamily: 'Poppins-Regular',
    fontSize: 17,
  },
  previous: {
    fontFamily: 'Poppins-Regular',
    fontSize: 17,
  },
  next: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: '#f05760',
  },
  nextContainer: {
    paddingTop: '25%',
  },
  nextContainer1: {
    paddingTop: '26%',
  },
  introBg: {
    width: wp('100'),
    height: hp('100'),
    backgroundColor: Colors.button[0],
    position: 'absolute',
  },
});
