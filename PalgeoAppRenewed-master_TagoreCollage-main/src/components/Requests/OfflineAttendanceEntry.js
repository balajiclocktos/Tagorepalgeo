import {Radio, TextArea, VStack} from 'native-base';
import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SubHeader from '../common/DrawerHeader';
import TravelImage from '../../assets/travelCheck.svg';
import LocImage from '../../assets/simpleCheck.svg';
//import {CustomList} from '../common/CustomList';
//import {CustomButton} from '../common/CustomButton';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
//import {CustomList2} from '../common/CustomList2';
import {CustomTextArea} from '../common/CustomTextArea';
import {ApprovalStages} from '../common/ApprovalStages';
import {CalenderView} from '../common/CalenderView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomLoader from '../Task Allocation/CustomLoader';
import CustomModal from '../common/CustomModal';
import CustomLabel from '../common/CustomLabel';
import {CheckBox, Icon} from 'react-native-elements';
import {Colors} from '../../utils/configs/Colors';
import Error from '../popups/error';
import {CalenderView2} from '../common/CalenderView2';
import {CustomButton} from '../common/CustomButton';
import ImageCard from '../common/ImageCard';
import CustomPicker from '../common/CustomPicker';
import {getAssignedLocations} from '../../utils/helperFunctions';
import {tokenApi} from '../../utils/apis';
import SuccessError from '../common/SuccessError';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {
  GOOGLE_MAPS_APIKEY,
  OPEN_CAGE_APIKEY,
  OPEN_GEOCODING_API,
} from '../../utils/configs/Constants';

import NetInfo from '@react-native-community/netinfo';

const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];

const screenWidth = Dimensions.get('window').width;
export default class OfflineAttendanceEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ApprovalStages: [],
      Attachment: {FileName: 'FileName'},
      options: [],
      Reason: '',
      status: false,
      time: new Date(),
      travel: false,
      normal: true,
      geofenceId: null,
      checked_out: 'yes',
      isOn: false,
      coordinates: {},
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('bodyOffline').then(res => {
      const response = JSON.parse(res);
      console.log('response', response);
      if (response !== null) {
        return this.props.navigation.goBack();
      }
    });
    //Geocoder.init(GOOGLE_MAPS_APIKEY);
    this.getCurrentLocation();
    this.getUserInfo().then(() => {
      this.getType();
    });
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
  }

  getCurrentLocation = () => {
    const options = {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 1000,
      fastestInterval: 1000,
    };

    this.watchID = Geolocation.watchPosition(this.success, this.error, options);
  };

  success = pos => {
    console.log(pos);
    Geolocation.clearWatch(this.watchID);
    this.setState({coordinates: pos.coords}, async () => {
      const {latitude, longitude} = pos.coords;
      const {data} = await axios.get(
        `${OPEN_GEOCODING_API}${latitude}+${longitude}&key=${OPEN_CAGE_APIKEY}`,
      );

      const formatted_address = data.results[0].formatted;
      this.setState({
        travelCheckInAddress: formatted_address,
      });
      // Geocoder.from(pos.coords.latitude, pos.coords.longitude)
      //   .then(json => {
      //     const {results} = json;
      //     const filteredResults = results.filter(
      //       e => !e.formatted_address.includes('+'),
      //     );
      //     // console.log('dd', filteredResults[0].formatted_address);

      //   })
      //   .catch(er => console.log('errrrr', er));
    });
  };

  error = error => {
    alert(error.status + '. GPS');
  };

  getType = async () => {
    // this.state.selectedLeaveId;
    const url =
      Const +
      'api/Leave/GetLeaveTypeSubCategoriesByInstituteId?instituteId=' +
      this.state.institute_id +
      '&leaveRequestId=' +
      10 +
      '&staffCode=' +
      this.state.user_id;
    //console.log('GetLeaveTypeSubCategoriesByInstituteId Url = ', url);
    try {
      const response = await axios.get(url);
      console.log(
        'GetLeaveTypeSubCategoriesByInstituteId =',
        response.data[0].leaveId,
      );

      this.setState({
        loader: false,
        leaveRequestTypeId: response.data[0].leaveId,
        // CustomListLoader: false,
      });
      //('typeId ==', response.data[0].leaveId);
    } catch (error) {
      // console.log('getSub==', error);

      this.setState({loader: false});
      alert(error.message);
    }
  };

  getUserInfo = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const checked_out = await AsyncStorage.getItem('checked_out');
      // console.log('cccc', checked_out);
      this.setState(
        {user_id, institute_id, bearer_token, checked_out},
        async () => {
          const connected = await NetInfo.fetch();
          console.log('connected', connected.isConnected);
          if (!connected.isConnected) {
            const locations = JSON.parse(
              await AsyncStorage.getItem('locationsAll'),
            );
            const leaveId = await AsyncStorage.getItem('leaveTypeId');
            if (locations.length > 0) {
              const options = locations.map(e => {
                return {
                  id: e.id,
                  name: e.accessLocation,
                  shiftId: e.shiftId,
                };
              });
              this.setState({options, leaveRequestTypeId: Number(leaveId)});
            }
            return;
          }

          const locations = await getAssignedLocations();
          //console.log('offlineLocations', locations);
          if (locations.length > 0) {
            const options = locations.map(e => {
              return {
                id: e.id,
                name: e.accessLocation,
                shiftId: e.shiftId,
              };
            });
            this.setState({options});
          }
        },
      );
    } catch (e) {
      if (e.message.includes('Network')) {
        const locations = await JSON.parse(
          AsyncStorage.getItem('locationsAll'),
        );
        if (locations.length > 0) {
          const options = locations.map(e => {
            return {
              id: e.id,
              name: e.accessLocation,
              shiftId: e.shiftId,
            };
          });
          this.setState({options});
        }
      }
      console.log(e);
    }
  };

  makeRequest = async () => {
    const {time, travel, options, travelCheckInAddress, coordinates} =
      this.state;
    let findd = {};
    if (travel) {
      findd = options.find(e => e.name === 'Travel Check In');
    }
    const checked_out = await AsyncStorage.getItem('checked_out');
    const check = checked_out === 'yes' || !checked_out;
    if (this.state.Reason === '') {
      return this.displayMsg(true, 'Reason is required', true);
    }
    if (!this.state.geofenceId && !travel) {
      return this.displayMsg(true, 'Choose a location', true);
    }
    let findShift = {};
    if (this.state.options.length > 0 && !travel) {
      findShift = this.state.options.find(e => e.id === this.state.geofenceId);
    }

    const {latitude, longitude} = coordinates;

    const body = {
      Id: 0,
      InstituteId: Number(this.state.institute_id),
      StaffCode: this.state.user_id,
      IsCheckIn: check ? true : false,
      GeoFenceId: travel ? findd.id : this.state.geofenceId,
      ShiftId: travel ? findd.shiftId : findShift.shiftId,
      CheckInTime: check ? time : '',
      CheckOutTime: check ? '' : time,
      Reason: this.state.Reason,
      LeaveTypeId: this.state.leaveRequestTypeId,
      IsTravelCheckIn: travel,
      TravelCheckInAddress: travel ? travelCheckInAddress : '',
      Latitude: travel ? latitude : 0,
      Longitude: travel ? longitude : 0,
    };

    console.log('body', body);

    try {
      const res = await tokenApi();
      const response = await res.post(
        'api/Leave/OfflineAttendanceRequest',
        body,
      );
      const {data} = response;
      console.log('data', data);
      if (!data.status) {
        return this.displayMsg(true, data.message, true);
      }
      this.displayMsg(false, 'Request submitted successfully!', true);
    } catch (e) {
      if (e.message.includes('Network')) {
        return await this.saveDataForPush(body);
      }
      this.displayMsg(true, e.message, true);
      console.log(e);
    }
  };

  saveDataForPush = async body => {
    await AsyncStorage.setItem('offlineBody', JSON.stringify(body));
    this.displayMsg(
      false,
      'Date saved successfully. Your request will be sent as soon as you are online.',
      true,
    );
    setTimeout(() => this.props.navigation.goBack(), 3000);
  };

  displayMsg = (error, error_message, showAlert) =>
    this.setState({
      error,
      error_message,
      showAlert,
      status: error ? false : true,
    });

  render() {
    if (this.state.Loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <SubHeader
          title="Offline Attendance Entry"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />

        <SuccessError
          isVisible={this.state.showAlert}
          error={this.state.error}
          subTitle={this.state.error_message}
          deleteIconPress={() => this.setState({showAlert: false})}
        />

        {this.state.status ? (
          <ScrollView contentContainerStyle={{paddingBottom: 100}}>
            <View
              style={{
                width: '100%',
                backgroundColor: 'white',
                padding: 10,
              }}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                You are checked IN
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <View
                  style={{
                    width: '10%',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Icon
                    size={16}
                    name="shield"
                    color={'#236DE7'}
                    type={'entypo'}
                  />
                </View>
                <View
                  style={{
                    width: '90%',
                    flexDirection: 'row',
                  }}>
                  <Text style={{color: 'gray'}}>
                    Check in type :{' '}
                    <Text style={{color: 'black'}}>Normal Check IN</Text>
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <View
                  style={{
                    width: '10%',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Icon
                    size={16}
                    name="clock"
                    color={'#236DE7'}
                    type={'entypo'}
                  />
                </View>
                <View
                  style={{
                    width: '90%',
                    flexDirection: 'row',
                  }}>
                  <Text style={{color: 'gray'}}>
                    Check in time :{' '}
                    <Text style={{color: 'black'}}>
                      {moment(this.state.time).format('h:mm a')}
                    </Text>
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <View
                  style={{
                    width: '10%',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Icon
                    size={16}
                    name="location"
                    color={'#236DE7'}
                    type={'entypo'}
                  />
                </View>
                <View
                  style={{
                    width: '90%',
                    flexDirection: 'row',
                  }}>
                  <Text style={{color: 'gray'}}>
                    Check in Location :{' '}
                    <Text style={{color: 'black'}}>
                      {!this.state.travel
                        ? this.state.options.find(
                            e => e.id === this.state.geofenceId,
                          ).name
                        : this.state.travelCheckInAddress}
                    </Text>
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <View
                  style={{
                    width: '10%',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Icon
                    size={16}
                    name="shield"
                    color={'#236DE7'}
                    type={'entypo'}
                  />
                </View>
                <View
                  style={{
                    width: '90%',
                    flexDirection: 'row',
                  }}>
                  <Text style={{color: 'gray'}}>
                    Check in reason :{' '}
                    <Text style={{color: 'black'}}>{this.state.Reason}</Text>
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                marginVertical: 10,
                padding: 10,
              }}>
              <View
                style={{
                  width: '10%',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <Icon
                  size={16}
                  name="alert-circle"
                  color={'red'}
                  type={'feather'}
                />
              </View>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                }}>
                <Text style={{color: 'gray'}}>
                  Check in reason :{' '}
                  <Text style={{color: 'black'}}>{this.state.Reason}</Text>
                </Text>
              </View>
            </View>

            <View style={{marginVertical: 20}}>
              <CustomButton
                title={'CHECK OUT'}
                width={'90%'}
                color={ThemeColor}
                onPress={this.makeRequest}
              />
            </View>
            {this.state.ApprovalStages.length > 0 && (
              <View style={{marginVertical: 10}}>
                <ApprovalStages
                  onPress={() => {}}
                  width="100%"
                  key={0}
                  title="Approval Stages"
                  color={SubThemeColor}
                  headerColor={ThemeColor}
                  Arr={this.state.ApprovalStages}
                />
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView>
            <View
              style={{
                width: '96%',
                alignSelf: 'center',
                justifyContent: 'flex-start',
                backgroundColor: 'white',
                paddingVertical: 10,
              }}>
              {this.state.options.filter(e => e.name === 'Travel Check In')
                .length > 0 && (
                <ImageCard
                  title={'TRAVEL CHECK IN'}
                  secondIcon={
                    <CheckBox
                      style={{zIndex: 100}}
                      onPress={() =>
                        this.setState({travel: true, normal: false})
                      }
                      checked={this.state.travel}
                      checkedColor={Colors.green}
                      uncheckedIcon={
                        <Icon
                          name={'radio-btn-passive'}
                          color={Colors.white}
                          type="fontisto"
                        />
                      }
                      checkedIcon={
                        <Icon
                          name={'radio-btn-active'}
                          type="fontisto"
                          color={Colors.green}
                        />
                      }
                      //disabled={this.state.normal}
                    />
                  }
                  backgroundColor={'#3F1BD0'}
                  disabled
                  // onPress={() => this.setState({travel:'true'})}
                  source={require('../../assets/home_tv.png')}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    resizeMode: 'stretch',
                    zIndex: -100,
                  }}
                />
              )}
              {this.state.options.filter(e => e.name !== 'Travel Check In')
                .length > 0 && (
                <ImageCard
                  title={'NORMAL CHECK IN'}
                  source={require('../../assets/home_lc.png')}
                  style={{
                    width: '100%',
                    height: '100%',
                    zIndex: -100,
                    position: 'absolute',
                    resizeMode: 'stretch',
                  }}
                  secondIcon={
                    <CheckBox
                      style={{zIndex: 100}}
                      onPress={() =>
                        this.setState({normal: true, travel: false})
                      }
                      checked={this.state.normal}
                      uncheckedIcon={
                        <Icon
                          name={'radio-btn-passive'}
                          color={Colors.white}
                          type="fontisto"
                        />
                      }
                      checkedIcon={
                        <Icon
                          name={'radio-btn-active'}
                          type="fontisto"
                          color={Colors.green}
                        />
                      }
                      checkedColor={Colors.green}
                      //disabled={this.state.travel}
                    />
                  }
                  backgroundColor={Colors.mainHeader[0]}
                  disabled
                  //onPress={() => alert('hit')}
                  //source={require('../../assets/password.png')}
                />
              )}
              {!this.state.travel && (
                <View>
                  {this.state.options.filter(e => e.name !== 'Travel Check In')
                    .length > 0 && (
                    <CustomPicker
                      label="Select Location"
                      selectedValue={this.state.geofenceId}
                      options={this.state.options.filter(
                        e => e.name !== 'Travel Check In',
                      )}
                      onValueChange={value =>
                        this.setState({geofenceId: value})
                      }
                    />
                  )}
                </View>
              )}
              <View style={{width: '96%', alignSelf: 'center',marginTop:10}}>
                <CustomLabel margin={0} size={14} title={'Reason'} />
                <TextArea
                  h={20}
                  placeholder="Enter your reason"
                  w="98%"
                  fontSize={16}
                  alignSelf="center"
                  marginBottom={5}
                  value={this.state.Reason}
                  onChangeText={text => this.setState({Reason: text})}
                  //maxW="300"
                />
              </View>
              <View style={{width: '50%', marginLeft: 13}}>
                <CustomLabel
                  title={`Check ${
                    this.state.checked_out === 'no' ? 'Out' : 'In'
                  } Time`}
                  size={14}
                  color={Colors.mainHeader[0]}
                />
                <TouchableOpacity
                  onPress={() => this.setState({showFirstTime: true})}>
                  <View
                    style={{
                      width: '100%',
                      //backgroundColor: SubThemeColor,
                      height: 40,
                      borderRadius: 5,
                      borderWidth: 0.5,
                      marginTop: 10,
                      justifyContent: 'center',
                      //alignItems: 'center',
                      paddingLeft: 10,
                    }}>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}>
                      <Icon
                        size={16}
                        name="clock"
                        color={'black'}
                        type={'entypo'}
                      />

                      <Text
                        style={[
                          styles.label,
                          {color: 'black', marginLeft: 10},
                        ]}>
                        {moment(this.state.time).format('h:mm a')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={false}
                  mode="time"
                  disabled
                  // display={'inline'}
                  //minimumDate={moment()}
                  onConfirm={time =>
                    this.setState({time, showFirstTime: false})
                  }
                  onCancel={() => this.setState({showFirstTime: false})}
                />
              </View>
            </View>
            <View style={{marginVertical: 20}}>
              <CustomButton
                title={`CHECK ${
                  this.state.checked_out === 'no' ? 'OUT' : 'IN'
                }`}
                width={'80%'}
                color={ThemeColor}
                onPress={this.makeRequest}
              />
            </View>
            {/* <View style={{marginVertical: 10}}>
             
              <ApprovalStages
                onPress={() => {}}
                width="100%"
                key={0}
                title="Approval Stages"
                color={SubThemeColor}
                headerColor={ThemeColor}
                Arr={this.state.ApprovalStages}
              />
             
            </View> */}
          </ScrollView>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  item: {
    borderRadius: 15,
    margin: 10,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 0.5,
    shadowColor: 'silver',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    height: hp('5'),
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000000',
  },
  labelContainer: {
    margin: '1.5%',
  },
  dateContainer: {
    backgroundColor: ThemeColor,
  },
});
