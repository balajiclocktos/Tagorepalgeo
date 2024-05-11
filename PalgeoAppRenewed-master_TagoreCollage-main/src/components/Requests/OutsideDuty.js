import {TextArea, VStack} from 'native-base';
import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
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
import {CustomTabs} from '../common/CustomTabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';
import {CustomCalendar} from '../common/CustomCalendar';
import {ScrollView} from 'react-native';
import {CheckBox, Icon} from 'react-native-elements';
import {Colors} from '../../utils/configs/Colors';
import CustomLabel from '../common/CustomLabel';
import CustomLoader from '../Task Allocation/CustomLoader';
import CustomModal from '../common/CustomModal';
import Error from '../popups/error';
import {CalenderView2} from '../common/CalenderView2';
import AlternateStaffComp from './AlternateStaffComp';
import {CustomSelect, SuccessError} from '../common';
import {getAllReportees, noTokenAPi} from '../../utils/apis';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];
var current = new Date();
var p = current.setDate(current.getDate() - 1);
export default class OutsideDuty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SelectedLeaveIdArr: [],
      Reason: '',
      Attachment: '',
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
      ApprovalStages: [],
      ApproverLoading: false,
      ActiveTab: 'From',
      LeaveType: '',
      FromDate: new Date(),
      Loader: true,
      ToDate: new Date(),
      AvailableLeaves: '',
      availedMonthCount: '0',
      availedYearCount: '0',
      selectedStaff: [],
      alternateReason: '',
      //FromDate: new Date().toISOString(),
      //ToDate: new Date().toISOString(),
      GetLeaveTypes: [],
      GetDetailedLeaves: [],
      FinalArr: [],
      departments: [],
      staffList: [],
      allStaffs: [],
      reportees: [],
      reporteeStaffCode: '',
      showReporteesDropdown: false,
    };
  }
  componentDidMount() {
    this.retrieveData();
  }

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('org_id');
      if (value !== null) {
        this.setState({org_id: value}, () => {});
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('bearer_token');
      if (value !== null) {
        //alert(value);
        this.setState({Token: value}, function () {
          //this.GetLeaveTypes();
        });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('institute_id');
      if (value !== null) {
        this.setState({institute_id: value}, function () {
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
        this.setState({StaffCode: value, user_id: value}, function () {
          this.setState({LeaveType: ''}, () => {
            this.GetLeaveTypeSubCategoriesByInstituteId();
          });
          //this.GetMasterLeaveApproverDetails();
          this.GetMasterLeaveApproverDetails();
          this.getAvailedOD();
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
          this.setState({departments: temparr});
        } else {
          this.setState({departments: []});
        }
      })
      .catch(error => {
        // this.setState({loader: false});
      });
  };
  getAllStaff = async () => {
    const {org_id, institute_id} = this.state;
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
      this.setState({allStaffs: response}, () => {
        console.log('allStaffs ==== ', this.state.allStaffs);
      });
    } catch (error) {
      alert(error);
    }
  };
  getAvailedOD = async () => {
    const url = Const + 'api/Leave/ODRequestedInfo';
    const body = {
      staffCode: this.state.StaffCode,
      InstituteId: this.state.institute_id,
      Date: new Date().toISOString(),
    };
    try {
      const response = await axios.post(url, body);
      const {data} = response;
      console.log('data', data);
      this.setState({
        availedMonthCount:
          data.currentMonth < 10 && data.currentMonth > 1
            ? '0' + data.currentMonth
            : data.currentMonth,
        availedYearCount:
          data.currentYear < 10 && data.currentMonth > 1
            ? '0' + data.currentYear
            : data.currentYear,
      });
    } catch (e) {
      alert('Error calculating availed OD: ' + e.message);
    }
  };

  getDetailedLeaves = async () => {
    const fromDate = new Date(this.state.FromDate).toISOString();
    const toDate = new Date(this.state.ToDate).toISOString();
    //console.log('from and to ==>', this.state.FromDate, this.state.ToDate);
    const url = `${'http://182.71.102.212/palgeoapi/api/Leave/GetDetailedLeaves/'}${fromDate}/${toDate}/${
      this.state.LeaveType
    }/${this.state.institute_id}/${this.state.StaffCode}`;
    //https://insproplus.com/palgeoapi/2021-07-27T16:53:55.037Z/2021-07-27T16:53:55.037Z/1023/2/25
    //const url =
    //  'https://insproplus.com/palgeoapi/api/Leave/GetDetailedLeaves/2021-07-27T13%3A44%3A36.583Z/2021-07-28T13%3A44%3A36.583Z/2059/2/25';
    console.log(url);
    try {
      const response = await axios.get(url);
      console.log('GetDetailedLeaves = ', response.data);
      if (response.data.length === 0) {
        return this.setState({EmptyMessage: true});
      }

      const tempArr = response.data.map(item => {
        return {
          Id: 0,
          DatesSelected: item.date,
          FirstHalf: item.includeInLeaves ? true : false,
          SecondHalf: item.includeInLeaves ? true : false,
          isWeekOff: item.isWeekOff,
          isStaffHoliday: item.isStaffHoliday,
          includeInLeaves: item.includeInLeaves,
          isStaffHolidayFirstHalf: item.isStaffHolidayFirstHalf,
          isStaffHolidaySecondHalf: item.isStaffHolidaySecondHalf,
          holidayName: item.holidayName || '',
        };
      });
      this.setState({Loader: false, GetDetailedLeaves: tempArr}, function () {
        //alert(response.data.message);
      });
    } catch (error) {
      alert(
        'Oops! Something went wrong. Our team will fix it soon. Please try after some time',
      );
      console.log(error);
      return this.setState({EmptyMessage: true});
    }
  };

  GetMasterLeaveApproverDetails = async id => {
    //const url = `https://insproplus.com/palgeoapi/api/Leave/GetMasterLeaveApproverDetails/${this.state.institute_id}/${this.state.StaffCode}/${this.state.LeaveType}`;
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
      this.setState({ApproverLoading: false});
      alert(error.message);
    }
  };
  GetLeaveTypes = async () => {
    const url = Const + 'api/Leave/GetLeaveTypes';
    console.log(url);
    try {
      const response = await axios.get(url);
      console.log(JSON.stringify(response.data));
      this.setState(
        {Loader: false, GetLeaveTypes: response.data},
        function () {},
      );
    } catch (error) {
      alert(error.message);
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
          monthlyLeaves: item.monthlyLeaves,
          priority: item.priority,
          holidayIncluded: item.holidayIncluded,
          monthlyCarryOn: item.monthlyCarryOn,
          includeLOP: item.includeLOP,
          sundayIncluded: item.sundayIncluded,
          yearlyCarryOn: item.yearlyCarryOn,
          yearlyLeaves: item.yearlyLeaves,
          staffCode: item.staffCode,
          isAlternateStaffSameDepartment: item.isAlternateStaffSameDepartment,
          isAlternateStaff: item.isAlternateStaff,
          alternateStaffPlaceholder: item.alternateStaffPlaceholder,
        });
      });
      this.setState({Loader: false, SelectedLeaveIdArr}, function () {
        if (this.state.LeaveType !== '') {
          this.getDetailedLeaves();
        }
        this.state.SelectedLeaveIdArr.length == 1
          ? this.setState(
              {
                LeaveType: this.state.SelectedLeaveIdArr[0].id,
              },
              () => {
                this.getDetailedLeaves();
                this.LeaveIdentifier(this.state.SelectedLeaveIdArr[0].id);
                console.log(
                  'this.state.SelectedLeaveIdArr[0].leaveId = ',
                  this.state.SelectedLeaveIdArr[0].id,
                ),
                  console.log(
                    'this.state.SelectedLeaveIdArr[0].monthlyLeaves = ',
                    this.state.SelectedLeaveIdArr[0].monthlyLeaves,
                  );
              },
            )
          : null;
        response.data.length == 0 &&
          Alert.alert(
            'Alert',
            'You have not assigned any Outside Duty. You can Select different Outside Duty types.',
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
      });
    } catch (error) {
      this.displayErrorMsg(error.message, true);
    }
  };

  displayErrorMsg = (msg, error) => {
    this.setState({showAlert: true, error_message: msg, error});
  };

  LeaveIdentifier = async id => {
    let arr = this.state.SelectedLeaveIdArr;
    let FinalArr = arr.filter(item => item.id == id);
    //console.log('FinalArr = ', FinalArr);
    this.setState({AvailableLeaves: FinalArr[0].monthlyLeaves, FinalArr});
  };

  AddUpdateLeaveRequestNew = async NewLeavesArr => {
    const result = this.DateCheckerFunction();
    if (!result) return;
    const device_token = await AsyncStorage.getItem('device_token');
    const url = Const + 'api/Leave/AddUpdateLeaveRequestNew';
    // console.log('AddUpdateLeaveRequestNew url = ', url);
    // const fromDate = new Date(this.state.FromDate).getTime();
    // const endDate = new Date(this.state.ToDate).getTime();
    // const diffSeconds = endDate - fromDate;
    // const diffeHours = diffSeconds / 3600000;
    // const difference = parseInt(diffeHours / 24) + 1;
    //console.log('dd', difference);
    let length = 0;
    NewLeavesArr.forEach(item => {
      if (item.FirstHalf && item.SecondHalf) {
        length = length + 1;
      }
      if (item.FirstHalf && !item.SecondHalf) {
        length = length + 0.5;
      }
      if (!item.FirstHalf && item.SecondHalf) {
        length = length + 0.5;
      }
    });

    const allLeavesWithWOffOrHol = this.state.GetDetailedLeaves.filter(
      e =>
        (e.isStaffHoliday &&
          e.isStaffHolidayFirstHalf &&
          e.isStaffHolidaySecondHalf) ||
        e.isWeekOff,
    );
    const lengthAll = allLeavesWithWOffOrHol.length;
    if (lengthAll === this.state.GetDetailedLeaves.length) {
      this.setState({loader: false});
      this.displayErrorMsg(
        'You cannot apply for OD as all the dates are either week off or holidays',
        true,
      );
      return;
    }

    const data = NewLeavesArr.map(item => {
      return {
        Id: item.Id,
        DatesSelected: item.DatesSelected,
        FirstHalf: item.FirstHalf,
        SecondHalf: item.SecondHalf,
      };
    });
    let bodyData = {
      Id: 0,
      MobileDeviceToken: device_token,
      InstituteId: parseInt(this.state.institute_id),
      StaffCode: this.state.StaffCode.toString(),
      RaisedByStaffCode: this.state.user_id,
      LeaveTypeId: parseInt(this.state.LeaveType),
      LeaveDates: data,
      FromDate: this.state.FromDate,
      EndDate: this.state.ToDate,
      FromTime: this.state.FromDate,
      ToTime: this.state.ToDate,
      Reason: this.state.Reason,
      LeaveAttachment: this.state.Attachment,
      NoOfDays: data.length,
      AlternateStaff:
        this.state.selectedStaff.length > 0
          ? this.state.allStaffs.find(e => e.id === this.state.selectedStaff[0])
              .name
          : '',
      AlternateStaffReason: this.state.alternateReason,
      Status: 0,
      CreatedDate: new Date().toISOString(),
      ModifiedDate: new Date().toISOString(),
    };
    console.log(
      'AddUpdateLeaveRequestNew = ',
      JSON.stringify(bodyData),
      bodyData.NoOfDays,
    );

    try {
      const response = await axios.post(url, bodyData);
      //console.log('working');
      console.log(JSON.stringify(response.data));

      if (response.data.status == true) {
        this.setState(
          {
            loader: false,
          },
          function () {
            setTimeout(() => this.props.navigation.navigate('Leaves'), 3000);
            this.displayErrorMsg(response.data.message, false);
          },
        );
      } else {
        this.setState({loader: false});
        const dates = response.data.overlappingDatesInfo;
        const overflowDates = response.data.occupiedLeaves;
        if (dates?.length > 0) {
          this.setState({overlappingDatesInfo: dates}, () => {
            this.setState({showModal: true});
          });
        } else if (overflowDates?.length > 0) {
          this.setState({overflowDates}, () => {
            this.setState({showModal1: true});
          });
        } else {
          this.displayErrorMsg(response.data.message, true);
        }
      }
    } catch (error) {
      console.log('errpr', error.message);
      this.setState({loader: false});
      this.displayErrorMsg(error.message, true);
    }
  };

  getAvailableLeaves = () => {
    var nextMonthLastDate = moment()
      .add(1, 'M')
      .endOf('month')
      .format('YYYY-MM-DD');
    var currentMonthDate = moment().format('YYYY-MM-DD');
    var diff = moment(nextMonthLastDate, 'YYYY-MM-DD').diff(
      moment(currentMonthDate, 'YYYY-MM-DD'),
      'days',
    );
    console.log('dfiff', diff);
    return diff + 1;
  };

  DateCheckerFunction() {
    if (this.state.FromDate > this.state.ToDate) {
      this.displayErrorMsg('The Date must be Bigger to From Date', true);
      this.setState({ToDate: this.state.FromDate});
      return false;
    }
    return true;
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
          deleteIconPress={() => this.setState({showAlert: false})}
        />
        <SubHeader
          title="Onsite Duty"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
        {this.state.loader && (
          <CustomLoader loaderText={'Trying to raise your request'} />
        )}
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={{paddingBottom: 100}}>
          <VStack>
            {this.state.showModal1 && (
              <CustomModal
                title={'Occupied Request Dates'}
                isVisible={this.state.showModal1}
                deleteIconPress={() => this.setState({showModal1: false})}>
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
                        <View style={{width: '40%'}}>
                          <CustomLabel
                            //containerStyle={{width: '40%'}}
                            title={moment(item.date).format('DD.MM.YYYY')}
                          />
                        </View>
                        <View style={{width: '40%'}}>
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
            {this.state.showModal && (
              <CustomModal
                title={'Overlapping Request Dates'}
                isVisible={this.state.showModal}
                deleteIconPress={() => this.setState({showModal: false})}>
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
                        <View style={{width: '40%'}}>
                          <CustomLabel
                            //containerStyle={{width: '40%'}}
                            title={moment(item.date).format('DD.MM.YYYY')}
                          />
                          <CustomLabel title={item.leaveRequestType} />
                        </View>
                        <View style={{width: '40%'}}>
                          <CheckBox
                            containerStyle={{
                              padding: 0,
                              backgroundColor: 'transparent',
                              elevation: 0,
                              minHeight: 50,
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
                              elevation: 0,
                              minHeight: 50,
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
                    this.getAvailedOD();
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
              date={this.state.availedMonthCount.toString()}
              backgroundColor={'white'}
              width={'100%'}
              color={Colors.button[0]}
            />
            <CalenderView2
              mainTitle="Total availed"
              title="CURRENT YEAR"
              date={this.state.availedYearCount.toString()}
              backgroundColor={'white'}
              width={'100%'}
              color={Colors.button[0]}
            />
            {/* {this.state.loading && <CustomLoader />} */}
            <View style={{width: '100%', backgroundColor: 'white'}}>
              {this.state.SelectedLeaveIdArr.length > 1 && (
                <CustomPicker
                  label="You can choose type here"
                  selectedValue={this.state.LeaveType}
                  options={this.state.SelectedLeaveIdArr}
                  onValueChange={value => {
                    console.log('CustomPicker value = ', value);
                    this.setState({LeaveType: value}, () => {
                      this.LeaveIdentifier(value);
                      this.setState({ApproverLoading: true}, () =>
                        this.GetLeaveTypeSubCategoriesByInstituteId(),
                      );
                      //this.GetMasterLeaveApproverDetails();
                    });
                  }}
                />
              )}
            </View>
            {/*) : null}*/}
            {/* <CustomTabs
              borderRadius={20}
              height={45}
              color={ThemeColor}
              backgroundColor={SubThemeColor}
              ActiveTab={this.state.ActiveTab}
              tab1="From"
              tab2="To"
              onPress={(value) => {
                this.setState({ActiveTab: value}, function () {
                  console.log('Selected tab = ', value);
                });
              }}
            /> */}

            {this.state.LeaveType !== '' && (
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  width: wp('100'),
                  alignSelf: 'center',
                  justifyContent: 'space-around',
                  backgroundColor: 'white',
                }}>
                <View style={{width: wp('45')}}>
                  <CustomCalendar
                    title={'Starting Date'}
                    AvailableLeaves={this.getAvailableLeaves()}
                    FromDate={this.state.FromDate}
                    date={this.state.FromDate}
                    onPress={() => this.setState({dateVisible: true})}
                    isVisible={this.state.dateVisible}
                    onConfirm={date => {
                      this.setState(
                        {
                          FromDate: date,
                          ToDate: date,
                          dateVisible: false,
                          GetDetailedLeaves: [],
                        },
                        () => {
                          //this.DateCheckerFunction();
                          this.getDetailedLeaves();
                        },
                      );
                    }}
                    //style={{backgroundColor: SubThemeColor}}
                    //textStyle={{color: ThemeColor}}
                    onCancel={() => this.setState({dateVisible: false})}
                  />
                </View>
                <View style={{width: wp('45')}}>
                  <CustomCalendar
                    title={'Ending Date'}
                    AvailableLeaves={this.getAvailableLeaves()}
                    FromDate={this.state.FromDate}
                    date={this.state.ToDate}
                    onPress={() => this.setState({dateVisible1: true})}
                    isVisible={this.state.dateVisible1}
                    onConfirm={date => {
                      this.setState(
                        {
                          ToDate: date,
                          dateVisible1: false,
                          GetDetailedLeaves: [],
                        },
                        () => {
                          this.DateCheckerFunction();
                          this.getDetailedLeaves();
                        },
                      );
                    }}
                    //style={{backgroundColor: SubThemeColor}}
                    //textStyle={{color: ThemeColor}}
                    onCancel={() => this.setState({dateVisible1: false})}
                  />
                </View>
              </View>
            )}
            {this.state.LeaveType !== '' && (
              <View style={{paddingVertical: 20, backgroundColor: 'white'}}>
                <CustomList2
                  width="95%"
                  title1="Date"
                  title2="Session 1"
                  title3="Session 2"
                  //title4="Select"
                  color={'#D2E1FA'}
                  headerColor={'#236EE8'}>
                  <ScrollView nestedScrollEnabled={true}>
                    {this.state.GetDetailedLeaves.length ? (
                      this.state.GetDetailedLeaves.map((item, index) => {
                        //console.log(item);
                        let checkBoxFirst = null;
                        let checkBoxSecond = null;
                        if (item.includeInLeaves) {
                          if (item.isWeekOff) {
                            // this.state.GetDetailedLeaves[index].FirstHalf = true;
                            // this.state.GetDetailedLeaves[index].SecondHalf = true;
                            // this.setState({
                            //   GetDetailedLeaves: [
                            //     ...this.state.GetDetailedLeaves,
                            //   ],
                            // });

                            checkBoxFirst = (
                              <CustomLabel
                                labelStyle={{textAlign: 'center'}}
                                title={'WEEK OFF'}
                              />
                            );
                            checkBoxSecond = (
                              <CustomLabel
                                labelStyle={{textAlign: 'center'}}
                                title={'WEEK OFF'}
                              />
                            );
                          }
                          if (!item.isWeekOff && !item.isStaffHoliday) {
                            checkBoxFirst = (
                              <CheckBox
                                title={'Morning'}
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  minHeight: 50,
                                }}
                                checked={
                                  this.state.GetDetailedLeaves[index].FirstHalf
                                }
                                checkedColor={Colors.calendarBg}
                                onPress={() => {
                                  let modifiedArr =
                                    this.state.GetDetailedLeaves;
                                  if (modifiedArr[index].FirstHalf) {
                                    //console.log('if');
                                    modifiedArr[index].FirstHalf = false;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });

                                    //alert(item.FirstHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  } else {
                                    //console.log('else');
                                    modifiedArr[index].FirstHalf = true;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });
                                    //alert(item.FirstHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  }
                                }}
                              />
                            );
                            checkBoxSecond = (
                              <CheckBox
                                title={'Evening'}
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  minHeight: 50,
                                }}
                                checked={
                                  this.state.GetDetailedLeaves[index].SecondHalf
                                }
                                checkedColor={Colors.calendarBg}
                                onPress={() => {
                                  let modifiedArr =
                                    this.state.GetDetailedLeaves;
                                  if (modifiedArr[index].SecondHalf) {
                                    //console.log('if');
                                    modifiedArr[index].SecondHalf = false;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });

                                    //alert(item.FirstHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  } else {
                                    //console.log('else');
                                    modifiedArr[index].SecondHalf = true;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });
                                    //alert(item.SecondHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  }
                                }}
                              />
                            );
                          }
                          if (!item.isWeekOff && item.isStaffHoliday) {
                            if (
                              item.isStaffHolidayFirstHalf &&
                              item.isStaffHolidaySecondHalf
                            ) {
                              // this.state.GetDetailedLeaves[
                              //   index
                              // ].FirstHalf = true;
                              // this.state.GetDetailedLeaves[
                              //   index
                              // ].SecondHalf = true;
                              // this.setState({
                              //   GetDetailedLeaves: [
                              //     ...this.state.GetDetailedLeaves,
                              //   ],
                              // });
                              checkBoxFirst = (
                                <CustomLabel
                                  title={item.holidayName}
                                  labelStyle={{textAlign: 'center'}}
                                />
                              );
                              checkBoxSecond = (
                                <CustomLabel
                                  title={item.holidayName}
                                  labelStyle={{textAlign: 'center'}}
                                />
                              );
                              //return;
                            } else {
                              checkBoxFirst = (
                                <CheckBox
                                  title={
                                    item.isStaffHolidayFirstHalf
                                      ? item.holidayName
                                      : 'Morning'
                                  }
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    minHeight: 50,
                                  }}
                                  disabled={item.isStaffHolidayFirstHalf}
                                  checked={
                                    this.state.GetDetailedLeaves[index]
                                      .FirstHalf
                                  }
                                  checkedColor={Colors.calendarBg}
                                  onPress={() => {
                                    let modifiedArr =
                                      this.state.GetDetailedLeaves;
                                    if (modifiedArr[index].FirstHalf) {
                                      modifiedArr[index].FirstHalf = false;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    } else {
                                      modifiedArr[index].FirstHalf = true;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    }
                                  }}
                                />
                              );
                              checkBoxSecond = (
                                <CheckBox
                                  title={
                                    item.isStaffHolidaySecondHalf
                                      ? item.holidayName
                                      : 'Evening'
                                  }
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    minHeight: 50,
                                  }}
                                  disabled={item.isStaffHolidaySecondHalf}
                                  checked={
                                    this.state.GetDetailedLeaves[index]
                                      .SecondHalf
                                  }
                                  checkedColor={Colors.calendarBg}
                                  onPress={() => {
                                    let modifiedArr =
                                      this.state.GetDetailedLeaves;
                                    if (modifiedArr[index].SecondHalf) {
                                      modifiedArr[index].SecondHalf = false;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    } else {
                                      modifiedArr[index].SecondHalf = true;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    }
                                  }}
                                />
                              );
                            }
                          }
                        }
                        if (!item.includeInLeaves) {
                          if (item.isWeekOff) {
                            // this.state.GetDetailedLeaves[index].FirstHalf = false;
                            // this.state.GetDetailedLeaves[
                            //   index
                            // ].SecondHalf = false;
                            // this.setState({
                            //   GetDetailedLeaves: [
                            //     ...this.state.GetDetailedLeaves,
                            //   ],
                            // });

                            checkBoxFirst = (
                              <CustomLabel
                                labelStyle={{textAlign: 'center'}}
                                title={'WEEK OFF'}
                              />
                            );
                            checkBoxSecond = (
                              <CustomLabel
                                labelStyle={{textAlign: 'center'}}
                                title={'WEEK OFF'}
                              />
                            );
                            //return;
                          }
                          if (!item.isWeekOff && !item.isStaffHoliday) {
                            checkBoxFirst = (
                              <CheckBox
                                title={'Morning'}
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  minHeight: 50,
                                }}
                                checked={
                                  this.state.GetDetailedLeaves[index].FirstHalf
                                }
                                checkedColor={Colors.calendarBg}
                                onPress={() => {
                                  let modifiedArr =
                                    this.state.GetDetailedLeaves;
                                  if (modifiedArr[index].FirstHalf) {
                                    //console.log('if');
                                    modifiedArr[index].FirstHalf = false;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });

                                    //alert(item.FirstHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  } else {
                                    //console.log('else');
                                    modifiedArr[index].FirstHalf = true;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });
                                    //alert(item.FirstHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  }
                                }}
                              />
                            );
                            checkBoxSecond = (
                              <CheckBox
                                title={'Evening'}
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  minHeight: 50,
                                }}
                                checked={
                                  this.state.GetDetailedLeaves[index].SecondHalf
                                }
                                checkedColor={Colors.calendarBg}
                                onPress={() => {
                                  let modifiedArr =
                                    this.state.GetDetailedLeaves;
                                  if (modifiedArr[index].SecondHalf) {
                                    //console.log('if');
                                    modifiedArr[index].SecondHalf = false;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });

                                    //alert(item.FirstHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  } else {
                                    //console.log('else');
                                    modifiedArr[index].SecondHalf = true;
                                    this.setState({
                                      GetDetailedLeaves: [...modifiedArr],
                                    });
                                    //alert(item.SecondHalf);
                                    //console.log(this.state.GetDetailedLeaves);
                                  }
                                }}
                              />
                            );
                          }
                          if (!item.isWeekOff && item.isStaffHoliday) {
                            if (
                              item.isStaffHolidayFirstHalf &&
                              item.isStaffHolidaySecondHalf
                            ) {
                              checkBoxFirst = (
                                <CustomLabel
                                  title={item.holidayName}
                                  labelStyle={{textAlign: 'center'}}
                                />
                              );
                              checkBoxSecond = (
                                <CustomLabel
                                  title={item.holidayName}
                                  labelStyle={{textAlign: 'center'}}
                                />
                              );
                            } else {
                              checkBoxFirst = (
                                <CheckBox
                                  title={
                                    item.isStaffHolidayFirstHalf
                                      ? item.holidayName
                                      : 'Morning'
                                  }
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    minHeight: 50,
                                  }}
                                  disabled={item.isStaffHolidayFirstHalf}
                                  checked={
                                    this.state.GetDetailedLeaves[index]
                                      .FirstHalf
                                  }
                                  uncheckedIcon={
                                    <Icon
                                      name="squared-cross"
                                      color={Colors.calendarBg}
                                      type={'entypo'}
                                    />
                                  }
                                  checkedColor={Colors.calendarBg}
                                  onPress={() => {
                                    let modifiedArr =
                                      this.state.GetDetailedLeaves;
                                    if (modifiedArr[index].FirstHalf) {
                                      modifiedArr[index].FirstHalf = false;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    } else {
                                      modifiedArr[index].FirstHalf = true;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    }
                                  }}
                                />
                              );
                              checkBoxSecond = (
                                <CheckBox
                                  title={
                                    item.isStaffHolidaySecondHalf
                                      ? item.holidayName
                                      : 'Evening'
                                  }
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    minHeight: 50,
                                  }}
                                  disabled={item.isStaffHolidaySecondHalf}
                                  checked={
                                    this.state.GetDetailedLeaves[index]
                                      .SecondHalf
                                  }
                                  uncheckedIcon={
                                    <Icon
                                      name="squared-cross"
                                      color={Colors.calendarBg}
                                      type={'entypo'}
                                    />
                                  }
                                  checkedColor={Colors.calendarBg}
                                  onPress={() => {
                                    let modifiedArr =
                                      this.state.GetDetailedLeaves;
                                    if (modifiedArr[index].SecondHalf) {
                                      modifiedArr[index].SecondHalf = false;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    } else {
                                      modifiedArr[index].SecondHalf = true;
                                      this.setState({
                                        GetDetailedLeaves: [...modifiedArr],
                                      });
                                    }
                                  }}
                                />
                              );
                            }
                          }
                        }
                        return (
                          <View
                            key={index}
                            style={[
                              styles.headerContainer,
                              {
                                marginBottom: 10,
                              },
                            ]}>
                            <View style={[styles.headerTitleContainer, {}]}>
                              <Text style={[styles.text, {color: 'black'}]}>
                                {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
                                {moment(item.DatesSelected).format(
                                  'DD.MM.YYYY',
                                )}
                              </Text>
                            </View>
                            {checkBoxFirst}
                            {checkBoxSecond}
                          </View>
                        );
                      })
                    ) : (
                      <View
                        style={{
                          marginTop: 35,
                          alignItems: 'center',
                          width: '100%',
                        }}>
                        {this.state.EmptyMessage ? (
                          <Text>No Data Found</Text>
                        ) : (
                          <ActivityIndicator />
                        )}
                      </View>
                    )}
                  </ScrollView>
                </CustomList2>
              </View>
            )}
            {this.state.FinalArr.length > 0 &&
              this.state.FinalArr[0].isAlternateStaff && (
                <View style={{marginVertical: 5, backgroundColor: 'white'}}>
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
                    containerStyle={{marginLeft: 20}}
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
                          let Staff = this.state.allStaffs;
                          let newStaff = [];
                          newStaff = Staff.filter((item, index) => {
                            return item.department == value;
                          });
                          console.log('newStaff = ', newStaff);
                          this.setState({staffList: newStaff});
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
                        this.setState({selectedStaff: value});
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
                      this.setState({alternateReason: text});
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
            {/* {this.state.ActiveTab == 'To' ? (
              // <CustomCalendar
              //   selectedDate={this.state.ToDate}
              //   onPress={(value) => {
              //     console.log('ToDate = ', value);
              //     this.setState({ToDate: value}, function () {
              //       this.DateCheckerFunction();
              //     });
              //   }}
              //   color={SubThemeColor}
              //   themeColor={ThemeColor}
              // />
              
            ) : null} */}

            {/* <Text style={[styles.text, {fontWeight: '600', margin: 10}]}>
                Type of OD
              </Text>
              <CustomPicker
                label="You can choose type here"
                selectedValue={this.state.LeaveType}
                options={this.state.GetLeaveTypes}
                onValueChange={(value) => {
                  this.setState({LeaveType: value});
                }}
              /> */}
            <View style={{marginTop: 10}}>
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
                  this.setState({Attachment});
                }}
                text={this.state.Attachment.FileName || 'No files attached'}
                title="Reason"
                backgroundColor={SubThemeColor}
                placeholderTextColor={ThemeColor}
                width="100%"
                height={100}
                placeholder="Write reason here"
                value={this.state.Reason}
                onChangeText={text => {
                  this.setState({Reason: text});
                }}
                onPress={() => {
                  if (
                    this.state.LeaveType == '' ||
                    this.state.LeaveType == null
                  ) {
                    this.displayErrorMsg('Please Select Leave Type', true);
                    // } else if (
                    //   this.state.FinalArr[0].isAlternateStaff &&
                    //   (this.state.selectedStaff.length === 0 ||
                    //     this.state.alternateReason === '')
                    // ) {
                    //   this.displayErrorMsg(
                    //     'Please Select Alternate Staff and reason',
                    //     true,
                    //   );
                  } else if (this.state.Reason == '') {
                    this.displayErrorMsg('Please Enter Reason', true);
                  } else if (
                    this.state.FinalArr[0].isAttachmentMandatory &&
                    !this.state.Attachment.FileName
                  ) {
                    this.displayErrorMsg('Attachment is missing.', true);
                  } else {
                    let tempGetDetailedLeaves = this.state.GetDetailedLeaves;
                    let NewLeavesArr = tempGetDetailedLeaves.filter(
                      item =>
                        item.FirstHalf != false || item.SecondHalf != false,
                    );
                    console.log('NewLeavesArr = ', NewLeavesArr);
                    if (NewLeavesArr.length) {
                      this.setState({loader: true});
                      this.AddUpdateLeaveRequestNew(NewLeavesArr);
                    } else {
                      this.displayErrorMsg(
                        'Please select atleast one Session (Morning/Evening)',
                        true,
                      );
                    }
                    //this.AddUpdateLeaveRequestNew();
                  }
                }}
              />
            </View>
            <View style={{marginVertical: 10}}>
              {this.state.ApprovalStages.length > 0 ||
              !this.state.ApproverLoading ? (
                <ApprovalStages
                  onPress={() => {}}
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
  headerContainer: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  headerTitleContainer: {
    width: '24%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
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
