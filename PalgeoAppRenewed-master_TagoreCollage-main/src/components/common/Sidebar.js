import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {VStack, HStack} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import WifiManager from 'react-native-wifi-reborn';
import {Colors} from '../../utils/configs/Colors';
import {ListItem} from 'react-native-elements';
import Const from './Constants';
import {SafeAreaView} from 'react-native';
import {isIOS} from '../../utils/configs/Constants';
import CustomLabel from './CustomLabel';
import VersionCheck from 'react-native-version-check';
import {Avatar} from 'react-native-elements/dist/avatar/Avatar';
import Drawer from '../../assets/drawer.svg';
import {getUserInfo} from '../../utils/helperFunctions';
import {StatusBar} from 'react-native';
import {ScrollView} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
const MenuItem = props => (
  <TouchableWithoutFeedback onPress={props.onPress}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('2'),
        marginLeft: 10,
      }}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          padding: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#679CF2',
        }}>
        <Image
          source={props.source}
          style={{
            tintColor: Colors.white,
            width: 17,
            height: 17,
            resizeMode: 'contain',
          }}
        />
      </View>
      <Text style={styles.menu}>{props.title}</Text>
    </View>
  </TouchableWithoutFeedback>
);

export default class SideBar extends Component {
  _unsubscribe = null;
  state = {
    loader: false,
    profile_pic: '',
    showOtherCheckInMenu: false,
    otherStaff: [],
    menuLoader: false,
    menuLoader1: false,
    menuLoader2: false,
    menuLoader3: false,
    user_id: null,
    institute_id: null,
    bearer_token: null,
    travel_check_in: null,
    menus: [],
    qrCheckin: 'false',
    qrCheckout: 'false',
    user: null,
  };

  async componentDidMount() {
    //console.log('navvvvv===', this.props.navigation);
    console.log('sideeeeeeeeeee');
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    const user_id = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    const travel_check_in = await AsyncStorage.getItem('travel_check_in');
    const qrCheckin = await AsyncStorage.getItem('qrCheckin');
    const qrCheckout = await AsyncStorage.getItem('qrCheckout');
    const menus = await AsyncStorage.getItem('menus');
    const isFaceRequired = await AsyncStorage.getItem('isFaceRequired');
    const isCCTVFaceRegister = await AsyncStorage.getItem('isCCTVFaceRegister');

    const user = await getUserInfo(user_id, institute_id);

    console.log('isFace===>', isFaceRequired);
    this.setState({
      bearer_token,
      user_id,
      institute_id,
      travel_check_in,
      menus: JSON.parse(menus),
      user,
      qrCheckin,
      qrCheckout,
      isFaceRequired: isFaceRequired === 'true' ? true : false,
      isCCTVFaceRegister: isCCTVFaceRegister === 'true' ? true : false,
    });
    AsyncStorage.getItem('profile_pic').then(profile_pic => {
      this.setState({profile_pic: profile_pic});
    });
    // this._unsubscribe = this.props.navigation.addListener(
    //   'focus',
    //   this.restoreData,
    // );
    this.CheckOtherCheckIn();
  }

  restoreData = async () => {
    AsyncStorage.getItem('profile_pic').then(profile_pic => {
      console.log('profic_pic', profile_pic);
      this.setState({profile_pic: profile_pic});
    });
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    const user_id = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    const travel_check_in = await AsyncStorage.getItem('travel_check_in');
    this.setState({
      bearer_token,
      user_id,
      institute_id,
      travel_check_in,
    });
  };

  // componentWillUnmount() {
  //   this.props.navigation.removeListener(this._unsubscribe);
  // }

  goToFaceRegister = () => {
    this.props.navigation.navigate('FaceRegister', {
      showOtherCheckInMenu: this.state.showOtherCheckInMenu,
      otherStaff: this.state.otherStaff,
      show: !this.state.isCCTVFaceRegister,
      show1: this.state.isCCTVFaceRegister,
    });
  };
  goToFaceRegisterOther = () => {
    this.props.navigation.navigate('FaceRegister1', {
      showOtherCheckInMenu: this.state.showOtherCheckInMenu,
      otherStaff: this.state.otherStaff,
    });
  };
  goToCheckIn = async () => {
    this.setState({menuLoader1: true});
    const {bearer_token, institute_id, user_id, travel_check_in, qrCheckin} =
      this.state;

    fetch(Const + 'api/Staff/IsCheckedInNew', {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: bearer_token,
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify({
        staffCode: user_id,
        instituteId: Number(institute_id),
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          showAlert: false,
          loader: false,
          menuLoader1: false,
        });
        if (json && json.isCheckedIn) {
          Toast.show({
            text: 'You have already checked in.Please view your tasks',
            duration: 3000,
            type: 'warning',
            textStyle: {
              fontFamily: 'Poppins-Regular',
              color: '#ffffff',
              textAlign: 'center',
              fontSize: 14,
            },
          });
          this.props.navigation.navigate('StaffTasks', {disable: true});
        } else {
          //console.log('ttravel', travel_check_in);
          if (travel_check_in === 'no' && qrCheckin === 'false') {
            //this.props.navigation.navigate('Checkin', {travel: false});
            this.props.navigation.navigate('Checkin', {show: true});
          } else {
            this.props.navigation.navigate('Checkin', {
              travel: travel_check_in,
              qrCheckin,
              show: false,
            });
          }
        }
      })
      .catch(error => {
        this.setState({showAlert: false, loader: false, menuLoader1: false});
        console.error(error);
        alert(error);
      });
  };
  goToCheckout = () => {
    const {travel_check_in, qrCheckout} = this.state;
    AsyncStorage.getItem('institute_id').then(institute_id => {
      AsyncStorage.getItem('user_id').then(user_id => {
        AsyncStorage.getItem('bearer_token').then(bearer_token => {
          //console.log(bearer_token);
          this.setState({menuLoader: true});
          fetch(Const + 'api/Staff/StaffTasks', {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: {
              Authorization: bearer_token,
              Accept: 'text/plain',
              'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify({
              staffCode: user_id,
              instituteId: institute_id,
            }),
          })
            .then(response => response.json())
            .then(json => {
              console.log('tasks_json', json);
              if (json.length == 0) {
                fetch(Const + 'api/Staff/IsCheckedInNew', {
                  method: 'POST',
                  withCredentials: true,
                  credentials: 'include',
                  headers: {
                    Authorization: bearer_token,
                    Accept: 'text/plain',
                    'Content-Type': 'application/json-patch+json',
                  },
                  body: JSON.stringify({
                    staffCode: user_id,
                    instituteId: Number(institute_id),
                  }),
                })
                  .then(response => response.json())
                  .then(json => {
                    console.log(json);
                    this.setState({
                      showAlert: false,
                      loader: false,
                      menuLoader: false,
                    });
                    if (json && json.isCheckedIn) {
                      if (travel_check_in === 'no' && qrCheckout === 'false') {
                        this.props.navigation.navigate('Checkout', {
                          show: true,
                        });
                      } else {
                        this.props.navigation.navigate('Checkout', {
                          show: false,
                          travel_check_in,
                          qrCheckin: qrCheckout,
                        });
                      }
                    } else {
                      alert('Please check in first');
                    }
                  })
                  .catch(error => {
                    this.setState({
                      showAlert: false,
                      loader: false,
                      menuLoader: false,
                    });
                    console.error(error);
                    alert(error);
                  });
              } else {
                this.setState({
                  showAlert: false,
                  loader: false,
                  menuLoader: false,
                });
                if (travel_check_in === 'no' && qrCheckout === 'false') {
                  this.props.navigation.navigate('StaffTasks', {
                    show: true,
                    disable: false,
                  });
                } else {
                  this.props.navigation.navigate('StaffTasks', {
                    show: false,
                    travel_check_in,
                    qrCheckin: qrCheckout,
                    disable: false,
                  });
                }
              }
            })
            .catch(error => {
              this.setState({menuLoader: false});
              alert(error);
              console.error(error);
            });
        });
      });
    });
  };
  goToLiveCheckout = () => {
    AsyncStorage.getItem('institute_id').then(institute_id => {
      AsyncStorage.getItem('user_id').then(user_id => {
        AsyncStorage.getItem('bearer_token').then(bearer_token => {
          this.setState({menuLoader3: true});
          fetch(Const + 'api/Staff/StaffTasks', {
            method: 'POST',
            withCredentials: true,
            credentials: 'include',
            headers: {
              Authorization: bearer_token,
              Accept: 'text/plain',
              'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify({
              staffCode: user_id,
              instituteId: institute_id,
            }),
          })
            .then(response => response.json())
            .then(json => {
              if (json.length == 0) {
                fetch(Const + 'api/Staff/IsCheckedInNew', {
                  method: 'POST',
                  withCredentials: true,
                  credentials: 'include',
                  headers: {
                    Authorization: bearer_token,
                    Accept: 'text/plain',
                    'Content-Type': 'application/json-patch+json',
                  },
                  body: JSON.stringify({
                    staffCode: user_id,
                    instituteId: institute_id,
                  }),
                })
                  .then(response => response.json())
                  .then(json => {
                    this.setState({
                      showAlert: false,
                      loader: false,
                      menuLoader3: false,
                    });
                    if (json && json.isCheckedIn) {
                      this.props.navigation.navigate('LiveCheckOut', {
                        show: true,
                        travel_check_in: this.state.travel_check_in,
                      });
                    } else {
                      alert('Please check in first');
                    }
                  })
                  .catch(error => {
                    this.setState({
                      showAlert: false,
                      loader: false,
                      menuLoader3: false,
                    });
                    console.error(error);
                    alert(error);
                  });
              } else {
                this.props.navigation.navigate('StaffTasks', {disable: false});
              }
            })
            .catch(error => {
              this.setState({menuLoader3: false});
              alert(error);
              console.error(error);
            });
        });
      });
    });
  };
  CheckOtherCheckIn = () => {
    AsyncStorage.getItem('org_id').then(org_id => {
      AsyncStorage.getItem('user_id').then(user_id => {
        AsyncStorage.getItem('bearer_token').then(bearer_token => {
          fetch(
            Const + `api/Staff/staff/descendantStaff/${user_id}/${org_id}`,
            {
              method: 'GET',
              withCredentials: true,
              credentials: 'include',
              headers: {
                Authorization: bearer_token,
                Accept: 'text/plain',
                'Content-Type': 'application/json-patch+json',
              },
            },
          )
            .then(response => response.json())
            .then(json => {
              //console.log('json', json);
              if (json.length == 0) {
                this.setState({showOtherCheckInMenu: false, otherStaff: []});
              } else {
                this.setState({showOtherCheckInMenu: true, otherStaff: json});
              }
            })
            .catch(error => {
              console.error(error);
            });
        });
      });
    });
  };
  goToPrivacy = () => {
    this.props.navigation.navigate('Privacy', {backScreen: 'Home'});
  };
  goToReports = () => {
    this.props.navigation.navigate('Reports');
  };
  goToManagerReports = () => {
    this.props.navigation.navigate('ManagerReports');
  };
  goToSelectInstitute = () => {
    this.props.navigation.navigate('Geofence');
  };
  goToCircular = () => {
    this.props.navigation.navigate('e-Circular');
  };
  goTaskAllocation = () => {
    this.props.navigation.navigate('TaskPreferences');
  };
  goToCircularList = () => {
    this.props.navigation.navigate('CircularList');
  };
  goToMyProfile = () => {
    this.props.navigation.navigate('Profile');
  };
  goToLocateMenu = () => {
    this.props.navigation.navigate('LocateMenu');
  };
  goToOtherCheckIn = () => {
    this.props.navigation.navigate('OtherCheckin');
  };
  goToMyInfo = () => {
    this.props.navigation.navigate('DynamicDocs');
  };
  goToMyCalendar = () => {
    this.props.navigation.navigate('Holidays');
  };
  goToLiveCheckIn = () => {
    this.setState({menuLoader2: true});
    const {bearer_token, institute_id, user_id, travel_check_in} = this.state;
    fetch(Const + 'api/Staff/IsCheckedInNew', {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: bearer_token,
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify({
        staffCode: user_id,
        instituteId: Number(institute_id),
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          showAlert: false,
          loader: false,
          menuLoader2: false,
        });
        if (json && json.isCheckedIn) {
          Toast.show({
            text: 'You have already checked in.Please view your tasks',
            duration: 3000,
            type: 'warning',
            textStyle: {
              fontFamily: 'Poppins-Regular',
              color: '#ffffff',
              textAlign: 'center',
              fontSize: 14,
            },
          });
          this.props.navigation.navigate('StaffTasks', {disable: true});
        } else {
          //console.log('ttravel', travel_check_in);
          if (travel_check_in === 'no') {
            this.props.navigation.navigate('LiveCheckin', {travel: false});
          } else {
            this.props.navigation.navigate('LiveCheckin', {travel: true});
          }
        }
      })
      .catch(error => {
        this.setState({showAlert: false, loader: false, menuLoader2: false});
        alert(error);
        console.error(error);
      });
  };
  goToOtherCheckOut = () => {
    this.props.navigation.navigate('OtherCheckout');
  };
  goToLeaves = () => {
    this.props.navigation.navigate('Leaves');
  };
  handleLogout = () => {
    //AsyncStorage.setItem('user_id', '');
    AsyncStorage.setItem('bearer_token', '');
    //AsyncStorage.clear()
    this.props.navigation.navigate('MainNavigator');
  };

  getBSSID = async () => {
    try {
      const {type, details} = await NetInfo.fetch();
      if (type !== 'wifi') {
        return alert('No wifi connected');
      }
      if (details.bssid) {
        alert(details.bssid);
      } else {
        alert('Could not detect bssid');
      }
      // const isEnabled = await WifiManager.isEnabled();
      // if (!isEnabled) WifiManager.setEnabled(true);
      // const bssid = await WifiManager.getBSSID();
      // alert(bssid);
    } catch (error) {
      alert(error);
    }
  };

  getAppVersion = () => {
    const res = VersionCheck.getCurrentVersion();
    return res;
  };
  render() {
    const {isFaceRequired} = this.state;
    const {props} = this;
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            width: '100%',
            minHeight: 100,

            //borderBottomWidth: 1,
            //borderBottomColor: Colors.overlay,
            alignItems: 'center',
            justifyContent: 'center',
            // flexDirection: 'row',
            //paddingTop: 10,
            backgroundColor: 'transparent',
            marginBottom: 10,
          }}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              resizeMode: 'cover',
            }}
            source={require('../../assets/sideBg.png')}
          />
          <Avatar
            rounded
            containerStyle={{
              marginTop: isIOS
                ? StatusBar.currentHeight + 50
                : StatusBar.currentHeight,
            }}
            //avatarStyle={{tintColor: 'white', }}
            source={{uri: this.state.profile_pic}}
            size={'medium'}
          />
          <CustomLabel
            labelStyle={{alignSelf: 'center'}}
            color={Colors.white}
            size={14}
            title={this.state.user?.name || ''}
          />
          <CustomLabel
            labelStyle={{alignSelf: 'center'}}
            color={Colors.white}
            size={12}
            title={this.state.user?.designation || ''}
          />
        </View>
        <ScrollView
          // style={{marginTop: isIOS ? null : 0, borderWidth: 1}}

          {...props}>
          {this.state.menus.includes('User Profile') && (
            <MenuItem
              onPress={this.goToMyProfile}
              title={'User Profile'}
              source={require('../../assets/ic_proile1.png')}
            />
          )}
          <MenuItem
            onPress={this.goToMyInfo}
            title={'Dynamic DocsQ'}
            source={require('../../assets/dynamic.png')}
          />
          <MenuItem
            onPress={this.goToMyCalendar}
            title={'My Calendar'}
            source={require('../../assets/calender.png')}
          />
          {this.state.menus.includes('Campus Fencing') && (
            <MenuItem
              onPress={this.goToSelectInstitute}
              title={'Geofence'}
              source={require('../../assets/ic_location.png')}
            />
          )}
          {this.state.menus.includes('Face Register') && (
            <MenuItem
              onPress={this.goToFaceRegister}
              title={'Face Register'}
              source={require('../../assets/ic_face_register.png')}
            />
          )}
          {this.state.showOtherCheckInMenu && (
            <MenuItem
              onPress={this.goToFaceRegisterOther}
              title={'Others Face Register'}
              source={require('../../assets/ic_face_register.png')}
            />
          )}

          {this.state.menus.includes('Live check in') && (
            <TouchableWithoutFeedback onPress={this.goToLiveCheckIn}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                  marginBottom: hp('2'),
                }}>
                <Image
                  source={require('../../assets/checkin.png')}
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 14,
                    backgroundColor: '#679CF2',
                    tintColor: 'white',
                  }}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.menu}>Live Check In</Text>
                  {this.state.menuLoader2 && (
                    <View style={{marginLeft: 10}}>
                      <ActivityIndicator color="red" size="small" />
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {this.state.menus.includes('Live check out') && (
            <TouchableWithoutFeedback onPress={this.goToLiveCheckout}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                  marginBottom: hp('2'),
                }}>
                <Image
                  source={require('../../assets/checkout.png')}
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 14,
                    backgroundColor: '#679CF2',
                    tintColor: 'white',
                  }}
                />
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.menu}>Live Check Out</Text>
                  {this.state.menuLoader3 && (
                    <View style={{marginLeft: 10}}>
                      <ActivityIndicator color="red" size="small" />
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
          {this.state.showOtherCheckInMenu && (
            <TouchableWithoutFeedback onPress={this.goToOtherCheckIn}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                  marginBottom: hp('2'),
                }}>
                <Image
                  source={require('../../assets/checkin.png')}
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 14,
                    backgroundColor: Colors.secondary,
                  }}
                />
                <Text style={styles.menu}>Other Check In</Text>
              </View>
            </TouchableWithoutFeedback>
          )}
          {this.state.showOtherCheckInMenu && (
            <TouchableWithoutFeedback onPress={this.goToOtherCheckOut}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                  marginBottom: hp('2'),
                }}>
                <Image
                  source={require('../../assets/checkout.png')}
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 14,
                    backgroundColor: Colors.secondary,
                  }}
                />
                <Text style={styles.menu}>Other Check Out</Text>
              </View>
            </TouchableWithoutFeedback>
          )}
          {this.state.menus.includes('Reports') && (
            <MenuItem
              onPress={this.goToReports}
              title={'Reports'}
              source={require('../../assets/ic_report.png')}
            />
          )}

          {this.state.menus.includes('e-Circular') && (
            <MenuItem
              onPress={this.goToCircular}
              title={'e-Circular'}
              source={require('../../assets/ic_ecricule.png')}
            />
          )}

          {this.state.menus.includes('Task Allocation') && (
            <MenuItem
              onPress={this.goTaskAllocation}
              title={'Task Allocation'}
              source={require('../../assets/ic_ecricule.png')}
            />
          )}
          {this.state.menus.includes('Locate Staff') && (
            <MenuItem
              onPress={this.goToLocateMenu}
              title={'Locate Staff'}
              source={require('../../assets/locate.png')}
            />
          )}

          <MenuItem
            onPress={this.getBSSID}
            title={'Get BSSID'}
            source={require('../../assets/locate.png')}
          />

          {/*{this.state.menus.includes('R-Dashboard') && (*/}
          {/* <MenuItem
              onPress={this.goToLeaves}
              title={'R-Dashboard'}
              source={require('../../assets/ic_notification.png')}
            /> */}

          {/*)}*/}
          {this.state.menus.includes('QrCodeGenerator') && (
            <MenuItem
              onPress={() => this.props.navigation.navigate('QRCodeGenerator')}
              title={'QR Code Generator'}
              source={{
                uri: 'https://static.thenounproject.com/png/2956132-200.png',
              }}
            />
          )}

          {this.state.menus.includes('Logout') && (
            <MenuItem
              onPress={this.handleLogout}
              title={'Logout'}
              source={require('../../assets/ic_logout.png')}
            />
          )}

          <CustomLabel
            title={`App Version - ${this.getAppVersion()}`}
            labelStyle={{color: Colors.button[0]}}
            margin={10}
            containerStyle={{paddingLeft: '4%'}}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sideHeader: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#b9b9b9',
  },
  menu: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    paddingLeft: '4%',
    color: 'black',
  },
  header: {
    backgroundColor: Colors.maroon,
    height: hp('13'),
    paddingTop: hp('3'),
  },
  leftContainer: {
    marginLeft: wp('2'),
    marginBottom: Platform.OS == 'ios' ? '4%' : '0%',
  },
  buttonContainer: {
    width: wp('22'),
    height: hp('6'),
    backgroundColor: '#e7f6fb',
    margin: '2%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  welcomeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },
  welcomeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: wp('3'),
  },
});
