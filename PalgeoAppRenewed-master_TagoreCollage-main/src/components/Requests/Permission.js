import { TextArea, VStack } from 'native-base';
import React, { Component } from 'react';
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
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SubHeader from '../common/DrawerHeader';
//import CustomPicker from '../common/CustomPicker';
//import {CustomList} from '../common/CustomList';
//import {CustomButton} from '../common/CustomButton';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
//import {CustomList2} from '../common/CustomList2';
import { CustomTextArea } from '../common/CustomTextArea';
import { ApprovalStages } from '../common/ApprovalStages';
import { CalenderView } from '../common/CalenderView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomPicker from '../common/CustomPicker';
import CustomLoader from '../Task Allocation/CustomLoader';
import CustomModal from '../common/CustomModal';
import CustomLabel from '../common/CustomLabel';
import { CheckBox, Icon } from 'react-native-elements';
import { Colors } from '../../utils/configs/Colors';
import Error from '../popups/error';
import { CalenderView2 } from '../common/CalenderView2';
import AlternateStaffComp from './AlternateStaffComp';
import { isIOS } from '../../utils/configs/Constants';
import SuccessError from '../common/SuccessError';
import { CustomSelect } from '../common';
import { getAllReportees, noTokenAPi } from '../../utils/apis';
import { flexDirection } from 'styled-system';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];

const screenWidth = Dimensions.get('window').width;
export default class Permission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SelectedLeaveIdArr: [],
      FinalArr: [],
      LeaveType: '',
      date: moment().format('YYYY-MM-DD'),
      time: "",
      time2: "",
      // time: new Date(),
      // time2: new Date(),
      ApprovalStages: [],
      showFirstTime: false,
      showSecondTime: false,
      Attachment: '',
      Loader: true,
      availedMonthCount: '00',
      availedYearCount: '00',
      Reason: '',
      selectedStaff: [],
      alternateReason: '',
      departments: [],
      staffList: [],
      allStaffs: [],
      reportees: [],
      reporteeStaffCode: '',
      showReporteesDropdown: false,
      date: new Date(),
      FirstHalfTimeShow: true,
      seconedhalfTimeShow: false,
      showSeconedDatePicker: false,
      SecondHalfFromTime: "",
      ShowSeconedToTime: false,
      SeconedHalToTimedata: "",

      //Attachment: {
      //  FileName: '',
      //  FileType: '',
      //  Attachment: '',
      //},
      SelectedLeaveId: this.props.route.params
        ? this.props.route.params.SelectedLeaveId
          ? this.props.route.params.SelectedLeaveId
          : ''
        : '',
    };
  }
  componentDidMount() {
    this.retrieveData();
  }

  displayErrorMsg = (msg, showAlert, error) => {
    this.setState({ showAlert, error_message: msg, error }, () => {
      if (isIOS) {
        alert(msg);
      }
    });
  };

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('org_id');
      if (value !== null) {
        this.setState({ org_id: value }, () => { });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('bearer_token');
      if (value !== null) {
        //alert(value);
        this.setState({ Token: value }, function () { });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('institute_id');
      if (value !== null) {
        this.setState({ institute_id: value }, function () {
          this.getAllStaff();
          this.getDepartments(value, this.state.Token);
        });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('user_id');
      if (value !== null) {
        //alert(value);
        this.setState({ StaffCode: value, user_id: value }, function () {
          this.setState({ LeaveType: '' }, () => {
            this.GetLeaveTypeSubCategoriesByInstituteId();
          });
          this.GetMasterLeaveApproverDetails();
          this.getAvailedPermissions();
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
      const allReportees = [{ staffCode, name: 'Self' }, ...reportees];
      this.setState({
        showReporteesDropdown: true,
        reportees: allReportees,
        //reporteeStaffCode: staffCode,
      });
    }
  };

  getDepartments = (institue, bearer_token) => {
    console.log(bearer_token);
    // this.setState({loader: true});
    fetch(Const + 'api/Master/GetDepartment/' + institue, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
        Authorization: 'Bearer ' + bearer_token,
      },
    })
      .then(response => response.json())
      .then(json => {
        console.log('json_sssss', json);
        // this.setState({loader: false});
        if (json.length > 0) {
          let temparr = [];
          var currentArr = json;
          currentArr.map((item, index) => {
            var obj = {
              // id: item.id.toString(),
              id: item.department,
              name: item.department,
            };
            temparr.push(obj);
          });
          console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^666")
          console.log(JSON.stringify(temparr))
          console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^666")
          this.setState({ departments: temparr });
        } else {
          this.setState({ departments: [] });
        }
      })
      .catch(error => {
        // this.setState({loader: false});
      });
  };
  getAllStaff = async () => {
    const { org_id, institute_id } = this.state;
    const url = `api/Staff/staffwithId/all/${org_id}/${institute_id}`;
    console.log(url);
    try {
      const res = await noTokenAPi.get(url);
      console.log('getAllStaff = ', res.data);
      const response = res.data.map(e => {
        return {
          id: e.staffCode,
          name: `${e.name} - ${e.staffCode}`,
          department: e.department,
        };
      });
      this.setState({ allStaffs: response }, () => {
        console.log('allStaffs ==== ', this.state.allStaffs);
      });
    } catch (error) {
      alert(error);
    }
  };
  getAvailedPermissions = async () => {
    const url = Const + 'api/Leave/PermissionsRequestedInfo';
    const body = {
      staffCode: this.state.StaffCode,
      InstituteId: this.state.institute_id,
      Date: new Date().toISOString(),
    };
    try {
      const response = await axios.post(url, body);
      const { data } = response;
      console.log('data', data);
      this.setState({
        availedMonthCount:
          data.currentMonth < 10 ? '0' + data.currentMonth : data.currentMonth,
        availedYearCount:
          data.currentYear < 10 ? '0' + data.currentYear : data.currentYear,
      });
    } catch (e) {
      this.displayErrorMsg(
        'Error calculating availed permissions: ' + e.message,
      );
    }
  };
  GetLeaveTypeSubCategoriesByInstituteId = async () => {
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
        });
      });
      this.setState(
        { Loader: false, SelectedLeaveIdArr, FinalArr: response.data },
        function () {
          // if (this.state.LeaveType !== '') {
          //   this.getDetailedLeave();
          // }
          response.data.length == 1 &&
            this.setState({ LeaveType: this.state.SelectedLeaveIdArr[0].id });
          response.data.length == 0 &&
            Alert.alert(
              'Alert',
              'You have not assigned any Permission. You can Select different Permission types.',
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
      this.displayErrorMsg('Error: ' + error.message);
    }
  };
  GetMasterLeaveApproverDetails = async id => {
    //const url = `https://insproplus.com/palgeoapi/api/Leave/GetMasterLeaveApproverDetails/${this.state.institute_id}/${this.state.StaffCode}/${this.state.SelectedLeaveId}`;
    const url = `http://182.71.102.212/palgeoapi/api/Leave/GetMasterLeaveApproverDetailsByMainType/${this.state.institute_id}/${this.state.StaffCode}/${this.state.SelectedLeaveId}`;

    console.log(url);
    try {
      const response = await axios.get(url);
      console.log('aproval stages', response.data);
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
      console.log('error', error);
      this.setState({ ApproverLoading: false });
      this.displayErrorMsg(error.message);
    }
  };
  DateCheckerFunction() {
    if (
      new Date(this.state.time).getTime() > new Date(this.state.time2).getTime()
    ) {
      this.displayErrorMsg('Start time cannot be more than end time!');
      this.setState({ time2: this.state.time });
      return false;
    }
    return true;
  }
  AddUpdateLeaveRequestNew = async NewLeavesArr => {
    const result = this.DateCheckerFunction();
    if (!result)
      return this.displayErrorMsg(
        'Start time cannot be more than end time!',
        true,
        true,
      );
    const device_token = await AsyncStorage.getItem('device_token');
    const url = Const + 'api/Leave/AddUpdateLeaveRequestNew';
  
    const fromDate = new Date(this.state.time).getTime();
    const endDate = new Date(this.state.time2).getTime();
    const diffSeconds = endDate - fromDate;
    const diffeHours = diffSeconds / 3600000;
    const difference = parseInt(diffeHours / 24) + 1;
    console.log('dd', difference);
    console.log("****************isSecondHalfOverLapping*********************")
    console.log(JSON.stringify(this.state.seconedhalfTimeShow));
    // var objjLeaveDate = [];
    var time = this.state.time;
    var time2 = this.state.time2;
    if(this.state.seconedhalfTimeShow){
      time = this.state.SecondHalfFromTime;
      time2 = this.state.SeconedHalToTimedata;
    }
    console.log("****************");
    let bodyData = {
      Id: 0,
      MobileDeviceToken: device_token,
      InstituteId: parseInt(this.state.institute_id),
      StaffCode: this.state.StaffCode.toString(),
      RaisedByStaffCode: this.state.user_id,
      LeaveTypeId: parseInt(this.state.LeaveType),
      LeaveDates: [
        {
          Id: 0,
          DatesSelected: new Date(this.state.date).toISOString(),
          FirstHalf: true,
          SecondHalf: true,
          FHFromTime: time,
          FHToTime: time2,
          SHFromTime: this.state.SecondHalfFromTime,
          SHToTime: this.state.SeconedHalToTimedata,
        },
      ],
      FromDate: time,
      EndDate: time2,
      FromTime: time,
      ToTime: time2,
      FHFromTime: time,
      FHToTime: time2,
      SHFromTime: this.state.SecondHalfFromTime,
      SHToTime: this.state.SeconedHalToTimedata,
      Reason: this.state.Reason,
      LeaveAttachment: this.state.Attachment,
      NoOfDays: 1,
      AlternateStaff: this.state.selectedStaff.length
        ? this.state.allStaffs.find(e => e.id === this.state.selectedStaff[0])
          .name
        : '',
      AlternateStaffReason: this.state.alternateReason,
      Status: 0,
      CreatedDate: new Date().toISOString(),
      ModifiedDate: new Date().toISOString(),
    };

    

    console.log("*********************")
    console.log(url);
    console.log(JSON.stringify(bodyData));
    console.log("*********************")

    try {
      const response = await axios.post(url, bodyData);
      console.log('working');
      console.log(JSON.stringify(response.data));
      if (response.data.status == true) {
        this.setState(
          {
            loader: false,
          },
          function () {
            setTimeout(() => this.props.navigation.navigate('Leaves'), 3000);
            this.displayErrorMsg(response.data.message, true, false);
          },
        );
      } else {
        this.setState({ loader: false });
        const dates = response.data.overlappingDatesInfo;
        const overflowDates = response.data.occupiedLeaves;
        console.log("dates--dates", dates)
        if (dates?.length > 0) {
          this.setState({ overlappingDatesInfo: dates }, () => {
            this.setState({ showModal: true });
          });
        } else if (overflowDates?.length > 0) {
          this.setState({ overflowDates }, () => {
            this.setState({ showModal1: true });
          });
        } else {
          this.displayErrorMsg(response.data.message, true, true);
        }
      }
    } catch (error) {
      this.setState({ loader: false });
      this.displayErrorMsg(error.message, true, true);
    }
  };

  handleConfirm1 = time => {
    console.log("********first half***********")
    console.log(time);
    console.log('time', time);
    if (
      moment(this.state.date).format('YYYY-MM-DD') ===
      moment().format('YYYY-MM-DD')
    ) {
      // if (moment(time) < moment()) {
      //   this.setState({ time: new Date(), time2: new Date() });
      //   return this.displayErrorMsg('Time cannot be less than current time');
      // }
    }
    this.setState({
      time,
      //  time2: time
    }, () => this.hideDatePicker1());
  };
  handleConfirm0 = date => {
    console.log('date', date);
    this.setState({ date }, () => this.hideDatePicker0());
  };
  handleConfirm2 = timevar => {
    
    console.log("********second half***********")
    console.log(timevar);
    this.setState({ time2: timevar }, () => this.hideDatePicker2());
    this.setState({
      // time,
      //  time2: time
    }, () => this.hideDatePicker1());
  };

  hideDatePicker0 = () => {
    this.setState({ showDate: false }, () =>
      this.handleConfirm1(this.state.time),
    );
  };
  hideDatePicker1 = () => {
    if (this.state.time && this.state.time2) {
      //this.DateCheckerFunction()
    }
    this.setState({ showFirstTime: false });
  };
  hideDatePicker2 = () => {
    if (this.state.time && this.state.time2) {
      this.DateCheckerFunction();
    }
    this.setState({ showSecondTime: false });
  };

  HaldleSecondFromTime = (time) => {
    console.log("****--> from time")
    console.log(console.log(time))
    // this.setState({ time: time });
    this.setState({ SecondHalfFromTime: time, showSeconedDatePicker: false })
  }

  handleShowSeconedToTime = (time) => {
    console.log("****--->To time:")
    console.log(time)
    // this.setState({ time2: time });
    this.setState({ SeconedHalToTimedata: time, ShowSeconedToTime: false })
  }
  render() {
    if (this.state.Loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <SuccessError
          subTitle={this.state.error_message}
          error={this.state.error}
          isVisible={this.state.showAlert}
          deleteIconPress={() => this.setState({ showAlert: false })}
        />
        <SubHeader
          title="Permission"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
        {this.state.loader && (
          <CustomLoader loaderText={'Trying to raise your request'} />
        )}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <VStack>
            {this.state.showModal && (
              <CustomModal
                title={'Overlapping Request Dates'}
                isVisible={this.state.showModal}
                deleteIconPress={() => this.setState({ showModal: false })}>
                {this.state.overlappingDatesInfo?.length &&
                  this.state.overlappingDatesInfo.map((item, i) => {
                    return (
                      <View
                        key={i}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                          width: '100%',
                          alignItems: 'center',
                          borderBottomColor: Colors.overlay,
                          borderBottomWidth: 1,
                          marginBottom: 5,
                        }}>
                        <View style={{ width: '40%' }}>
                          <CustomLabel
                            //containerStyle={{width: '40%'}}
                            title={moment(item.date).format('DD.MM.YYYY')}
                          />
                          <CustomLabel title={item.leaveRequestType} />
                        </View>
                        <View style={{ width: '40%' }}>
                          <CheckBox
                            containerStyle={{
                              padding: 0,
                              backgroundColor: 'transparent',
                              minHeight: 50,
                              elevation: 0,
                            }}
                            title={'First Half'}
                            checked={item.isFirstHalfOverLapping}
                            disabled
                            checkedColor={Colors.calendarBg}
                          />
                          <CheckBox
                            containerStyle={{
                              padding: 0,
                              backgroundColor: 'transparent',
                              minHeight: 50,
                              elevation: 0,
                            }}
                            title={'Second Half'}
                            checked={item.isSecondHalfOverLapping}
                            disabled
                            checkedColor={Colors.calendarBg}
                          />
                        </View>
                      </View>
                    );
                  })}
              </CustomModal>
            )}

            {this.state.showModal1 && (
              <CustomModal
                title={'Occupied Request Dates'}
                isVisible={this.state.showModal1}
                deleteIconPress={() => this.setState({ showModal1: false })}>
                {this.state.occupiedDates?.length > 0 &&
                  this.state.occupiedDates.map((item, i) => {
                    return (
                      <View
                        key={i}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                          width: '100%',
                          alignItems: 'center',
                          borderBottomColor: Colors.overlay,
                          borderBottomWidth: 1,
                          marginBottom: 5,
                        }}>
                        <View style={{ width: '40%' }}>
                          <CustomLabel
                            //containerStyle={{width: '40%'}}
                            title={moment(item.date).format('DD.MM.YYYY')}
                          />
                        </View>
                        <View style={{ width: '40%' }}>
                          <CheckBox
                            containerStyle={{
                              padding: 0,
                              backgroundColor: 'transparent',
                              elevation: 0,
                            }}
                            title={'Allowed'}
                            checked={item.allowed}
                            disabled
                            checkedColor={Colors.calendarBg}
                          />
                        </View>
                      </View>
                    );
                  })}
              </CustomModal>
            )}

            {this.state.showReporteesDropdown && (
              <CustomPicker
                label={'Select Reportee'}
                height={hp('11')}
                selectedValue={this.state.StaffCode}
                onValueChange={value =>
                  this.setState({ StaffCode: value }, () => {
                    //this.GetDetailedLeaves();
                    this.GetLeaveTypeSubCategoriesByInstituteId(
                      this.state.SelectedLeaveId,
                    );
                    this.GetMasterLeaveApproverDetails();
                    this.getAvailedPermissions();
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

            <CalenderView2
              mainTitle="Total availed"
              title="CURRENT MONTH"
              date={this.state.availedMonthCount.toString() || '00'}
              backgroundColor={'white'}
              width={'100%'}
            />
            <CalenderView2
              mainTitle="Total availed"
              title="CURRENT YEAR"
              date={this.state.availedYearCount.toString() || '00'}
              backgroundColor={'white'}
              width={'100%'}
            />
            {this.state.SelectedLeaveIdArr.length > 1 && (
              <CustomPicker
                label="You can choose type here"
                selectedValue={this.state.LeaveType}
                options={this.state.SelectedLeaveIdArr}
                onValueChange={value => {
                  this.setState({ LeaveType: value }, () => {
                    this.setState({ ApproverLoading: true });
                  });
                }}
              />
            )}

            <View >
              <View
                style={{
                  width: '100%',
                  backgroundColor: 'white',
                  paddingLeft: 9,
                }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Date</Text>
                  <View style={{ flexDirection: "row", width: "100%" }}>
                    <TouchableOpacity onPress={() => this.setState({ showDate: true })}
                      style={{
                        width: screenWidth / 2.3,
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
                            { color: ThemeColor, marginLeft: 10 },
                          ]}>
                          {moment(this.state.date).format('DD.MM.YYYY')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View style={{ width: '40%', }}>
                      <CheckBox
                        containerStyle={{
                          padding: 0,
                          backgroundColor: 'transparent',
                          elevation: 0,
                        }}
                        title={'First Half'}
                        onIconPress={() => {
                          this.setState({ FirstHalfTimeShow: !this.state.FirstHalfTimeShow }, () => {
                            // this.setState({seconedhalfTimeShow : false})
                          })
                        }}
                        checked={this.state.FirstHalfTimeShow}
                        disabled
                        checkedColor={Colors.calendarBg}
                      />
                      <CheckBox
                        containerStyle={{
                          padding: 0,
                          backgroundColor: 'transparent',
                          elevation: 0,
                        }}
                        title={'Second Half'}
                        onIconPress={() => {
                          this.setState({ seconedhalfTimeShow: !this.state.seconedhalfTimeShow }, () => {
                            // this.setState({FirstHalfTimeShow : false})
                          })
                        }}
                        checked={this.state.seconedhalfTimeShow}
                        disabled
                        checkedColor={Colors.calendarBg}
                      />
                    </View>
                  </View>
                </View>
                <DateTimePickerModal
                  isVisible={this.state.showDate}
                  mode="date"
                  // date={new Date()}
                  // minimumDate={this.state.date.getDate() - 1}
                  minimumDate={new Date()}
                  onConfirm={this.handleConfirm0}
                  onCancel={this.hideDatePicker0}
                />
              </View>
            </View>

            <View
              style={{
                width: '100%',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                // flexDirection: 'row',
                alignSelf: 'center',
                marginTop: 10,
                paddingBottom: 10,
                backgroundColor: 'white',
                //marginTop: "4%",
              }}>
              {/* {this.state.FirstHalfTimeShow ? <> */}
              {this.state.FirstHalfTimeShow && <>
                <Text style={{ alignSelf: "center", width: "90%", textAlign: "left", fontWeight: "bold" }}>First half Timing : -</Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ showFirstTime: true })}>
                    <View style={{ width: '100%' }}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>From Time</Text>
                        <View
                          style={{
                            width: screenWidth / 2.3,
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
                                { color: ThemeColor, marginLeft: 10 },
                              ]}>
                              {moment(this.state.time).format('h:mm a')}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <DateTimePickerModal
                        isVisible={this.state.showFirstTime}
                        mode="time"
                        // minimumDate={new Date(Date.now() - 86400000)}
                        // date={new Date(Date.now() - 86400000)}
                        onConfirm={this.handleConfirm1}
                        onCancel={this.hideDatePicker1}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({ showSecondTime: true })}>
                    <View style={{ width: '100%' }}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>To Time</Text>
                        <View
                          style={{
                            width: screenWidth / 2.3,
                            //backgroundColor: SubThemeColor,
                            borderWidth: 0.5,
                            marginTop: 10,
                            height: 40,
                            borderRadius: 5,
                            justifyContent: 'center',
                            paddingLeft: 10,
                            //alignItems: 'center',
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
                                { color: ThemeColor, marginLeft: 10 },
                              ]}>
                              {moment(this.state.time2).format('h:mm a')}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <DateTimePickerModal
                        isVisible={this.state.showSecondTime}
                        mode="time"
                        value={this.state.time2}
                        // date={new Date()}
                        onConfirm={this.handleConfirm2}
                        onCancel={this.hideDatePicker2}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </>}
              {this.state.seconedhalfTimeShow && <>
                <Text style={{ alignSelf: "center", width: "90%", textAlign: "left", fontWeight: "bold", marginTop: 10 }}>Second half Timing : -</Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ showSeconedDatePicker: true })}>
                    <View style={{ width: '100%' }}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>From Time</Text>
                        <View
                          style={{
                            width: screenWidth / 2.3,
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
                                { color: ThemeColor, marginLeft: 10 },
                              ]}>
                              {moment(this.state.SecondHalfFromTime).format('h:mm a')}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <DateTimePickerModal
                        isVisible={this.state.showSeconedDatePicker}
                        mode="time"
                        // minimumDate={new Date(Date.now() - 86400000)}
                        // date={new Date(Date.now() - 86400000)}
                        onConfirm={this.HaldleSecondFromTime}
                        onCancel={() => { this.setState({ showSeconedDatePicker: false }) }}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({ ShowSeconedToTime: true })}>
                    <View style={{ width: '100%' }}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>To Time</Text>
                        <View
                          style={{
                            width: screenWidth / 2.3,
                            //backgroundColor: SubThemeColor,
                            borderWidth: 0.5,
                            marginTop: 10,
                            height: 40,
                            borderRadius: 5,
                            justifyContent: 'center',
                            paddingLeft: 10,
                            //alignItems: 'center',
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
                                { color: ThemeColor, marginLeft: 10 },
                              ]}>
                              {moment(this.state.SeconedHalToTimedata).format('h:mm a')}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <DateTimePickerModal
                        isVisible={this.state.ShowSeconedToTime}
                        mode="time"
                        value={this.state.SeconedHalToTimedata}
                        // date={new Date()}
                        onConfirm={this.handleShowSeconedToTime}
                        onCancel={() => { this.setState({ ShowSeconedToTime: false }) }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

              </>
              }
            </View>

            {this.state.FinalArr.length > 0 &&
              this.state.FinalArr[0].isAlternateStaff && (
                <View style={{ marginVertical: 5, backgroundColor: 'white' }}>
                  {/* <AlternateStaffComp
                    allStaffs={staffs =>
                      this.setState({
                        allStaffs: staffs,
                      })
                    }
                    isAlternateStaffSameDepartment={
                      this.state.FinalArr[0].isAlternateStaffSameDepartment
                    }
                    placeholder={
                      this.state.FinalArr.length > 0
                        ? this.state.FinalArr[0].alternateStaffPlaceholder
                        : ''
                    }
                    textValue={value => this.setState({alternateReason: value})}
                    selectedStaff={staff => {
                      this.setState({selectedStaff: staff});
                    }}
                  /> */}
                  <CustomLabel
                    title={'Alternate Staff'}
                    containerStyle={{ marginLeft: 20 }}
                    size={14}
                  />
                  <CustomSelect
                    items={this.state.departments}
                    onSelectedItemsChange={value => {
                      console.log('vvv', value);
                      this.setState(
                        {
                          staffList: [],
                          selectedStaff: [],
                          selectedDepartment: value,
                        },
                        () => {
                          console.log(
                            'this.state.allStaffs = ',
                            this.state.allStaffs,
                          );
                          let Staff = this.state.allStaffs;
                          let newStaff = [];
                          newStaff = Staff.filter((item, index) => {
                            return item.department == value;
                          });
                          console.log('newStaff = ', newStaff);
                          this.setState({ staffList: newStaff });
                        },
                      );
                    }}
                    borderColor={'#ccc'}
                    width={'95%'}
                    selectedItems={this.state.selectedDepartment}
                    selectText="Search Department . . ."
                    searchInputPlaceholderText="Search Department . . ."
                    single
                  />
                  {this.state.staffList.length ? (
                    <CustomSelect
                      items={this.state.staffList}
                      onSelectedItemsChange={value => {
                        console.log('vvv', value);
                        this.setState({ selectedStaff: value });
                      }}
                      borderColor={'#ccc'}
                      width={'95%'}
                      selectedItems={this.state.selectedStaff}
                      selectText="Search a Staff . . ."
                      searchInputPlaceholderText="Search a Staff . . ."
                      single
                    />
                  ) : null}

                  <TextArea
                    value={this.state.alternateReason}
                    onChangeText={text => {
                      this.setState({ alternateReason: text });
                    }}
                    h={20}
                    placeholder={
                      this.state.FinalArr.length > 0
                        ? this.state.FinalArr[0].alternateStaffPlaceholder
                        : ''
                    }
                    fontSize={14}
                    placeholderTextColor={Colors.button[0]}
                    w="95%"
                    alignSelf="center"
                    marginBottom={10}
                    borderColor={'coolGray.400'}
                  //maxW="300"
                  />
                </View>
              )}

            <View style={{ marginTop: 0 }}>
              <CustomTextArea
                isAttachmentMandatory={
                  this.state.FinalArr.length > 0 &&
                  this.state.FinalArr[0].isAttachmentMandatory
                }
                onPress2={() => {
                  this.setState({
                    Attachment: '',
                  });
                }}
                SelectedImage={Attachment => {
                  this.setState({ Attachment });
                }}
                title="Reason"
                text={this.state.Attachment.FileName || 'No files attached'}
                backgroundColor={SubThemeColor}
                placeholderTextColor={ThemeColor}
                width="100%"
                height={100}
                placeholder="Write reason here"
                value={this.state.Reason}
                onChangeText={text => {
                  this.setState({ Reason: text });
                }}
                onPress={() => {
                  if (
                    this.state.LeaveType == '' ||
                    this.state.LeaveType == null
                  ) {
                    this.displayErrorMsg(
                      'You have not assigned any permission for this type',
                      true,
                      true,
                    );
                    // } else if (
                    //   this.state.FinalArr[0].isAlternateStaff &&
                    //   (this.state.selectedStaff.length === 0 ||
                    //     this.state.alternateReason === '')
                    // ) {
                    //   this.displayErrorMsg(
                    //     'Please Select Alternate Staff and reason',
                    //     true,
                    //     true,
                    //   );
                  } else if (this.state.Reason == '') {
                    this.displayErrorMsg('Please add reason', true, true);
                  } else if (
                    this.state.FinalArr[0].isAttachmentMandatory &&
                    !this.state.Attachment.FileName
                  ) {
                    this.displayErrorMsg('Attachment is missing.', true, true);
                  } else {
                    console.log('I ran');
                    this.setState({ loader: true });
                    this.AddUpdateLeaveRequestNew();
                  }
                }}
              />
            </View>
            <View style={{ marginVertical: 10 }}>
              {this.state.ApprovalStages.length > 0 ||
                !this.state.ApproverLoading ? (
                <ApprovalStages
                  onPress={() => { }}
                  width="100%"
                  key={0}
                  title="Approval Stages"
                  color={SubThemeColor}
                  headerColor={ThemeColor}
                  Arr={this.state.ApprovalStages}
                />
              ) : (
                <View>
                  <ActivityIndicator />
                  <Text style={{ alignSelf: 'center', marginTop: 10 }}>
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
  },
  item: {
    borderRadius: 15,
    margin: 10,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 0.5,
    shadowColor: 'silver',
    shadowOffset: { width: 0, height: 0 },
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
