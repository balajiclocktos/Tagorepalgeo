import React, { Component, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { VStack } from 'native-base';
import SubHeader from '../common/DrawerHeader';
import Loader from '../common/Loader';
import Geolocation from 'react-native-geolocation-service';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraComp from '../common/CameraComp';
import axios from 'axios';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import ImageResizer from 'react-native-image-resizer';
import Geocoder from 'react-native-geocoding';
import {
  GOOGLE_MAPS_APIKEY,
  GOOGLE_MAPS_APIKEY_IOS,
  isIOS,
  OPEN_CAGE_APIKEY,
  OPEN_GEOCODING_API,
} from '../../utils/configs/Constants';
import {
  getAssignedLocations,
  validatePointWithinCircle,
} from '../../utils/helperFunctions';
import CustomModal from '../common/CustomModal';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { CustomButton } from '../common/CustomButton';
import { Colors } from '../../utils/configs/Colors';
import CustomLabel from '../common/CustomLabel';
import GPSState from 'react-native-gps-state';
import AnimatedLoader from '../common/AnimatedLoader';
import SuccessError from '../common/SuccessError';
import CustomPopUp from '../common/CustomPopUp';
import { Avatar } from 'react-native-elements/dist/avatar/Avatar';
import { ScrollView } from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';

export default class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      coordinates: {
        latitude: '',
        longitude: '',
        accuracy: '',
      },
      showAlert: false,
      StaffNo: '',
      bearer_token: '',
      institute_id: '',
      showAlert1: false,
      error_message: '',
      travel_check_in: this.props.route?.params?.travel_check_in || 'no',
      qrCheckout: this.props.route?.params?.qrCheckin || 'false',
      notInFence: false,
      modal: false,
      //show: false,
      show: this.props.route?.params?.show || false,
      count: 0,
      btnCount: 1,
      pressed: false,
      base64Data: null,
      isScanning: false,
      beaconID: '',
      beaconDetails: {},
      rssi: null,
      isBluetoothOn: false,
      travelCheckOut: this.props.route?.params?.travelCheckOut || false,
      current_travel_check_in: '',
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
      show2: this.props.route?.params?.show2 || false,
    };
    this.interval = 0;
    this.watchID = 0;
    if(!this.props.route?.params?.show){
      this.checkLocationHandler()
    }
  }
  async componentDidMount() {
    Geocoder.init(
      Platform.OS === 'android' ? GOOGLE_MAPS_APIKEY : GOOGLE_MAPS_APIKEY_IOS,
    );
    this.checkGPSStatus();
    const current_travel_check_in = await AsyncStorage.getItem(
      'current_travel_checkin',
    );
    const isTravelCheckinWithMpin = await AsyncStorage.getItem(
      'isTravelCheckinWithMpin',
    );
    const locations = JSON.parse(await AsyncStorage.getItem('locations'));
    this.setState({
      current_travel_check_in,
      isTravelCheckinWithMpin,
      assignedLocations: locations,
    });
    AsyncStorage.getItem('user_id').then(user_id => {
      AsyncStorage.getItem('profile_pic').then(profile_pic => {
        AsyncStorage.getItem('bearer_token').then(bearer_token => {
          AsyncStorage.getItem('institute_id').then(institute_id => {
            this.setState({
              StaffNo: user_id,
              bearer_token: bearer_token,
              institute_id: institute_id,
              //travel_check_in: travel_check_in,
              profile_pic,
            });
          });
        });
      });
    });
  }

  checkGPSStatus = async () => {
    const status = await GPSState.getStatus();
    return status;
  };

  componentWillUnmount() {
    clearInterval(this.interval);
    Geolocation.clearWatch(this.watchId);
  }

  travelCheckInAPIHandler = async (uri, coordinates) => {
    Geolocation.clearWatch(this.watchID);
    setTimeout(() => this.setState({ showAlert2: true }), 100);
    const assignedLocations = await getAssignedLocations();

    const findTravelGeoFence = assignedLocations.find(
      each => each.accessLocation === 'Travel Check In',
    );
    const AccessLocationId = findTravelGeoFence.id;
    // const AccessLocationId = await AsyncStorage.getItem(
    //   'travelCheckinLocationId',
    // );
    const uid = await AsyncStorage.getItem('uuid');
    console.log('travelCheckinLocationId', AccessLocationId);
    const { latitude, longitude, accuracy } = coordinates;

    const filteredLocations = assignedLocations.filter(
      e => e.type !== 'Anonymous',
    );
    let count = 0;
    if (filteredLocations.length > 0) {
      filteredLocations.forEach(e => {
        const check = validatePointWithinCircle(e, coordinates);
        console.log('check', check);
        if (check) {
          return this.setState({ travelCheckInAddress: e.accessLocation });
        }
        count += 1;
      });
    }
    if (count === filteredLocations.length) {
      const { data } = await axios.get(
        `${OPEN_GEOCODING_API}${latitude}+${longitude}&key=${OPEN_CAGE_APIKEY}`,
      );

      const formatted_address = data.results[0].formatted;
      this.setState({ travelCheckInAddress: formatted_address }, () =>
        this.checkOUT(
          uri,
          latitude,
          longitude,
          accuracy,
          AccessLocationId,
          uid,
        ),
      );
    } else {
      this.checkOUT(uri, latitude, longitude, accuracy, AccessLocationId, uid);
    }
  };

  checkOUT = async (

    uri,
    latitude,
    longitude,
    accuracy,
    AccessLocationId,
    uid,
  ) => {
    // alert("hit")
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
    uploadData.append('Accuracy', Number(accuracy));
    uploadData.append('IsTravelCheckIn', true);
    uploadData.append('AccessLocationId', Number(AccessLocationId));
    uploadData.append('TripIdentitfier', uid);
    uploadData.append('TravelCheckInAddress', this.state.travelCheckInAddress);
    console.log('uploadData', uploadData);
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    setTimeout(() => {
      source.cancel('Request cancel after timeout');
    }, 30000);
    try {
      console.log('uploadData', uploadData);
      const response = await axios({
        method: 'post',
        url: Const + 'api/Staff/CheckOutWithFormFile',
        data: uploadData,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,

        cancelToken: source.token,
      });
      console.log('End time', new Date());

      const { data } = response;
      if (!data.status) return alert(data.message);
      await AsyncStorage.setItem('current_travel_checkin', 'stopped');
      await AsyncStorage.setItem('checked_out', 'yes');
      await AsyncStorage.setItem('coordinates', '');
      await AsyncStorage.setItem('radius', '');
      await AsyncStorage.setItem('type', '');
      await AsyncStorage.setItem('checkin_time', '');
      await AsyncStorage.setItem('beacon', '');
      await AsyncStorage.setItem('geo_id', '');
      await AsyncStorage.setItem('actualCheckInTime', '');
      await AsyncStorage.setItem('uuid', '');
      await BackgroundGeolocation.stop();
      //await BackgroundGeolocation.resetOdometer();

      if (isIOS) {
        alert(data.message);
      }
      this.setState({
        showAlert: false,
        showAlert2: false,
        showAlert1: true,
        progress: 0,
        error: false,
        error_message: data.message,
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
        if (isIOS) {
          alert(
            'Request taking too long to respond. Refresh internet connection and retry.',
          );
        }
        this.setState({
          showAlert: false,
          showAlert2: false,
          showAlert1: true,
          error: true,
          error_message:
            'Request taking too long to respond. Refresh internet connection and retry.',
          progress: 0,
          success: false,
        });
        return;
      }

      if (isIOS) {
        alert(`Sorry! ${error.message}`);
      }
      this.setState({
        showAlert1: true,
        error: true,
        error_message: 'Sorry! Unhandled exception occured while checking-out.',
        showAlert: false,
        progress: 0,

        showAlert2: false,
      });
    }
  };

  openCamera = async camera => {
    const options1 = { quality: 1, base64: false, width: 800 };
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

      // this.setState({
      //   show: false,
      //   showAlert2: true,
      //   capturedPhoto: image1,
      //   //error_message: 'Fetching location...',
      //   showAlert: false,
      // });
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
          if (this.state.travelCheckOut) {
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
            return await this.beaconCheckout();
          }
          if (this.props?.route?.params?.wifi) {
            console.log('I ran beacon');
            return await this.checkOutHandler(
              this.props?.route?.params?.wifiLocation,
            );
          }

          this.checkLocationHandler();
          // call new face validation API:
        })
        .catch(error => console.log(error));
      //Travel Check-in
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
        this.setState({
          showAlert: false,
          showAlert2: false,
          showAlert1: true,
          error_message:
            'Request taking too long to respond. Refresh internet connection and retry.',
          progress: 0,
          success: false,
          error: true,
        });
        return;
      }
      this.setState({
        showAlert1: true,
        error_message: 'Sorry! Unhandled exception occured while checking-out.',
        showAlert: false,
        progress: 0,
        error: true,
        showAlert2: false,
      });

      // this.setState({
      //   showAlert: false,
      //   showAlert2: false,
      //   showAlert1: false,
      //   progress: 0,
      // });
      //alert('Error validating face:' + e + '. Please try again');
    }
  };

  wifiCheckout = async () => { };

  beaconCheckout = async () => {
    setTimeout(() => this.setState({ showAlert2: true }), 300);
    const geofence = this.props?.route?.params?.beaconLocation;

    const url = `${Const}api/Staff/StaffBeaconCheckOut`;
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
    try {
      console.log('url = ', `${Const}api/Staff/StaffBeaconCheckOut`);
      console.log('geofebeacon', geofence);
      console.log('body ========3>', uploadData);
      const apiResponse = await axios.post(url, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { data } = apiResponse;

      console.log('facerespinse ==>', data);
      if (!data.status && !data.message.includes('Unhandled')) {
        if (Platform.OS === 'ios') {
          setTimeout(() => this.setState({ showAlert2: false }), 100);
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
        await AsyncStorage.setItem('checked_out', 'yes');
        await AsyncStorage.setItem('coordinates', '');
        await AsyncStorage.setItem('checkin_time', '');
        await AsyncStorage.setItem('beacon', '');
        await AsyncStorage.setItem('geo_id', '');
        await AsyncStorage.setItem('geoLocation', '');
        await AsyncStorage.setItem('actualCheckInTime', '');
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

  checkOutHandler = async accessLocation => {
    setTimeout(() => this.setState({ showAlert2: true }), 300);
    const url = `${Const}api/Staff/StaffFaceCheckOut`;
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
    console.log("url ========= ", url);
    console.log("uploadData ===", JSON.stringify(body));

    const body = uploadData;
    const apiResponse = await axios.post(url, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const { data } = apiResponse;
    console.log("url = ", `${Const}api/Staff/StaffFaceCheckOut`);
    console.log("uploadData ===", JSON.stringify(body));
    console.log('facerespinse ==>', data);
    if (!data.status && !data.message.includes('Unhandled')) {
      if (Platform.OS === 'ios') {
        setTimeout(() => this.setState({ showAlert2: false }), 100);
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
        progress: 0,
        faceMismatchModal: true,
        faceMismatchMessage: data.message,
      });
    }
    if (data.status) {
      await AsyncStorage.setItem('checked_out', 'yes');
      await AsyncStorage.setItem('coordinates', '');
      await AsyncStorage.setItem('radius', '');
      await AsyncStorage.setItem('type', '');
      await AsyncStorage.setItem('checkin_time', '');
      await AsyncStorage.setItem('beacon', '');
      await AsyncStorage.setItem('geo_id', '');
      await AsyncStorage.setItem('actualCheckInTime', '');
    }
    this.setState({
      showAlert: false,
      showAlert2: false,
      showAlert1: true,
      progress: 0,
      error: false,
      error_message: data.message,
    });
  };

  openCamera1 = async camera => {
    const options1 = { quality: 1, base64: false };
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
      ).then(async response => {
        console.log('size of image ===>', response.size);
        this.setState({ showAlert: true });
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
          console.log(body);
          const response = await axios({
            method: 'POST',
            url: Const + 'api/staff/QrCheckOut',
            data: body,
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          this.setState({ show1: false, showAlert: false });
          console.log('JSON ==>', response.data);
          const json = response.data;
          if (!json.status) {
            return alert(response.data.message);
          }

          if (json.status) {
            this.setState({
              showAlert1: true,
              error_message: json.message,
              showAlert: false,
              error: false,
              count: 0,
            });
            if (this.state.isBluetoothOn) {
              BluetoothStateManager.disable().then(result => {
                // do something...
                console.log('blettoth', result);
              });
            }
            AsyncStorage.setItem('checked_out', 'yes');
            try {
              //AsyncStorage.setItem('coordinates', '');
              //AsyncStorage.setItem('radius', '');
              //AsyncStorage.setItem('type', '');
              AsyncStorage.setItem('checkin_time', '');
              AsyncStorage.setItem('beacon', '');
              AsyncStorage.setItem('actualCheckInTime', '');
              // AsyncStorage.setItem('geo_id', '');
              // if (ReactNativeForegroundService.is_task_running('taskid')) {
              //   ReactNativeForegroundService.remove_task('taskid');
              // }
              // Stoping Foreground service.
              //KeepAwake.deactivate();
              //ReactNativeForegroundService.stop();

              return setTimeout(() => {
                this.props.navigation.goBack();
              }, 5200);
            } catch (e) {
              console.log(e);
            }
          }
          //alert(response.data.response.message)
        }
      });
    } catch (e) {
      console.log(e);
      alert(e.toString());
      this.setState({ show1: false, showAlert: false });
    }
  };

  CheckOutWithBarCode = async ({ data }) => {
    let parsedDate = JSON.parse(data);
    let now1 = new Date().valueOf();
    let then1 = new Date(parsedDate.timeStamp).valueOf();
    const difference = (now1 - then1) / 1000;
    if (difference > 10) {
      this.setState({ show2: false }, () => {
        return alert('Time exceeded for check out');
      });
      return;
    }
    this.setState({
      data: JSON.parse(data),
      show2: false,
      show1: true,
    });
  };

  launchTipsModal = () => {
    this.setState({ modal: true, notInFence: false });
  };
  goToHome = () => {
    this.props.navigation.goBack();
  };

  pinHandler = async () => {
    console.log('I am pressed');
    const url = `${Const}api/Staff/TravelCheckOutWithStaffCode`;
    const isIOS = Platform.OS === 'ios' ? true : false;
    if (isIOS) {
      setTimeout(() => this.setState({ showAlert: true }), 200);
    } else {
      this.setState({ showAlert: true });
    }
    this.watchID = Geolocation.watchPosition(
      async pos => {
        try {
          const assignedLocations = await getAssignedLocations();
          const findTravelGeoFence = assignedLocations.find(
            each => each.accessLocation === 'Travel Check IN with Staff Code',
          );
          const geoFenceId = findTravelGeoFence.id;
          const shiftId = findTravelGeoFence.shiftId;
          const body = {
            geoFenceId,
            staffCode: this.state.StaffNo,
            instituteId: this.state.institute_id,
            checkoutCoordinates: `${pos.coords.latitude},${pos.coords.longitude}`,
            shiftId,
            mpin: this.state.mpin,
          };
          const response = await axios.post(url, body);
          const { data } = response;
          if (data.status) {
            await AsyncStorage.setItem('checked_out', 'yes');
            await AsyncStorage.setItem('current_travel_checkin', 'stopped');
            await AsyncStorage.setItem('actualCheckInTime', '');
          }

          if (isIOS) {
            setTimeout(() => this.setState({ showAlert: false }), 300);
            setTimeout(() => this.setState({ showMPINAlert: false }), 400);
            setTimeout(
              () =>
                this.setState({
                  showAlert1: true,
                  error: data.status ? true : false,
                  error_message: data.message,
                }),
              500,
            );
          } else {
            this.setState({
              showAlert: false,
              showMPINAlert: false,
              showAlert1: true,
              error: data.status ? true : false,
              error_message: data.message,
            });
          }
        } catch (e) {
          if (isIOS) {
            setTimeout(() => this.setState({ showMPINAlert: false }), 300);
            setTimeout(() => this.setState({ showAlert: false }), 400);
          } else {
            this.setState({
              showAlert: false,
              showMPINAlert: false,
            });
          }
          alert('Error checking out with mpin: ' + e);
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

  success = position => this.setState({ coordinates: position.coords });

  error = error =>
    alert('Error retreiving location. Check your location services.');

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

    // const {assignedLocations} = this.state;

    const assignedLocationsAll = await getAssignedLocations();

    const assignedLocations = assignedLocationsAll.filter(
      each => each.type === 'Circle',
    );
    console.log('assignedLocationssssssssssssssssssss', assignedLocations);
    const options = {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 1000,
      fastestInterval: 1000,
    };

    this.watchID = Geolocation.watchPosition(this.success, this.error, options);
    this.setState({ loaderModal: true });
    setTimeout(() => {
      Geolocation.clearWatch(this.watchID);
      clearInterval(this.interval);
      this.setState({ loaderModal: false, progress: 0 });
      if (assignedLocations?.length === 0) {
        return alert(
          'No locations assigned. Please contact your administrator for further details.',
        );
      }
      let count = 0;
      assignedLocations.forEach(location => {
        console.log("((((((((((((((((((((((((((((((((((((((((((")
        console.log(JSON.stringify(location))
        const point = validatePointWithinCircle(
          location,
          this.state.coordinates,
        );
        if (point) {
          return this.setState({
            // show: true,
            geofence: location,
          });
        }
        count += 1;
      });
      console.log(count);
      if (count === assignedLocations.length) {
        setTimeout(() => this.setState({ locationModal: true }), 100);
        return;
      }
      
      //return this.setState({show: true});
      this.checkOutHandler(this.state.geofence);
    }, 10000);
  };

  render() {
    var cardStyle1 = {
      borderRadius: 10,
      elevation: 4,
      padding: 20,
    };
    var cardStyle2 = {
      borderRadius: 10,
      elevation: 4,
      padding: 20,
    };
    let { current_travel_check_in } = this.state;
    const mainCardStyle =
      this.state.travel_check_in == 'yes' ? cardStyle1 : cardStyle2;
    if (this.state.loader) {
      return <Loader />;
    }

    return (
      <View style={styles.container}>
        <SubHeader
          title="Check Out"
          showBack={true}
          backScreen="Tab"
          showBell={false}
          navigation={this.props.navigation}
        />
        <AnimatedLoader isVisible={this.state.showAlert} doNotShowDeleteIcon />
        <AnimatedLoader
          source={require('../../assets/lottie/splash1.json')}
          isVisible={this.state.loaderModal}
          doNotShowDeleteIcon
          message={
            'Please wait... Checking whether you are in your assigned location or not...'
          }
        />
        <AnimatedLoader
          source={require('../../assets/lottie/travel_bubble.json')}
          isVisible={this.state.showAlert2}
          doNotShowDeleteIcon
          message={'Please wait... Trying to check out...'}
        />

        {/* <CustomPopUp
          name={'search-location'}
          type={'font-awesome-5'}
          color={Colors.white}
          size={45}
          isVisible={this.state.showAlert2}
          title={'Trying to Check OUT'}
          subTitle={'Please wait...'}
          bgColor={'#5D5FEF'}
        /> */}

        <CustomPopUp
          name={'location-off'}
          type={'material'}
          color={Colors.white}
          size={45}
          isVisible={this.state.locationModal}
          title={'You are not in your assigned location'}
          subTitle={'Please check out from assigned location'}
          bgColor={'#FFD200'}>
          <CustomButton
            alignSelf={'center'}
            color={Colors.mainHeader[0]}
            width={'90%'}
            title={'Ok'}
            onPress={() =>
              this.setState({ locationModal: false }, () => this.goToHome())
            }
          />
        </CustomPopUp>

        {/* {this.state.locationModal && (
          <LocationModal
            isVisible={this.state.locationModal}
            deleteIconPress={() =>
              this.setState({locationModal: false}, () => this.goToHome())
            }
            title={
              'Your GPS accuracy: ' +
              Number(this.state.coordinates.accuracy).toFixed()
            }
            subTitle={'The recommended GPS accuracy is 10 m or less.'}
            latitude={this.state.coordinates.latitude || 12.3788}
            longitude={this.state.coordinates.longitude || 74.444}
            photo={this.state.profile_pic}
            // onPressRetry={() => {
            //   this.setState({locationModal: false});
            //   this.checkLocationHandler();
            // }}
            //radius={this.state.coordinates.accuracy || 25}
            assignedLocations={this.state.assignedLocations || []}
          />
        )} */}
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
                <View style={{ width: wp('30'), elevation: 2 }}>
                  <Avatar
                    containerStyle={{ alignSelf: 'center' }}
                    source={{
                      uri:
                        this.state.profile_pic ||
                        'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
                    }}
                    size={'large'}
                  />
                  <CustomLabel
                    family={'Poppins-Regular'}
                    labelStyle={{ textAlign: 'center', fontSize: 12 }}
                    title={'Registered Photo'}
                  />
                </View>
                <View style={{ width: wp('30'), elevation: 2 }}>
                  <Avatar
                    containerStyle={{ alignSelf: 'center' }}
                    source={{
                      uri:
                        this.state.capturedPhoto?.uri ||
                        'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
                    }}
                    size={'large'}
                  />
                  <CustomLabel
                    family={'Poppins-Regular'}
                    labelStyle={{ textAlign: 'center', fontSize: 12 }}
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
                  this.setState({ faceMismatchModal: false }, () =>
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
                textStyle={{ color: Colors.mainHeader[0] }}
                width={'90%'}
                title={'Ok'}
                onPress={() =>
                  this.setState({ faceMismatchModal: false }, () =>
                    this.goToHome(),
                  )
                }
              />
            </CustomPopUp>

            // <FaceMismatchModal
            //   isVisible={this.state.faceMismatchModal}
            //   title={'Face Mismatch'}
            //   profilePic={
            //     this.state.profile_pic ||
            //     'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
            //   }
            //   capturedPhoto={
            //     this.state.capturedPhoto?.uri ||
            //     'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
            //   }
            //   errorMsg={
            //     this.state.faceMismatchMessage.includes('register')
            //       ? this.state.faceMismatchMessage +
            //         '. Re-register your face again'
            //       : this.state.faceMismatchMessage +
            //           '. Adjust your camera showing the face clearly or re-register your face again.' ||
            //         'No error'
            //   }
            //   registerScreen={() => {
            //     this.setState({faceMismatchModal: false}, () =>
            // this.props.navigation.navigate('FaceRegister', {
            // show: true,
            // show1: false,
            // }),
            //     );
            //   }}
            //   deleteIconPress={() =>
            //     this.setState({faceMismatchModal: false}, () => this.goToHome())
            //   }
            // />
          )}

        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() =>
            this.setState({ showAlert1: false }, () => this.goToHome())
          }
          subTitle={this.state.error_message}
        />

        {/* <SubHeader
            title="Check Out"
            showBack={true}
            backScreen="Home"
            showBell={false}
            navigation={this.props.navigation}
          /> */}
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <VStack>
            {this.state.show && (
              <CameraComp
                visible={this.state.show}
                onClose={() =>
                  this.setState({ show: false }, () => this.goToHome())
                }
                onPress={camera => this.openCamera(camera)}
                //onBarCodeRead = {this.CheckOutWithBarCode}
                //btnText={'check-out'}
                btnText={
                  !this.state.travelCheckOut ? 'check-out' : 'travel check-out'
                }
                onRecordingStart={event => {
                  //console.log('event', event);
                  this.interval2 = setInterval(() => {
                    this.setState(prev => ({ btnCount: prev.btnCount + 1 }));
                  }, 1000);
                }}
                onRecordingEnd={() => {
                  clearInterval(this.interval2);
                  this.setState({
                    show: false,
                    btnCount: 0,
                    pressed: false,
                    showAlert: true,
                  });
                }}
              />
            )}

            {this.state.showMPINAlert && (
              <CustomModal
                isVisible={this.state.showMPINAlert}
                deleteIconPress={() =>
                  this.setState({ showMPINAlert: false }, () => this.goToHome())
                }>
                <Text>Enter MPIN to verify</Text>
                <OTPInputView
                  style={{ width: wp('80'), height: 80 }}
                  pinCount={4}
                  autoFocusOnLoad={true}
                  secureTextEntry={true}
                  codeInputFieldStyle={styles.inputFeilds}
                  codeInputHighlightStyle={styles.inputFeildsFocus}
                  onCodeFilled={text =>
                    this.setState({ mpin: text }, () => this.pinHandler())
                  }
                />

                <CustomButton
                  title={'Verify'}
                  color={Colors.mainHeader[0]}
                  onPress={this.pinHandler}
                />
              </CustomModal>
            )}

            {this.state.show1 && (
              <CameraComp
                visible={this.state.show1}
                onClose={() =>
                  this.setState({ show1: false }, () => this.goToHome())
                }
                onPress={camera => this.openCamera1(camera)}
                btnText={'qr check-out'}
              />
            )}
            {this.state.show2 && (
              <CameraComp
                visible={this.state.show2}
                onClose={() =>
                  this.setState({ show2: false }, () => this.goToHome())
                }
                onPress={camera => { }}
                btnText={'QR Code Scanner'}
                onBarCodeRead={this.CheckOutWithBarCode}
              //type = {RNCamera.Constants.Type.back}
              />
            )}
            {/* {this.state.modal && (
              <ModalForAccuracy
                visible={this.state.modal}
                onClose={() => this.setState({modal: false})}
                onPress={() => this.props.navigation.goBack()}
                //accuracy={parseInt(this.state.coordinates.accuracy).toString()}
                accuracy={Math.round(
                  Number(this.state.coordinates.accuracy),
                ).toString()}
                checkout
              />
            )} */}
          </VStack>
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
  card: {
    borderRadius: 10,
    elevation: 4,
    paddingTop: '3%',
    paddingBottom: '3%',
    height: hp('60'),
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
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#ffffff',
  },
  btImage: {
    width: 50,
    height: 39,
    borderRadius: 20,
  },
  preview: {
    flex: 1,
  },
  heading: {
    fontFamily: 'Poppins-SemiBold',
    margin: 12,
  },
  buttonContainer1: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('41'),
    marginTop: '4%',
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
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
    paddingRight: '3%',
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
