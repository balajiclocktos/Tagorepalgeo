import {VStack} from 'native-base';
import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SubHeader from '../common/DrawerHeader';
import CustomPicker from '../common/CustomPicker';
import {CustomList} from '../common/CustomList';
import {CustomButton} from '../common/CustomButton';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import {CustomList2} from '../common/CustomList2';
import {CustomTextArea} from '../common/CustomTextArea';
import {ApprovalStages} from '../common/ApprovalStages';
import {CalenderView} from '../common/CalenderView';
import axios from 'axios';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Nodata from '../common/NoData';
import {ActivityIndicator} from 'react-native';
import CustomLoader from '../Task Allocation/CustomLoader';
import {Colors} from '../../utils/configs/Colors';
import Error from '../popups/error';
import {Icon} from 'react-native-elements';
import CheckBox from 'react-native-check-box';
import SuccessError from '../common/SuccessError';
import {getAllReportees} from '../../utils/apis';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];
export default class Punch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LeaveType: '',
      Loader: true,
      Reason: '',
      ActivityLoader: true,
      NewArr: [],
      data: [],
      SelectedLeaveIdArr: [],
      ApprovalStages: [],
      ApproverLoading: true,
      tempIndex2: -1,
      tempIndex2: -1,
      //Attachment: {
      //  FileName: '',
      //  FileType: '',
      //  Attachment: '',
      //},
      Attachment: '',
      SelectedLeaveId: this.props.route.params
        ? this.props.route.params.SelectedLeaveId
          ? this.props.route.params.SelectedLeaveId
          : ''
        : '',
      FromDate: new Date().toISOString(),
      ToDate: new Date().toISOString(),
      AddUpdatePunch: [],
    };
  }
  componentDidMount() {
    this.retrieveData();
  }

  displayError = (msg, success) => {
    this.setState({showAlert: true, error_message: msg, success});
  };

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('bearer_token');
      if (value !== null) {
        //alert(value);
        this.setState({Token: value}, function () {});
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('institute_id');
      if (value !== null) {
        this.setState({institute_id: value}, function () {});
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('user_id');
      if (value !== null) {
        //alert(value);
        this.setState({StaffCode: value, user_id: value}, function () {
          this.setState({LeaveType: ''}, () => {
            this.GetLeaveTypeSubCategoriesByInstituteId();
          });
          this.AddUpdatePunch();
          this.GetMasterLeaveApproverDetails();
          this.fetchAllReportees(value);
        });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
  };

  fetchAllReportees = async staffCode => {
    const reportees = await getAllReportees();
    console.log('resportees', reportees);
    if (reportees?.length > 0) {
      const allReportees = [{staffCode, name: 'Self'}, ...reportees];
      this.setState({
        showReporteesDropdown: true,
        reportees: allReportees,
        //reporteeStaffCode: staffCode,
      });
    }
  };

  GetLeaveTypeSubCategoriesByInstituteId = async id => {
    const url =
      Const +
      'api/Leave/GetLeaveTypeSubCategoriesByInstituteId?instituteId=' +
      this.state.institute_id +
      '&leaveRequestId=' +
      this.state.SelectedLeaveId +
      '&staffCode=' +
      this.state.StaffCode;
    console.log('GetLeaveTypeSubCategoriesByInstituteId Url = ', url);
    try {
      const response = await axios.get(url);
      console.log('GetLeaveTypeSubCategoriesByInstituteId =', response.data);
      let SelectedLeaveIdArr = this.state.SelectedLeaveIdArr;
      response.data.map(item => {
        SelectedLeaveIdArr.push({
          createdDate: item.createdDate,
          id: item.leaveId,
          instituteId: item.instituteId,
          isActive: item.isActive,
          name: item.leaveName,
          leaveRequestTypeId: item.leaveRequestTypeId,
          modifiedDate: item.modifiedDate,
          shortForm: item.shortForm,
          isAttachmentMandatory: item.isAttachmentMandatory,
        });
      });
      this.setState(
        {
          Loader: false,
          SelectedLeaveIdArr,
          CustomListLoader: false,
        },
        function () {
          response.data.length >= 1 &&
            this.setState({
              LeaveType: this.state.SelectedLeaveIdArr[0].id,
            });
          response.data.length == 0 &&
            Alert.alert(
              'Alert',
              'You have not assigned any Missed Punch. You can Select different Missed Punch types.',
              [
                {
                  text: 'Stay Here',
                  onPress: () => console.log('stay here pressed'),
                },
                {
                  text: 'Go Back',
                  onPress: () => this.props.navigation.goBack(),
                },
              ],
              {
                cancelable: false,
              },
            );
        },
      );
    } catch (error) {
      this.setState({CustomListLoader: false});
      this.displayError(error.message, false);
    }
  };
  GetMasterLeaveApproverDetails = async () => {
    //const url = `https://insproplus.com/palgeoapi/api/Leave/GetMasterLeaveApproverDetails/${this.state.institute_id}/${this.state.StaffCode}/${this.state.SelectedLeaveId}`;
    const url = `http://182.71.102.212/palgeoapi/api/Leave/GetMasterLeaveApproverDetailsByMainType/${this.state.institute_id}/${this.state.StaffCode}/${this.state.SelectedLeaveId}`;
    console.log(url);
    try {
      const response = await axios.get(url);
      console.log(
        'missed punch GetMasterLeaveApproverDetails = ',
        response.data,
      );
      this.setState(
        {
          Loader: false,
          ApprovalStages: response.data,
          ApproverLoading: false,
        },
        function () {
          this.state.ApprovalStages.length == 0 &&
            Alert.alert(
              'Alert',
              'No approver found.',
              [
                //{
                //  text: 'Stay Here',
                //  onPress: () => console.log('cancel pressed'),
                //  style: 'cancel',
                //},
                {
                  text: 'Go Back',
                  onPress: () => this.props.navigation.goBack(),
                },
              ],
              {
                cancelable: false,
              },
            );
        },
      );
    } catch (error) {
      this.setState({ApproverLoading: false});
      this.displayError(error.message, false);
    }
  };
  AddUpdatePunch = async () => {
    //let date = new Date();
    const url =
      Const +
      'api/Leave/IdentifyMissedPunchTimestamps/' +
      this.state.institute_id +
      '/' +
      this.state.StaffCode;
    //let bodyData = {
    //  InstituteId: parseInt(this.state.institute_id),
    //  StaffCode: this.state.StaffCode,
    //  //FromDate: new Date(date.getFullYear(), date.getMonth(), 2).toISOString(),
    //  //ToDate: this.state.ToDate,

    //  //InstituteId: 2,
    //  //StaffCode: 'PW100',
    //  //FromDate: '2018-07-07T11:44:09.417Z',
    //  //ToDate: '2021-07-07T11:44:09.417Z',
    //};
    //console.log(url, bodyData);
    try {
      const response = await axios.get(url);
      console.log('missed_puches url =>>', url);
      console.log('missed_puches =>>', response.data);
      this.setState(
        {
          Loader: false,
          ActivityLoader: false,
          AddUpdatePunch: response.data,
        },
        () => {
          const NewArr = this.state.AddUpdatePunch.map((item2, index2) => {
            return {
              AccessDate: item2.accessDate,
              actualCheckinTime: item2.actualCheckinTime,
              actualCheckoutTime: item2.actualCheckoutTime,
              checkinDelayTime: item2.checkinDelayTime,
              CheckinRowId: item2.checkinRowId,
              checkoutEarlyTime: item2.checkoutEarlyTime,
              CheckoutRowId: item2.checkoutRowId,
              scheduledCheckinTime: item2.scheduledCheckinTime,
              scheduledCheckoutTime: item2.scheduledCheckoutTime,
              ApproveInTime: false,
              ApproveOutTime: false,
              isCheckIn: item2.isCheckIn,
              rowId: item2.rowId,
              Reason: this.state.Reason,
            };
          });
          this.setState({NewArr: NewArr || []}, () => {
            if (this.state.NewArr.length === 0) {
              this.displayError('You do not have any missed punches.', false);
              //return this.props.navigation.goBack();
            }
          });
        },
      );
    } catch (error) {
      this.setState({ActivityLoader: false});
      this.displayError(error.message, false);
    }
  };

  AddLeave = async data => {
    const url = Const + 'api/Leave/RequestToModifyMissedPunchTimings';
    const days = data.map(e => {
      return {accessDate: e.AccessDate};
    });
    const uniques = Object.values(
      days.reduce((a, c) => {
        a[c.accessDate] = c;
        return a;
      }, {}),
    );

    let bodyData = {
      Id: 0,
      InstituteId: parseInt(this.state.institute_id),
      RequestTypeId: parseInt(this.state.LeaveType),
      StaffCode: this.state.StaffCode,
      RaisedByStaffCode: this.state.user_id,
      NoOfDays: uniques.length,
      PunchDetails: data,
      MissedPunchAttachment: this.state.Attachment,
      //Reason: this.state.Reason,
      //PunchDetails: [
      //  {
      //    Reason: this.state.Reason,
      //    AccessDate: this.state.SelectedData.accessDate,
      //    CheckinRowId: parseInt(this.state.SelectedData.checkinRowId),
      //    CheckoutRowId: parseInt(this.state.SelectedData.checkoutRowId),
      //    ApproveInTime: this.state.ApproveInTime,
      //    ApproveOutTime: this.state.ApproveOutTime,
      //  },
      //],
    };
    console.log(url);
    console.log(bodyData);

    try {
      const response = await axios.post(url, bodyData);
      console.log(JSON.stringify(response.data));
      if (response.data.status == true) {
        this.setState(
          {
            loader: false,
          },
          function () {
            setTimeout(() => this.props.navigation.navigate('Leaves'), 3000);
            this.displayError(response.data.message, true);
          },
        );
      } else {
        this.setState({loader: false});
        this.displayError(response.data.message, false);
      }
    } catch (error) {
      this.setState({loader: false});
      this.displayError(error.message, false);
    }
  };
  convertFrom24To12Format = time24 => {
    const [sHours, minutes] = time24.match(/([0-9]{1,2}):([0-9]{2})/).slice(1);
    const period = +sHours < 12 ? 'AM' : 'PM';
    const hours = +sHours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
  };
  render() {
    if (this.state.Loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <SuccessError
          error={!this.state.success}
          subTitle={this.state.error_message}
          isVisible={this.state.showAlert}
          deleteIconPress={() => this.setState({showAlert: false})}
        />
        <SubHeader
          title="Punch"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
        {this.state.loader && (
          <CustomLoader loaderText={'Trying to raise your request'} />
        )}
        <ScrollView
          nestedScrollEnabled={true}
          contentContainerStyle={{paddingBottom: 100}}>
          {this.state.SelectedLeaveIdArr.length > 1 && (
            <View
              style={{
                width: '100%',
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <CustomPicker
                label="Select Type"
                //label="You can choose type here"
                selectedValue={this.state.LeaveType}
                options={this.state.SelectedLeaveIdArr}
                onValueChange={value => {
                  this.setState({LeaveType: value}, () => {
                    this.AddUpdatePunch();
                    this.setState({ApproverLoading: true});
                  });
                }}
              />
            </View>
          )}
          {this.state.showReporteesDropdown && (
            <CustomPicker
              label={'Select Reportee'}
              height={hp('11')}
              selectedValue={this.state.StaffCode}
              onValueChange={value =>
                this.setState({StaffCode: value}, () => {
                  //this.GetDetailedLeaves();
                  this.GetLeaveTypeSubCategoriesByInstituteId(
                    this.state.SelectedLeaveId,
                  );
                  this.GetMasterLeaveApproverDetails();
                  this.AddUpdatePunch();
                })
              }
              options={this.state.reportees.map(e => {
                return {
                  id: e.staffCode,
                  name: e.name,
                };
              })}
            />
          )}
          <VStack>
            <View
              style={{
                width: '95%',
                alignSelf: 'center',
                marginTop: 10,
                backgroundColor: 'transparent',
                borderRadius: 10,
                minHeight: 200,
                maxHeight: 340,
              }}>
              <ScrollView nestedScrollEnabled={true}>
                {this.state.NewArr.length ? (
                  this.state.NewArr.map((item, index) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          let mod = this.state.NewArr;
                          if (item.isCheckIn) {
                            mod[index].ApproveInTime =
                              !mod[index].ApproveInTime;

                            this.setState({NewArr: [...mod]});
                            return;
                          }
                          mod[index].ApproveOutTime =
                            !mod[index].ApproveOutTime;

                          this.setState({NewArr: [...mod]});
                          ///console.log('NewArr==', this.state.NewArr),

                          return;
                        }}>
                        <View
                          key={index}
                          style={[
                            styles.headerContainer,
                            {
                              marginTop: 5,
                              paddingHorizontal: 0,
                              backgroundColor: SubThemeColor,
                              height: 80,
                              borderRadius: 5,
                            },
                          ]}>
                          <View
                            style={{
                              //alignItems: 'center',
                              width: '40%',
                              height: '100%',
                              justifyContent: 'space-evenly',

                              paddingLeft: 10,
                              //backgroundColor: 'yellow',
                            }}>
                            <View
                              style={{
                                width: '100%',
                                alignItems: 'center',
                                flexDirection: 'row',
                              }}>
                              <Icon
                                size={16}
                                name="calendar"
                                color={'#1B6AEC'}
                                type={'entypo'}
                              />
                              <Text
                                style={[
                                  styles.text,
                                  {
                                    fontSize: 14,
                                    marginLeft: 10,
                                    color: 'black',
                                  },
                                ]}>
                                {moment(item.AccessDate).format('DD.MM.YYYY')}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: '100%',
                                alignItems: 'center',
                                flexDirection: 'row',
                              }}>
                              <Icon
                                size={16}
                                name="clock"
                                color={'#1B6AEC'}
                                type={'entypo'}
                              />
                              <Text
                                style={[
                                  styles.text,
                                  {
                                    fontSize: 14,
                                    marginLeft: 10,
                                    color: 'black',
                                  },
                                ]}>
                                Schedule :{' '}
                                {item.isCheckIn
                                  ? item.scheduledCheckinTime.slice(0, 5)
                                  : item.scheduledCheckoutTime.slice(0, 5)}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              backgroundColor: 'transparent',
                              borderRadius: 10,
                              width: '40%',
                              height: '100%',
                              paddingLeft: 10,
                              justifyContent: 'space-evenly',
                            }}>
                            <View
                              style={{
                                width: '70%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 25,
                                backgroundColor: '#1B6AEC',
                                borderRadius: 5,
                              }}>
                              <Text
                                style={[
                                  styles.text,
                                  {
                                    fontSize: 14,
                                    marginHorizontal: 10,

                                    color: 'white',
                                  },
                                ]}>
                                {item.isCheckIn ? 'Check In' : 'Check Out'}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: '100%',
                                alignItems: 'center',
                                flexDirection: 'row',
                              }}>
                              <Icon
                                size={16}
                                name="clock"
                                color={'#1B6AEC'}
                                type={'entypo'}
                              />
                              <Text
                                style={[
                                  styles.text,
                                  {
                                    fontSize: 14,
                                    marginLeft: 10,
                                    color: 'black',
                                    //marginHorizontal: 10,
                                  },
                                ]}>
                                Actual :{' '}
                                {item.isCheckIn
                                  ? item.actualCheckinTime.slice(0, 5)
                                  : item.actualCheckoutTime.slice(0, 5)}
                              </Text>
                            </View>
                          </View>

                          <View
                            style={[
                              styles.headerTitleContainer,
                              {
                                backgroundColor: 'transparent',
                                borderRadius: 10,
                                alignItems: 'center',
                                width: '20%',
                              },
                            ]}>
                            <CheckBox
                              isChecked={
                                (this.state.NewArr.length &&
                                  this.state.NewArr[index].ApproveInTime) ||
                                this.state.NewArr[index].ApproveOutTime
                                  ? true
                                  : false
                              }
                              onClick={() => {
                                let mod = this.state.NewArr;
                                if (item.isCheckIn) {
                                  mod[index].ApproveInTime =
                                    !mod[index].ApproveInTime;

                                  this.setState({NewArr: [...mod]});
                                  return;
                                }
                                mod[index].ApproveOutTime =
                                  !mod[index].ApproveOutTime;

                                this.setState({NewArr: [...mod]});
                                ///console.log('NewArr==', this.state.NewArr),

                                return;
                              }}
                              checkedCheckBoxColor="#1B6AEC"
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View
                    style={{
                      width: '100%',
                      height: 150,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {this.state.ActivityLoader ? (
                      <ActivityIndicator color={ThemeColor} />
                    ) : (
                      <Text>No Record Found</Text>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
            <View style={{marginTop: 20}}>
              <CustomTextArea
                isAttachmentMandatory={
                  this.state.SelectedLeaveIdArr.length > 0 &&
                  this.state.SelectedLeaveIdArr[0].isAttachmentMandatory
                }
                onPress2={() => {
                  this.setState({
                    Attachment: {
                      FileName: '',
                      FileType: '',
                      Attachment: '',
                    },
                  });
                }}
                SelectedImage={Attachment => {
                  this.setState({Attachment});
                }}
                text={this.state.Attachment.FileName || 'No files attached'}
                title="Reason"
                height={100}
                backgroundColor={SubThemeColor}
                placeholderTextColor={ThemeColor}
                width="95%"
                placeholder="Write reason here"
                value={this.state.Reason}
                onChangeText={text => {
                  this.setState({Reason: text});
                }}
                onPress={() => {
                  let data = this.state.NewArr;
                  data = data
                    .filter(
                      item =>
                        (item.ApproveInTime == true &&
                          item.ApproveOutTime == true) ||
                        (item.ApproveInTime == true &&
                          item.ApproveOutTime == false) ||
                        (item.ApproveInTime == false &&
                          item.ApproveOutTime == true),
                    )
                    .map(
                      ({
                        Reason,
                        AccessDate,
                        CheckinRowId,
                        CheckoutRowId,
                        ApproveInTime,
                        ApproveOutTime,
                        isCheckIn,
                        rowId,
                      }) => ({
                        Reason: this.state.Reason,
                        AccessDate,
                        CheckinRowId,
                        CheckoutRowId,
                        ApproveInTime,
                        ApproveOutTime,
                        isCheckIn,
                        rowId,
                      }),
                    );
                  // console.log('data = ', data);
                  this.setState({data});
                  // console.log('data length = ', data.length);
                  if (
                    this.state.LeaveType == '' ||
                    this.state.LeaveType == null
                  ) {
                    this.displayError(
                      'You have not assigned any Missed Punch for this type ',
                      false,
                    );
                  } else if (this.state.Reason == '') {
                    this.displayError('Please add reason', false);
                  } else if (data.length == 0) {
                    this.displayError(
                      'Please select missed punch check in / check out time',
                      false,
                    );
                  } else if (
                    this.state.SelectedLeaveIdArr[0].isAttachmentMandatory &&
                    !this.state.Attachment.FileName
                  ) {
                    this.displayError('Attachment is missing.', false);
                  } else {
                    this.setState({loader: true});
                    this.AddLeave(data);
                  }
                }}
              />
            </View>
            <View style={{marginVertical: 20}}>
              {this.state.ApprovalStages.length > 0 ||
              !this.state.ApproverLoading ? (
                <ApprovalStages
                  onPress={() => {}}
                  width="95%"
                  key={0}
                  title="Approval Stages"
                  color={SubThemeColor}
                  headerColor={ThemeColor}
                  Arr={this.state.ApprovalStages}
                />
              ) : (
                <View>
                  <ActivityIndicator />
                  <Text style={{alignSelf: 'center', marginTop: 10}}>
                    Fetching Approver List...
                  </Text>
                </View>
              )}
            </View>
          </VStack>
        </ScrollView>
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
    textAlign: 'center',
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
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'white',
  },
  headerContainer: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitleContainer: {
    //flex: 1,
    width: '25%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
