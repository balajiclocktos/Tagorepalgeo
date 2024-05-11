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
  //Modal,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, Card, VStack} from 'native-base';
import SubHeader from '../common/SubHeader';
import Loader from '../common/Loader';
import Geolocation from 'react-native-geolocation-service';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalForAccuracy from '../common/Modal';
import CameraComp from '../common/CameraComp';
import ProgressCircle from 'react-native-progress-circle';
import BleManager from 'react-native-ble-manager';
import axios from 'axios';
//import base64 from 'react-native-base64';
import Modal from 'react-native-modal';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
//import Boundary from 'react-native-boundary';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {Colors} from '../../utils/configs/Colors';

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
      showAlert: false,
      StaffNo: '',
      bearer_token: '',
      institute_id: '',
      showAlert1: false,
      error_message: '',
      travel_check_in: 'no',
      uri: '',
      travelCheckIn: false,
      selected: false,
      notInFence: false,
      modal: false,
      show: !this.props.route.params.travel,
      showMessage: false,
      showTimer: false,
      count: 0,
      subCount: 0,
      btnCount: 1,
      pressed: false,
      base64Data: null,
      isScanning: false,
      beaconID: '',
      beaconDetails: {},
      vtype: [
        {value: 'Blink left eye only', id: 1},
        {value: 'Blink right eye only', id: 2},
        {value: 'Blink both the eyes', id: 3},
        {value: 'Smile', id: 4},
      ],
      index: 1,
      randomQuestion: '',
      loadingMessage: '',
      progress: '0',
      totalBeacons: [],
      recordDone: false,
      uploadDone: false,
      scanTime: 5,
    };
  }
  startScan = () => {
    if (!this.state.isScanning) {
      BleManager.scan([], this.state.scanTime, true)
        .then(results => {
          console.log('Scanning...');
          this.setState({isScanning: true});
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  handleStopScan = () => {
    console.log('Scan is stopped');
    this.setState({isScanning: false});
  };

  handleDiscoverPeripheral = async peripheral => {
    console.log('peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'unknown';
    }
    console.log(this.state.beaconDetails.uniqueId === peripheral.id);
    if (this.state.beaconDetails.uniqueId === peripheral.id) {
      this.setState({isScanning: false});
      alert(
        `Got beacon ${
          peripheral.id
        } with signal strength ${peripheral.rssi.toString()}`,
      );
      this.setState({beaconID: peripheral.id, beaconDetails: peripheral});
    }
  };

  async componentDidMount() {
    if (this.state.show) {
      const randomQuestion =
        this.state.vtype[Math.floor(Math.random() * this.state.vtype.length)];
      this.setState({randomQuestion});
      console.log('random', randomQuestion);
      this.setState({index: randomQuestion.id});
      console.log('index', this.state.index);
    }
    const user_id = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    const checkBeacon = await this.checkBeacon(user_id, institute_id);
    if (checkBeacon) {
      this.enableBluetooth();
    }
    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
    console.log('I ran man');
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    const base64Data = await AsyncStorage.getItem('base64Data');
    const travel_check_in = await AsyncStorage.getItem('travel_check_in');

    //console.log('ttt', travel_check_in);
    this.setState({
      bearer_token,
      StaffNo: user_id,
      institute_id,
      travel_check_in,
      base64Data,
    });
  }

  checkBeacon = async (user_id, institute_id) => {
    //this.setState({showAlert: false});
    return fetch(
      Const + 'api/Staff/information/' + institute_id + '/' + user_id,
      {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
          'content-type': 'application/json-patch+json',
        },
      },
    )
      .then(response => response.json())
      .then(json => {
        if (json.status) {
          const beacon = json.assignedLocations.find(
            item => item.uniqueId !== null,
          );
          if (beacon) {
            this.setState({beaconDetails: beacon});
            return true;
          }
          return false;
        }
        return false;
      })
      .catch(error => {
        this.setState({showAlert: false});
        return false;
      });
  };

  enableBluetooth = () => {
    this.setState({loader: true});
    BleManager.enableBluetooth()
      .then(() => {
        // Success code
        console.log('The bluetooth is already enabled or the user confirm');
        this.setState({loader: false});
        BleManager.start({showAlert: false});
        this.startScan();
      })
      .catch(error => {
        //Failure code
        Alert.alert('Attention', 'Please turn on your bluetooth', [
          {
            text: 'OK',
            onPress: () => {
              BleManager.enableBluetooth();
            },
          },
        ]);
        return;
      });
  };

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.interval2);
    Geolocation.clearWatch(this.watchID);

    bleManagerEmitter.removeListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    bleManagerEmitter.removeListener('BleManagerStopScan', this.handleStopScan);
  }

  openCamera = async camera => {
    const options = {maxDuration: 5, maxFileSize: 4 * 1024 * 1024};
    try {
      const image = await camera.recordAsync(options);
      const base64Image = await AsyncStorage.getItem('base64Data');
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      if (image.uri) {
        clearInterval(this.interval2);
        this.setState({
          btnCount: 1,
          pressed: false,
          show: false,
          //showAlert: true,
          recordDone: true,
          loadingMessage: 'Uploading...',
        });
        let data = new FormData();
        data.append('images', base64Image);
        data.append('video', {
          name: 'name.mp4',
          uri: image.uri,
          type: 'video/mp4',
        });
        data.append('vtype', this.state.index);
        const config = {
          method: 'post',
          url: 'http://103.87.172.204:5690/api/v1/validate/face',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          data: data,
          timeout: 60000,
          cancelToken: source.token,
          onUploadProgress: progressEvent => {
            let percentCompleted = Math.floor(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            console.log(percentCompleted, ' %');

            //await AsyncStorage.setItem('progress', percentCompleted.toString());
            let ratio = progressEvent.loaded / progressEvent.total;
            console.log(progressEvent.total);
            //await AsyncStorage.setItem('progress', percentCompleted.toString());
            this.setState({progress: percentCompleted});
            if (ratio === 1) {
              this.setState({
                uploadDone: true,
                recordDone: false,
                loadingMessage: 'Validating face...',
              });
            }
          },
        };

        setTimeout(() => {
          source.cancel('Request cancel after timeout');
        }, config.timeout);

        axios(config)
          .then(response => {
            console.log('response', response);
            //this.setState({uploadDone: false});
            const json = response.data;
            console.log(json);
            if (json.status && json.threshold >= 80) {
              this.setState({
                // showAlert: false,
                // showAlert1: true,
                // error_message: 'Fetching location...',
                // showTimer: true,
                progress: 0,
                loadingMessage: 'Confirming location...',
              });
              //this.startScan();
              //setTimeout(() => this.props.navigation.navigate('Home'), 1200);
              // if (this.state.travelCheckIn) {
              //   this.CheckIn();
              // }
              this.getCurrentLocationWithAccuracy();
            } else {
              this.setState({
                showAlert: false,
                showAlert1: true,
                error_message: `The activity "${this.state.randomQuestion.value}" is not recognised. Please try again.`,
                progress: 0,
              });
              // setTimeout(() => {
              //   const randomQuestion = this.state.vtype[
              //     Math.floor(Math.random() * this.state.vtype.length)
              //   ];
              //   this.setState({randomQuestion});
              //   console.log('random', randomQuestion);
              //   this.setState({index: randomQuestion.id});
              //   console.log('index', this.state.index);
              //   this.setState({
              //     recordDone: false,
              //     show: true,
              //     showAlert1: false,
              //     uploadDone: false,
              //   });
              // }, 2200);
              //setTimeout(() => this.props.navigation.navigate('Home'), 1200);
            }
          })
          .catch(error => {
            this.setState({uploadDone: false});
            if (axios.isCancel(error)) {
              console.log('Request canceled', error.message);
              this.setState({
                showAlert: false,
                showAlert1: true,
                error_message: `Request taking too long. Please try again`,
                progress: 0,
                uploadDone: false,
                recordDone: false,
              });
              return;
              //return this.props.navigation.navigation('Home');
            }
            console.log(error);
            this.setState({
              showAlert: false,
              showAlert1: true,
              error_message: `${error.message}`,
              progress: 0,
              uploadDone: false,
              recordDone: false,
            });
          });
      } else {
        this.setState({
          showAlert1: true,
          error_message: 'Please re authenticate your face',
          showAlert: false,
          showTimer: false,
        });
      }
    } catch (error) {
      alert('Error in recording video. Try again');
      clearInterval(this.interval2);
      this.setState({
        uploadDone: false,
        recordDone: false,
        btnCount: 0,
        pressed: false,
        show: true,
      });
    }
  };

  getCurrentLocationWithAccuracy = () => {
    // this.interval = setInterval(() => {
    //   this.setState((prev) => ({count: prev.count + 1}));
    // }, 1000);
    let coordinatesTemp = {latitude: '', longitude: '', accuracy: ''};
    setTimeout(async () => {
      Geolocation.clearWatch(this.watchID);
      if (this.state.coordinates.accuracy > 10) {
        console.log('Entry_Time', new Date());
        await this.CheckIn(this.state.coordinates);
        return;
      } else {
        if (this.state.coordinates.accuracy === '') {
          console.log('accuracy', this.state.coordinates.accuracy);
          Geolocation.getCurrentPosition(
            pos => this.CheckIn(pos.coords),
            () => {},
            {enableHighAccuracy: true, maximumAge: 0},
          );
        }
        console.log('Accuracy achieved');
      }
    }, 10000);
    this.watchID = Geolocation.watchPosition(
      async position => {
        console.log('progress_location', position);
        this.setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
        coordinatesTemp.latitude = position.coords.latitude;
        coordinatesTemp.longitude = position.coords.longitude;
        coordinatesTemp.accuracy = position.coords.accuracy;
        if (position.coords.accuracy <= 10) {
          Geolocation.clearWatch(this.watchID);
          await this.CheckIn(coordinatesTemp);
          return;
        }
      },
      e => {
        console.log(e.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 1000,
        fastestInterval: 1000,
      },
    );
  };

  checkDistance = locations => {
    let check = true;
    if (locations.length === 0) {
      check = false;
    } else {
      locations.forEach(item => {
        if (parseInt(item.distance) > 40) {
          check = false;
        } else {
          check = true;
        }
      });
    }
    return check;
  };

  CheckIn = async coordinates => {
    console.log('uri==>', coordinates, this.state.institute_id);
    if (this.state.subCount > 0)
      console.log('==> I ran again', this.state.subCount);
    this.setState({
      //uploadDone: false,
      //showAlert1: false,
      //showAlert: true,
      loadingMessage: 'Loading...',
    });
    let uploadData = {
      StaffNo: this.state.StaffNo,
      Latitude: Number(coordinates.latitude),
      Longitude: Number(coordinates.longitude),
      Accuracy: Number(coordinates.accuracy),
      InstituteId: this.state.institute_id,
      IsTravelCheckIn: this.state.travelCheckIn,
    };

    try {
      console.log('Try time', new Date());

      const response = await axios.post(
        Const + 'api/Staff/LiveCheckin',
        uploadData,
      );
      console.log('End time', new Date());
      const json = response.data;
      clearInterval(this.interval);
      Geolocation.clearWatch(this.watchID);
      console.log('JSON', json);
      const totalBeacons = json.geofencingClients.filter(
        (item, index) => item.uniqueId,
      );

      this.setState({totalBeacons});
      console.log('total_beacons', totalBeacons);
      const beacon = json.geofencingClients.find(
        (item, index) =>
          item.uniqueId === this.state.beaconID &&
          Math.abs(this.state.beaconDetails.rssi) <= 65,
      );

      if (beacon) {
        AsyncStorage.setItem('beacon', JSON.stringify(beacon));
      }

      console.log('check', beacon, 'totalBeacons_count', totalBeacons.length);
      if (json.response.status) {
        BluetoothStateManager.disable().then(result => {
          // do something...
          console.log('blettoth', result);
        });
        const geofence = json.geofencingClients.find(
          item => item.distance === 0,
        );
        console.log('End time1', new Date());
        AsyncStorage.setItem('checked_out', 'no');
        AsyncStorage.setItem('isInside', 'yes');

        if (this.state.travelCheckIn) {
          AsyncStorage.setItem('current_travel_checkin', 'running');
        }
        console.log('End time2', new Date());
        setTimeout(() => {
          this.setState({
            showAlert: false,
            uploadDone: false,
            showAlert1: true,
            error_message: 'Checked in successfully',
          });
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
          return setTimeout(() => {
            this.props.navigation.navigate('StaffTasks', {disable: true});
          }, 1200);
        }, 1000);
      } else if (!json.response.status) {
        //this.enableBluetooth();

        //this.startScan();
        let isWithinBoundary = this.checkDistance(json.geofencingClients);
        console.log('boundary', isWithinBoundary);
        if (json.geofencingClients.length === 0) {
          this.setState({
            showAlert: false,
            uploadDone: false,
            showAlert1: true,
            error_message:
              'No assigned locations. Please contact your administrator for further details.',
          });
          return;
        }

        //console.log('BEACON', beacon.id);
        if (totalBeacons.length > 0) {
          if (
            !beacon &&
            json.geofencingClients.length > 0 &&
            !this.state.travelCheckIn
          ) {
            this.setState({
              showAlert1: true,
              uploadDone: false,
              showAlert: false,
              error_message: `Either you are not in your assigned location or you are not close enough to the assigned beacon. Please move closer to the beacon location for successful check-in.`,
            });
            return setTimeout(
              () => this.props.navigation.navigate('Home'),
              5000,
            );
          }
          if (
            beacon &&
            json.geofencingClients.length > 0 &&
            !this.state.travelCheckIn
          ) {
            axios
              .post(`${Const}api/Staff/LiveCheckin`, {
                ...uploadData,
                IsBeaconVerified: true,
                AccessLocationId: beacon.id || null,
              })
              .then(response => response.data)
              .then(json => {
                //console.log('beacon_json',json);
                if (!json.response.status) {
                  clearInterval(this.interval);
                  Geolocation.clearWatch(this.watchID);
                  console.log('beacon_json', json);
                  this.setState({
                    showAlert: false,
                    uploadDone: false,
                    showAlert1: true,
                    error_message: json.response.message,
                  });
                  return;
                }
                clearInterval(this.interval);
                Geolocation.clearWatch(this.watchID);
                console.log('beacon_json', json);

                BluetoothStateManager.disable().then(result => {
                  // do something...
                  console.log('blettoth', result);
                });
                AsyncStorage.setItem('checked_out', 'no');
                AsyncStorage.setItem('isInside', 'yes');
                if (this.state.travelCheckIn) {
                  AsyncStorage.setItem('current_travel_checkin', 'running');
                }
                this.setState({
                  showAlert: false,
                  uploadDone: false,
                  showAlert1: true,
                  error_message: 'Checked in successfully via beacon!',
                });
                // try {
                if (beacon.type == 'Circle') {
                  AsyncStorage.setItem(
                    'coordinates',
                    JSON.stringify(beacon.coordinates),
                  );
                  AsyncStorage.setItem('radius', beacon.radius.toString());
                  AsyncStorage.setItem('type', beacon.type.toString());
                  AsyncStorage.setItem(
                    'checkin_time',
                    beacon.CheckInTime ? beacon.CheckInTime : '',
                  );
                } else {
                  AsyncStorage.setItem(
                    'coordinates',
                    JSON.stringify(beacon.coordinates),
                  );
                  AsyncStorage.setItem(
                    'checkin_time',
                    beacon.CheckInTime ? beacon.CheckInTime : '',
                  );
                  AsyncStorage.setItem('type', beacon.type.toString());
                }
                //   }
                return setTimeout(() => {
                  this.props.navigation.navigate('StaffTasks', {
                    disable: true,
                  });
                }, 1200);
                // } catch (e) {
                //   console.log(e);
                // }
              })
              .catch(error => console.log('beacon_error', error));
            return;
          }
          return this.setState({
            showAlert: false,
            uploadDone: false,
            showAlert1: true,
            error_message: json.response.message,
            count: 0,
          });
        }
        if (
          this.state.coordinates.accuracy > 10 &&
          json.geofencingClients.length > 0 &&
          !this.state.travelCheckIn
        ) {
          this.setState({
            showAlert: false,
            uploadDone: false,
            modal: true,
            count: 0,
          });
        } else if (
          this.state.coordinates.accuracy <= 10 &&
          json.geofencingClients.length > 0 &&
          isWithinBoundary &&
          !this.state.travelCheckIn
        ) {
          Geolocation.getCurrentPosition(
            position => {
              let coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              };
              this.setState({count: 0});
              if (this.state.subCount < 2) {
                this.CheckIn(uri, coordinates);
                console.log('==> I ran');
              } else {
                // this.setState({
                //   showAlert: false,
                //   showAlert1: true,
                //   error_message:
                //     'Please check-in from assigned location or retry again.',
                // });
                alert('Please check-in from assigned location or retry again.');
                setTimeout(() => this.props.navigation.navigate('Home'), 1200);
              }
              setTimeout(
                () => this.setState({subCount: this.state.subCount + 1}),
                1200,
              );
            },
            e => {
              console.log(e);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
            },
          );
        } else {
          this.setState({
            showAlert1: true,
            uploadDone: false,
            error_message: json.response.message,
            showAlert: false,
            count: 0,
          });
        }
      }
    } catch (error) {
      clearInterval(this.interval);
      Geolocation.clearWatch(this.watchID);
      console.log('Error', error);
      this.setState({
        showAlert: false,
        uploadDone: false,
        showAlert1: true,
        error_message:
          'Unhandled exception occured while checking-in. Please try again',

        count: 0,
      });
    }
  };

  goToHome = () => {
    this.props.navigation.navigate('Home');
  };

  goToStaffTasks = () => {
    this.props.navigation.navigate('StaffTasks', {disable: true});
  };

  launchTipsModal = () => {
    this.setState({modal: true, notInFence: false});
  };

  render() {
    if (this.state.loader) {
      return <Loader />;
    }

    return (
      <View style={styles.container}>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title={this.state.loadingMessage}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        />

        <AwesomeAlert
          show={this.state.showAlert1}
          showProgress={
            this.state.error_message === 'Fetching location...' ? true : false
          }
          title={
            this.state.error_message === 'Fetching location...'
              ? this.state.count.toString()
              : 'Attention'
          }
          //title={'Attention'}
          message={this.state.error_message}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={
            this.state.error_message === 'Fetching location...' ? false : true
          }
          cancelText="Okay"
          onCancelPressed={() => {
            this.setState({showAlert1: false});
            if (
              this.state.error_message ===
              `The activity "${this.state.randomQuestion.value}" is not recognised. Please try again.`
            ) {
              const randomQuestion =
                this.state.vtype[
                  Math.floor(Math.random() * this.state.vtype.length)
                ];
              this.setState({randomQuestion});
              console.log('random', randomQuestion);
              this.setState({index: randomQuestion.id});
              console.log('index', this.state.index);
              this.setState({
                recordDone: false,
                show: true,
                showAlert1: false,
                uploadDone: false,
              });
              return;
            }
            if (
              this.state.error_message ===
              'Either you are not in your assigned location or you are not close enough to the assigned beacon. Please move closer to the beacon location for successful check-in.'
            ) {
              return this.props.navigation.navigate('Home');
            }
          }}
          cancelButtonColor={Colors.button[0]}
          cancelButtonTextStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
        />

        <SubHeader
          title="Live Check In"
          showBack={true}
          backScreen="Tab"
          showBell={false}
          navigation={this.props.navigation}
        />
        <VStack>
          {this.state.travel_check_in == 'yes' && (
            <View style={{marginTop: 20, marginLeft: 15, marginRight: 15}}>
              <Text style={styles.heading}>
                Please select your Check IN type
              </Text>
              <View style={styles.center}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    const randomQuestion =
                      this.state.vtype[
                        Math.floor(Math.random() * this.state.vtype.length)
                      ];
                    this.setState({randomQuestion});
                    console.log('random', randomQuestion);
                    this.setState({index: randomQuestion.id});
                    console.log('index', this.state.index);
                    this.setState({travelCheckIn: false, show: true});
                  }}>
                  <Card style={styles.mainCardStyle}>
                    <Text style={styles.checkinText}>Check IN</Text>
                  </Card>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() => {
                    const randomQuestion =
                      this.state.vtype[
                        Math.floor(Math.random() * this.state.vtype.length)
                      ];
                    this.setState({randomQuestion});
                    console.log('random', randomQuestion);
                    this.setState({index: randomQuestion.id});
                    console.log('index', this.state.index);

                    this.setState({travelCheckIn: true, show: true});
                  }}>
                  <Card style={styles.mainCardStyle}>
                    <Text style={styles.checkinText}>Travel Check IN</Text>
                  </Card>
                </TouchableWithoutFeedback>
              </View>
            </View>
          )}
          {this.state.recordDone && (
            <Modal isVisible={this.state.recordDone}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: wp('80%'),
                  alignSelf: 'center',
                  //marginTop: hp('30%'),
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    textAlign: 'center',
                    color: 'white',
                    fontFamily: 'Poppins-regular',
                  }}>
                  {`Uploading...`}
                </Text>

                <ProgressCircle
                  percent={Number(this.state.progress)}
                  radius={50}
                  borderWidth={8}
                  color="#f05760"
                  shadowColor="#999"
                  bgColor="#fff">
                  <Text style={{fontSize: 18}}>
                    {this.state.progress.toString()}
                  </Text>
                </ProgressCircle>
              </View>
            </Modal>
          )}
          {this.state.uploadDone && (
            <Modal isVisible={this.state.uploadDone}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: wp('80%'),
                  alignSelf: 'center',
                  //marginTop: hp('30%'),
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    textAlign: 'center',
                    color: 'white',
                    fontFamily: 'Poppins-regular',
                  }}>
                  {this.state.loadingMessage}
                </Text>
                <ActivityIndicator
                  size="large"
                  color="#f05760"
                  style={{height: 30, width: 30, alignSelf: 'center'}}
                  // animating={this.state.progress == 100}
                />
              </View>
            </Modal>
          )}

          {this.state.show && (
            <CameraComp
              reduce
              text="check-in"
              visible={this.state.show}
              onClose={() => {
                this.setState({show: this.state.pressed ? true : false});
              }}
              onPress={camera => {
                this.setState({pressed: true});
                setTimeout(() => this.openCamera(camera), 1200);
              }}
              question={this.state.randomQuestion.value}
              //travelCheck={this.state.travelCheckIn}
              btnText={
                !this.state.pressed
                  ? 'check-in'
                  : this.state.btnCount.toString()
              }
              pressed={this.state.pressed}
              onRecordingStart={event => {
                //console.log('event', event);

                this.interval2 = setInterval(() => {
                  this.setState(prev => ({btnCount: prev.btnCount + 1}));
                }, 1000);
              }}
              onRecordingEnd={() => {
                clearInterval(this.interval2);
                this.setState({
                  btnCount: 1,
                  pressed: false,
                  show: false,
                  recordDone: true,
                  //showAlert: true,
                  loadingMessage: `Uploading...`,
                });
              }}
            />
          )}

          {this.state.modal && (
            <ModalForAccuracy
              visible={this.state.modal}
              onClose={() => this.setState({modal: false})}
              onPress={() => this.props.navigation.goBack()}
              accuracy={Math.round(
                Number(this.state.coordinates.accuracy),
              ).toString()}
              checkin
            />
          )}

          {/* <Button title="Get ccurrent location" onPress={this.CheckIn} /> */}
        </VStack>
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
});
