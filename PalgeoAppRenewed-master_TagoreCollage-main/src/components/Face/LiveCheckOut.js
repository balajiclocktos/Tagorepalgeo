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
  TouchableOpacity,
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
import Modal from 'react-native-modal';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
//import Boundary, {Events} from 'react-native-boundary';
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
      loadingMessage: '',
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
      show: this.props.route.params.show,
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
      progress: 0,
      recordDone: false,
      uploadDone: false,
      rssi: null,
      isBluetoothOn: false,
    };
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
              BleManager.enableBluetooth();
            },
          },
        ]);
        return;
      });
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

    if (
      this.state.beaconDetails &&
      this.state.beaconDetails.uniqueId === peripheral.id &&
      Math.abs(peripheral.rssi) <= 65
    ) {
      return alert(
        `Got beacon ${
          peripheral.id
        } with signal strength ${peripheral.rssi.toString()}`,
      );
      this.setState({beaconID: peripheral.id, rssi: Math.abs(peripheral.rssi)});
    }

    // BleManager.connect(peripheral.id).then(() => {
    //   BleManager.readRSSI(peripheral.id).then((rssi) => {
    //     //console.log('rssi', rssi)
    //     this.setState({beaconID: peripheral.id, beaconDetails: peripheral});
    //     return alert(
    //       `Got beacon ${peripheral.id} with signal strength ${rssi.toString()}`,
    //     );
    //   });
    // });
  };

  async componentDidMount() {
    const beacon = await AsyncStorage.getItem('beacon');
    console.log('f', beacon);
    if (beacon) {
      this.setState({beaconDetails: JSON.parse(beacon), isBluetoothOn: true});
      this.enableBluetooth();
    }
    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);

    const bearer_token = await AsyncStorage.getItem('bearer_token');
    const base64Data = await AsyncStorage.getItem('base64Data');
    const travel_check_in = await AsyncStorage.getItem('travel_check_in');
    const user_id = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    //console.log('ttt', travel_check_in);
    this.setState({
      bearer_token,
      StaffNo: user_id,
      institute_id,
      travel_check_in,
      base64Data,
    });
  }

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

        //this.setState({show: false});
        let body = new FormData();
        body.append('images', this.state.base64Data);
        body.append('video', {
          name: 'name.mp4',
          uri: image.uri,
          type: 'video/mp4',
        });
        body.append('vtype', this.state.index);
        const config = {
          method: 'post',
          url: 'http://103.87.172.204:5690/api/v1/validate/face',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          data: body,
          timeout: 60000,
          cancelToken: source.token,
          onUploadProgress: progressEvent => {
            let percentCompleted = Math.floor(
              (progressEvent.loaded * 100) / progressEvent.total,
            );

            let ratio = progressEvent.loaded / progressEvent.total;
            console.log(percentCompleted, ' %');
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
              //     show: true,
              //     showAlert1: false,
              //     recordDone: false,
              //     uploadDone: false,
              //   });
              // }, 2200);
            }
          })
          .catch(err => {
            this.setState({uploadDone: false});
            if (axios.isCancel(err)) {
              console.log('Request canceled', err.message);
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
            console.log(err);
            //const error = JSON.stringify(err);
            //console.log('erer', error);
            this.setState({
              showAlert: false,
              uploadDone: false,
              recordDone: false,
              showAlert1: true,
              error_message: `${err.message}`,
              progress: 0,
            });
          });

        return;
      } else {
        this.setState({
          showAlert1: true,
          error_message: 'Please re authenticate your face',
          showAlert: false,
          showTimer: false,
        });
      }
    } catch (error) {
      console.log('recording[ERROR]', error);
      alert('Error in recording video. Please try again');
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
    this.interval = setInterval(() => {
      this.setState(prev => ({count: prev.count + 1}));
    }, 1000);
    let coordinatesTemp = {latitude: '', longitude: '', accuracy: ''};
    setTimeout(async () => {
      Geolocation.clearWatch(this.watchID);
      if (this.state.coordinates.accuracy > 10) {
        console.log('Entry_Time', new Date());
        await this.checkout(this.state.coordinates);
        return;
      } else {
        if (this.state.coordinates.accuracy === '') {
          console.log('accuracy', this.state.coordinates.accuracy);
          Geolocation.getCurrentPosition(
            pos => this.checkout(pos.coords),
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
          await this.checkout(coordinatesTemp);
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

  checkout = async coordinates => {
    let status = this.state.travel_check_in == 'yes' ? true : false;
    //console.log('travel_status', status);
    this.setState({
      //showAlert1: false,
      //uploadDone: false,
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
    // console.log(
    //   'fdfd',
    //   this.state.beaconDetails.uniqueId === this.state.beaconID,
    //   this.state.beaconDetails,
    // );
    if (
      this.state.beaconDetails &&
      this.state.beaconDetails.uniqueId === this.state.beaconID &&
      this.state.rssi <= 65
    ) {
      //API call for beacon check in
      axios
        .post(Const + 'api/Staff/LiveCheckOut', {
          ...uploadData,
          IsBeaconVerified: true,
          AccessLocationId: this.state.beaconDetails.id,
        })
        .then(response => response.data)
        .then(json => {
          clearInterval(this.interval);
          Geolocation.clearWatch(this.watchId);
          console.log('[JSON_BEACON]==>', json);
          if (!json.status) {
            this.setState({
              uploadDone: false,
              showAlert1: true,
              error_message: json.message,
              showAlert: false,
              count: 0,
            });
            return;
          }
          if (json.status) {
            if (this.state.isBluetoothOn) {
              BluetoothStateManager.disable().then(result => {
                // do something...
                console.log('blettoth', result);
              });
            }
            setTimeout(() => {
              this.setState({
                showAlert1: true,
                error_message: 'Checked out successfully',
                showAlert: false,
                uploadDone: false,
                count: 0,
              });
              AsyncStorage.setItem('checked_out', 'yes');
              // Boundary.remove('checkinGeo')
              //   .then(() => console.log('Goodbye Chipotle :('))
              //   .catch((e) => console.log('Failed to delete Chipotle :)', e));
              if (status) {
                AsyncStorage.setItem('current_travel_checkin', 'stopped');
              }
              try {
                AsyncStorage.setItem('coordinates', '');
                AsyncStorage.setItem('radius', '');
                AsyncStorage.setItem('type', '');
                AsyncStorage.setItem('checkin_time', '');
                AsyncStorage.setItem('beacon', '');
                return setTimeout(() => {
                  this.props.navigation.navigate('Home');
                }, 1200);
              } catch (e) {
                console.log(e);
              }
            }, 1200);
            return;
          }
        })
        .catch(error => {
          return this.setState({
            uploadDone: false,
            showAlert1: true,
            error_message: `${error.message}`,
            showAlert: false,
            count: 0,
          });
        });
      return;
    }

    axios
      .post(Const + 'api/Staff/LiveCheckOut', uploadData)
      .then(response => response.data)
      .then(json => {
        clearInterval(this.interval);
        Geolocation.clearWatch(this.watchId);
        console.log('[JSON]==>', json);
        if (json.status) {
          if (this.state.isBluetoothOn) {
            BluetoothStateManager.disable().then(result => {
              // do something...
              console.log('blettoth', result);
            });
          }
          setTimeout(() => {
            this.setState({
              uploadDone: false,
              showAlert1: true,
              error_message: 'Checked out successfully',
              showAlert: false,
              count: 0,
            });
            AsyncStorage.setItem('checked_out', 'yes');
            if (status) {
              AsyncStorage.setItem('current_travel_checkin', 'stopped');
            }
            try {
              AsyncStorage.setItem('coordinates', '');
              AsyncStorage.setItem('radius', '');
              AsyncStorage.setItem('type', '');
              AsyncStorage.setItem('checkin_time', '');
              AsyncStorage.setItem('beacon', '');
              return setTimeout(() => {
                this.props.navigation.navigate('Home');
              }, 1200);
            } catch (e) {
              console.log(e);
            }
          }, 1200);
        } else if (this.state.coordinates.accuracy > 10 && json.isOutSide) {
          this.setState({
            uploadDone: false,
            showAlert: false,
            modal: true,
            count: 0,
          });
        } else {
          this.setState({
            showAlert1: true,
            error_message: json.message,
            showAlert: false,
            count: 0,
            uploadDone: false,
          });
          setTimeout(() => this.props.navigation.navigate('Home'), 1200);
        }
      })
      .catch(error => {
        return this.setState({
          uploadDone: false,
          showAlert1: true,
          error_message: `${error.message}`,
          showAlert: false,
          count: 0,
        });
      });
    return;
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
    const mainCardStyle =
      this.state.travel_check_in == 'yes' ? cardStyle1 : cardStyle2;
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
          //title={'Attention'}
          title={
            this.state.error_message === 'Fetching location...'
              ? this.state.count.toString()
              : 'Attention'
          }
          message={this.state.error_message}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
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
          }}
          cancelButtonColor={Colors.button[0]}
          cancelButtonTextStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
        />

        <SubHeader
          title="Live Check Out"
          showBack={true}
          backScreen="Tab"
          showBell={false}
          navigation={this.props.navigation}
        />

        <VStack>
          {this.state.show && (
            <CameraComp
              reduce
              visible={this.state.show}
              onClose={() =>
                this.setState({show: this.state.pressed ? true : false})
              }
              onPress={camera => {
                const randomQuestion =
                  this.state.vtype[
                    Math.floor(Math.random() * this.state.vtype.length)
                  ];
                this.setState({randomQuestion});
                console.log('random', randomQuestion);
                this.setState({index: randomQuestion.id});
                console.log('index', this.state.index);
                this.setState({pressed: true});
                setTimeout(() => this.openCamera(camera), 1200);
              }}
              text="check-out"
              //btnText={'check-out'}
              question={this.state.randomQuestion.value}
              btnText={
                !this.state.pressed
                  ? 'check-out'
                  : this.state.btnCount.toString()
              }
              pressed={this.state.pressed}
              onRecordingStart={event => {
                //console.log('event', event);
                //this.setState({pressed: true});
                // const randomQuestion = this.state.vtype[
                //   Math.floor(Math.random() * this.state.vtype.length)
                // ];
                // this.setState({randomQuestion});
                // console.log('random', randomQuestion);
                // this.setState({index: randomQuestion.id});
                // console.log('index', this.state.index);
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
                  //showAlert: true,
                  recordDone: true,
                  loadingMessage: 'Uploading...',
                });
              }}
            />
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
                  // marginTop: hp('30%'),
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
          {this.state.modal && (
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
          )}
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
  buttonContainer1: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('41'),
    marginTop: '4%',
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
});
