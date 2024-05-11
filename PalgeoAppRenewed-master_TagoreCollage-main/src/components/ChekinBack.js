import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, Card, VStack} from 'native-base';
import {RNCamera} from 'react-native-camera';
import SubHeader from './SubHeader';
import Loader from './Loader';
import Geolocation from '@react-native-community/geolocation';
import Const from './Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Loading...</Text>
  </View>
);
export default class Checkin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      coordinates: {
        latitude: '',
        longitude: '',
      },
      showAlert: false,
      StaffNo: '',
      bearer_token: '',
      institute_id: '',
      showAlert1: false,
      error_message: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      AsyncStorage.getItem('user_id').then(user_id => {
        AsyncStorage.getItem('institute_id').then(institute_id => {
          this.setState({
            bearer_token: bearer_token,
            StaffNo: user_id,
            institute_id: institute_id,
          });
        });
      });
    });
  }
  takePicture = async function (camera) {
    const options = {quality: 0.5, base64: true};
    const data = await camera.takePictureAsync(options);
    this.registerFace(data.base64);
  };
  registerFace = async base64 => {
    this.setState({showAlert: true});
    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = parseFloat(position.coords.longitude);
        const currentLatitude = parseFloat(position.coords.latitude);
        var coordinates = {
          latitude: currentLatitude,
          longitude: currentLongitude,
        };
        console.log(coordinates);
        const bearer = this.state.bearer_token;
        fetch(Const + 'api/Staff/IsCheckedIn', {
          method: 'POST',
          withCredentials: true,
          credentials: 'include',
          headers: {
            Authorization: bearer,
            Accept: 'text/plain',
            'Content-Type': 'application/json-patch+json',
          },
          body: JSON.stringify({
            staffCode: this.state.StaffNo,
            instituteId: this.state.institute_id,
          }),
        })
          .then(response => response.json())
          .then(json => {
            if (!json) {
              fetch(Const + 'api/Staff/CheckIn', {
                method: 'POST',
                withCredentials: true,
                credentials: 'include',
                headers: {
                  Authorization: bearer,
                  Accept: 'application/json, text/plain',
                  'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({
                  capturedBase64Image: base64,
                  StaffNo: this.state.StaffNo,
                  coordinates: coordinates,
                  dob: '',
                  instituteId: this.state.institute_id,
                }),
              })
                .then(response => response.json())
                .then(json => {
                  if (json.response.status) {
                    this.setState({
                      showAlert1: true,
                      error_message: 'Checked in successfully',
                      showAlert: false,
                    });
                    try {
                      if (json.geofencingClients[0].type == 'Circle') {
                        AsyncStorage.setItem(
                          'coordinates',
                          JSON.stringify(json.geofencingClients[0].coordinates),
                        );
                        AsyncStorage.setItem(
                          'radius',
                          json.geofencingClients[0].radius.toString(),
                        );
                        AsyncStorage.setItem(
                          'type',
                          json.geofencingClients[0].type.toString(),
                        );
                        AsyncStorage.setItem(
                          'checkin_time',
                          json.geofencingClients[0].CheckInTime
                            ? json.geofencingClients[0].CheckInTime
                            : '',
                        );
                      } else {
                        AsyncStorage.setItem(
                          'coordinates',
                          JSON.stringify(json.geofencingClients[0].coordinates),
                        );
                        AsyncStorage.setItem(
                          'checkin_time',
                          json.geofencingClients[0].CheckInTime
                            ? json.geofencingClients[0].CheckInTime
                            : '',
                        );
                        AsyncStorage.setItem(
                          'type',
                          json.geofencingClients[0].type.toString(),
                        );
                      }
                      setTimeout(() => {
                        this.props.navigation.navigate('StaffTasks', {
                          disable: true,
                        });
                      }, 1200);
                    } catch (e) {
                      console.log(e);
                    }
                  } else if (!json.response.status) {
                    if (json.response.isOutSide === true) {
                      var geoArr = json.geofencingClients;
                      geoArr.sort(
                        (a, b) =>
                          parseFloat(a.distance) - parseFloat(b.distance),
                      );
                      var distance = parseInt(geoArr[0].distance);
                      if (distance > 1000) {
                        var updateddistance = distance / 1000 + ' kms';
                      } else if (distance) {
                        var updateddistance = distance + ' mts';
                      }
                      this.setState({
                        showAlert1: true,
                        error_message:
                          'You are ' +
                          updateddistance +
                          ' away from assigned location',
                        showAlert: false,
                      });
                    } else {
                      this.setState({
                        showAlert1: true,
                        error_message: json.response.message,
                        showAlert: false,
                      });
                    }
                  }
                })
                .catch(error => {
                  console.log(error);
                  this.setState({
                    showAlert1: true,
                    error_message: 'Unknown error occured',
                    showAlert: false,
                  });
                });
            } else {
              this.setState({
                showAlert1: true,
                error_message: 'Already checked in.Please view your tasks',
                showAlert: false,
              });
              setTimeout(() => {
                this.props.navigation.navigate('StaffTasks', {disable: true});
              }, 1200);
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
      {enableHighAccuracy: true, timeout: 15000},
    );
  };
  goToHome = () => {
    this.props.navigation.navigate('Home');
  };
  goToStaffTasks = () => {
    this.props.navigation.navigate('StaffTasks', {disable: true});
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
          cancelButtonTextStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
        />

        <SubHeader
          title="Check In"
          showBack={true}
          backScreen="Home"
          showBell={false}
          navigation={this.props.navigation}
        />
        <VStack>
          <View style={styles.cardContainer}>
            <Card style={styles.card}>
              <View
                style={{
                  marginTop: '13%',
                  marginLeft: '4%',
                  marginRight: '4%',
                }}>
                <View
                  style={{
                    width: 200,
                    height: 200,
                    marginTop: '8%',
                    marginLeft: wp('14'),
                    marginBottom: hp('3'),
                    borderRadius: 10,
                  }}>
                  <RNCamera
                    style={styles.preview}
                    type={RNCamera.Constants.Type.front}
                    flashMode={RNCamera.Constants.FlashMode.on}
                    androidCameraPermissionOptions={{
                      title: 'Permission to use camera',
                      message: 'We need your permission to use your camera',
                      buttonPositive: 'Ok',
                      buttonNegative: 'Cancel',
                    }}
                    captureAudio={false}>
                    {({camera, status, recordAudioPermissionStatus}) => {
                      if (status !== 'READY') return <PendingView />;
                      return (
                        <View style={{top: 250}}>
                          <TouchableWithoutFeedback
                            onPress={() => this.takePicture(camera)}>
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: hp('3'),
                              }}>
                              <View style={styles.buttonContainer}>
                                <Image
                                  source={require('../assets/ic_checkin.png')}
                                  style={styles.btImage}
                                />
                                <Text style={styles.buttonText}>Check in</Text>
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                        </View>
                      );
                    }}
                  </RNCamera>
                </View>
              </View>
            </Card>
          </View>
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
    height: hp('60'),
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
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#ffffff',
  },
  btImage: {
    width: 54,
    height: 39,
  },
});
