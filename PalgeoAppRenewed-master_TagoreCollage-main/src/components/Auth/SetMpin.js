import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Container, VStack } from 'native-base';
import SubHeader from '../common/SubHeader';
import Loader from '../common/Loader';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../utils/configs/Colors';
import CustomLabel from '../common/CustomLabel';
import OTPView from '../common/OTPView';
import { CustomButton } from '../common/CustomButton';
import LoginBackGround from '../common/LoginBackGround';
import AnimatedLoader from '../common/AnimatedLoader';
import SuccessError from '../common/SuccessError';
import { getUniqueId } from 'react-native-device-info';
export default class SetMpin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      mobileNumber: '',
      mpin: '',
      mpin1: '',
      device_token: '',
      autoFocus: false,
      showAlert: false,
      showAlert1: false,
      error_message: '',
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ loader: false });
    }, 700);
    const deviceId = getUniqueId();
    AsyncStorage.getItem('device_token').then(device_token => {
      this.setState({ device_token: device_token, deviceId });
      console.log('ddd', device_token);
    });
  }
  setMpin = () => {
    console.log({ deviceId: this.state.deviceId });
    this.setState({ showAlert: true });
    if (this.props.route.params.mobile) {
      if (this.state.mpin && this.state.mpin1) {
        if (this.state.mpin === this.state.mpin1) {
          fetch(Const + 'api/MobileApp/PalgeoRegister', {
            method: 'POST',
            headers: {
              Accept: 'text/plain',
              'content-type': 'application/json-patch+json',
            },
            body: JSON.stringify({
              mobileNumber: this.props.route.params.mobile,
              mpin: this.state.mpin1,
              deviceToken: this.state.device_token,
              deviceId: this.state.deviceId,
            }),
          })
            .then(response => response.json())
            .then(json => {
              console.log('json', {json,body:JSON.stringify({
                mobileNumber: this.props.route.params.mobile,
                mpin: this.state.mpin1,
                deviceToken: this.state.device_token,
                deviceId: this.state.deviceId,
              })});
              if (json.status) {
                if (Platform.OS == 'ios') {
                  alert('Mpin registered successfully.Please login');
                  setTimeout(() => {
                    this.setState({ showAlert: false });
                  }, 1300);
                  try {
                    AsyncStorage.setItem(
                      'mobile',
                      this.props.route.params.mobile.toString(),
                    );
                    AsyncStorage.setItem('mpin', this.state.mpin.toString());
                    setTimeout(() => {
                      this.props.navigation.navigate('Login');
                    }, 1200);
                  } catch (e) {
                    console.log(e);
                  }
                } else {
                  this.setState({
                    showAlert1: true,
                    error_message: 'Mpin registered successfully.Please login',
                    showAlert: false,
                    error: false,
                  });
                  try {
                    AsyncStorage.setItem(
                      'mobile',
                      this.props.route.params.mobile.toString(),
                    );
                    AsyncStorage.setItem('mpin', this.state.mpin.toString());
                    setTimeout(() => {
                      this.props.navigation.navigate('Login');
                    }, 1200);
                  } catch (e) {
                    console.log(e);
                  }
                }
              } else {
                // this.setMpin();
                if(json.message != null){
                  if (Platform.OS == 'ios') {
                    alert(json.message);
                    setTimeout(() => {
                      this.setState({ showAlert: false });
                    }, 1200);
                  } else {
                    this.setState({
                      showAlert1: true,
                      error_message: json.message,
                      showAlert: false,
                      error: true,
                    });
                    
                }
                }else{
                  this.setMpin();
                }
              }
            })
            //        }else{
            //             if(Platform.OS == "ios"){
            //                 alert('Unknown error occured.Try later');
            //                 setTimeout(()=>{this.setState({showAlert:false})},1200)
            //             }else{
            //                 this.setState({showAlert1:true,error_message:'Unknown error occured.Try later',showAlert : false});
            //             }
            //         }
            //   })
            //   .catch((error) => {
            //         if(Platform.OS == "ios"){
            //             alert('Unknown error occured.Try later');
            //             setTimeout(()=>{this.setState({showAlert:false})},1200)
            //         }else{
            //             this.setState({showAlert1:true,error_message:'Unknown error occured.Try later',showAlert : false});
            //         }
            //  });
            // }else{
            //     if(Platform.OS == "ios"){
            //         alert('Please enter same values');
            //         setTimeout(()=>{this.setState({showAlert:false})},1200)
            //     }else{
            //         this.setState({showAlert1:true,error_message:'Please enter same values',showAlert : false});
            //     }
            // }
            .catch(error => {
              console.log(error);
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
          if (Platform.OS == 'ios') {
            alert('Please enter same values');
            setTimeout(() => {
              this.setState({ showAlert: false });
            }, 1200);
          } else {
            this.setState({
              showAlert1: true,
              error_message: 'Please enter same values',
              showAlert: false,
              error: true,
            });
          }
        }
      } else {
        if (Platform.OS == 'ios') {
          alert('Mpin cannot be empty');
          setTimeout(() => {
            this.setState({ showAlert: false });
          }, 1200);
        } else {
          this.setState({
            showAlert1: true,
            error_message: 'Mpin cannot be empty',
            showAlert: false,
            error: true,
          });
        }
      }
    } else {
      if (Platform.OS == 'ios') {
        alert('Invalid Request');
        setTimeout(() => {
          this.setState({ showAlert: false });
        }, 1200);
        setTimeout(() => {
          this.props.navigation.navigate('RegisterPin');
        }, 1300);
      } else {
        this.setState({
          showAlert1: true,
          error_message: 'Invalid Request',
          showAlert: false,
          error: true,
        });
        setTimeout(() => {
          this.props.navigation.navigate('RegisterPin');
        }, 1200);
      }
    }
  };
  showPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };
  registerMpin = () => {
    this.props.navigation.navigate('RegisterPin');
  };
  handleCode = code => {
    console.log('hiii');
    this.setState({ mpin: code, autoFocus: true });
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    console.log(this.state.CountryCode);
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <AnimatedLoader doNotShowDeleteIcon isVisible={this.state.showAlert} />
          <SuccessError
            isVisible={this.state.showAlert1}
            error={this.state.error}
            deleteIconPress={() => this.setState({ showAlert1: false })}
            subTitle={this.state.error_message}
          />

          <LoginBackGround height="60%" />

          <View>
            <Text style={styles.otpHeader}>Welcome!</Text>
            <View style={{ marginTop: '4%', marginLeft: '4%', marginRight: '4%' }}>
              <CustomLabel title="Enter your MPIN" />
              <OTPView
                onCodeFilled={mpin => this.setState({ mpin, showSecondMPIN: true })}
              />
              {this.state.showSecondMPIN && (
                <View>
                  <CustomLabel title="Re-enter your MPIN" />

                  <OTPView onCodeFilled={mpin1 => this.setState({ mpin1 })} />
                </View>
              )}
            </View>

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3'),
              }}>
              {this.state.showSecondMPIN && (
                <CustomButton
                  onPress={() => {
                    this.setMpin();
                  }}
                  width={'60%'}
                  radius={50}
                  title={'Register'}
                  color={Colors.button[0]}
                />
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  otpHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000',
    marginLeft: 10,
    marginTop: -50,
  },
});
