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
    const options = {quality: 1, base64: false};
    const data = await camera.takePictureAsync(options);
    this.checkout(data.uri, status);
  };
  checkout = async (uri, status) => {
    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        var coordinates = {
          latitude: currentLatitude,
          longitude: currentLongitude,
        };
        this.setState({showAlert: true});
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
        fetch(Const + 'api/Staff/CheckOutWithFormFile', {
          method: 'POST',
          body: uploadData,
        })
          .then(response => response.json())
          .then(json => {
            if (json.status) {
              this.setState({
                showAlert1: true,
                error_message: 'Checked out successfully',
                showAlert: false,
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
                setTimeout(() => {
                  this.props.navigation.navigate('Home');
                }, 1200);
              } catch (e) {
                console.log(e);
              }
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
          title="Check Out"
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
                                <Text style={styles.buttonText}>Check out</Text>
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
                                    Travel Checkout
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
