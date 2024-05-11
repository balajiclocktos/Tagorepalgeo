import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, VStack, Item, Input, Icon, Toast} from 'native-base';
import SubHeader from './SubHeader';
import Loader from './Loader';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from './Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      userNameOrEmailAddress: '',
      password: '',
      showPassword: true,
      showAlert: false,
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({loader: false});
    }, 700);
  }
  handleLogin = () => {
    if (this.state.userNameOrEmailAddress) {
      if (this.state.password) {
        this.setState({showAlert: true});
        fetch(Const + 'api/TokenAuth/AuthenticateStaff', {
          method: 'POST',
          headers: {
            Accept: 'text/plain',
            'content-type': 'application/json-patch+json',
          },
          body: JSON.stringify({
            userNameOrEmailAddress: this.state.userNameOrEmailAddress,
            password: this.state.password,
            rememberClient: true,
            capturedBase64Image: '',
          }),
        })
          .then(response => response.json())
          .then(json => {
            this.setState({showAlert: false});
            if (json.result != null && json.result.status) {
              Toast.show({
                text: 'Logged in successfully',
                duration: 2500,
                type: 'success',
                textStyle: {
                  fontFamily: 'Poppins-Regular',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontSize: 14,
                },
              });
              try {
                AsyncStorage.setItem('user_id', json.result.staff_code);
                this.props.navigation.navigate('MainNavigator');
              } catch (err) {
                console.log(err.message);
              }
            } else {
              Toast.show({
                text: 'Invalid Login Request',
                duration: 2000,
                type: 'danger',
                textStyle: {
                  fontFamily: 'Poppins-Regular',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontSize: 14,
                },
              });
            }
          })
          .catch(error => {
            this.setState({showAlert: false});
            console.error(error);
          });
      } else {
        Toast.show({
          text: 'Password cannot be empty',
          duration: 2000,
          type: 'danger',
          textStyle: {
            fontFamily: 'Poppins-Regular',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: 14,
          },
        });
      }
    } else {
      Toast.show({
        text: 'Username cannot be empty',
        duration: 2000,
        type: 'danger',
        textStyle: {
          fontFamily: 'Poppins-Regular',
          color: '#ffffff',
          textAlign: 'center',
          fontSize: 14,
        },
      });
    }
  };
  showPassword = () => {
    this.setState({showPassword: !this.state.showPassword});
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

        <SubHeader
          title="Login"
          showBack={false}
          backScreen=""
          showBell={false}
          navigation={this.props.navigation}
        />
        <VStack>
          <View style={styles.cardContainer}>
            <View
              style={{marginTop: '4%', marginLeft: '4%', marginRight: '4%'}}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Username</Text>
              </View>
              <View>
                <Item regular style={styles.item}>
                  <Input
                    placeholder="Enter username"
                    style={styles.input}
                    value={this.state.userNameOrEmailAddress}
                    onChangeText={userNameOrEmailAddress => {
                      this.setState({
                        userNameOrEmailAddress: userNameOrEmailAddress,
                      });
                    }}
                  />
                  <Icon
                    active
                    name="user"
                    type="FontAwesome"
                    style={{fontSize: 17, color: '#089bf9'}}
                    onPress={this.showPassword}
                  />
                </Item>
              </View>
            </View>
            <View
              style={{marginTop: '4%', marginLeft: '4%', marginRight: '4%'}}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Password</Text>
              </View>
              <View>
                <Item regular style={styles.item}>
                  <Input
                    placeholder="Enter password"
                    style={styles.input}
                    value={this.state.password}
                    onChangeText={password => {
                      this.setState({password: password});
                    }}
                    secureTextEntry={this.state.showPassword}
                  />
                  <Icon
                    active
                    name={this.state.showPassword ? 'eye-slash' : 'eye'}
                    type="FontAwesome"
                    style={{fontSize: 17, color: '#089bf9'}}
                    onPress={this.showPassword}
                  />
                </Item>
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3'),
              }}>
              <TouchableWithoutFeedback onPress={this.handleLogin}>
                <View style={styles.buttonContainer}>
                  <Text style={styles.buttonText}>SIGN IN</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
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
    marginTop: '5%',
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
    borderRadius: 20,
    elevation: 5,
    paddingTop: '3%',
    paddingBottom: '3%',
    height: hp('58'),
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6%',
    backgroundColor: '#4dbd74',
    height: hp('5.8'),
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  fpText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  fpContainer: {
    margin: '3%',
    marginLeft: wp('48'),
  },
  rgContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '3%',
    marginRight: '3%',
  },
  rgText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#089bf9',
    paddingLeft: '1%',
  },
  rgText1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
  preview: {
    flex: 1,
  },
});
