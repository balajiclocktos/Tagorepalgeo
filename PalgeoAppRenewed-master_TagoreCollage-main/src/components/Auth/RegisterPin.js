import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { VStack, Item } from 'native-base';
import { Input, Icon } from 'react-native-elements';
import SubHeader from '../common/SubHeader';
import Loader from '../common/Loader';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import HighLightedText from '../common/HighLightedText';
import PhoneInput from 'react-native-phone-number-input';
import LoginBackGround from '../common/LoginBackGround';
import { CustomButton } from '../common/CustomButton';
import { Colors } from '../../utils/configs/Colors';
import { SafeAreaView } from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import OTPView from '../common/OTPView';
import { noTokenAPi, tokenApi } from '../../utils/apis';
import axios from 'axios';
import CustomLabel from '../common/CustomLabel';
import { TouchableOpacity } from 'react-native';
import { Keyboard } from 'react-native';
import AnimatedLoader from '../common/AnimatedLoader';
import CustomModal from '../common/CustomModal';
import CustomPopUp from '../common/CustomPopUp';
import SuccessError from '../common/SuccessError';
import { isIOS } from '../../utils/configs/Constants';
import { textAlign } from 'styled-system';
import { KeyboardAvoidingView } from 'react-native';
export default class RegisterPin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      mobileNo: '',
      hash: '',
      showAlert1: false,
      error_message: '',
      CountryCode: '+91',
      showOTP: false,
      buttonText: 'Send OTP',
    };
  }
  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      if (this.props.route.params != undefined) {
        this.setState({ CountryCode: this.props.route.params.CountryCode });
      }
    });
  }

  sendOtp = () => {
    console.log('mobile', this.state.mobileNo);
    console.log( Const +'api/MobileApp/StaffDetailsByMobileNumber?mobileNumber=' +this.state.mobileNo)
    console.log()
    if (this.state.mobileNo) {
      this.setState({ showAlert: true });
      fetch(
        Const +
        'api/MobileApp/StaffDetailsByMobileNumber?mobileNumber=' +
        this.state.mobileNo,
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
          console.log('json', json);
          if (json.length > 0) {
            console.log("----------------------------")
            console.log(Const + 'api/MobileApp/SendVerificationOTP')
            console.log(JSON.stringify({
              mobileNo: this.state.mobileNo,
              haskKey: 'haskey',
              CountryCode: this.state.CountryCode,
            }))
            console.log("----------------------------")

            fetch(Const + 'api/MobileApp/SendVerificationOTP', {
              method: 'POST',
              headers: {
                Accept: 'text/plain',
                'content-type': 'application/json-patch+json',
              },
              body: JSON.stringify({
                mobileNo: this.state.mobileNo,
                haskKey: 'haskey',
                CountryCode: this.state.CountryCode,
              }),
            })
              .then(response => response.json())
              .then(json => {
                if (isIOS) {
                  alert(json.message);
                }

                this.setState({
                  showAlert: false,
                  buttonText: 'Verify OTP',
                  showOTP: true,
                  showAlert1: true,
                  error_message: json.message,
                  error: false,
                });
              })
              .catch(e => {
                this.setState({
                  showAlert: false,
                  error: true,
                  showAlert1: true,
                  error_message: e.message,
                });
              });

            // this.props.navigation.navigate('StaffDetails', {
            //   name: json[0].name,
            //   institute: json[0].institute,
            //   department: json[0].department,
            //   designation: json[0].designation,
            //   mobile: json[0].mobileNumber,
            //   CountryCode: this.state.CountryCode,
            // });
          } else {
            if (Platform.OS == 'ios') {
              alert('Invalid mobile number');
              setTimeout(() => {
                this.setState({ showAlert: false });
              }, 1200);
            } else {
              this.setState({
                showAlert1: true,
                error: true,
                error_message: 'Invalid mobile number',
                showAlert: false,
              });
            }
          }
        })
        .catch(error => {
          console.log('error', error);
          if (Platform.OS == 'ios') {
            alert(error.message);
            setTimeout(() => {
              this.setState({ showAlert: false });
            }, 1200);
          } else {
            this.setState({
              showAlert1: true,
              error: true,
              error_message: error.message,
              showAlert: false,
            });
          }
        });
    } else {
      this.setState({
        showAlert1: true,
        error_message: 'Enter mobile number',
        showAlert: false,
        error: true,
      });
    }
  };
  goToSearchCountry = () => {
    this.props.navigation.navigate('SearchCountry');
  };
  verifyOTP = async () => {
    const { otp } = this.state;
    const body = {
      mobileNumber: this.state.mobileNo,
      otp,
    };
    try {
      const response = await axios.post(
        Const + 'api/MobileApp/VerifyOTP',
        body,
      );
      console.log("0000000000000000000000000000000000000000000");
      console.log("otp =" +otp);
      console.log("22222222222222222222222222222222222222222222");
      console.log(Const + 'api/MobileApp/VerifyOTP')
      console.log("33333333333333333333333333333333333333333333333");
      console.log(JSON.stringify(body));

      const { data } = response;
      if (!data) {
        if (isIOS) {
          return this.setState(
            {
              showAlert: false,
              showAlert1: true,
              error_message: 'Invalid OTP',
              error: true,
            },
            () => alert('Invalid OTP'),
          );
        }
        return this.setState({
          showAlert: false,
          showAlert1: true,
          error_message: 'Invalid OTP',
          error: true,
        });
      }
      this.setState(
        {
          showAlert1: true,
          error_message: 'OTP verified successfully!',
          error: false,
        },
        () => {
          if (isIOS) {
            alert(this.state.error_message);
          }
        },
      );
      setTimeout(() => {
        this.props.navigation.navigate('SetMpin', {
          mobile: this.state.mobileNo,
        });
      }, 1300);
      console.log('data', data);
    } catch (e) {
      return this.setState({
        showAlert: false,
        showAlert1: true,
        error_message: e.message,
        error: true,
      });
    }
  };
  render() {
    //console.log(this.state.showAlert1);
    if (this.state.loader) {
      return <Loader />;
    }
    // console.log(this.state.CountryCode);
    return (
      // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <AnimatedLoader
            isVisible={this.state.showAlert}
            doNotShowDeleteIcon
          //source={require('../../assets/lottie/loader.json')}
          />
          <SuccessError
            isVisible={this.state.showAlert1}
            error={this.state.error}
            deleteIconPress={() => this.setState({ showAlert1: false })}
            subTitle={this.state.error_message}
          />
          <LoginBackGround height="60%" />

          <View style={styles.secondContainer}>
            <Text style={styles.otpHeader}>Welcome!</Text>
            <View
              style={{ marginTop: '4%', marginLeft: '4%', marginRight: '4%' }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Enter your mobile number</Text>
              </View>

              <PhoneInput
                ref={c => (this.phoneInput = c)}
                //defaultValue={this.state.mobileNumber}
                textInputProps={{
                  keyboardType: 'phone-pad',
                  returnKeyType: "done"

                }}
                placeholder={this.state.mobileNo || ' '}
                codeTextStyle={{
                  borderRightWidth: 1,
                  borderRightColor: Colors.overlay,
                  paddingRight: 3,
                }}
                textContainerStyle={{
                  padding: 0,
                  borderWidth: .5,
                  borderRadius: 7
                }}
                defaultCode="IN"
                layout="first"
                disableArrowIcon={false}
                onChangeText={mobileNo => {
                  this.setState({ mobileNo });
                }}
                // onChangeFormattedText={(text) => {
                //   this.setState({CountryCode: text.slice(0, 3)});
                // }}
                onChangeCountry={country => {
                  this.setState({
                    CountryCode: `+${country.callingCode[0]}`,
                  });
                }}
                value={this.state.mobileNo}
                withDarkTheme
                withShadow
                autoFocus={this.state.mobileNo ? false : true}
                containerStyle={{
                  elevation: 1,
                  // borderWidth:.5,
                  backgroundColor: 'transparent',
                  alignSelf: 'flex-start',
                }}
                disabled={this.state.buttonText === 'Verify OTP'}
                textInputStyle={{
                  padding: 0,
                  backgroundColor: 'transparent',
                  // borderWidth: .5,
                  margin: -10,
                  paddingLeft: 5
                }}
              />
              {this.state.showOTP && (
                <TouchableOpacity onPress={this.sendOtp}>
                  <CustomLabel
                    title="Resend OTP"
                    color={Colors.red}
                    labelStyle={{ textAlign: 'center' }}
                  />
                </TouchableOpacity>
              )}
              {this.state.showOTP && (
                <OTPView
                  onCodeFilled={otp => this.setState({ otp }, this.verifyOTP)}
                />
              )}
            </View>

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3'),
              }}>
              <CustomButton
                onPress={() => {
                  if (this.state.showOTP) {
                    this.verifyOTP();
                  } else {
                    this.sendOtp();
                  }
                }}
                width={'60%'}
                radius={50}
                title={this.state.buttonText}
                color={Colors.button[0]}
              />
            </View>
            {!this.state.showOTP && (
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  alignItems: 'center',
                }}>
                <CustomLabel
                  labelStyle={{ textAlign: 'center' }}
                  title="Already a registered user?"
                />
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('Login')}>
                  <CustomLabel
                    labelStyle={{ textAlign: 'center', color: Colors.button[0] }}
                    title="Sign in!"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      // </TouchableWithoutFeedback>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
  },
  label1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#c9c3c5',
    paddingLeft: wp('3'),
  },
  labelContainer: {
    //margin: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#f1f1f1',
    paddingLeft: '5%',
    borderRadius: 10,
    //height: hp('7'),
    width: wp('100'),
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    height: hp('7'),
    width: wp('80'),
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('30'),
    paddingRight: wp('7'),
    marginTop: '4%',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#ffffff',
  },
  preview: {
    flex: 1,
  },
  firstContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('30'),
    backgroundColor: '#f05760',
  },
  secondContainer: {
    //alignItems: 'center',
    //width: wp('80'),
    //alignSelf: 'center',
    //marginTop: hp('6'),
  },
  loginImage: {
    width: 250,
    height: 200,
  },
  otpHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000',
    marginLeft: 10,
    marginTop: -50,
  },
  btImage: {
    width: 54,
    height: 39,
  },
  row: {
    flexDirection: 'row',
  },
  code: {
    fontFamily: 'Poppins-Regular',
    marginLeft: '3%',
  },
});
