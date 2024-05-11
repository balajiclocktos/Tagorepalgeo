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
export default class Checkout extends Component {
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
    AsyncStorage.getItem('user_id').then(user_id => {
      AsyncStorage.getItem('travel_check_in').then(travel_check_in => {
        AsyncStorage.getItem('bearer_token').then(bearer_token => {
          AsyncStorage.getItem('institute_id').then(institute_id => {
            this.setState({
              StaffNo: user_id,
              bearer_token: bearer_token,
              institute_id: institute_id,
              travel_check_in: travel_check_in,
            });
          });
        });
      });
    });
  }
  takePicture = async function (camera, status) {
    const options = {quality: 0, base64: true};
    const data = await camera.takePictureAsync(options);
    this.checkout(data.base64, status);
  };
  checkout = async (base64, status) => {
    this.interval = setInterval(() => {
      this.setState(prev => ({count: prev.count + 1}));
    }, 1000);
    setTimeout(() => this.setState({show: false}), 100);
    setTimeout(
      () =>
        this.setState({
          //show: false,
          showAlert1: true,
          error_message: 'Fetching location...',
          //showAlert: false,
        }),
      200,
    );
    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        var coordinates = {
          Latitude: currentLatitude,
          Longitude: currentLongitude,
        };

        // let uploadData1 = new FormData();
        // uploadData1.append('file', {
        //   uri: uri,
        //   name: 'photo.png',
        //   type: 'image/png',
        // });

        fetch(Const + 'api/Staff/CheckOutForOthers', {
          method: 'POST',
          withCredentials: true,
          credentials: 'include',
          headers: {
            Authorization: this.state.bearer_token,
            Accept: 'text/plain',
            'Content-Type': 'application/json-patch+json',
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
          .then(response => {
            console.log('response ===>', JSON.stringify(response, null, 4));
            return response.json();
          })
          .then(json => {
            console.log('JSON ==>', json);
            clearInterval(this.interval);
            console.log({
              StaffNo: this.state.StaffNo,
              Coordinates: coordinates,
              DOB: '',
              InstituteId: this.state.institute_id,
              Accuracy: parseInt(position.coords.accuracy),
              IsTravelCheckIn: status,
            });
            if (json.status) {
              AsyncStorage.setItem('other_checkedin_user_id', '');
              if (Platform.OS === 'ios') {
                alert('Checked out successfully');
                return setTimeout(() => this.goToHome(), 1200);
              }
              setTimeout(
                () =>
                  this.setState({
                    showAlert1: true,
                    error_message: 'Checked out successfully',
                    showAlert: false,
                  }),
                100,
              );
              setTimeout(() => this.goToHome(), 1200);
            } else {
              if (Platform.OS === 'ios') {
                return alert(json.message);
              }
              this.setState({
                showAlert1: true,
                error_message: json.message,
                showAlert: false,
                //show: true,
              });
            }
          })
          .catch(error => {
            clearInterval(this.interval);
            if (Platform.OS === 'ios') {
              return alert(error.toString());
            }
            setTimeout(
              () =>
                this.setState({
                  showAlert1: true,
                  error_message: error.toString(),
                  showAlert: false,
                }),
              100,
            );
          });
      },
      error => {
        console.log(error);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 0},
    );
  };
  goToHome = () => {
    this.props.navigation.navigate('Home');
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
        {/* <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title="Loading"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        /> */}
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
          title="Other Person Check Out"
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
                          <View style={{top: 250}}>
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
                                    source={require('../../assets/ic_checkout.png')}
                                    style={styles.btImage}
                                  />
                                  <Text style={styles.buttonText}>
                                    Check out
                                  </Text>
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
                  ? 'check-out'
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
});
