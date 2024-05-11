import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  ScrollView,
  AppState,
  NativeModules,
  NativeEventEmitter,
  TouchableOpacity,
  BackHandler,
  Dimensions,
} from 'react-native';
import {
  CustomHeader,
  Loader,
  Constants as Const,
  CustomModal,
  CustomModalTextArea,
  CustomLabel,
  ImageCard,
  CustomButton,
  CheckinCard,
  NewCheckinCard,
  EmptyView,
  PrimaryCard,
  SuccessError,
} from './common/index';
import {VStack} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import DocumentPicker from 'react-native-document-picker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AwesomeAlert from 'react-native-awesome-alerts';
import {
  getStatus,
  getAssignedLocations,
  getBeaconLocations,
  getWifiLocations,
  validatePointWithinCircle,
  asyncStorageDataFetch,
  asyncStorageDataSet,
  inBetween,
  disableBatteryOptimization,
} from '../utils/helperFunctions';
import WifiManager from 'react-native-wifi-reborn';
import BackgroundGeolocation from 'react-native-background-geolocation';
import RNFetchBlob from 'rn-fetch-blob';
import {
  isIOS,
  OPEN_CAGE_APIKEY,
  OPEN_GEOCODING_API,
  PROFILE_PIC,
} from '../utils/configs/Constants';
import axios from 'axios';
import {Colors} from '../utils/configs/Colors';
import MapView, {Marker} from 'react-native-maps';
import {Avatar, Icon, ListItem} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {tokenApi} from '../utils/apis';
import MpinImage from '../assets/mpinCheckin.svg';
import QRImage from '../assets/qrCheckin.svg';
import BeaconImage from '../assets/beaconCheckin.svg';
// import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';
// import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import NetInfo from '@react-native-community/netinfo';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
var moment = require('moment');

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      checked_out: 'yes',
      running_status: 'resume',
      position: {},
      bearer_token: '',
      StaffNo: '',
      institute_id: '',
      showAlert: false,
      showAlert1: false,
      activities: [],
      error_message: '',
      modalVisible: false,
      modal: true,
      isPause: false,
      address: '',
      message: '',
      address: '',
      attachments: [],
      uploaded: false,
      current_travel_checkin: 'stopped',
      app_state: '',
      files: [],
      accuracy: '',
      latitude: 12.4,
      longitude: 78.3,
      appointments: [],
      appointment: null,
      modalVisible1: false,
      checkInTime: '9:00 AM',
      checkOutTime: '5:00 PM',
      shedcheckInTime: '09:00:00',
      shedcheckOutTime: '17:00:00',
      curTime: new Date().toLocaleTimeString(),
      travelCheckIn: false,
      travelMpinPressed: false,
      qrCheckInPressed: false,
      geofence: {},
      shiftName: '',
      modeOfCheckIn: '',
      latitudeChecked: null,
      longitudeChecked: null,
      isOn: true,
      assignedLocationsAll: [],
    };
  }

  successLocation = position => {
    this.setState({
      position,
      accuracy: position.coords.accuracy,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    console.log('psition-watch', position.coords);
  };

  errorLocation = error => alert('Error finding location:' + error.message);

  checkUserActivity = state => {
    if (state === 'active') {
      this.retrieveData();
    }
  };

  handleBeaconCheckin = async () => {
    this.enableBluetooth();
  };

  enableBluetooth = () => {
    BleManager.enableBluetooth()
      .then(() => {
        // Success code
        console.log('The bluetooth is already enabled or the user confirm');
        //this.startConnect();
        BleManager.start({showAlert: false});
        this.startScan();
      })
      .catch(error => {
        //Failure code
        Alert.alert('Attention', 'Please turn on your bluetooth', [
          {
            text: 'OK',
            onPress: () => {
              this.handleBeaconCheckin();
              h;
            },
          },
        ]);
        return;
      });
  };

  startScan = async () => {
    console.log('scanning..');
    if (!this.state.isScanning) {
      try {
        const results = await BleManager.scan([], 5, true);
        //console.log('results', results);
        this.setState({isScanning: true});
      } catch (e) {
        console.log(e.message);
      }
    }
  };

  handleStopScan = async () => {
    console.log('Scan is stopped');
    this.setState({isScanning: false});
  };

  handleDiscoverPeripheral = async peripheral => {
    if (AppState.currentState !== 'active') {
      return;
    }
    //console.log('peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'unknown';
    }

    this.state.beaconLocations.forEach(async beaconLocation => {
      if (
        beaconLocation.uniqueId === peripheral.id &&
        Math.abs(peripheral.rssi) <= 65
      ) {
        //await BleManager.connect(peripheral.id);
        this.setState({isScanning: false});
        const isFace = await asyncStorageDataFetch('isFaceRequired');
        if (this.state.checked_out === 'no') {
          return this.props.navigation.navigate('Checkout', {
            show: isFace == 'false' ? false : true,
            travelCheckOut: false,
            qrCheckin: 'false',
            show2: false,
            travel_check_in: 'no',
            isTravelCheckinWithMpin: false,
            showMpinAlert: false,
            beacon: true,
            beaconLocation,
          });
        }
        return this.props.navigation.navigate('Checkin', {
          show: isFace == 'false' ? false : true,
          qrCheckin: 'false',
          beacon: true,
          beaconLocation,
          travel: 'no',
          isTravelCheckinWithMpin: false,
        });
      }
    });
  };

  backButtonPress = () => {
    return true;
  };

  async componentDidMount() {
    // NetInfo.fetch().then(state => {
    //   console.log('Connection type', state);
    // });

    this.watchID = Geolocation.watchPosition(
      this.successLocation,
      this.errorLocation,
      {
        enableHighAccuracy: true,
        fastestInterval: 1000,
        interval: 1000,
        distanceFilter: 0,
      },
    );
    setTimeout(() => Geolocation.clearWatch(this.watchID), 4000);

    if (!isIOS) {
      const enabled = await WifiManager.isEnabled();
      console.log('enabled', enabled);
      if (!enabled) WifiManager.setEnabled(true);
    } else {
      const details = await NetInfo.fetch();
      this.setState({isWifiConnected: details.type === 'wifi'});
      console.log('details', details);
    }

    this.appState = AppState.addEventListener('change', this.checkUserActivity);
    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this.backButtonPress,
      );
    });
    BackHandler.addEventListener('hardwareBackPress', this.backButtonPress);
    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);

    try {
      await this.retrieveData().then(() => {
        this.getTasks();
        this.getType();
      });
    } catch (e) {
      // alert('Error fetching user current check in status: ' + e);
      console.log('Error fetching user current check in status: ', e);
    }
    // this.willFocusSubscription = this.props.navigation.addListener('focus', this.retrieveData)
  }

  getType = async () => {
    const url =
      Const +
      'api/Leave/GetLeaveTypeSubCategoriesByInstituteId?instituteId=' +
      this.state.institute_id +
      '&leaveRequestId=' +
      10 +
      '&staffCode=' +
      this.state.StaffNo;
    try {
      const response = await axios.get(url);
      // console.log('GetLeaveTypeSubCategoriesByInstituteId =', response.data);
      if (response.data.length > 0) {
        await AsyncStorage.setItem(
          'leaveTypeId',
          response.data[0].leaveId.toString(),
        );
      }
    } catch (error) {
      this.setState({loader: false});
      console.log(error.message);
    }
  };

  getTasks = async () => {
    const user_id = await asyncStorageDataFetch('user_id');
    const institute_id = await asyncStorageDataFetch('institute_id');
    try {
      const res = await tokenApi();
      const response = await res.post('api/Staff/StaffTasks', {
        staffCode: user_id,
        instituteId: institute_id,
      });
      console.log('response: ' + JSON.stringify(response.data));
      console.log('staffCode = ', user_id, 'instituteId = ', institute_id);
      const {data} = response;
      if (data.length === 0) return;
      const filtered = data.filter(
        e =>
          moment(e.taskStartTime, 'YYYY-MM-DDT00:00:00').format(
            'YYYY-MM-DD',
          ) === moment().format('YYYY-MM-DD'),
      );
      this.setState({activities: filtered});
    } catch (e) {
      console.log('Hello, task error', e.message);
    }
  };

  retrieveData = async () => {
    const assignedLocationsAll = await getAssignedLocations();
    const beaconLocations = await getBeaconLocations();
    const wifiLocations = await getWifiLocations();
    const locations = JSON.parse(await asyncStorageDataFetch('locations'));
    const checked_out = await asyncStorageDataFetch('checked_out');
    const bearer_token = await asyncStorageDataFetch('bearer_token');
    const StaffNo = await asyncStorageDataFetch('user_id');
    const institute_id = await asyncStorageDataFetch('institute_id');
    const running_status = await asyncStorageDataFetch('running_status');
    const current_travel_checkin = await asyncStorageDataFetch(
      'current_travel_checkin',
    );
    const profile_pic = await asyncStorageDataFetch('profile_pic');
    const isFaceRequired = await asyncStorageDataFetch('isFaceRequired');
    const qrCheckin = await asyncStorageDataFetch('qrCheckin');
    const qrCheckOut = await asyncStorageDataFetch('qrCheckout');
    const travel_check_in = await asyncStorageDataFetch('travel_check_in');
    //this.setState({travel_check_in})
    //console.log('travel_check_in', travel_check_in);
    const travelCheckIn = await asyncStorageDataFetch('travelCheckIn');
    const qrCheckInPressed = await asyncStorageDataFetch('qrCheckInPressed');
    const travelMpinPressed = await asyncStorageDataFetch('travelMpinPressed');
    const actualCheckInTime = await asyncStorageDataFetch('actualCheckInTime');
    const isTravelCheckinWithMpin = await asyncStorageDataFetch(
      'isTravelCheckinWithMpin',
    );
    const beaconPressed = await asyncStorageDataFetch('beaconPressed');
    const wifiPressed = await asyncStorageDataFetch('wifiPressed');
    const trackInBackground = await asyncStorageDataFetch('trackInBackground');
    this.setState({
      refreshing: true,
      assignedLocationsAll,
      beaconLocations,
      wifiLocations,
      locations,
      checked_out,
      bearer_token,
      StaffNo,
      institute_id,
      running_status: running_status ? running_status : 'resume',
      current_travel_checkin: current_travel_checkin
        ? current_travel_checkin
        : 'stopped',
      travel_check_in: travel_check_in === 'yes' ? true : false,
      qrCheckin: qrCheckin === 'true' ? true : false,
      qrCheckOut: qrCheckOut === 'true' ? true : false,
      isTravelCheckinWithMpin: isTravelCheckinWithMpin === 'yes' ? true : false,
      isFaceRequired,
      profile_pic,
      actualCheckInTime,
      travelCheckIn: travelCheckIn === 'yes' ? true : false,
      qrCheckInPressed: qrCheckInPressed === 'yes' ? true : false,
      travelMpinPressed: travelMpinPressed === 'yes' ? true : false,
      beaconPressed: beaconPressed === 'yes' ? true : false,
      wifiPressed: wifiPressed === 'yes' ? true : false,
      trackInBackground,
    });

    const body = {
      staffCode: StaffNo,
      instituteId: institute_id,
    };

    const {enabled} = await BackgroundGeolocation.getState();
    //const tasks = ReactNativeForegroundService.get_all_tasks();
    //console.log('taks', tasks, isFaceRequired, isTravelCheckinWithMpin);
    await this.checkCheckinStatus(body);
    console.log('iFace', isFaceRequired);
    if (isFaceRequired === 'false' && isTravelCheckinWithMpin == 'no') {
      // if (trackInBackground === 'true') {
      //   if (wifiLocations.length > 0) {
      //     console.log('I ran');
      //     var dt = new Date(); //current Date that gives us current Time also
      let {shedcheckInTime, shedcheckOutTime} = this.state;
      if (wifiLocations.length > 0) {
        if (!this.state.isWifiConnected && isIOS) {
          return alert('Please connect to wifi first');
        }
        shedcheckInTime = moment
          .utc(wifiLocations[0].checkInTime, 'HH:mm:ss')
          .local()
          .format('HH:mm:ss');
        shedcheckOutTime = moment
          .utc(wifiLocations[0].checkOutTime, 'HH:mm:ss')
          .local()
          .format('HH:mm:ss');
      }
      var startTime = shedcheckInTime;
      var endTime = shedcheckOutTime;

      const inBetweenTime = inBetween(startTime, endTime);
      console.log('inBetween', inBetweenTime);
      if (!inBetweenTime) {
        if (enabled) {
          return BackgroundGeolocation.stop();
        }
        return;
      }
      //     if (dt >= dt1 && dt <= dt2) {
      //       ReactNativeForegroundService.start({
      //         id: 144,
      //         title: 'Wifi Check in',
      //         message: 'Tracking nearby wifi devices',
      //       });
      //     } else {
      //       ReactNativeForegroundService.stop();
      //     }
      //   }
      //   return;
      // }
      if (trackInBackground === 'true') {
        console.log('I ran bro!');
        if (!enabled) {
          await BackgroundGeolocation.start();
        }

        disableBatteryOptimization();
      }
    }
    if (
      (checked_out === 'yes' && isFaceRequired === 'true') ||
      isTravelCheckinWithMpin === 'yes'
    ) {
      if (enabled) {
        //await BackgroundGeolocation.resetOdometer();
        if (current_travel_checkin === 'stopped') {
          await BackgroundGeolocation.stop();
        }
      }
    }
  };

  checkCheckinStatus = async body => {
    try {
      const state = await BackgroundGeolocation.getState();
      console.log('bg_state_enabled', state.enabled);
      console.log('bg_state_extras', state.extras);
      const trackInBackground = await asyncStorageDataFetch(
        'trackInBackground',
      );
      const currentTravelLocation = await asyncStorageDataFetch(
        'currentTravelLocation',
      );
      const geoOld = await asyncStorageDataFetch('geoOld');
      const isFaceRequired = await asyncStorageDataFetch('isFaceRequired');
      const res = await tokenApi();
      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55',
      );
      console.log(JSON.stringify(body));
      console.log(
        '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55',
      );
      const response = await res.post('api/Staff/IsCheckedInNew', body);
      const json = response.data;
      this.setState({refreshing: false, isOn: true});
      // ToDo:
      //new one time check in flag logic

      if (json && !json.isCheckedIn) {
        if (state.enabled && isFaceRequired === 'true') {
          //await BackgroundGeolocation.resetOdometer();
          await BackgroundGeolocation.stop();
        }
        //console.log('I ran');
        this.setState({checked_out: 'yes'});
        await AsyncStorage.setItem('checked_out', 'yes');
        await AsyncStorage.setItem('geo_id', '');
        await AsyncStorage.setItem('radius', '');
        await AsyncStorage.setItem('coordinates', JSON.stringify([]));
        await AsyncStorage.setItem('current_travel_checkin', 'stopped');
        //return;
      }
      if (json && json.isCheckedIn) {
        this.setState({
          modeOfCheckIn: json.modeOfCheckIn,
          actualCheckInTime: moment
            .utc(json?.checkedInTime)
            .local()
            .format('DD.MM.YYYY h:mm a'),
          checked_out: 'no',
        });
        //console.log('I ran again');
        await AsyncStorage.setItem('checked_out', 'no');
        await AsyncStorage.setItem(
          'actualCheckInTime',
          moment.utc(json?.checkedInTime).local().format('DD.MM.YYYY h:mm a'),
        );
        if (json?.shiftInfo) {
          await AsyncStorage.setItem(
            'checkInTime',
            json?.shiftInfo
              ? moment
                  .utc(json?.shiftInfo?.checkinTime)
                  .local()
                  .format('h:mm a')
              : '',
          );
          await AsyncStorage.setItem(
            'checkOutTime',
            json?.shiftInfo
              ? moment
                  .utc(json?.shiftInfo?.checkoutTime)
                  .local()
                  .format('h:mm a')
              : '',
          );
          await AsyncStorage.setItem(
            'shedcheckInTime',
            json?.shiftInfo
              ? moment
                  .utc(json?.shiftInfo?.checkinTime)
                  .local()
                  .format('HH:mm:ss')
              : '',
          );
          await AsyncStorage.setItem(
            'shedcheckOutTime',
            json?.shiftInfo
              ? moment
                  .utc(json?.shiftInfo?.checkoutTime)
                  .local()
                  .format('HH:mm:ss')
              : '',
          );
          this.setState({
            checkInTime: moment
              .utc(json?.shiftInfo?.checkinTime)
              .local()
              .format('h:mm a'),
            checkOutTime: moment
              .utc(json?.shiftInfo?.checkoutTime)
              .local()
              .format('h:mm a'),
            shedcheckInTime: moment
              .utc(json?.shiftInfo?.checkinTime)
              .local()
              .format('HH:mm:ss'),
            shedcheckOutTime: moment
              .utc(json?.shiftInfo?.checkoutTime)
              .local()
              .format('HH:mm:ss'),
            shiftName: json?.shiftInfo?.shiftName,
          });
        }
        //let latitudeChecked = [];
        if (json?.locationDetails) {
          this.setState({
            geofence: json?.locationDetails,
          });
          const coordinates = JSON.parse(json.locationDetails.coordinates);
          if (coordinates.length > 0) {
            const latitudeChecked = JSON.parse(
              json?.locationDetails?.coordinates,
            );
            //console.log('latitudeChecked', latitudeChecked[0]);
            this.setState({
              latitudeChecked: latitudeChecked[0].Latitude,
              longitudeChecked: latitudeChecked[0].Longitude,
            });
          }
        }
        console.log('state_bg===retriecve', state);
        if (trackInBackground === 'true' && !state.enabled) {
          await BackgroundGeolocation.start();
          await BackgroundGeolocation.resetOdometer();
          disableBatteryOptimization();
        }

        if (json.isTravelCheckIn) {
          await AsyncStorage.setItem('current_travel_checkin', 'running');
          await this.getAppointments();

          if (!currentTravelLocation) {
            await AsyncStorage.setItem(
              'currentTravelLocation',
              JSON.stringify(this.state.position?.coords),
            );
          }
          return this.setState({current_travel_checkin: 'running'});
        }
        if (json?.locationDetails?.type === 'Circle' && !json.isTravelCheckIn) {
          //console.log('geoOld', geoOld);
          if (geoOld) {
            return;
          }
          await AsyncStorage.setItem(
            'radius',
            json.locationDetails.radius.toString(),
          );
          await AsyncStorage.setItem(
            'geo_id',
            json.locationDetails.id.toString(),
          );
          await AsyncStorage.setItem(
            'coordinates',
            JSON.stringify(json.locationDetails.coordinates),
          );
        }
      }
    } catch (e) {
      if (e.message.includes('Network')) {
        this.setState({isOn: false});
      }
      this.setState({refreshing: false});
      // alert('Error fetching current checkin status: ' + e.message);
      console.log('Error fetching current checkin status: ', e.message);
    }
  };

  getAppointments = async () => {
    const instituteId = this.state.institute_id;
    const StaffCode = this.state.StaffNo;
    const calendarView = 'day';
    const url = `${Const}api/GeoFencing/travelcheckin/Details/${instituteId}/${StaffCode}/${calendarView}`;
    // const url =
    //   'http://182.71.102.212/palgeoapi/api/GeoFencing/travelcheckin/Details/27185/120220007/day';
    try {
      console.log('url = ', url);
      const response = await axios.get(url);
      console.log('appointments', response.data);
      if (response?.data?.length > 0) {
        const travelLocations = response.data.map(loc => {
          return {
            latitude: loc.latitude,
            longitude: loc.longitude,
            address: loc.address,
            id: loc.appointmentId,
            status: loc.status,
          };
        });
        await AsyncStorage.setItem(
          'travelLocations',
          JSON.stringify(travelLocations),
        );
      }
      let data = [];
      data = response.data.sort(
        (e1, e2) =>
          new Date(e1.startDateTime).getTime() >
          new Date(e2.startDateTime).getTime(),
      );
      //console.log('data ==>', data);
      this.setState({appointments: data});
    } catch (e) {
      alert(e.message);
    }
  };

  async componentWillUnmount() {
    //this.props.navigation.removeListener(this.willFocusSubscription);
    BackHandler.removeEventListener('hardwareBackPress', this.backButtonPress);
    this.props.navigation.removeListener('blur', () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this.backButtonPress,
      );
    });
    this.appState.remove();
    Geolocation.clearWatch(this.watchID);
    //clearInterval(this.interval);
  }

  openModal = async status => {
    const {assignedLocationsAll} = this.state;
    this.setState({attachments: [], message: ''}, () => {
      Geolocation.getCurrentPosition(
        async position => {
          var coordinates = {
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
          };
          let count = 0;
          const filteredLocations = assignedLocationsAll.filter(
            e => e.type !== 'Anonymous',
          );
          if (filteredLocations.length > 0) {
            filteredLocations.forEach(e => {
              const check = validatePointWithinCircle(e, coordinates);
              console.log('check', check);
              if (check) {
                return this.setState({
                  address: e.accessLocation,
                  // modalVisible: true,
                  isPause: status,

                  uploaded: false,
                  message: '',
                });
              }
              count += 1;
            });
          }
          if (count === filteredLocations.length) {
            const {data} = await axios.get(
              `${OPEN_GEOCODING_API}${position.coords.latitude}+${position.coords.longitude}&key=${OPEN_CAGE_APIKEY}`,
            );
            const formatted_address = data.results[0].formatted;
            this.setState({
              modalVisible: true,
              isPause: status,
              address: formatted_address,
              uploaded: false,
              message: '',
            });
          } else {
            this.setState({modalVisible: true});
          }

          // Geocoder.from(coordinates.latitude, coordinates.longitude)
          //   .then(json => {

          // })
          // .catch(error => console.log(error));
        },
        error => {},
        {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000},
      );
    });
  };
  pauseOrResume = async status => {
    const coordinates = JSON.parse(
      await asyncStorageDataFetch('userCurrentLocation'),
    );
    if (coordinates) {
      this.setState({showAlert: true, modalVisible: false});
      console.log(
        'body ===> ',
        JSON.stringify({
          instituteId: Number(this.state.institute_id),
          StaffCode: this.state.StaffNo,
          coordinates,
          isCheckOut: false,
          isCheckIn: false,
          address: this.state.address,
          message: this.state.message,
          isPause: status,
          attachments: !status ? this.state.attachments : [],
        }),
      );
      console.log('api/GeoFencing/travelcheckin/pause/update');
      fetch(Const + 'api/GeoFencing/travelcheckin/pause/update', {
        method: 'POST',
        withCredentials: true,
        credentials: 'include',
        headers: {
          Authorization: 'Bearer ' + this.state.bearer_token,
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify({
          instituteId: Number(this.state.institute_id),
          StaffCode: this.state.StaffNo,
          coordinates,
          isCheckOut: false,
          isCheckIn: false,
          address: this.state.address,
          message: this.state.message,
          isPause: status,
          attachments: !status ? this.state.attachments : [],
        }),
      })
        .then(response => response.json())
        .then(json => {
          console.log('json_travel', json);
          if (status) {
            AsyncStorage.setItem('running_status', 'pause');
            this.setState({running_status: 'pause'});
          } else if (!status) {
            AsyncStorage.setItem('running_status', 'resume');
            this.setState({running_status: 'resume'});
          }
          if (json.status) {
            this.setState({
              showAlert1: true,
              error_message: json.message,
              showAlert: false,
              files: [],
              attachments: [],
            });
          } else {
            this.setState({
              showAlert1: true,
              error_message: json.message,
              showAlert: false,
              files: [],
              attachments: [],
            });
          }
        })
        .catch(error => {
          this.setState({
            showAlert1: true,
            error_message: 'Unknown error occured',
            showAlert: false,
            files: [],
            attachments: [],
          });
        });
    } else {
      Geolocation.getCurrentPosition(
        position => {
          const currentLongitude = parseFloat(position.coords.longitude);
          const currentLatitude = parseFloat(position.coords.latitude);
          var coordinates = {
            latitude: currentLatitude,
            longitude: currentLongitude,
          };
          this.setState({showAlert: true, modalVisible: false});
          console.log(
            'body == >',
            JSON.stringify({
              instituteId: Number(this.state.institute_id),
              StaffCode: this.state.StaffNo,
              coordinates,
              isCheckOut: false,
              isCheckIn: false,
              address: this.state.address,
              message: this.state.message,
              isPause: status,
              attachments: !status ? this.state.attachments : [],
            }),
          );
          console.log('api/GeoFencing/travelcheckin/pause/update');
          fetch(Const + 'api/GeoFencing/travelcheckin/pause/update', {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: {
              Authorization: 'Bearer ' + this.state.bearer_token,
              Accept: 'application/json, text/plain',
              'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify({
              instituteId: Number(this.state.institute_id),
              StaffCode: this.state.StaffNo,
              coordinates,
              isCheckOut: false,
              isCheckIn: false,
              address: this.state.address,
              message: this.state.message,
              isPause: status,
              attachments: !status ? this.state.attachments : [],
            }),
          })
            .then(response => response.json())
            .then(json => {
              console.log('json_travel', json);
              if (status) {
                AsyncStorage.setItem('running_status', 'pause');
                this.setState({running_status: 'pause'});
              } else if (!status) {
                AsyncStorage.setItem('running_status', 'resume');
                this.setState({running_status: 'resume'});
              }
              if (json.status) {
                this.setState({
                  showAlert1: true,
                  error_message: json.message,
                  showAlert: false,
                });
              } else {
                this.setState({
                  showAlert1: true,
                  error_message: json.message,
                  showAlert: false,
                });
              }
            })
            .catch(error => {
              this.setState({
                showAlert1: true,
                error_message: 'Unknown error occured',
                showAlert: false,
              });
            });
        },
        error => {
          console.log(error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 0},
      );
    }
  };
  uploadAttachments = async () => {
    try {
      const results = await DocumentPicker.pickMultiple({
        includeBase64: true,
        type: [DocumentPicker.types.allFiles],
      });
      var tempArr = [];
      var files = [];
      // console.log('files', results);
      results.forEach(res => {
        RNFetchBlob.fs
          .readFile(res.uri, 'base64')
          .then(data => {
            var Attachment = {
              fileName: res.name,
              fileType: res.type,
              attachment: data,
            };
            // console.log("Arr", Attachment)
            this.setState({
              attachments: [...this.state.attachments, Attachment],
              uploaded: true,
              files: [...this.state.files, res.name],
            });
            // tempArr.push(Attachment)
            // files.push(res.name)
          })
          .catch(err => {});
        //console.log('files', files, tempArr)
      });
      //files = tempArr.map((tt) => tt.fileName)
    } catch (e) {
      console.log(e);
    }
  };

  renderItem = ({item, index, section}) => {
    return (
      <ListItem bottomDivider>
        <ListItem.Content>
          <Badge
            badgeStyle={{
              minWidth: 25,
              minHeight: 25,
              borderRadius: 15,
              padding: 3,
            }}
            value={item.status || 'Not Completed'}
            status={
              item.status === 'Completed'
                ? 'success'
                : item.status === 'Postponed'
                ? 'warning'
                : 'error'
            }
          />
          <ListItem.Title>{item.title}</ListItem.Title>
          <ListItem.Subtitle>{item.companyName}</ListItem.Subtitle>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '100',
              fontFamily: 'Poppins-Regular',
              color: 'rgba(0,0,0,0.6)',
            }}>{`${moment(item.startDateTime).format('h:mm a')} to ${moment(
            item.endDateTime,
          ).format('h:mm a')}`}</Text>
        </ListItem.Content>
        <ListItem.Chevron
          color={'black'}
          size={25}
          onPress={() =>
            this.props.navigation.navigate('AppointmentDetails', {item})
          }
        />
      </ListItem>
    );
  };

  openAppointment = item => {
    this.setState({appointment: item}, () =>
      this.setState({modalVisible1: true}),
    );
  };
  handleCheckbox = (index, status) => {
    const newArray = [...this.state.activities];
    newArray[index].isCompleted = !status;
    this.setState({activities: newArray});
  };
  handleCheckInOrOut = async () => {
    const {
      travelCheckIn,
      qrCheckInPressed,
      checked_out,
      qrCheckOut,
      qrCheckin,
      isTravelCheckinWithMpin,
      travel_check_in,
      travelMpinPressed,
      bearer_token,
      StaffNo,
      institute_id,
      beaconPressed,
      wifiPressed,
    } = this.state;

    if (checked_out === 'no') {
      console.log('wifif', wifiPressed);
      const isCheckedIn = await getStatus(bearer_token, StaffNo, institute_id);
      if (!isCheckedIn) {
        await AsyncStorage.setItem('checked_out', 'yes');
        this.setState({checked_out: 'yes'}, () =>
          alert('Please check in first'),
        );
        return this.props.navigation.replace('HomeScreen');
      }
      if (
        (!travelCheckIn &&
          !qrCheckInPressed &&
          !travelMpinPressed &&
          !beaconPressed &&
          !wifiPressed) ||
        (this.state.modeOfCheckIn === 'Auto CheckIn' && !wifiPressed)
      ) {
        const isFace = await asyncStorageDataFetch('isFaceRequired');
        this.props.navigation.navigate('Checkout', {
          show: isFace == 'false' ? false : true,
        });
      } else {
        if (beaconPressed) {
          return this.handleBeaconCheckin();
        }
        if (wifiPressed) {
          return this.handleWifiCheckin();
        }
        this.props.navigation.navigate('Checkout', {
          show: travelMpinPressed ? false : travelCheckIn,
          travelCheckOut: travelCheckIn,
          qrCheckin: qrCheckOut ? 'true' : 'false',
          show2: qrCheckInPressed,
          travel_check_in: travel_check_in ? 'yes' : 'no',
          isTravelCheckinWithMpin,
          showMpinAlert: travelMpinPressed,
        });
      }
      return;
    }
    const isCheckedIn = await getStatus(bearer_token, StaffNo, institute_id);
    // console.log('isCheckedIn', isCheckedIn);
    if (isCheckedIn) return this.props.navigation.replace('Homescreen');
    if (!travelCheckIn && !qrCheckInPressed && !travelMpinPressed) {
      //this.props.navigation.navigate('Checkin', {travel: false});
      const isFace = await asyncStorageDataFetch('isFaceRequired');
      this.props.navigation.navigate('Checkin', {
        show: isFace == 'false' ? false : true,
        qrCheckin: qrCheckin ? 'true' : 'false',
        travel: travel_check_in ? 'yes' : 'no',
        isTravelCheckinWithMpin,
      });
    } else {
      this.props.navigation.navigate('Checkin', {
        show: travelCheckIn,
        qrCheckin: qrCheckin ? 'true' : 'false',
        show2: qrCheckInPressed,
        travelCheckIn,
        travel: travel_check_in ? 'yes' : 'no',
        isTravelCheckinWithMpin,
        showMpinAlert: travelMpinPressed,
      });
    }
  };

  getLocationName = locationName => {
    let check = false;
    const {assignedLocationsAll} = this.state;
    assignedLocationsAll.forEach(e => {
      if (e.accessLocation === locationName) {
        check = true;
      }
    });
    return check;
  };

  handleWifiCheckin = async () => {
    const {checked_out} = this.state;
    const enabled = await WifiManager.isEnabled();
    if (!enabled) {
      return this.displayMsg('Please enable wifi first.', true, true);
    }
    await WifiManager.getBSSID()
      .then(async ssid => {
        //alert('bssid' + ssid);
        const findMatch = this.state.wifiLocations.find(
          wifi => wifi.wifiSsid === ssid,
        );
        if (!findMatch) {
          return this.displayMsg(
            'You are not connected to the assigned wifi. Please connect and then do checkin/checkout',
            true,
            true,
          );
        }
        if (findMatch) {
          if (!findMatch.isFaceRecognitionMandatory) {
            await this.checkinByWifi(findMatch, checked_out);
            return;
          }
          const isFace = await asyncStorageDataFetch('isFaceRequired');
          return this.props.navigation.navigate(
            checked_out === 'no' ? 'Checkout' : 'Checkin',
            {
              show: isFace == 'false' ? false : true,
              travel: 'no',
              wifi: true,
              wifiLocation: findMatch,
              isFaceRequired: findMatch.isFaceRecognitionMandatory,
            },
          );
        }
      })
      .catch(e => this.displayMsg('Please connect to wifi first.', true, true));
  };

  checkinByWifi = async (wifi, checked_out) => {
    const url = `api/Staff/StaffFace${
      checked_out === 'no' ? 'CheckOut' : 'CheckIn'
    }`;
    let uploadData = new FormData();
    uploadData.append('StaffNo', this.state.StaffNo);
    uploadData.append('InstituteId', this.state.institute_id);
    uploadData.append('FaceValidationMandatory', false);

    uploadData.append('AccessLocationId', wifi.id);
    const body = uploadData;
    try {
      const res = await tokenApi();
      const response = await res.post(url, body);
      const {data} = response;
      if (!data.status) {
        return this.displayMsg(data.message, true, true);
      }
      this.retrieveData().then(() => {
        this.displayMsg(data.message, false, true);
      });
    } catch (e) {
      this.displayMsg(e.message, true, true);
    }
  };

  displayMsg = (error_message, error, showAlert2) => {
    this.setState({
      error_message,
      error,
      showAlert2,
    });
  };

  render() {
    // console.log('state', this.state.profile_pic);
    const {checked_out, assignedLocationsAll} = this.state;
    //, checked_out);
    const innerComponent = (
      <>
        <View style={{marginTop: '3%'}}>
          <CustomLabel title={'Current Address'} />
          <CustomModalTextArea
            value={this.state.address}
            onChangeText={address => this.setState({address})}
            disabled
          />
        </View>
        <View style={{marginTop: '4%'}}>
          <CustomLabel title={'Message'} />
          <CustomModalTextArea
            value={this.state.message}
            onChangeText={message => {
              this.setState({message});
            }}
          />
        </View>
        {!this.state.isPause && (
          <View style={{marginTop: '4%'}}>
            <View style={styles.input}>
              <TouchableWithoutFeedback onPress={this.uploadAttachments}>
                <View>
                  {this.state.uploaded && (
                    // <Text style={styles.label}>
                    //   Uploaded Successfully
                    // </Text>
                    <Text style={styles.label}>
                      {this.state.files.join(',')}
                    </Text>
                  )}

                  {!this.state.uploaded && (
                    <Text style={styles.label}>Upload Attachments</Text>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        )}
        <TouchableWithoutFeedback
          onPress={() => this.pauseOrResume(this.state.isPause)}>
          <View style={styles.buttonContainer3}>
            <Text style={styles.footerText}>Submit</Text>
          </View>
        </TouchableWithoutFeedback>
      </>
    );
    //console.log(this.state.latitudeChecked);
    if (this.state.loader) {
      return <Loader />;
    }
    // if (this.state.newVersionRequired) {
    //   return <AskForUpdate />;
    // }
    return (
      <View style={styles.container}>
        {isIOS && (
          <LinearGradient
            colors={Colors.mainHeader}
            style={{height: StatusBar.currentHeight}}>
            <StatusBar backgroundColor="transparent" />
          </LinearGradient>
        )}
        <View style={styles.container}>
          <CustomHeader navigation={this.props.navigation} />
          {/*   */}

          <CustomModal
            title={'Please fill the details before you submit'}
            isVisible={this.state.modalVisible}
            deleteIconPress={() => {
              this.setState({modalVisible: false, address: ''});
            }}>
            {innerComponent}
          </CustomModal>
          <AwesomeAlert
            show={this.state.showAlert}
            showProgress={true}
            title="Loading"
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
          />
          <AwesomeAlert
            show={this.state.showAlert1}
            showProgress={false}
            title="Attention"
            message={this.state.error_message}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            cancelText="Okay"
            onCancelPressed={() => {
              this.setState({showAlert1: false});
            }}
            cancelButtonColor={Colors.button[0]}
            cancelButtonTextStyle={{
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
            }}
            messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
            titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
          />
          <SuccessError
            error={this.state.error}
            isVisible={this.state.showAlert2}
            subTitle={this.state.error_message}
            deleteIconPress={() => this.setState({showAlert2: false})}
          />
          <ScrollView
            style={{marginBottom: 100}}
            nestedScrollEnabled
            refreshing
            refreshControl={
              <RefreshControl
                style={{backgroundColor: 'transparent'}}
                refreshing={this.state.refreshing}
                onRefresh={() => this.retrieveData()}
                tintColor="#ff0000"
                title="Loading..."
                titleColor="#00ff00"
                //colors={['#ff0000', '#00ff00', '#0000ff']}
                //progressBackgroundColor="#ffff00"
              />
            }>
            <VStack>
              {checked_out === 'no' &&
                this.state.modeOfCheckIn !== 'Bio Metric CheckIn' && (
                  <View>
                    {this.state.latitudeChecked !== null && (
                      <>
                        <View
                          style={{
                            width: '100%',
                            alignSelf: 'center',
                            alignItems: 'center',
                            height: Dimensions.get('window').height * 0.4,
                          }}>
                          <MapView
                            //onRegionChange={this.onRegionChange}
                            style={{width: '100%', height: '100%'}}
                            //mapType={'satellite'}
                            //
                            loadingEnabled={false}
                            followUserLocation={true}
                            cacheEnabled={true}
                            initialRegion={{
                              latitude: this.state.latitudeChecked,
                              longitude: this.state.longitudeChecked,
                              latitudeDelta: 0.005,
                              longitudeDelta: 0.005,
                            }}
                            //scrollEnabled={true}
                            zoomEnabled={true}>
                            <Marker
                              //focusable
                              //draggable
                              coordinate={{
                                latitude: this.state.latitudeChecked,
                                longitude: this.state.longitudeChecked,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                              }}
                              tappable={false}
                              title={'Your Check In Location'}>
                              <View
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <CustomLabel
                                  containerStyle={{
                                    borderWidth: 2,
                                    borderColor: Colors.button[0],
                                    padding: 2,
                                    borderRadius: 8,
                                    backgroundColor: Colors.button[0],
                                  }}
                                  labelStyle={{color: 'white'}}
                                  title={'Your Check In Location'}
                                />
                                <Avatar
                                  rounded
                                  source={{
                                    uri: this.state.profile_pic || PROFILE_PIC,
                                  }}
                                  size={'small'}
                                />
                              </View>
                            </Marker>
                          </MapView>
                        </View>
                      </>
                    )}
                    <View
                      style={{
                        width: '100%',
                        alignSelf: 'center',
                        justifyContent: 'flex-end',
                        backgroundColor: '#F7F7F7',
                      }}>
                      <NewCheckinCard
                        modeOfCheckIn={this.state.modeOfCheckIn}
                        shiftName={this.state.shiftName}
                        accessLocation={this.state.geofence.accessLocation}
                        actualCheckInTime={this.state.actualCheckInTime}
                        checkInTime={this.state.checkInTime}
                        checkOutTime={this.state.checkOutTime}
                        onPress={() => this.handleCheckInOrOut()}>
                        {this.state.current_travel_checkin == 'running' && (
                          <View style={{alignSelf: 'flex-start'}}>
                            {this.state.running_status == 'resume' && (
                              <TouchableOpacity
                                onPress={() => this.openModal(true)}
                                style={{
                                  backgroundColor: Colors.red,
                                  borderRadius: 10,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 5,
                                }}>
                                <CustomLabel
                                  color={'white'}
                                  family={'Poppins-Regular'}
                                  title={'Pause'}
                                />
                              </TouchableOpacity>
                            )}
                            {this.state.running_status == 'pause' && (
                              <TouchableOpacity
                                onPress={() => this.openModal(false)}
                                style={{
                                  backgroundColor: Colors.green,
                                  borderRadius: 10,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 5,
                                  zIndex: 100,
                                }}>
                                <CustomLabel
                                  color={'white'}
                                  family={'Poppins-Regular'}
                                  title={'Resume'}
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </NewCheckinCard>
                    </View>
                  </View>
                )}
              {this.state.modeOfCheckIn === 'Bio Metric CheckIn' &&
                checked_out === 'no' && (
                  <View
                    style={{
                      alignSelf: 'center',
                    }}>
                    <CustomLabel size={25} title={this.state.modeOfCheckIn} />
                    <NewCheckinCard
                      modeOfCheckIn={this.state.modeOfCheckIn}
                      shiftName={this.state.shiftName}
                      accessLocation={this.state.geofence.accessLocation}
                      actualCheckInTime={this.state.actualCheckInTime}
                      checkInTime={this.state.checkInTime}
                      checkOutTime={this.state.checkOutTime}
                      onPress={() => this.handleCheckInOrOut()}
                    />
                    {/* <CustomButton
                      onPress={() => this.handleCheckInOrOut()}
                      title={'Check Out'}
                      color={Colors.button[0]}
                      buttonStyle={{
                        backgroundColor: Colors.header,
                        padding: 8,
                        margin: 10,
                      }}
                    /> */}
                  </View>
                )}
              <View style={{alignItems: 'center', marginTop: '4%'}}>
                {!this.state.isOn && (
                  <ImageCard
                    title={'Offline Check In'}
                    // marginLeft={1}
                    source={require('../assets/home_ol.png')}
                    style={{
                      width: '100%',
                      height: '100%',
                      zIndex: -100,

                      position: 'absolute',
                      resizeMode: 'stretch',
                    }}
                    backgroundColor={Colors.button[0]}
                    onPress={() => {
                      this.props.navigation.navigate('OfflineAttendance', {
                        SelectedLeaveId: 10,
                      });
                    }}
                    // source={require('../assets/locationOn.png')}
                  />
                )}
                {assignedLocationsAll?.length > 0 && checked_out !== 'no' && (
                  <View
                    style={{
                      width: '95%',
                      alignSelf: 'center',
                      alignItems: 'center',
                    }}>
                    {this.state.locations?.length > 0 && (
                      <ImageCard
                        title={'Check In'}
                        marginLeft={'25%'}
                        source={require('../assets/home_lc.png')}
                        style={{
                          width: '100%',
                          height: '100%',
                          zIndex: -100,
                          position: 'absolute',
                          resizeMode: 'stretch',
                        }}
                        backgroundColor={Colors.mainHeader[0]}
                        onPress={() => {
                          this.setState(
                            {
                              travelMpinPressed: false,
                              qrCheckInPressed: false,
                              travelCheckIn: false,
                              beaconPressed: false,
                              wifiPressed: false,
                            },
                            async () => {
                              await AsyncStorage.setItem(
                                'travelMpinPressed',
                                'no',
                              );
                              await AsyncStorage.setItem(
                                'qrCheckInPressed',
                                'no',
                              );
                              await AsyncStorage.setItem('wifiPressed', 'no');
                              await AsyncStorage.setItem('beaconPressed', 'no');
                              await AsyncStorage.setItem('travelCheckIn', 'no');
                              this.handleCheckInOrOut();
                            },
                          );
                        }}
                        // source={require('../assets/locationOn.png')}
                      />
                    )}

                    {this.getLocationName('Travel Check In') && (
                      <ImageCard
                        title={'Travel Check In'}
                        source={require('../assets/home_tv.png')}
                        style={{
                          width: '100%',
                          height: '100%',
                          zIndex: -100,
                          position: 'absolute',
                          resizeMode: 'stretch',
                        }}
                        backgroundColor={'#3F1BD0'}
                        onPress={() => {
                          this.setState(
                            {
                              travelMpinPressed: false,
                              qrCheckInPressed: false,
                              travelCheckIn: true,
                              beaconPressed: false,
                              wifiPressed: false,
                            },
                            async () => {
                              await AsyncStorage.setItem(
                                'travelMpinPressed',
                                'no',
                              );
                              await AsyncStorage.setItem(
                                'qrCheckInPressed',
                                'no',
                              );
                              await AsyncStorage.setItem(
                                'travelCheckIn',
                                'yes',
                              );
                              await AsyncStorage.setItem('wifiPressed', 'no');
                              await AsyncStorage.setItem('beaconPressed', 'no');
                              this.handleCheckInOrOut();
                            },
                          );
                        }}
                      />
                    )}
                    {this.getLocationName('Qr Check In') && (
                      <ImageCard
                        title={'QR Check In'}
                        image={<QRImage width={62} height={60} />}
                        backgroundColor={Colors.mainHeader[0]}
                        onPress={() =>
                          this.setState(
                            {
                              travelMpinPressed: false,
                              travelCheckIn: false,
                              qrCheckInPressed: true,
                              beaconPressed: false,
                              wifiPressed: false,
                            },
                            async () => {
                              await AsyncStorage.setItem(
                                'travelMpinPressed',
                                'no',
                              );
                              await AsyncStorage.setItem(
                                'qrCheckInPressed',
                                'yes',
                              );
                              await AsyncStorage.setItem('wifiPressed', 'no');
                              await AsyncStorage.setItem('travelCheckIn', 'no');
                              await AsyncStorage.setItem('beaconPressed', 'no');
                              this.handleCheckInOrOut();
                            },
                          )
                        }
                        //source={require('../assets/qr-code.png')}
                      />
                    )}
                    {this.getLocationName(
                      'Travel Check IN with Staff Code',
                    ) && (
                      <ImageCard
                        title={'Travel Mpin Check In'}
                        image={<MpinImage width={62} height={60} />}
                        backgroundColor={'#3F1BD0'}
                        onPress={() =>
                          this.setState(
                            {
                              travelMpinPressed: true,
                              qrCheckInPressed: false,
                              travelCheckIn: false,
                              beaconPressed: false,
                              wifiPressed: false,
                            },
                            async () => {
                              await AsyncStorage.setItem(
                                'travelMpinPressed',
                                'yes',
                              );
                              await AsyncStorage.setItem(
                                'qrCheckInPressed',
                                'no',
                              );
                              await AsyncStorage.setItem('wifiPressed', 'no');
                              await AsyncStorage.setItem('beaconPressed', 'no');
                              await AsyncStorage.setItem('travelCheckIn', 'no');
                              this.handleCheckInOrOut();
                            },
                          )
                        }
                        //source={require('../assets/password.png')}
                      />
                    )}
                    {this.state.beaconLocations?.length > 0 && (
                      <ImageCard
                        title={'Beacon Check In'}
                        image={<BeaconImage width={62} height={60} />}
                        backgroundColor={Colors.mainHeader[0]}
                        onPress={() =>
                          this.setState(
                            {
                              travelMpinPressed: false,
                              qrCheckInPressed: false,
                              travelCheckIn: false,
                              beaconPressed: true,
                              wifiPressed: false,
                            },
                            async () => {
                              await AsyncStorage.setItem(
                                'travelMpinPressed',
                                'no',
                              );
                              await AsyncStorage.setItem(
                                'qrCheckInPressed',
                                'no',
                              );
                              await AsyncStorage.setItem('travelCheckIn', 'no');
                              await AsyncStorage.setItem(
                                'beaconPressed',
                                'yes',
                              );
                              await AsyncStorage.setItem('wifiPressed', 'no');
                              this.handleBeaconCheckin();
                            },
                          )
                        }
                        //source={require('../assets/password.png')}
                      />
                    )}
                    {this.state.wifiLocations?.length > 0 && (
                      <ImageCard
                        title={'Wifi Check In'}
                        source={require('../assets/home_wf.png')}
                        style={{
                          width: '100%',
                          height: '100%',
                          zIndex: -100,
                          position: 'absolute',
                          resizeMode: 'stretch',
                        }}
                        backgroundColor={Colors.button[0]}
                        onPress={() =>
                          this.setState(
                            {
                              travelMpinPressed: false,
                              qrCheckInPressed: false,
                              travelCheckIn: false,
                              beaconPressed: false,
                              wifiPressed: true,
                            },
                            async () => {
                              await AsyncStorage.setItem(
                                'travelMpinPressed',
                                'no',
                              );
                              await AsyncStorage.setItem(
                                'qrCheckInPressed',
                                'no',
                              );
                              await AsyncStorage.setItem('travelCheckIn', 'no');
                              await AsyncStorage.setItem('beaconPressed', 'no');
                              await AsyncStorage.setItem('wifiPressed', 'yes');
                              this.handleWifiCheckin();
                            },
                          )
                        }
                      />
                    )}
                  </View>
                )}
                {this.state.activities.length > 0 && checked_out !== 'no' && (
                  <CustomLabel
                    title={`Today's Actvities`}
                    size={16}
                    containerStyle={{alignSelf: 'flex-start'}}
                  />
                )}
                {this.state.activities.length === 0 && checked_out !== 'no' && (
                  <EmptyView title={'Enjoy! No activities today.'} />
                )}
                {this.state.activities.length > 0 &&
                  checked_out !== 'no' &&
                  this.state.activities.map((item, index) => {
                    var gmtDateTime = moment(item.start_Time, 'YYYY-MM-DD HH');
                    var startTime = gmtDateTime.local().format('h:mm A');
                    return (
                      <PrimaryCard
                        key={index}
                        width={'85'}
                        backgroundColor="#E8E7FD">
                        <View style={{flexDirection: 'row'}}>
                          <View
                            style={{
                              backgroundColor: '#23C4D7',
                              width: 42,
                              height: 50,
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <CustomLabel
                              title={moment(item.taskStartTime).format('ddd')}
                              color={'white'}
                            />
                            <CustomLabel
                              title={moment(item.taskStartTime).format('D')}
                              color={'white'}
                            />
                          </View>
                          <View style={{marginLeft: 10}}>
                            <CustomLabel title={item.task} />
                            <CustomLabel
                              color={Colors.button[0]}
                              family={'Poppins-Regular'}
                              title={item.task_Description}
                            />
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <Icon
                                name={'clock'}
                                type={'evilicon'}
                                color={Colors.button[0]}
                                size={25}
                              />
                              <CustomLabel
                                margin={0}
                                family="Poppins-Regular"
                                title={`${moment(item.taskStartTime).format(
                                  'h:mm a',
                                )} to ${moment(item.taskEndTime).format(
                                  'h:mm a',
                                )}`}
                              />
                            </View>
                            <CustomLabel
                              color={'white'}
                              containerStyle={{
                                backgroundColor: item.isCompleted
                                  ? '#23A428'
                                  : '#F15761',
                                borderRadius: 20,
                                minWidth: 60,
                                width: 100,
                                alignItems: 'center',
                                // alignSelf: 'flex-end',
                                padding: 5,
                              }}
                              title={item.isCompleted ? 'Completed' : 'Pending'}
                            />
                          </View>
                        </View>
                      </PrimaryCard>
                    );
                  })}
              </View>

              {this.state.appointments.length > 0 &&
                this.state.current_travel_checkin === 'running' && (
                  <>
                    <CustomLabel
                      labelStyle={{fontSize: 17, fontWeight: 'bold'}}
                      title={'Your Appointments'}
                    />
                    <FlatList
                      data={this.state.appointments}
                      keyExtractor={(item, index) => index + ''}
                      renderItem={this.renderItem}
                    />
                  </>
                )}
            </VStack>
          </ScrollView>
          {/*   */}
          {/* </Drawer> */}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.header,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  heading: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  walletContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    width: wp('93'),
    paddingTop: '3%',
    paddingLeft: '4%',
    paddingRight: '4%',
    paddingBottom: '3%',
    marginTop: '5%',
  },
  row: {
    flexDirection: 'row',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: wp('20'),
  },
  buttonContainer1: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 10,
    width: wp('20'),
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingContainer: {
    marginTop: 8,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: '5%',
  },
  modalHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
  labelContainer: {
    margin: '1.5%',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
  },
  item1: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  textarea: {
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderRadius: 8,
  },
  buttonContainer3: {
    width: wp('80'),
    backgroundColor: Colors.button[0],
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: hp('3'),
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#ffffff',
    paddingLeft: '5%',
    borderRadius: 10,
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
    height: hp('7'),
    justifyContent: 'center',
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: hp('7'),
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
});
