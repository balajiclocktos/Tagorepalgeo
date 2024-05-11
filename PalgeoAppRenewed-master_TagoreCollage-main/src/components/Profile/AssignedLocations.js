import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  //Picker,
} from 'react-native';
import {VStack, Select, CheckIcon} from 'native-base';
import {Card} from 'react-native-elements';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../utils/configs/Colors';
import {ScrollView} from 'react-native';
import {Platform} from 'react-native';
import CustomCard from '../common/CustomCard';
import AnimatedLoader from '../common/AnimatedLoader';
import SuccessError from '../common/SuccessError';
import {CustomButton} from '../common/CustomButton';
import {Define} from '../M-Dashboard/components/StaffMaster';
import {Image} from 'react-native';
var moment = require('moment');
function convertUTCToLocal(utcDt, utcDtFormat) {
  var toDt = moment.utc(utcDt, utcDtFormat).toDate();
  return moment(toDt).format('hh:mm A');
}
export default class StaffDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showAlert: false,
      options: [],
      data: [],
      travelPreference: 1,
      showAlert1: false,
      error_message: '',
    };
    this.DATA = [
      {id: 1, type: 'DRIVING', icon: require('../../assets/i2.png')},
      {id: 2, type: 'BICYCLING', icon: require('../../assets/i3.png')},
      {id: 3, type: 'WALKING', icon: require('../../assets/i4.png')},
      {id: 4, type: 'BUS', icon: require('../../assets/i5.png')},
      {id: 5, type: 'TRAIN', icon: require('../../assets/i1.png')},
    ];
  }
  async componentDidMount() {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const driving_type = await AsyncStorage.getItem('driving_type');
      console.log('driving_type', driving_type);
      switch (driving_type) {
        case 'DRIVING':
          this.setState({travelPreference: 1});
          break;
        case 'BICYCLING':
          this.setState({travelPreference: 2});
          break;
        case 'WALKING':
          this.setState({travelPreference: 3});
          break;
        case 'BUS':
          this.setState({travelPreference: 4});
          break;
        case 'TRAIN':
          this.setState({travelPreference: 5});
          break;

        default:
          this.setState({travelPreference: ''});
          break;
      }
      this.staffDetails(user_id, institute_id);
      this.getTravelPreference(bearer_token);
    } catch (e) {
      alert(e.message);
    }
  }
  getTravelPreference = bearer_token => {
    this.setState({showAlert: false});
    fetch(Const + 'api/Staff/traveloptions', {
      method: 'GET',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: 'Bearer ' + bearer_token,
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json-patch+json',
      },
    })
      .then(response => response.json())
      .then(json => {
        //console.log(json);
        if (json.length > 0) {
          this.setState({options: json, showAlert: false});
        } else {
          this.setState({options: [], showAlert: false});
        }
      })
      .catch(error => {
        this.setState({showAlert: false});
      });
  };
  staffDetails = (user_id, institute_id) => {
    // console.log(user_id, institute_id);
    this.setState({showAlert: false});
    fetch(Const + 'api/Staff/information/' + institute_id + '/' + user_id, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'content-type': 'application/json-patch+json',
      },
    })
      .then(response => response.json())
      .then(json => {
        if (json.status) {
          // console.log(
          //   'api/Staff/information/institute_id/user_id ==>',
          //   json.assignedLocations,
          // );
          this.setState({data: json.assignedLocations, showAlert: false});
        } else {
          this.setState({data: [], showAlert: false});
        }
      })
      .catch(error => {
        this.setState({showAlert: false});
      });
  };
  goToMapView = (type, coordinates, radius) => {
    if (type == 'Circle') {
      this.props.navigation.navigate('CircleMapView', {
        coordinates: coordinates,
        radius: radius,
      });
    } else if (type == 'Polygon') {
      this.props.navigation.navigate('PolygonMapView', {
        coordinates: coordinates,
      });
    }
  };
  onValueChange = value => {
    this.updateTravelPreference(value);
  };
  updateTravelPreference = value => {
    AsyncStorage.getItem('user_id').then(user_id => {
      AsyncStorage.getItem('institute_id').then(institute_id => {
        AsyncStorage.getItem('bearer_token').then(bearer_token => {
          this.setState({showAlert: true});
          fetch(
            Const +
              '/api/Staff/update/traveloptions/' +
              institute_id +
              '/' +
              user_id +
              '/' +
              value,
            {
              method: 'GET',
              withCredentials: true,
              credentials: 'include',
              headers: {
                Authorization: 'Bearer ' + bearer_token,
                Accept: 'application/json, text/plain',
                'Content-Type': 'application/json-patch+json',
              },
            },
          )
            .then(response => {
              let text = '';
              if (value == '1') {
                text = 'DRIVING';
              } else if (value == '2') {
                text = 'BICYCLING';
              } else if (value == '3') {
                text = 'WALKING';
              } else if (value == '4') {
                text = 'BUS';
              } else if (value == '5') {
                text = 'TRAIN';
              }
              try {
                AsyncStorage.setItem('driving_type', text);
                AsyncStorage.setItem('driving_type_id', value.toString());
              } catch (e) {
                console.log(e);
              }
              if (Platform.OS === 'android') {
                this.setState({
                  showAlert1: true,
                  error_message: 'Travel preference updated successfully',
                  showAlert: false,
                  travelPreference: value,
                  error: false,
                });
              } else {
                this.setState({showAlert: false, travelPreference: value}, () =>
                  alert('Travel preference updated successfully'),
                );
              }
            })
            .catch(error => {
              this.setState({showAlert: false});
            });
        });
      });
    });
  };
  render() {
    return (
      <View style={{marginBottom: 50, flex: 1}}>
        {/* <View style={{backgroundColor: Colors.red}}> */}
        <AnimatedLoader
          doNotShowDeleteIcon
          isVisible={this.state.showAlert}
          //ource={require('../../assets/lottie/loader.json')}
        />
        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({showAlert1: false})}
          subTitle={this.state.error_message}
        />

        <View style={{marginTop: '3%', marginLeft: '3%', marginRight: '3%'}}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Travel Preference</Text>
          </View>
          <View>
            <Select
              padding="3"
              fontSize={14}
              minWidth="200"
              accessibilityLabel="Choose Service"
              variant="outline"
              placeholder="Choose Service"
              _item={{
                _text: {
                  fontSize: 14,
                },
              }}
              mt={1}
              selectedValue={this.state.travelPreference}
              onValueChange={value => this.onValueChange(value)}>
              {/* <Select.Item label="Select" value="" key="" /> */}
              {this.DATA.map(item => {
                return (
                  <Select.Item
                    label={item.type}
                    value={item.id}
                    key={item.id}
                    leftIcon={
                      <Image
                        source={item.icon}
                        style={{width: 16, height: 20, resizeMode: 'contain'}}
                      />
                    }
                  />
                );
              })}
            </Select>
          </View>
        </View>
        <ScrollView>
          {/* <View style={[styles.center]}> */}
          {this.state.data.map((item, index) => {
            var date = moment().format('YYYY-MM-DD ' + item.checkInTime);
            var local_checkin_time = convertUTCToLocal(date);

            var date1 = moment().format('YYYY-MM-DD ' + item.checkOutTime);
            var local_checkout_time = convertUTCToLocal(date1);

            return (
              <Card
                key={index}
                containerStyle={{
                  minHeight: 100,
                  width: '90%',
                  borderRadius: 6,
                  alignSelf: 'center',
                  backgroundColor: 'white',
                  elevation: 4,
                  shadowOpacity: 0.25,
                  //shadowColor: 'black',
                  padding: 0,
                  borderWidth: 0,
                  marginVertical: 10,
                }}
                wrapperStyle={{
                  width: '100%',
                  borderRadius: 6,
                  alignSelf: 'center',
                  backgroundColor: 'white',
                }}>
                <View
                  style={{
                    backgroundColor: Colors.mainHeader[0],
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    paddingLeft: 8,
                  }}>
                  <View style={{width: '100%'}}>
                    <View style={{}}>
                      <Define
                        icon
                        name="location"
                        color={'white'}
                        size={15}
                        type="evilicon"
                        text
                        titleColor={'white'}
                        title={'Access Location:'}
                        value={item.accessLocation}
                      />
                      <Define
                        icon
                        name="emoji-happy"
                        titleColor={'white'}
                        color={'white'}
                        size={15}
                        type="entypo"
                        text
                        title={'Face Authentication:'}
                        value={
                          item.isFaceRecognitionMandatory
                            ? 'Mandatory'
                            : 'Not Mandatory'
                        }
                      />

                      {item.beaconLocation && item.beaconLocation !== '' && (
                        <Define
                          icon
                          name="bluetooth"
                          titleColor={'white'}
                          color={'white'}
                          size={15}
                          type="feather"
                          text
                          title={'Beacon Location:'}
                          value={item.beaconLocation}
                        />
                      )}
                    </View>
                  </View>
                </View>
                <View style={{padding: 8}}>
                  <Define
                    icon
                    name="location-enter"
                    color={Colors.green}
                    size={15}
                    type="material-community"
                    text
                    title={'Check-in Time:'}
                    value={
                      local_checkin_time &&
                      local_checkin_time !== 'Invalid date'
                        ? local_checkin_time
                        : 'Not Alloted'
                    }
                  />
                  <Define
                    icon
                    size={15}
                    name="location-exit"
                    type="material-community"
                    color={Colors.red}
                    text
                    title={'Check-out Time:'}
                    value={
                      local_checkout_time &&
                      local_checkout_time !== 'Invalid date'
                        ? local_checkout_time
                        : 'Not Alloted'
                    }
                  />
                  {!item.accessLocation.includes('Travel') && (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Define
                        icon
                        size={15}
                        name="my-location"
                        type="material"
                        color={Colors.mainHeader[0]}
                        text
                        title={'Type:'}
                        value={item.type}
                      />
                      {item.type === 'Circle' || item.type === 'Polygon' ? (
                        <CustomButton
                          onPress={() =>
                            this.goToMapView(
                              item.type,
                              item.coordinates,
                              item.radius,
                            )
                          }
                          title={'Map View'}
                          radius={33}
                          textStyle={{fontSize: 12}}
                          color={Colors.button[0]}
                        />
                      ) : null}
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </ScrollView>
        {/* </View> */}
        {/* </View> */}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  drivingContainer: {
    paddingTop: 10,
    paddingLeft: 14,
  },
  drivingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    margin: '1%',
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    margin: '1%',
    color: '#909090',
  },
  walletContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    width: wp('93'),
    marginBottom: hp('1.5'),
  },
  header: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#67747d',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    padding: '3%',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    margin: '2%',
  },
  divider1: {
    borderWidth: 1,
    borderColor: '#f3f3f3',
    margin: '2%',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
  headerVal5: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#f05760',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#67747d',
  },
  labelContainer: {
    margin: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('6'),
    borderColor: '#f1f1f1',
    borderWidth: 1,
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 1,
    height: hp('6'),
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2%',
  },
});
