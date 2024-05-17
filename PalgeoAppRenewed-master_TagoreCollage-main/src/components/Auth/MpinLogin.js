import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Platform,
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, VStack, Icon, Input, Item} from 'native-base';
import SubHeader from '../common/SubHeader';
import Loader from '../common/Loader';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Geolocation from 'react-native-geolocation-service';
import {addBoundaries} from '../../utils/helperFunctions';
import PhoneInput from 'react-native-phone-number-input';
//import googleFit, {Scopes} from 'react-native-google-fit';
import {Colors} from '../../utils/configs/Colors';
import {SafeAreaView} from 'react-native';
import CustomLabel from '../common/CustomLabel';
import {TouchableOpacity} from 'react-native';
import OTPView from '../common/OTPView';
import {ScrollView} from 'react-native';
import LoginBackGround from '../common/LoginBackGround';
import {CustomButton} from '../common/CustomButton';
import SuccessError from '../common/SuccessError';
import AnimatedLoader from '../common/AnimatedLoader';
import {getUniqueId} from 'react-native-device-info';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      mobileNumber: null,
      device_token: '',
      showAlert1: false,
      error_message: '',
      app_status: '',
      CountryCode: '+91',
    };
    this.phoneInput = null;
  }

  backButtonPress = () => {
    return true;
  };

  async componentDidMount() {
    const mobile = await AsyncStorage.getItem('mobile');
    if (!mobile) return this.props.navigation.navigate('Login');
    const app_state = AppState.currentState;
    const deviceId = getUniqueId();
    this.setState({app_status: app_state, deviceId});
    console.log('current appState', this.state.app_status, mobile);
    const device_token = await AsyncStorage.getItem('device_token');
    this.setState({mobileNumber: mobile, device_token: device_token});
    BackHandler.addEventListener('hardwareBackPress', this.backButtonPress);
    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this.backButtonPress,
      );
    });
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      AsyncStorage.getItem('mobile').then(mobile => {
        console.log('[async_mobile]', mobile);
        AsyncStorage.getItem('device_token').then(device_token => {
          this.setState({mobileNumber: mobile, device_token: device_token});
        });
      });
    });
  }

  componentWillUnmount() {
    this.props.navigation.removeListener(this._unsubscribe);
    BackHandler.removeEventListener('hardwareBackPress', this.backButtonPress);
    this.props.navigation.removeListener('blur', () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this.backButtonPress,
      );
    });
    //Geolocation.clearWatch(this.watchID);
  }
  handleLogin = code => {
    const {deviceId} = this.state;
    if (code) {
      this.setState({showAlert: true});
      fetch(Const + 'api/Security/Mobilelogin', {
        method: 'POST',
        headers: {
          Accept: 'text/plain',
          'content-type': 'application/json-patch+json',
        },
        body: JSON.stringify({
          mobileNumber: this.state.mobileNumber,
          mpin: code.toString(),
          deviceId,
          // device_token: this.state.device_token,
        }),
      })
        // .then(response => response.json())
        .then(response => {
          console.log('Mpin Login Response:', response);
          return response.json();
        })
        .then(async json => {
          console.log('body', {
            mobileNumber: this.state.mobileNumber,
            mpin: code.toString(),
            deviceId,
          });
          console.log('[LOGIN_JSON => api/Security/Mobilelogin]', json);
          if (json.isAuthenticated) {
            //await this.setupGoogleFit();
            console.log('face==', json.isFaceAuthenticationRequired);
            AsyncStorage.setItem('mobile', this.state.mobileNumber);
            AsyncStorage.setItem('mpin', code.toString());
            fetch(Const + 'api/MobileApp/RegisterMPIN', {
              method: 'POST',
              headers: {
                Accept: 'text/plain',
                'content-type': 'application/json-patch+json',
              },
              body: JSON.stringify({
                mobileNumber: this.state.mobileNumber,
                mpin: code.toString(),
                deviceToken: this.state.device_token,
                deviceId,
              }),
            })
              .then(response => response.json())
              .then(json => {
                //alert('device token registered successfully');
              })
              .catch(e => console.log(e));
            await AsyncStorage.setItem('menus', JSON.stringify(json.menus));
            // if (Platform.OS === 'ios') {
            //   alert('Logged in successfully');
            // }
            // this.setState({
            //   showAlert1: true,
            //   error_message: 'Logged in successfully',
            //   showAlert: false,
            // });
            console.log('jsonnnn', json);
            try {
              await AsyncStorage.setItem('app_status', this.state.app_status);
              await AsyncStorage.setItem('user_id', json.staffNumber);
              await AsyncStorage.setItem('bearer_token', json.bearerToken);
              await AsyncStorage.setItem(
                'institute_id',
                json.instituteId.toString(),
              );
              await AsyncStorage.setItem(
                'org_id',
                json.organisationId.toString(),
              );
              await AsyncStorage.setItem(
                'driving_type',
                json.travelPreference.toString(),
              );
              await AsyncStorage.setItem(
                'start_time',
                json.staffTravelStartTime.toString(),
              );
              await AsyncStorage.setItem(
                'profile_pic',
                json.profilePic ? json.profilePic : '',
              );
              await AsyncStorage.setItem(
                'trackInBackground',
                json.trackInBackground ? 'true' : 'false',
              );

              if (json.isTravelCheckInAvailable) {
                await AsyncStorage.setItem('travel_check_in', 'yes');
              } else {
                await AsyncStorage.setItem('travel_check_in', 'no');
              }
              if (json.isTravelCheckinWithMpin) {
                await AsyncStorage.setItem('isTravelCheckinWithMpin', 'yes');
              } else {
                await AsyncStorage.setItem('isTravelCheckinWithMpin', 'no');
              }
              if (json.isQrCheckIn) {
                await AsyncStorage.setItem('qrCheckin', 'true');
              } else {
                await AsyncStorage.setItem('qrCheckin', 'false');
              }
              if (json.isQrCheckOut) {
                await AsyncStorage.setItem('qrCheckout', 'true');
              } else {
                await AsyncStorage.setItem('qrCheckout', 'false');
              }
              if (json.isFaceAuthenticationRequired) {
                await AsyncStorage.setItem('isFaceRequired', 'true');
              } else {
                await AsyncStorage.setItem('isFaceRequired', 'false');
              }
              if (json.isCheckInIdeal) {
                await AsyncStorage.setItem('IsCheckInIdeal', 'true');
              } else {
                await AsyncStorage.setItem('IsCheckInIdeal', 'false');
              }
              if (json.isTravelCheckInIdeal) {
                await AsyncStorage.setItem('IsTravelCheckInIdeal', 'true');
              } else {
                await AsyncStorage.setItem('IsTravelCheckInIdeal', 'false');
              }
              if (json.checkInIdealTime !== 0) {
                await AsyncStorage.setItem(
                  'CheckInIdealTime',
                  json.checkInIdealTime.toString(),
                );
              }
              if (json.travelCheckInIdealTime !== 0) {
                await AsyncStorage.setItem(
                  'TravelCheckInIdealTime',
                  json.travelCheckInIdealTime.toString(),
                );
              }
              await AsyncStorage.setItem(
                'travelCheckinLocationId',
                json.travelCheckinLocationId.toString(),
              );
              if (json.isCCTVFaceRegister) {
                await AsyncStorage.setItem('isCCTVFaceRegister', 'true');
              } else {
                await AsyncStorage.setItem('isCCTVFaceRegister', 'false');
              }
              await AsyncStorage.setItem('idealCount', '0');
              await addBoundaries(json.staffNumber, json.instituteId);
              setTimeout(() => {
                this.props.navigation.replace('MainNavigator');
              }, 1500);
            } catch (err) {
              this.setState({
                showAlert: false,
                showAlert1: true,
                error_message: err.message,
                error: true,
              });
            }
          } else {
            if (Platform.OS === 'ios') {
              alert('Enter valid Mpin');
            }
            this.setState({
              showAlert1: true,
              error_message: 'Enter valid Mpin',
              showAlert: false,
              error: true,
            });
          }
        })
        .catch(error => {
          console.log('error', error);
          this.setState({
            showAlert: false,
            showAlert1: true,
            error: true,
            //error_message: 'You might not be connected to Internet. Please check your internet connection.',
            error_message: error.message,
          });
        });
    } else {
      // if (Platform.OS === 'ios') {
      //   alert('Mpin cannot be empty');
      // }
      this.setState({
        showAlert1: true,
        error_message: 'Mpin cannot be empty',
        showAlert: false,
        error: true,
      });
    }
  };
  registerMpin = () => {
    this.props.navigation.navigate('RegisterPin');
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <Pressable onPress={() => Keyboard.dismiss()}>
          <AnimatedLoader
            doNotShowDeleteIcon
            isVisible={this.state.showAlert}
          />
          <SuccessError
            isVisible={this.state.showAlert1}
            error={this.state.error}
            deleteIconPress={() => this.setState({showAlert1: false})}
            subTitle={this.state.error_message}
          />
          <LoginBackGround height={'60%'} />
          <View style={styles.secondContainer}>
            <Text style={styles.otpHeader}>Enter your MPIN to Login!</Text>
          </View>

          <OTPView
            onCodeFilled={code => {
              this.setState({mpin: code}, () =>
                this.handleLogin(this.state.mpin),
              );
            }}
          />
          <TouchableWithoutFeedback
            onPress={() =>
              this.props.navigation.navigate('SetMpin', {
                mobile: this.state.mobileNumber,
              })
            }>
            <Text style={styles.privacy}>Forgot MPIN?</Text>
          </TouchableWithoutFeedback>

          <CustomButton
            color={Colors.button[0]}
            width={'60%'}
            title={'Login'}
            radius={60}
            onPress={() => this.handleLogin(this.state.mpin)}
          />
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              alignItems: 'center',
            }}>
            <CustomLabel
              labelStyle={{textAlign: 'center'}}
              title="Do not have an account?"
            />
            <TouchableOpacity onPress={this.registerMpin}>
              <CustomLabel
                labelStyle={{textAlign: 'center', color: Colors.button[0]}}
                title="Sign up!"
              />
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: '#089bf9',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: '#ffffff',
  },
  privacy: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#2460a5',
  },
  firstContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('30'),
    backgroundColor: Colors.maroon,
  },
  secondContainer: {
    alignItems: 'center',
    marginTop: hp('6'),
  },
  inputFeilds: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    color: '#000000',
    borderRadius: 10,
  },
  privacy: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.button[0],
    alignSelf: 'flex-end',
    marginRight: 5,
  },
  inputFeildsFocus: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f05760',
    color: '#000000',
    borderRadius: 10,
  },
  otpHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000',
    //margin: '1%',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  loginImage: {
    width: 200,
    height: 200,
  },
  buttonContainer: {
    width: wp('80'),
    // backgroundColor: '#f05760',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: hp('6'),
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    //borderBottomWidth:0.5,
    //backgroundColor: '#f1f1f1',
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('7'),
    width: wp('80'),
  },
  item: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    //backgroundColor: '#f1f1f1',
    // borderLeftWidth: 0,
    // borderRightWidth: 0,
    // borderTopWidth: 0,
    // borderBottomWidth: 0,
    height: hp('7'),
    width: wp('80'),
  },
  code: {
    fontFamily: 'Poppins-Regular',
    marginLeft: '3%',
  },
});
