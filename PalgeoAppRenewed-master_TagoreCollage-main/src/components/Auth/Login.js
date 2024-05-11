import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Platform,
  AppState,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, VStack} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import SubHeader from '../common/SubHeader';
import Loader from '../common/Loader';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {addBoundaries, asyncStorageDataSet} from '../../utils/helperFunctions';
import PhoneInput from 'react-native-phone-number-input';
import {apiLoading, handleLoginRequest} from '../../redux/actions';
import {connect} from 'react-redux';
import CustomModal from '../common/CustomModal';
import {Colors} from '../../utils/configs/Colors';
import {SafeAreaView} from 'react-native';

import {ScrollView} from 'react-native';

import CustomLabel from '../common/CustomLabel';
import LoginBackGround from '../common/LoginBackGround';
import AnimatedLoader from '../common/AnimatedLoader';
import SuccessError from '../common/SuccessError';

import {getUniqueId} from 'react-native-device-info';
import {LoginApi} from './AxiosApi';

export class Login extends Component {
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
      mpin: '',
      deviceId: null,
    };
  }
  async componentDidMount() {
    const mobile = await AsyncStorage.getItem('mobile');
    const device_token = await AsyncStorage.getItem('device_token');
    const deviceId = getUniqueId();
    console.log('ddd', {device_token, deviceId});
    const app_state = AppState.currentState;
    this.setState({
      mobileNumber: mobile,
      device_token: device_token,
      deviceId,
      app_status: app_state,
    });
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      AsyncStorage.getItem('mobile').then(mobile => {
        console.log('[async_mobile]', mobile);
        AsyncStorage.getItem('device_token').then(device_token => {
          this.setState(
            {mobileNumber: mobile, device_token: device_token},
            () => console.log('ddd', device_token),
          );
        });
      });
    });
  }

  componentWillUnmount() {
    this.props.navigation.removeListener(this._unsubscribe);
    //Geolocation.clearWatch(this.watchID);
  }
  handleLogin = async code => {
    const {deviceId} = this.state;
    if (this.state.mobileNumber) {
      console.log(this.phoneInput.isValidNumber(this.state.mobileNumber));
      if (!this.phoneInput.isValidNumber(this.state.mobileNumber)) {
        return this.displayErrorMsg('Enter a valid mobile number', true);
      }
      if (code) {
        // this.props.handleLoginRequest(
        //   code,
        //   this.state.mobileNumber,
        //   this.props.navigation,
        // );
        console.log('********************');
        console.log(Const + 'api/Security/Mobilelogin');
        console.log(
          JSON.stringify({
            mobileNumber: this.state.mobileNumber,
            mpin: code.toString(),
            deviceId,
            // device_token: this.state.device_token,
          }),
        );
        console.log('********************');
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
          .then(response => response.json())
          .then(async json => {
            // alert(JSON.stringify(json))
            console.log('json menu => ', json, json.isAuthenticated);
            console.log('aaaaaaaaaa', json.isAuthenticated);
            if (json.isAuthenticated) {
              fetch(Const + 'api/MobileApp/PalgeoRegister', {
                method: 'POST',
                headers: {
                  Accept: 'text/plain',
                  'content-type': 'application/json-patch+json',
                },
                body: JSON.stringify({
                  mobileNumber: this.state.mobileNumber,
                  mpin: code.toString(),
                  deviceToken: this.state.device_token,
                  deviceId: this.state.deviceId,
                }),
              })
                .then(response => response.json())
                .then(json => {
                  //alert('device token registered successfully');
                })
                .catch(e => console.log('loginerrorr', e));
              asyncStorageDataSet('mobile', this.state.mobileNumber);
              asyncStorageDataSet('mpin', code.toString());
              asyncStorageDataSet('menus', JSON.stringify(json.menus));

              try {
                asyncStorageDataSet('app_status', this.state.app_status);
                asyncStorageDataSet('user_id', json.staffNumber);
                asyncStorageDataSet('bearer_token', json.bearerToken);
                asyncStorageDataSet(
                  'institute_id',
                  json.instituteId.toString(),
                );
                asyncStorageDataSet('org_id', json.organisationId.toString());
                asyncStorageDataSet(
                  'driving_type',
                  json.travelPreference.toString(),
                );
                asyncStorageDataSet(
                  'start_time',
                  json.staffTravelStartTime.toString(),
                );
                asyncStorageDataSet(
                  'profile_pic',
                  json.profilePic ? json.profilePic : '',
                );

                if (json.isTravelCheckInAvailable) {
                  asyncStorageDataSet('travel_check_in', 'yes');
                } else {
                  asyncStorageDataSet('travel_check_in', 'no');
                }
                if (json.isTravelCheckinWithMpin) {
                  asyncStorageDataSet('isTravelCheckinWithMpin', 'yes');
                } else {
                  asyncStorageDataSet('isTravelCheckinWithMpin', 'no');
                }
                if (json.isQrCheckIn) {
                  asyncStorageDataSet('qrCheckin', 'true');
                } else {
                  asyncStorageDataSet('qrCheckin', 'false');
                }
                if (json.isQrCheckOut) {
                  asyncStorageDataSet('qrCheckout', 'true');
                } else {
                  asyncStorageDataSet('qrCheckout', 'false');
                }
                if (json.isFaceAuthenticationRequired) {
                  asyncStorageDataSet('isFaceRequired', 'true');
                } else {
                  asyncStorageDataSet('isFaceRequired', 'false');
                }
                if (json.isCheckInIdeal) {
                  asyncStorageDataSet('IsCheckInIdeal', 'true');
                } else {
                  asyncStorageDataSet('IsCheckInIdeal', 'false');
                }
                if (json.isTravelCheckInIdeal) {
                  asyncStorageDataSet('IsTravelCheckInIdeal', 'true');
                } else {
                  asyncStorageDataSet('IsTravelCheckInIdeal', 'false');
                }
                if (json.checkInIdealTime !== 0) {
                  asyncStorageDataSet(
                    'CheckInIdealTime',
                    json.checkInIdealTime.toString(),
                  );
                }
                if (json.travelCheckInIdealTime !== 0) {
                  asyncStorageDataSet(
                    'TravelCheckInIdealTime',
                    json.travelCheckInIdealTime.toString(),
                  );
                }
                asyncStorageDataSet(
                  'travelCheckinLocationId',
                  json.travelCheckinLocationId.toString(),
                );
                asyncStorageDataSet(
                  'trackInBackground',
                  json.trackInBackground ? 'true' : 'false',
                );
                if (json.isCCTVFaceRegister) {
                  asyncStorageDataSet('isCCTVFaceRegister', 'true');
                } else {
                  asyncStorageDataSet('isCCTVFaceRegister', 'false');
                }
                asyncStorageDataSet('idealCount', '0');
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
              this.displayErrorMsg(json.message, true);
            }
          })
          .catch(error => {
            console.log('error', error);
            this.displayErrorMsg(error.message, true);
            // this.setState({
            //   showAlert: false,
            //   showAlert1: true,
            //   error: true,
            //   //error_message: 'You might not be connected to Internet. Please check your internet connection.',
            //   error_message: error.message,
            // });
          });
      } else {
        this.displayErrorMsg('Mpin cannot be empty', true);
      }
    } else {
      this.displayErrorMsg('Register Mpin on this device', true);
    }
  };

  displayErrorMsg = (msg, error) => {
    if (Platform.OS === 'ios') {
      alert(msg);
    }
    this.setState({
      showAlert1: true,
      error_message: msg,
      showAlert: false,
      error,
    });
  };

  registerMpin = () => {
    this.props.navigation.navigate('RegisterPin');
  };

  dummy = async () => {
    const request = {
      mobileNumber: this.state.mobileNumber,
      mpin: '1234',
      deviceToken: this.state.device_token,
      deviceId: this.state.deviceId,
    };
    console.log('payload', request);

    try {
      const response = await LoginApi(request);
      console.log('responseee', response);
    } catch (error) {
      console.log('couponediterror', error);
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <AnimatedLoader doNotShowDeleteIcon isVisible={this.state.showAlert} />
        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({showAlert1: false})}
          subTitle={this.state.error_message}
        />

        <LoginBackGround height={'55%'} />
        <ScrollView contentContainerStyle={{}}>
          <View style={styles.secondContainer}>
            <CustomLabel
              title="Welcome!"
              labelStyle={{fontSize: 16}}
              containerStyle={{
                alignSelf: 'flex-start',
                width: '90%',
                alignSelf: 'center',
                paddingLeft: 5,
              }}
            />
            <Text style={styles.otpHeader}>
              Enter your mobile number and MPIN to Login!
            </Text>
          </View>
          <PhoneInput
            textInputProps={{
              keyboardType: 'phone-pad',
              returnKeyType: 'done',
            }}
            codeTextStyle={{
              borderRightWidth: 1,
              borderRightColor: Colors.overlay,
              paddingRight: 3,
            }}
            textContainerStyle={{padding: 0, borderWidth: 0.5, borderRadius: 7}}
            placeholder={this.state.mobileNumber || ' '}
            ref={c => (this.phoneInput = c)}
            //defaultValue={this.state.mobileNumber || ''}
            defaultCode="IN"
            layout="first"
            onChangeText={mobileNumber => {
              this.setState({mobileNumber});
            }}
            value={this.state.mobileNumber}
            //value={'12345'}
            onChangeCountry={country =>
              this.setState({CountryCode: `+${country.callingCode[0]}`})
            }
            //withDarkTheme
            //withShadow
            //disabled={this.state.mobileNumber ? true : false}
            autoFocus={false}
            containerStyle={{
              elevation: 1,

              backgroundColor: 'transparent',
            }}
            textInputStyle={{
              paddingLeft: 5,
              // height:45,
              backgroundColor: 'transparent',
              //borderWidth: 2,
              margin: -10,
            }}
          />
          <OTPInputView
            style={{width: wp('80'), height: 80, alignSelf: 'center'}}
            pinCount={4}
            autoFocusOnLoad={false}
            secureTextEntry={true}
            codeInputFieldStyle={styles.inputFeilds}
            codeInputHighlightStyle={styles.inputFeildsFocus}
            onCodeFilled={code => {
              this.setState({mpin: code}, () => this.handleLogin(code));
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

          <TouchableWithoutFeedback
            onPress={() => this.handleLogin(this.state.mpin)}>
            <View
              style={{
                ...styles.buttonContainer,
                backgroundColor: Colors.button[0],
              }}>
              <Text style={styles.footerText}>Login</Text>
            </View>
          </TouchableWithoutFeedback>
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = state => ({
  loginData: state.fetchReducer,
});

const mapDispatchToProps = dispatch => {
  return {
    handleLoginRequest: (code, mobileNumber, navigation) =>
      dispatch(handleLoginRequest(code, mobileNumber, navigation)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

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
    color: Colors.button[0],
    alignSelf: 'flex-end',
    marginRight: 5,
  },
  firstContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('30'),
    backgroundColor: '#f05760',
  },
  secondContainer: {
    alignItems: 'center',

    // marginTop: hp('10'),
  },
  inputFeilds: {
    //backgroundColor: '#ffffff',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    color: 'black',
    //borderRadius: 10,
  },
  inputFeildsFocus: {
    //backgroundColor: '#ffffff',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.button[0],
    color: '#000000',
    // borderRadius: 10,
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
    tintColor: Colors.maroon,
  },
  buttonContainer: {
    width: wp('60'),
    // backgroundColor: '#f05760',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: hp('2'),
    alignSelf: 'center',
    marginBottom: hp('2'),
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
