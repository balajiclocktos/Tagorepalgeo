import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Platform,
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
import CameraComp from '../common/CameraComp';
import {Colors} from '../../utils/configs/Colors';
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
export default class OtherCheckIn extends Component {
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
      show: true,
      count: 0,
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

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  takePicture = async function (camera, status) {
    const options = {quality: 0, base64: true};
    const data = await camera.takePictureAsync(options);
    setTimeout(() => this.setState({show: false}), 100);
    setTimeout(() => this.setState({showAlert: true}), 200);
    this.interval = setInterval(() => {
      this.setState(prev => ({count: prev.count + 1}));
    }, 1000);
    this.registerFace(data.base64, status);
  };
  registerFace = async (base64, status) => {
    const otherStaff = await AsyncStorage.getItem('other_checkedin_user_id');
    console.log(otherStaff);
    //this.setState({show: false});
    setTimeout(() => this.setState({showAlert: false}), 300);
    setTimeout(
      () =>
        this.setState({
          showAlert1: true,
          error_message: 'Fetching location...',
          //showAlert: false,
        }),
      400,
    );
    Geolocation.getCurrentPosition(
      position => {
        console.log('pos===', position);
        const currentLongitude = parseFloat(position.coords.longitude);
        const currentLatitude = parseFloat(position.coords.latitude);
        var coordinates = {
          Latitude: currentLatitude,
          Longitude: currentLongitude,
        };
        const bearer = this.state.bearer_token;
        // fetch(Const + 'api/Staff/IsCheckedIn', {
        //   method: 'POST',
        //   withCredentials: true,
        //   credentials: 'include',
        //   headers: {
        //     Authorization: bearer,
        //     Accept: 'text/plain',
        //     'Content-Type': 'application/json-patch+json',
        //   },
        //   body: JSON.stringify({
        //     staffCode: otherStaff,
        //     instituteId: this.state.institute_id,
        //   }),
        // })
        //   .then((response) => response.json())
        //   .then((json) => {
        //     console.log('jsob', json);
        // let uploadData1 = new FormData()
        // uploadData1.append('file', {
        //   uri: uri,
        //   name: 'photo.png',
        //   type: 'image/png',
        // })
        //if (!json) {
          console.log(Const + 'api/Staff/CheckInForOthers');
          console.log("====================================================")
          console.log(JSON.stringify({
            StaffNo: this.state.StaffNo,
            Coordinates: coordinates,
            DOB: '',
            InstituteId: this.state.institute_id,
            Accuracy: parseInt(position.coords.accuracy),
            IsTravelCheckIn: status,
            //File: uploadData1
          }));
          console.log("====================================================")
        fetch(Const + 'api/Staff/CheckInForOthers', {
          method: 'POST',
          withCredentials: true,
          credentials: 'include',
          headers: {
            Authorization: bearer,
            Accept: 'application/json, text/plain',
            'Content-Type': 'application/json;charset=UTF-8',
          },
          body: JSON.stringify({
            CapturedBase64Image: base64,
            StaffNo: this.state.StaffNo,
            Coordinates: coordinates,
            DOB: '',
            InstituteId: this.state.institute_id,
            Accuracy: parseInt(position.coords.accuracy),
            IsTravelCheckIn: status,
            //File: uploadData1
          }),
        })
          .then(response => response.json())
          .then(json => {
            console.log('otherCheckinJSON===', json);
            clearInterval(this.interval);
            if (json.response.status) {
              AsyncStorage.setItem(
                'other_checkedin_user_id',
                json.checkedInStaffNo,
              );
              if (Platform.OS === 'ios') {
                alert('Checked in successfully');
                return setTimeout(() => {

                  // this.goToHome();
                  // this.props.navigation.navigate('OtherStaffTasks', {
                  //   disable: true,
                  // });
                  // this.props.navigation.navigate('Home');
                  // this.props.navigation.navigate('Home');
                }, 1200);
              }
              this.setState({
                showAlert1: true,
                error_message: 'Checked in successfully',
                showAlert: false,
                count: 0,
              });
              try {
                setTimeout(() => {
                  // this.goToHome();
                  // this.props.navigation.navigate('Home');
                  // this.props.navigation.navigate('Home');
                  // this.props.navigation.navigate('OtherStaffTasks', {
                  //   disable: true,
                  // });
                }, 1200);
              } catch (e) {
                console.log(e);
              }
            } else if (!json.response.status) {
              clearInterval(this.interval);
              if (Platform.OS === 'ios') {
                alert(json.response.message);
                return setTimeout(() => this.goToHome(), 1200);
              }
              this.setState({
                showAlert1: true,
                error_message: json.response.message,
                showAlert: false,
                count: 0,
              });
              setTimeout(() => this.goToHome(), 1200);
            }
          })
          .catch(error => {
            clearInterval(this.interval);
            if (Platform.OS === 'ios') {
              this.setState({showAlert1: false, count: 0});
              return alert(error.toString());
            }
            this.setState({
              showAlert1: true,
              error_message: error.toString(),
              showAlert: false,
              count: 0,
            });
          });
        // } else {
        //   this.setState({
        //     showAlert1: true,
        //     error_message: 'Already checked in.Please view your tasks',
        //     showAlert: false,
        //   });
        //   setTimeout(() => {
        //     this.props.navigation.navigate('OtherStaffTasks', {
        //       disable: true,
        //     });
        //   }, 1200);
        // }
        //})
        // .catch((error) => {
        //   this.setState({
        //     showAlert1: true,
        //     error_message: 'Unknown error occured',
        //     showAlert: false,
        //   });
        // });
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
    // this.props.navigation.navigate('StaffTasks', {disable: true});
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
          showProgress={
            this.state.error_message === 'Fetching location...' ? true : false
          }
          title={
            this.state.error_message === 'Fetching location...'
              ? this.state.count.toString()
              : 'Attention'
          }
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
          title="Other Person Check In"
          showBack={true}
          backScreen="Tab"
          showBell={false}
          navigation={this.props.navigation}
        />
        <VStack>
          <View style={styles.cardContainer}>
            {/* <Card style={mainCardStyle}>
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
                          </View>
                        );
                      }}
                    </RNCamera>
                  </View>
                </View>
              </Card> */}
            <CameraComp
              visible={this.state.show}
              onClose={() =>
                this.setState({show: false}, () => {
                  this.props.navigation.navigate('Home');
                })
              }
              onPress={camera => this.takePicture(camera, false)}
              btnText={
                !this.state.pressed
                  ? 'check-in'
                  : this.state.btnCount.toString()
              }
            />
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
