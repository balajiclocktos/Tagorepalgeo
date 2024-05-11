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
import SubHeader from '../common/SubHeader';
import Loader from '../common/Loader';
import Geolocation from 'react-native-geolocation-service';
import Const from '../common/Constants';
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
      travel_check_in: 'no',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      AsyncStorage.getItem('travel_check_in').then(travel_check_in => {
        AsyncStorage.getItem('user_id').then(user_id => {
          AsyncStorage.getItem('institute_id').then(institute_id => {
            this.setState({
              bearer_token: bearer_token,
              StaffNo: user_id,
              institute_id: institute_id,
              travel_check_in: travel_check_in,
            });
          });
        });
      });
    });
  }
  dataURItoBlob = dataURI => {
    var binary = this.atob(dataURI);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  };
  atob = input => {
    var keyStr =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = '';
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    do {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    } while (i < input.length);
    return output;
  };
  takePicture = async function (camera, status) {
    const options = {quality: 1, base64: false};
    const data = await camera.takePictureAsync(options);
    this.CheckIn(data.uri, status);
  };
  CheckIn = async (uri, status) => {
    this.setState({showAlert: true});
    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = parseFloat(position.coords.longitude);
        const currentLatitude = parseFloat(position.coords.latitude);
        var coordinates = {
          latitude: currentLatitude,
          longitude: currentLongitude,
        };
        console.log({
          staffCode: this.state.StaffNo,
          instituteId: this.state.institute_id,
        });
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
              let uploadData = new FormData();
              uploadData.append('file', {
                uri: uri,
                name: 'photo.png',
                type: 'image/png',
              });
              uploadData.append('StaffNo', this.state.StaffNo);
              uploadData.append('Latitude', coordinates.latitude);
              uploadData.append('Longitude', coordinates.longitude);
              uploadData.append('InstituteId', this.state.institute_id);
              uploadData.append('Accuracy', parseInt(position.coords.accuracy));
              uploadData.append('IsTravelCheckIn', status);
              fetch(Const + 'api/Staff/CheckInWithFormFile', {
                method: 'POST',
                body: uploadData,
              })
                .then(response => response.json())
                .then(json => {
                  if (json.response.status) {
                    AsyncStorage.setItem('checked_out', 'no');
                    if (status) {
                      AsyncStorage.setItem('current_travel_checkin', 'running');
                    }
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
                    // if(json.response.isOutSide === true){
                    //     var geoArr = json.geofencingClients;
                    //     geoArr.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
                    //     var distance = parseInt(geoArr[0].distance);
                    //     if(distance > 1000){
                    //         var updateddistance = distance/1000 + ' kms';
                    //     }else if(distance){
                    //         var updateddistance =distance + ' mts';
                    //     }
                    //     this.setState({showAlert1:true,error_message:"You are "+updateddistance+" away from assigned location",showAlert : false});
                    // }else{
                    //     this.setState({showAlert1:true,error_message:json.response.message,showAlert : false});
                    // }
                    this.setState({
                      showAlert1: true,
                      error_message: json.response.message,
                      showAlert: false,
                    });
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
            console.log(error);
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
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 0},
    );
  };
  goToHome = () => {
    this.props.navigation.navigate('Home');
  };
  goToStaffTasks = () => {
    this.props.navigation.navigate('StaffTasks', {disable: true});
  };
  render() {
    var cardStyle1 = {
      borderRadius: 10,
      elevation: 4,
      paddingTop: '3%',
      paddingBottom: '3%',
      height: hp('75'),
    };
    var cardStyle2 = {
      borderRadius: 10,
      elevation: 4,
      paddingTop: '3%',
      paddingBottom: '3%',
      height: hp('60'),
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
            <Card style={mainCardStyle}>
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
                        <View
                          style={{
                            top:
                              this.state.travel_check_in == 'yes' ? 250 : 250,
                          }}>
                          <TouchableWithoutFeedback
                            onPress={() => this.takePicture(camera, false)}>
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: hp('3'),
                              }}>
                              <View style={styles.buttonContainer}>
                                <Image
                                  source={require('../../assets/ic_checkin.png')}
                                  style={styles.btImage}
                                />
                                <Text style={styles.buttonText}>Checkin</Text>
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                          {this.state.travel_check_in == 'yes' && (
                            <TouchableWithoutFeedback
                              onPress={() => this.takePicture(camera, true)}>
                              <View
                                style={{
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginTop: hp('3'),
                                }}>
                                <View style={styles.buttonContainer1}>
                                  <Image
                                    source={require('../../assets/ic_checkin.png')}
                                    style={styles.btImage}
                                  />
                                  <Text style={styles.buttonText}>
                                    Travel Checkin
                                  </Text>
                                </View>
                              </View>
                            </TouchableWithoutFeedback>
                          )}
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
});
