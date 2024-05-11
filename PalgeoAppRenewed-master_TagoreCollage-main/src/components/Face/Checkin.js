import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Button,
  AppState,
  Alert,
  NativeEventEmitter,
  NativeModules,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, Card, VStack} from 'native-base';
import SubHeader from '../common/DrawerHeader';
import Loader from '../common/Loader';
import Geolocation from 'react-native-geolocation-service';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalForAccuracy from '../common/Modal';
import CameraComp from '../common/CameraComp';
import RNLocation from 'react-native-location';
import ProgressCircle from 'react-native-progress-circle';
import BleManager from 'react-native-ble-manager';
import axios from 'axios';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
//import //KeepAwake from 'react-native-keep-awake';
import ImageResizer from 'react-native-image-resizer';

import {RNCamera} from 'react-native-camera';
import Geocoder from 'react-native-geocoding';
import Location from '../common/Location';
import {
  GOOGLE_MAPS_APIKEY,
  GOOGLE_MAPS_APIKEY_IOS,
  OPEN_CAGE_APIKEY,
  OPEN_GEOCODING_API,
  RADAR_APIKEY,
  RADAR_GEOCODING_API,
} from '../../utils/configs/Constants';
import CustomModal from '../common/CustomModal';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {
  disableBatteryOptimization,
  getAssignedLocations,
  staffCurrentLocation,
  validatePointWithinCircle,
} from '../../utils/helperFunctions';
import {CustomButton} from '../common/CustomButton';
import CustomLabel from '../common/CustomLabel';
import {Colors} from '../../utils/configs/Colors';
import LocationModal from '../common/LocationModal';
import FaceMismatchModal from '../common/FaceMismatchModal';
import GPSState from 'react-native-gps-state';
import moment from 'moment';
import {SafeAreaView} from 'react-native';
import AnimatedLoader from '../common/AnimatedLoader';
import CustomPopUp from '../common/CustomPopUp';
import {Avatar} from 'react-native-elements/dist/avatar/Avatar';
import SuccessError from '../common/SuccessError';
import {ScrollView} from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import AnimatedLottieView from 'lottie-react-native';

var geolib = require('geolib');

export default class Checkin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      coordinates: {
        latitude: '',
        longitude: '',
        accuracy: '',
      },
      isIOS: Platform.OS === 'ios' ? true : false,
      showAlert: false,
      StaffNo: '',
      bearer_token: '',
      institute_id: '',
      showAlert1: false,
      error_message: '',
      travel_check_in: this.props.route?.params?.travel || 'no',
      qrCheckin: this.props.route?.params?.qrCheckin || 'false',
      uri: '',
      travelCheckIn: this.props.route?.params?.travelCheckIn || false,
      selected: false,
      notInFence: false,
      modal: false,
      show: this.props.route?.params?.show || false,
      success: false,
      //show: false,
      showTimer: false,
      count: 0,
      subCount: 0,
      btnCount: 1,
      pressed: false,
      base64Data: null,
      isScanning: false,
      beaconID: '',
      beaconDetails: {},
      show1: false,
      show2: this.props.route?.params?.show2 || false,
      travelCheckInAddress: '',
      showAlert2: false,
      showMPINAlert: this.props.route?.params?.showMpinAlert || false,
      isTravelCheckinWithMpin:
        this.props.route?.params?.isTravelCheckinWithMpin || 'no',
      mpin: '',
      assignedLocations: [],
      geofence: {},
      faceMismatchModal: false,
      faceMismatchMessage: '',
      locationModal: false,
      profile_pic: '',
      capturedPhoto: {},
      progress: 0,
    };
    this.interval = 0;
    this.watchID = 0;
    if(!this.props.route?.params?.show){
      this.checkLocationHandler()
    }
  }

  startScan = () => {
    if (!this.state.isScanning) {
      BleManager.scan([], 5, true)
        .then(results => {
          console.log('Scanning...');
          this.setState({isScanning: true});
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  openCamera1 = async camera => {
    const options1 = {quality: 1, base64: false};
    const body = new FormData();

    try {
      const image1 = await camera.takePictureAsync(options1);
      ImageResizer.createResizedImage(
        image1.uri,
        300,
        300,
        'PNG',
        0,
        0,
        undefined,
      )
        .then(async response => {
          console.log('size of image ===>', response.size);
          this.setState({showAlert: true});
          if (response.uri) {
            body.append('StaffNo', this.state.StaffNo);
            body.append('InstituteId', this.state.institute_id);
            body.append('File', {
              uri: response.uri,
              name: 'photo.png',
              type: 'image/png',
            });
            body.append('AccessLocationId', Number(this.state.data.locationId));
            body.append('QrCodeOwnerStaffCode', this.state.data.StaffNo);
            const response = await axios({
              method: 'POST',
              url: Const + 'api/staff/QrCheckIn',
              data: body,
              headers: {'Content-Type': 'multipart/form-data'},
            });
            this.setState({show1: false, showAlert: false});
            console.log('JSON ==>', response.data);
            const json = response.data;
            if (!json.response.status) {
              return alert(response.data.response.message);
            }
            //alert(response.data.response.message)
            const geofence = json.geofencingClients.find(
              item => item.distance === 0,
            );
            console.log('Checked_in_geofence ==>', geofence);

            AsyncStorage.setItem('checked_out', 'no');
            await AsyncStorage.setItem(
              'actualCheckInTime',
              moment().format('DD.MM.YYYY h:mm a'),
            );
            if (this.state.travelCheckIn) {
              AsyncStorage.setItem('current_travel_checkin', 'running');
            }

            if (Platform.OS === 'android') {
              this.setState({
                showAlert: false,
                showAlert1: true,
                error: false,
                error_message: json.response.message,
                count: 0,
              });
            } else {
              alert(json.response.message);
              this.setState({showAlert: false, count: 0});
            }
            AsyncStorage.setItem('geo_id', geofence.id.toString());
            if (geofence.type == 'Circle') {
              AsyncStorage.setItem(
                'coordinates',
                JSON.stringify(geofence.coordinates),
              );
              AsyncStorage.setItem('radius', geofence.radius.toString());
              AsyncStorage.setItem('type', geofence.type.toString());
              AsyncStorage.setItem(
                'checkin_time',
                geofence.CheckInTime ? geofence.CheckInTime : '',
              );
            } else {
              AsyncStorage.setItem(
                'coordinates',
                JSON.stringify(geofence.coordinates),
              );
              AsyncStorage.setItem(
                'checkin_time',
                geofence.CheckInTime ? geofence.CheckInTime : '',
              );
              AsyncStorage.setItem('type', geofence.type.toString());
            }
            // ReactNativeForegroundService.start({
            //   id: 144,
            //   title: 'Background Location Tracking',
            //   message: 'You are being tracked!',
            // });

            //KeepAwake.activate();
            return setTimeout(() => {
              this.props.navigation.navigate('StaffTasks', {disable: true});
            }, 4000);
          }
          // response.uri is the URI of the new image that can now be displayed, uploaded...
          // response.path is the path of the new image
          // response.name is the name of the new image with the extension
          // response.size is the size of the new image
        })
        .catch(err => {
          console.log('error in resizing', err);
          // Oops, something went wrong. Check that the filename is correct and
          // inspect err to get more details.
        });
    } catch (e) {
      console.log(e);
      alert(e.toString());
      this.setState({show1: false, showAlert: false});
    }
  };

  async componentDidMount() {
    // Geocoder.init(
    //   Platform.OS === 'android' ? GOOGLE_MAPS_APIKEY : GOOGLE_MAPS_APIKEY_IOS,
    // );
    this.checkGPSStatus();
    const user_id = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    const profile_pic = await AsyncStorage.getItem('profile_pic');
    const isTravelCheckinWithMpin = await AsyncStorage.getItem(
      'isTravelCheckinWithMpin',
    );
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    const travel_check_in = await AsyncStorage.getItem('travel_check_in');
    const locations = JSON.parse(await AsyncStorage.getItem('locations'));
    //console.log('ttt', travel_check_in);
    this.setState({
      bearer_token,
      StaffNo: user_id,
      institute_id,
      travel_check_in,
      isTravelCheckinWithMpin,
      assignedLocations: locations,
      profile_pic,
    });
  }

  checkGPSStatus = async () => {
    const status = await GPSState.getStatus();
    return status;
  };

  componentWillUnmount() {
    clearInterval(this.interval);
    //clearInterval(this.interval2);
    Geolocation.clearWatch(this.watchID);
  }

  openCamera = async camera => {
    const {geofence} = this.state;
    const options1 = {quality: 1, base64: false, width: 800};
    try {
      const image1 = await camera.takePictureAsync(options1);
      console.log(image1);
      if (!image1.uri) {
        return this.setState({
          showAlert1: true,
          error_message: 'Please re authenticate your face',
          showAlert: false,
          showTimer: false,
          error: true,
        });
      }

      ImageResizer.createResizedImage(
        image1.uri,
        300,
        300,
        'PNG',
        0,
        0,
        undefined,
      )
        .then(async response => {
          this.setState({
            show: false,
            //showAlert2: true,
            capturedPhoto: response,
            //error_message: 'Fetching location...',
            showAlert: false,
          });
          if (this.state.travelCheckIn) {
            const options = {
              enableHighAccuracy: true,
              distanceFilter: 0,
              maximumAge: 0,
            };

            this.watchID = Geolocation.watchPosition(
              pos => this.travelCheckInAPIHandler(response.uri, pos.coords),
              this.error,
              options,
            );

            return;
          }
          if (this.props?.route?.params?.beacon) {
            console.log('I ran beacon');
            return await this.beaconCheckin();
          }
          if (this.props?.route?.params?.wifi) {
            console.log('I ran wifi');
            return await this.checkInHandler(
              this.props?.route?.params?.wifiLocation,
            );
          }
          this.checkLocationHandler();
          // call new face validation API:
        })
        .catch(error => console.log(error));
    } catch (e) {
      this.setState({
        showAlert: false,
        showAlert2: false,
        showAlert1: true,
        error: true,
        error_message: e.message,
      });
      // alert('Error validating face:' + e + '. Please try again');
    }
  };

  checkInHandler = async accessLocation => {
    setTimeout(() => this.setState({showAlert2: true}), 300);

    //const {geofence} = this.state;
    const url = `${Const}api/Staff/StaffFaceCheckIn`;
    let uploadData = new FormData();
    uploadData.append('StaffNo', this.state.StaffNo);
    uploadData.append('InstituteId', this.state.institute_id);
    if(accessLocation.isFaceRecognitionMandatory){
      uploadData.append('File', {
        uri: this.state.capturedPhoto.uri,
        name: 'photo.png',
        type: 'image/png',
      });
    }else{
      uploadData.append('FaceValidationMandatory', false);
    }
    uploadData.append('AccessLocationId', accessLocation.id);
    const body = uploadData;
    console.log("**********check in***************")
    console.log(url);
    console.log(JSON.stringify(body));
    console.log(JSON.stringify(this.state.bearer_token))
    console.log("*************************")
    const apiResponse = await axios.post(url, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const {data} = apiResponse;
    console.log('facerespinse ==>', data);
    if (!data.status && !data.message.includes('Unhandled')) {
      if (Platform.OS === 'ios') {
        setTimeout(() => this.setState({showAlert2: false}), 100);
        setTimeout(
          () =>
            this.setState({
              faceMismatchModal: true,
              faceMismatchMessage: data.message,
            }),
          200,
        );
        return;
      }
      return this.setState({
        showAlert2: false,
        faceMismatchModal: true,
        faceMismatchMessage: data.message,
      });
    }

    if (data.status) {
      await AsyncStorage.setItem('checked_out', 'no');
      await AsyncStorage.setItem(
        'actualCheckInTime',
        moment().format('DD.MM.YYYY h:mm a'),
      );
      await AsyncStorage.setItem('count', '0');
      await AsyncStorage.setItem('gpsCount', '0');
      await AsyncStorage.setItem('geo_id', accessLocation.id.toString());
      await AsyncStorage.setItem('geo_location', accessLocation.accessLocation);
      if (accessLocation.type == 'Circle') {
        await AsyncStorage.setItem(
          'coordinates',
          JSON.stringify(accessLocation.coordinates),
        );
        await AsyncStorage.setItem('radius', accessLocation.radius.toString());
        await AsyncStorage.setItem('type', accessLocation.type.toString());
        await AsyncStorage.setItem(
          'checkin_time',
          accessLocation.CheckInTime ? accessLocation.CheckInTime : '',
        );
      } else {
        await AsyncStorage.setItem(
          'coordinates',
          JSON.stringify(accessLocation.coordinates),
        );
        await AsyncStorage.setItem(
          'checkin_time',
          accessLocation.CheckInTime ? accessLocation.CheckInTime : '',
        );
        await AsyncStorage.setItem('type', accessLocation.type.toString());
      }
    }

    this.setState({
      showAlert: false,
      showAlert2: false,
      showAlert1: true,
      error: false,
      error_message: data.message,
    });
  };

  wifiCheckin = async () => {};

  beaconCheckin = async () => {
    this.setState({showAlert2: true});
    const geofence = this.props?.route?.params?.beaconLocation;

    console.log('geofebeacon', geofence);
    const url = `${Const}api/Staff/StaffBeaconCheckIn`;
    let uploadData = new FormData();
    uploadData.append('StaffNo', this.state.StaffNo);
    uploadData.append('FaceValidationMandatory', true);
    uploadData.append('InstituteId', this.state.institute_id);
    uploadData.append('File', {
      uri: this.state.capturedPhoto.uri,
      name: 'photo.png',
      type: 'image/png',
    });
    uploadData.append('AccessLocationId', geofence.id);
    uploadData.append('BeaconId', geofence.beaconId);
    const body = uploadData;
    console.log('body ==>', uploadData);
    try {
      const apiResponse = await axios.post(url, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const {data} = apiResponse;

      console.log('facerespinse ==>', data);
      if (!data.status && !data.message.includes('Unhandled')) {
        return this.setState({
          showAlert2: false,
          faceMismatchModal: true,
          faceMismatchMessage: data.message,
        });
      }

      if (data.status) {
        await AsyncStorage.setItem('checked_out', 'no');
        await AsyncStorage.setItem(
          'actualCheckInTime',
          moment().format('DD.MM.YYYY h:mm a'),
        );
        await AsyncStorage.setItem('count', '0');
        await AsyncStorage.setItem('gpsCount', '0');
        await AsyncStorage.setItem('geo_id', geofence.id.toString());
        await AsyncStorage.setItem('beacon_id', geofence.uniqueId);
        await AsyncStorage.setItem(
          'coordinates',
          JSON.stringify([{latitude: '12.972442', longitude: '77.580643'}]),
        );

        await AsyncStorage.setItem('geo_location', geofence.accessLocation);
      }

      this.setState({
        showAlert: false,
        showAlert2: false,
        showAlert1: true,
        error_message: data.message,
      });
    } catch (e) {
      alert(e.message);
    }
  };

  travelCheckInAPIHandler = async (uri, coordinates) => {
    Geolocation.clearWatch(this.watchID);
    setTimeout(() => this.setState({showAlert2: true}), 100);
    console.log('cooordinates ==', coordinates);
    const assignedLocations = await getAssignedLocations();
    const filteredLocations = assignedLocations.filter(
      e => e.type !== 'Anonymous',
    );
    const findTravelGeoFence = assignedLocations.find(
      each => each.accessLocation === 'Travel Check In',
    );
    const AccessLocationId = findTravelGeoFence.id;
    // const AccessLocationId = await AsyncStorage.getItem(
    //   'travelCheckinLocationId',
    // );
    console.log('travelCheckinLocationId', AccessLocationId);
    const uid = `${this.state.StaffNo}-${new Date()}`;
    console.log(uid);
    //return;
    this.setState({coordinates});
    const {latitude, longitude, accuracy} = coordinates;
    let count = 0;
    if (filteredLocations.length > 0) {
      filteredLocations.forEach(e => {
        const check = validatePointWithinCircle(e, coordinates);
        console.log('check', check);
        if (check) {
          return this.setState(
            {travelCheckInAddress: e.accessLocation},
            //  () =>
            // this.checkIn(
            //   uri,
            //   latitude,
            //   longitude,
            //   accuracy,
            //   AccessLocationId,
            //   coordinates,
            // ),
          );
        }
        count += 1;
      });
    }
    if (count === filteredLocations.length) {
      const {data} = await axios.get(
        `${OPEN_GEOCODING_API}${latitude}+${longitude}&key=${OPEN_CAGE_APIKEY}`,
      );
      this.setState({travelCheckInAddress: data.results[0].formatted}, () =>
        this.checkIn(
          uri,
          latitude,
          longitude,
          accuracy,
          AccessLocationId,
          coordinates,
          uid,
        ),
      );
    } else {
      this.checkIn(
        uri,
        latitude,
        longitude,
        accuracy,
        AccessLocationId,
        coordinates,
        uid,
      );
    }
  };

  checkIn = async (
    uri,
    latitude,
    longitude,
    accuracy,
    AccessLocationId,
    coordinates,
    uid,
  ) => {
    let uploadData = new FormData();
    //console.log('Process time', new Date());
    uploadData.append('file', {
      uri: uri,
      name: 'photo.png',
      type: 'image/png',
    });
    //uploadData.append('file', uri);
    uploadData.append('StaffNo', this.state.StaffNo);
    uploadData.append('Latitude', Number(latitude));
    uploadData.append('Longitude', Number(longitude));
    uploadData.append('InstituteId', this.state.institute_id);
    //uploadData.append('Accuracy', 10);
    uploadData.append('Accuracy', Number(accuracy));
    uploadData.append('IsTravelCheckIn', true);
    uploadData.append('AccessLocationId', Number(AccessLocationId));
    uploadData.append('TravelCheckInAddress', this.state.travelCheckInAddress);
    uploadData.append('TripIdentitfier', uid);
    console.log('uploadData', uploadData);
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    setTimeout(() => {
      source.cancel('Request cancel after timeout');
    }, 30000);
    try {
      const response = await axios({
        method: 'post',
        url: Const + 'api/Staff/CheckInWithFormFile',
        data: uploadData,
        headers: {'Content-Type': 'multipart/form-data'},
        timeout: 30000,

        cancelToken: source.token,
      });
      console.log('End time', new Date());

      const {data} = response;
      console.log('data==', data);
      if (!data.response.status) {
        this.setState({showAlert2: false}, () => {
          setTimeout(
            () =>
              this.setState({
                // showAlert: false,
                showAlert1: true,
                //showAlert2: false,
                error: true,
                progress: 0,
                error_message: data.response.message,
              }),
            300,
          );
        });

        return;
      }
      const json = await staffCurrentLocation(
        this.state.institute_id,
        this.state.StaffNo,
        coordinates,
      );
      await AsyncStorage.setItem('current_travel_checkin', 'running');
      await AsyncStorage.setItem('uuid', uid);
      await AsyncStorage.setItem(
        'actualCheckInTime',
        moment().format('DD.MM.YYYY h:mm a'),
      );
      await AsyncStorage.setItem('checked_out', 'no');
      await AsyncStorage.setItem('geo_location', 'Travel Check In');
      await AsyncStorage.setItem(
        'currentTravelLocation',
        JSON.stringify(coordinates),
      );

      await BackgroundGeolocation.setConfig({
        extras: {
          instId: this.state.institute_id,
          staffCode: this.state.StaffNo,
          tripIdentitfier: uid,
          isCheckIn: false,
          isCheckOut: false,
        },
        url: Const + 'api/GeoFencing/travelcheckinbatch',
      });
      await BackgroundGeolocation.resetOdometer();
      await BackgroundGeolocation.start();
      await disableBatteryOptimization();
      this.setState({showAlert2: false}, () => {
        setTimeout(
          () =>
            this.setState({
              // showAlert: false,
              showAlert1: true,
              //showAlert2: false,
              error: false,
              progress: 0,
              error_message: data.response.message,
            }),
          300,
        );
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
        this.setState({showAlert2: false}, () => {
          setTimeout(
            () =>
              this.setState({
                // showAlert: false,
                //   showAlert2: false,
                showAlert1: true,
                error: true,
                error_message:
                  'Request taking too long to respond. Refresh internet connection and retry.',
                progress: 0,
                success: false,
              }),
            300,
          );
        });

        return;
      }
      console.log(error);
      this.setState({showAlert2: false}, () => {
        setTimeout(
          () =>
            this.setState({
              // showAlert: false,
              //showAlert2: false,
              showAlert1: true,
              error_message:
                'Sorry! Unhandled exception occured while checking-in.',
              error: true,
              progress: 0,
              success: false,
            }),
          300,
        );
      });
    }
  };
  CheckinWithBarCode = async ({data}) => {
    console.log('data', data);
    let parsedDate = JSON.parse(data);
    let now1 = new Date().valueOf();
    let then1 = new Date(parsedDate.timeStamp).valueOf();
    const difference = (now1 - then1) / 1000;
    console.log({
      now: now1,
      then1,
      difference,
    });
    if (difference > 20) {
      this.setState({show2: false}, () => {
        return alert('Time exceeded for check in');
      });
      return;
    }

    this.setState({
      data: parsedDate,
      show2: false,
      show1: true,
    });
  };

  goToHome = () => {
    this.props.navigation.goBack();
  };

  goToStaffTasks = () => {
    this.props.navigation.navigate('StaffTasks', {disable: true});
  };

  launchTipsModal = () => {
    this.setState({modal: true, notInFence: false});
  };

  goTo = () => {
    if (this.state.success) {
      this.props.navigation.navigate('StaffTasks', {disable: true});
    } else {
      this.props.navigation.goBack();
    }
  };

  pinHandler = async () => {
    const {isIOS} = this.state;
    const url = `${Const}api/Staff/TravelCheckInWithStaffCode`;
    console.log('url ==', url);
    if (isIOS) {
      setTimeout(() => this.setState({showMPINAlert: false}), 200);
      setTimeout(() => this.setState({showAlert: true}), 300);
    } else {
      this.setState({showAlert: true});
    }
    this.watchID = Geolocation.watchPosition(
      async pos => {
        //console.log('pos', pos)
        try {
          const assignedLocations = await getAssignedLocations();

          const findTravelGeoFence = assignedLocations.find(
            each => each.accessLocation === 'Travel Check IN with Staff Code',
          );
          const geoFenceId = findTravelGeoFence.id;
          const shiftId = findTravelGeoFence.shiftId;
          console.log('assignedLocationsssssssssss ==?', geoFenceId, shiftId);
          const body = {
            geoFenceId,
            staffCode: this.state.StaffNo,
            instituteId: this.state.institute_id,
            checkinCoordinates: `${pos.coords.latitude},${pos.coords.longitude}`,
            shiftId,
            mpin: this.state.mpin,
          };
          const response = await axios.post(url, body);
          const {data} = response;
          console.log('data ==', data);
          if (!data.status) {
            if (isIOS) {
              // setTimeout(() => this.setState({showMPINAlert:false}), 300)
              this.setState({showAlert: false});
              alert(data.message);
              return this.goToHome();
            } else {
              this.setState({
                showAlert: false,
                showMPINAlert: false,
                showAlert1: true,
                error: true,
                error_message: data.message,
              });
            }
          }
          if (data.status) {
            await AsyncStorage.setItem('checked_out', 'no');
            await AsyncStorage.setItem('current_travel_checkin', 'running');
            await AsyncStorage.setItem(
              'actualCheckInTime',
              moment().format('DD.MM.YYYY h:mm a'),
            );
            if (isIOS) {
              // setTimeout(() => this.setState({showMPINAlert:false}), 300)
              this.setState({showAlert: false});
              alert(data.message);
              return this.goToHome();
              //setTimeout(() => this.setState({showAlert1:true, error_message: data.message,}), 400)
            } else {
              this.setState({
                showAlert: false,
                showMPINAlert: false,
                showAlert1: true,
                error: false,
                error_message: data.message,
              });
            }
          }
        } catch (e) {
          if (isIOS) {
            //setTimeout(() => this.setState({showMPINAlert:false}), 300)
            setTimeout(() => this.setState({showAlert: false}), 300);
          } else {
            this.setState({
              showAlert: false,
              showMPINAlert: false,
            });
          }
          alert('Error checking in with mpin: ' + e);
        }
      },
      this.error,
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        maximumAge: 0,
      },
    );
    setTimeout(() => Geolocation.clearWatch(this.watchID), 100);
  };

  success = position => this.setState({coordinates: position.coords});

  error = error => {
    this.setState({showAlert2: false});
    alert('Error retreiving location. Check your location services.');
  };

  checkLocationHandler = async () => {
    this.interval = setInterval(
      () =>
        this.setState(prevState => {
          return {
            ...prevState,
            progress: Number(prevState.progress) + 1,
          };
        }),
      1000,
    );

    //const {assignedLocations} = this.state;
    const assignedLocationsAll = await getAssignedLocations();
    const assignedLocations = assignedLocationsAll.filter(
      each => each.type === 'Circle',
    );
    console.log('assignedLocations12333', assignedLocations);
    const options = {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 1000,
      fastestInterval: 1000,
    };
    this.watchID = Geolocation.watchPosition(this.success, this.error, options);
    this.setState({loaderModal: true});
    setTimeout(() => {
      Geolocation.clearWatch(this.watchID);
      clearInterval(this.interval);
      this.setState({loaderModal: false, progress: 0});
      if (assignedLocations?.length === 0) {
        return alert(
          'No locations assigned. Please contact your administrator for further details.',
        );
      }
      let count = 0;
      assignedLocations.forEach(location => {
        const point = validatePointWithinCircle(
          location,
          this.state.coordinates,
        );
        this.setState({
          show: location.isFaceRecognitionMandatory,
        })
        if (point) {
          return this.setState({
            // show: location.isFaceRecognitionMandatory,
            geofence: location,
          });
        }
        count += 1;
      });
      console.log(count);
      if (count === assignedLocations.length) {
        setTimeout(() => this.setState({locationModal: true}), 400);
        return;
      }
      // return this.setState({show: true});
      this.checkInHandler(this.state.geofence);
    }, 10000);
  };

  render() {
    if (this.state.loader) {
      return <Loader />;
    }

    return (
      <View style={styles.container}>
        <AnimatedLoader isVisible={this.state.showAlert} doNotShowDeleteIcon />
        <AnimatedLoader
          source={require('../../assets/lottie/splash1.json')}
          isVisible={this.state.loaderModal}
          doNotShowDeleteIcon
          message={
            'Please wait... Checking whether you are in your assigned location or not...'
          }
        />

        {/* <CustomPopUp
          name={'search-location'}
          type={'font-awesome-5'}
          color={Colors.white}
          size={45}
          isVisible={this.state.showAlert2}
          title={'Trying to Check IN'}
          subTitle={'Please wait...'}
          bgColor={'#5D5FEF'}> */}
        {this.state.showAlert2 && (
          <AnimatedLoader
            source={require('../../assets/lottie/travel_bubble.json')}
            doNotShowDeleteIcon
            isVisible={this.state.showAlert2}
            message={'Please wait... Trying to check in...'}
          />
        )}
        {/* </CustomPopUp> */}
        <CustomPopUp
          name={'location-off'}
          type={'material'}
          color={Colors.white}
          size={45}
          isVisible={this.state.locationModal}
          title={'You are not in your assigned location'}
          subTitle={'Please check in from assigned location'}
          bgColor={'#FFD200'}>
          <CustomButton
            alignSelf={'center'}
            color={Colors.mainHeader[0]}
            width={'90%'}
            title={'Ok'}
            onPress={() =>
              this.setState({locationModal: false}, () => this.goToHome())
            }
          />
        </CustomPopUp>

        {this.state.faceMismatchMessage !== '' &&
          !this.state.faceMismatchMessage.includes('Unhandled') && (
            <CustomPopUp
              name={'emoji-sad'}
              type={'entypo'}
              color={Colors.white}
              size={45}
              isVisible={this.state.faceMismatchModal}
              title={'Face Mismatch'}
              //subTitle={'Please check in from assigned location'}
              bgColor={Colors.red}>
              <View
                style={{
                  flexDirection: 'row',
                  width: wp('100'),
                  alignSelf: 'center',
                  justifyContent: 'space-around',
                }}>
                <View style={{width: wp('30'), elevation: 2}}>
                  <Avatar
                    containerStyle={{alignSelf: 'center'}}
                    source={{
                      uri:
                        this.state.profile_pic ||
                        'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
                    }}
                    size={'large'}
                  />
                  <CustomLabel
                    family={'Poppins-Regular'}
                    labelStyle={{textAlign: 'center', fontSize: 12}}
                    title={'Registered Photo'}
                  />
                </View>
                <View style={{width: wp('30'), elevation: 2}}>
                  <Avatar
                    containerStyle={{alignSelf: 'center'}}
                    source={{
                      uri:
                        this.state.capturedPhoto?.uri ||
                        'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
                    }}
                    size={'large'}
                  />
                  <CustomLabel
                    family={'Poppins-Regular'}
                    labelStyle={{textAlign: 'center', fontSize: 12}}
                    title={'Captured Photo'}
                  />
                </View>
              </View>
              <CustomButton
                alignSelf={'center'}
                color={Colors.mainHeader[0]}
                width={'90%'}
                title={'Register Face'}
                onPress={() =>
                  this.setState({faceMismatchModal: false}, () =>
                    this.props.navigation.navigate('FaceRegister', {
                      show: true,
                      show1: false,
                    }),
                  )
                }
              />
              <CustomButton
                alignSelf={'center'}
                color={Colors.white}
                textStyle={{color: Colors.mainHeader[0]}}
                width={'90%'}
                title={'Ok'}
                onPress={() =>
                  this.setState({faceMismatchModal: false}, () =>
                    this.goToHome(),
                  )
                }
              />
            </CustomPopUp>
          )}

        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() =>
            this.setState({showAlert1: false}, () => this.goToHome())
          }
          subTitle={this.state.error_message}
        />
        <SubHeader
          title="Check In"
          showBack={true}
          backScreen="Tab"
          showBell={false}
          navigation={this.props.navigation}
        />
        <ScrollView contentContainerStyle={{flex: 1}}>
          {this.state.showMPINAlert && (
            <CustomModal
              isVisible={this.state.showMPINAlert}
              deleteIconPress={() =>
                this.setState({showMPINAlert: false}, () => this.goToHome())
              }>
              <Text>Enter MPIN to verify</Text>
              <OTPInputView
                style={{width: wp('80'), height: 80}}
                pinCount={4}
                autoFocusOnLoad={true}
                secureTextEntry={true}
                codeInputFieldStyle={styles.inputFeilds}
                codeInputHighlightStyle={styles.inputFeildsFocus}
                onCodeFilled={text =>
                  this.setState({mpin: text}, () => this.pinHandler())
                }
              />

              <CustomButton
                title={'Verify'}
                color={Colors.mainHeader[0]}
                onPress={this.pinHandler}
              />
            </CustomModal>
          )}

          {this.state.show && (
            <CameraComp
              visible={this.state.show}
              onClose={() =>
                this.setState({show: false}, () => this.goToHome())
              }
              onPress={camera => this.openCamera(camera)}
              btnText={
                !this.state.travelCheckIn ? 'check-in' : 'travel check-in'
              }
            />
          )}
          {this.state.show2 && (
            <CameraComp
              visible={this.state.show2}
              onClose={() =>
                this.setState({show2: false}, () => this.goToHome())
              }
              onPress={camera => {}}
              btnText={'QR Code Scanner'}
              onBarCodeRead={this.CheckinWithBarCode}
              //type = {RNCamera.Constants.Type.back}
            />
          )}

          {this.state.show1 && (
            <CameraComp
              visible={this.state.show1}
              onClose={() =>
                this.setState({show1: false}, () => this.goToHome())
              }
              onPress={camera => this.openCamera1(camera)}
              btnText={'qr check-in'}
            />
          )}
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  header: {
    backgroundColor: '#089bf9',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: '#ffffff',
  },
  cardContainer: {
    marginTop: '10%',
    marginLeft: '6%',
    marginRight: '6%',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#c9c3c5',
  },
  label1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#c9c3c5',
    paddingLeft: wp('3'),
  },
  labelContainer: {
    margin: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#f1f1f1',
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('7'),
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    height: hp('7'),
  },
  card: {
    borderRadius: 10,
    elevation: 4,
    paddingTop: '3%',
    paddingBottom: '3%',
    height: hp('65'),
  },
  preview: {
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('35'),
    paddingRight: wp('7'),
    marginTop: '4%',
  },
  buttonContainer1: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('40'),
    marginTop: '4%',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
    paddingRight: '3%',
  },
  btImage: {
    width: 50,
    height: 39,
    borderRadius: 20,
  },
  userImage: {
    width: 120,
    height: 120,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    marginBottom: 10,
  },
  mainCardStyle: {
    borderRadius: 10,
    elevation: 4,
    padding: 20,
    width: wp('85'),
  },
  checkinText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  heading: {
    fontFamily: 'Poppins-SemiBold',
    margin: 12,
  },
  inputFeilds: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    color: '#000000',
    borderRadius: 10,
  },
  inputFeildsFocus: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Colors.mainHeader[0],
    color: '#000000',
    borderRadius: 10,
  },
});
