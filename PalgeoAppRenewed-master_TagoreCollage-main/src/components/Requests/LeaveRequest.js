import {
  Container,
  VStack,
  Item,
  Picker,
  Image as Thumbnail,
  TextArea,
} from 'native-base';
import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
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
import {CustomTabs} from '../common/CustomTabs';
import {CustomCalendar} from '../common/CustomCalendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';
import {ActivityIndicator} from 'react-native';
import {Colors} from '../../utils/configs/Colors';
import {CheckBox, Divider, Icon} from 'react-native-elements';
import CustomLabel from '../common/CustomLabel';
import CustomModal from '../common/CustomModal';
import SuccessError from '../common/SuccessError';
import CustomLoader from '../Task Allocation/CustomLoader';
import CustomCard from '../common/CustomCard';
import SearchBar from 'react-native-elements/dist/searchbar/SearchBar-ios';
import {getAllReportees, noTokenAPi} from '../../utils/apis';
import CustomSelect from '../common/CustomSelect';
import AlternateStaffComp from './AlternateStaffComp';
//import ApprovalStages from '../common/ApprovalStages';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];
let TempArr = [];
let SelectedDated = [];
export default class LeaveRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: '',
      SelectedDate: true,
      Active: -1,
      LeaveType: '',
      LeaveDate: new Date(),
      GetLeaveTypes: [],
      GetInstituteStaffLeavesNew: [],
      GetDetailedLeaves: [],
      ApproverLoading: false,
      Morning: false,
      Evening: false,
      LeaveId: '',
      Reason: '',
      EmptyMessage: false,
      CustomListLoader: false,
      FromDate: new Date(),
      ToDate: new Date(),
      SelectedLeaveIdArr: [],
      AvailableLeaves: '',
      Active: -1,
      //FromDate: new Date().toISOString(),
      //ToDate: new Date().toISOString(),
      Attachment: '',
      //Attachment: {
      //  FileName: '',
      //  FileType: '',
      //  Attachment: '',
      //},
      ApprovalStages: [],
      LeaveArr2: [],
      LeaveDates: [],
      ActiveTab: 'From',
      Loader: true,
      overlappingDatesInfo: [],
      selectedStaff: [],
      alternateStaff: null,
      alternateReason: '',
      allStaffs: [],
      showModal: false,
      FinalArr: [],
      departments: [],
      staffList: [],
      reportees: [],
      reporteeStaffCode: '',
      showReporteesDropdown: false,
      SelectedLeaveId: this.props.route.params
        ? this.props.route.params.SelectedLeaveId
          ? this.props.route.params.SelectedLeaveId
          : ''
        : '',
    };
  }
  componentDidMount() {
    this.retrieveData();
    //reload data on screen focus
  }
  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('org_id');
      if (value !== null) {
        this.setState({org_id: value});
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
        //console.log('institute id =', value);
        this.setState({institute_id: value}, function () {
          this.getDepartments(value, this.state.Token);
        });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('user_id');
      if (value !== null) {
        //console.log('StaffCode  =', value);
        //alert(value);
        this.setState({StaffCode: value, user_id: value}, function () {
          this.setState({LeaveId: ''}, () => {
            //this.GetInstituteStaffLeavesNew();
            this.GetLeaveTypeSubCategoriesByInstituteId(
              this.state.SelectedLeaveId,
            );
          });
          this.GetMasterLeaveApproverDetails();
          this.getAllStaff();
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
    //console.log(bearer_token);
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
        //console.log('json_sssss', json);
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

    try {
      const res = await noTokenAPi.get(url);
      // console.log("getAllStaff = ",res.data);
      const response = res.data.map(e => {
        return {
          id: e.staffCode,
          name: `${e.name} - ${e.staffCode}`,
          department: e.department,
        };
      });
      this.setState({allStaffs: response}, () => {
        //console.log('allStaffs ==== ', this.state.allStaffs);
      });
    } catch (error) {
      alert(error);
    }
  };

  _onRefresh() {
    this.setState({refreshing: true});
    this.setState({LeaveId: ''}, () => {
      this.GetInstituteStaffLeavesNew();
    });
    //this.GetMasterLeaveApproverDetails(this.state.StaffCode);
  }
  DateCheckerFunction() {
    if (this.state.FromDate > this.state.ToDate) {
      alert('Start Date cannot be greater than End date');
      this.setState({ToDate: this.state.FromDate}, () =>
        this.GetDetailedLeaves(),
      );
      return false;
    }
    return true;
  }
  // GetLeaveTypes = async () => {
  //   const url = Const + 'api/Leave/GetLeaveTypes';
  //   console.log(url);
  //   try {
  //     const response = await axios.get(url);
  //     console.log(JSON.stringify(response.data));
  //     this.setState(
  //       {Loader: false, GetLeaveTypes: response.data},
  //       function () {},
  //     );
  //   } catch (error) {
  //     alert(error.message);
  //   }
  // };
  GetLeaveTypeSubCategoriesByInstituteId = async id => {
    const url =
      Const +
      'api/Leave/GetLeaveTypeSubCategoriesByInstituteId?instituteId=' +
      this.state.institute_id +
      '&leaveRequestId=' +
      id +
      '&staffCode=' +
      this.state.StaffCode;
    // console.log('GetLeaveTypeSubCategoriesByInstituteId Url = ', url);
    try {
      const response = await axios.get(url);
      //console.log('GetLeaveTypeSubCategoriesByInstituteId =', response.data);
      this.setState(
        {
          Loader: false,
          SelectedLeaveIdArr: response.data,
          CustomListLoader: false,
        },
        function () {
          response.data.length == 1
            ? this.setState(
                {
                  LeaveId: this.state.SelectedLeaveIdArr[0].leaveId,
                  isAlternateStaff:
                    this.state.SelectedLeaveIdArr[0].isAlternateStaff,
                  isAttachmentMandatory:
                    this.state.SelectedLeaveIdArr[0].isAttachmentMandatory,
                },
                () => {
                  this.LeaveIdentifier(
                    this.state.SelectedLeaveIdArr[0].leaveId,
                  );
                },
              )
            : null;
          response.data.length == 0 &&
            Alert.alert(
              'Alert',
              'You have not assigned any Leave. You can Select different leave types.',
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
      console.log('getSub==', error);
      this.setState({CustomListLoader: false});
      alert(error.message);
    }
  };
  LeaveIdentifier = async id => {
    //console.log('id = ', id);
    // console.log(
    //   'this.state.SelectedLeaveIdArr = ',
    //   this.state.SelectedLeaveIdArr,
    // );
    let arr = this.state.SelectedLeaveIdArr;
    let FinalArr = arr.filter(item => item.leaveId == id);
    //console.log('FinalArr = ', arr);
    this.setState(
      {
        AvailableLeaves: FinalArr[0].includeLOP
          ? this.getAvailableLeaves()
          : FinalArr[0].monthlyLeaves,
        FinalArr,
      },
      () => {
        if (this.state.AvailableLeaves == 0) {
          Alert.alert(
            'Alert',
            'You do have not sufficient leaves',
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
          this.setState({LeaveType: '', Active: -1});
        }
      },
    );
  };
  // GetInstituteStaffLeavesNew = async () => {
  //   //this.setState({LeaveType: 3});
  //   const url = `${Const}api/Leave/GetInstituteStaffLeavesNew/${this.state.institute_id}/${this.state.StaffCode}`;
  //   console.log('GetInstituteStaffLeavesNew', url);
  //   try {
  //     const response = await axios.get(url);
  //     console.log(('GetInstituteStaffLeavesNew = ', response.data));
  //     let GetInstituteStaffLeavesNew = this.state.GetInstituteStaffLeavesNew;
  //     response.data.map((item) => {
  //       GetInstituteStaffLeavesNew.push({
  //         availableLeave: item.availableLeave,
  //         createdOn: item.createdOn,
  //         holidayIncluded: item.holidayIncluded,
  //         id: item.leaveId,
  //         name: item.leaveName,
  //         staffMonthlyLeaves: item.staffMonthlyLeaves,
  //         sundayIncluded: item.sundayIncluded,
  //         totalMonthlyLeaves: item.totalMonthlyLeaves,
  //         totalYearlyLeaves: item.totalYearlyLeaves,
  //       });
  //     });
  //     this.setState(
  //       {
  //         Loader: false,
  //         GetInstituteStaffLeavesNew,
  //         refreshing: false,
  //       },
  //       function () {
  //         if (response.data.length == 1) {
  //           this.setState(
  //             {LeaveId: response.data[0].leaveId},
  //             () => {
  //               console.log('when response length is 1 = ', this.state.LeaveId);
  //             },
  //             () => {
  //               this.setState({LeaveType: ''}, () => {
  //                 this.GetLeaveTypeSubCategoriesByInstituteId(
  //                   this.state.SelectedLeaveId,
  //                 );
  //               });
  //             },
  //           );
  //         }
  //       },
  //     );
  //   } catch (error) {
  //     this.setState({
  //       Loader: false,
  //       refreshing: false,
  //     });
  //     alert(error.message);
  //   }
  // };

  GetDetailedLeaves = async () => {
    const fromDate = new Date(this.state.FromDate).toISOString();
    const toDate = new Date(this.state.ToDate).toISOString();

    const url = `${'http://182.71.102.212/palgeoapi/api/Leave/GetDetailedLeaves/'}${fromDate}/${toDate}/${
      this.state.LeaveType
    }/${this.state.institute_id}/${this.state.StaffCode}`;

    try {
      const response = await axios.get(url);
      // console.log('GetDetailedLeaves = ', response.data);
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
          holidayName: item.holidayName,
          includeInLeaves: item.includeInLeaves,
          isStaffHolidayFirstHalf: item.isStaffHolidayFirstHalf,
          isStaffHolidaySecondHalf: item.isStaffHolidaySecondHalf,
        };
      });
      this.setState({Loader: false, GetDetailedLeaves: tempArr}, function () {
        //alert(response.data.message) ;
      });
    } catch (error) {
      //alert('GetDetailedLeaves = ' + error.message);
      console.log(error);
      return this.setState({EmptyMessage: true});
    }
  };
  GetMasterLeaveApproverDetails = async id => {
    this.setState({ApproverLoading: true});
    //const url = `http://182.71.102.212/palgeoapi/api/Leave/GetMasterLeaveApproverDetails/${this.state.institute_id}/${this.state.StaffCode}/${this.state.SelectedLeaveId}`;
    const url = `${Const}api/Leave/GetMasterLeaveApproverDetailsByMainType/${this.state.institute_id}/${this.state.StaffCode}/${this.state.SelectedLeaveId}`;
    //console.log(url);
    try {
      const response = await axios.get(url);
      console.log('response ==>', response);
      this.setState(
        {
          Loader: false,
          ApprovalStages: response.data,
          refreshing: false,
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
      this.setState({refreshing: false, ApproverLoading: false});
      alert(error.message);
    }
  };

  getmaxAllowedLength = () => {
    const {LeaveType, SelectedLeaveIdArr} = this.state;
    const findLeave = SelectedLeaveIdArr.find(e => e.leaveId === LeaveType);
    //console.log('remaining count ==', findLeave.remainingLeaveCount);
    return findLeave.remainingLeaveCount;
  };

  AddUpdateLeaveRequestNew = async NewLeavesArr => {
    const result = this.DateCheckerFunction();
    if (!result) return;
    const device_token = await AsyncStorage.getItem('device_token');
    const url = Const + 'api/Leave/AddUpdateLeaveRequestNew';
    console.log(url);
    const fromDate = new Date(this.state.FromDate).getTime();
    const endDate = new Date(this.state.ToDate).getTime();
    const diffSeconds = endDate - fromDate;
    const diffeHours = diffSeconds / 3600000;
    const difference = parseInt(diffeHours / 24) + 1;
    //console.log('dd', difference);

    let data = NewLeavesArr;
    let length = 0;
    data.forEach(item => {
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
    const maxAllowedLength = this.getmaxAllowedLength();
    const {FinalArr} = this.state;
    if (maxAllowedLength === 0) {
      if (FinalArr[0].isApprovedLeaveEligible) {
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
          this.displayMsg(
            'You cannot apply leaves as all the dates are either week off or holidays',
            true,
            true,
          );
          return;
        }

        data = data.filter(
          item =>
            (item.FirstHalf == true && item.SecondHalf == true) ||
            (item.FirstHalf == true && item.SecondHalf == false) ||
            (item.FirstHalf == false && item.SecondHalf == true),
        );
        // console.log('NewLeavesArr = ', NewLeavesArr);
        // console.log('data = ', this.state.allStaffs);
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
          AlternateStaff: this.state.selectedStaff.length
            ? this.state.allStaffs.find(
                e => e.id === this.state.selectedStaff[0],
              ).name
            : '',
          AlternateStaffReason: this.state.alternateReason,
          //NoOfDays: difference,
          Status: 0,
          CreatedDate: new Date().toISOString(),
          ModifiedDate: new Date().toISOString(),
          IsApprovedLeave: true,
        };
        //console.log(JSON.stringify(bodyData));
        console.log('********************');
        console.log(url);
        console.log(JSON.stringify(bodyData));
        try {
          const response = await axios.post(url, bodyData);
          //console.log('working');
          //  console.log(JSON.stringify(response.data));
          if (response.data.status == true) {
            this.setState(
              () => ({
                loader: false,
              }),
              () => {
                this.displayMsg(
                  response.data.message +
                    '. Your leave is considered as approved leave',
                  true,
                  false,
                );
                setTimeout(
                  () => this.props.navigation.navigate('Leaves'),
                  4000,
                );
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
              this.displayMsg(response.data.message, true, true);
            }
          }
        } catch (error) {
          this.setState({loader: false});
          this.displayMsg(error.message, true, true);
        }
      }

      displayMsg = (msg, showAlert, error) => {
        this.setState({
          msg,
          showAlert,
          error,
        });
        return;
      };
    }
    if (!FinalArr[0].includeLOP) {
      if (length > maxAllowedLength) {
        this.setState({loader: false});
        this.displayMsg(
          'Sorry, you cannot apply leaves more than your allowed limit.',
          true,
          true,
        );
        return;
      }
    }

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
      this.displayMsg(
        'You cannot apply leaves as all the dates are either week off or holidays',
        true,
        true,
      );
      return;
    }

    data = data.filter(
      item =>
        (item.FirstHalf == true && item.SecondHalf == true) ||
        (item.FirstHalf == true && item.SecondHalf == false) ||
        (item.FirstHalf == false && item.SecondHalf == true),
    );
    // console.log('NewLeavesArr = ', NewLeavesArr);
    // console.log('data = ', this.state.allStaffs);
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
      AlternateStaff: this.state.selectedStaff.length
        ? this.state.allStaffs.find(e => e.id === this.state.selectedStaff[0])
            .name
        : '',
      AlternateStaffReason: this.state.alternateReason,
      //NoOfDays: difference,
      Status: 0,
      CreatedDate: new Date().toISOString(),
      ModifiedDate: new Date().toISOString(),
    };
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    console.log(url);
    console.log(JSON.stringify(bodyData));

    try {
      const response = await axios.post(url, bodyData);
      //console.log('working');
      //  console.log(JSON.stringify(response.data));
      if (response.data.status == true) {
        this.setState(
          () => ({
            loader: false,
          }),
          () => {
            this.displayMsg(response.data.message, true, false);
            setTimeout(() => this.props.navigation.navigate('Leaves'), 4000);
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
          this.displayMsg(response.data.message, true, true);
        }
      }
    } catch (error) {
      this.setState({loader: false});
      this.displayMsg(error.message, true, true);
    }
  };

  displayMsg = (msg, showAlert, error) => {
    this.setState({
      msg,
      showAlert,
      error,
    });
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
    //console.log('dfiff', diff);
    return diff + 1;
  };

  render() {
    console.log(this.state.FinalArr);
    if (this.state.Loader) {
      return <CustomLoader />;
    }
    //('alernateStaff', this.state.alternateReason);
    return (
      <View style={styles.container}>
        <SubHeader
          title="Leave Request"
          //title="Leave Request"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
        <SuccessError
          error={this.state.error}
          subTitle={this.state.msg}
          isVisible={this.state.showAlert}
          deleteIconPress={() => this.setState({showAlert: false})}
        />
        {this.state.loader && (
          <CustomLoader loaderText={'Trying to raise your request'} />
        )}
        <ScrollView
          nestedScrollEnabled={true}
          contentContainerStyle={{paddingBottom: 100}}>
          <VStack

          //refreshControl={
          //  <RefreshControl
          //    style={{backgroundColor: '#E0FFFF'}}
          //    refreshing={this.state.refreshing}
          //    onRefresh={this._onRefresh.bind(this)}
          //    tintColor="#ff0000"
          //    title="Loading..."
          //    titleColor="#00ff00"
          //    //colors={['#ff0000', '#00ff00', '#0000ff']}
          //    //progressBackgroundColor="#ffff00"
          //  />
          //}
          >
            {this.state.showModal && (
              <CustomModal
                title={'Overlapping Request Dates'}
                isVisible={this.state.showModal}
                deleteIconPress={() => this.setState({showModal: false})}>
                {this.state.overlappingDatesInfo?.length > 0 &&
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
                    //this.LeaveIdentifier();
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

            {!this.state.CustomListLoader ? (
              <View
                style={{
                  width: '95%',
                  alignSelf: 'center',
                  backgroundColor: SubThemeColor,
                  borderRadius: 10,
                  marginVertical: 10,
                }}>
                <View
                  style={[
                    styles.headerContainer,
                    {backgroundColor: '#236DE7'},
                  ]}>
                  {/*<View style={[styles.headerTitleContainer, {width: '10%'}]}>
                    <Text style={[styles.text, {color: 'white'}]}>
                      {'SR No.'}
                    </Text>
                  </View>*/}
                  <View style={[styles.headerTitleContainer, {width: '20%'}]}>
                    <Text style={[styles.text, {color: 'white'}]}>
                      {'Eligible Leave'}
                    </Text>
                  </View>
                  <View style={[styles.headerTitleContainer, {width: '20%'}]}>
                    <Text style={[styles.text, {color: 'white'}]}>
                      {'Month/Year'}
                    </Text>
                  </View>
                  <View style={[styles.headerTitleContainer, {width: '20%'}]}>
                    <Text
                      style={[styles.text, {color: 'white', numberOfLines: 2}]}>
                      {'Remaining Leaves'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.headerTitleContainer,
                      {width: '20%'},
                      //{alignItems: 'flex-end'},
                    ]}>
                    <Text style={[styles.text, {color: 'white'}]}>
                      {'Apply'}
                    </Text>
                  </View>
                </View>
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{
                    width: '100%',
                    maxHeight: 300,
                    minHeight: 100,
                  }}>
                  {this.state.SelectedLeaveIdArr.length ? (
                    this.state.SelectedLeaveIdArr.map((item, index) => {
                      //console.log('SelectedLeaveIdArr item= ', item);
                      return (
                        <View
                          key={index}
                          style={[
                            styles.headerContainer,
                            {
                              justifyContent: 'space-between',
                              padding: 5,
                            },
                          ]}>
                          <View
                            style={[
                              styles.headerTitleContainer,
                              // {width: '30%'},
                              // {alignItems: 'flex-start', flex: 1},
                            ]}>
                            <Text style={[styles.text, {color: 'black'}]}>
                              {item.leaveName}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.headerTitleContainer,
                              //{flex: 1}
                              // {width: '15%'},
                            ]}>
                            <Text style={[styles.text, {color: 'red'}]}>
                              {item.monthlyLeaves + '/' + item.yearlyLeaves}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.headerTitleContainer,
                              //{flex: 1}
                              // {width: '20%'},
                            ]}>
                            <Text style={[styles.text, {color: 'red'}]}>
                              {item.remainingLeaveCount || ''}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.headerTitleContainer,
                              // {width: '20%'},
                              // {alignItems: 'flex-end', flex: 0.7},
                            ]}>
                            {/*<TouchableOpacity
                              onPress={() => {
                                if (this.state.Active == index) {
                                  this.setState(
                                    {Active: -1, LeaveType: ''},
                                    function () {},
                                  );
                                } else {
                                  this.setState({Active: index}, function () {
                                    this.setState(
                                      {LeaveType: item.leaveId},
                                      function () {
                                        console.log(
                                          'Selected LeaveType = ',
                                          this.state.LeaveType,
                                        ),
                                          this.GetDetailedLeaves();
                                        this.LeaveIdentifier(item.leaveId);
                                      },
                                    );
                                  });
                                }
                              }}>
                              {this.state.Active == index ? (
                                <View
                                  style={{
                                    width: 25,
                                    height: 25,
                                    marginHorizontal: 10,
                                    borderRadius: 25,
                                    backgroundColor: ThemeColor,
                                  }}
                                />
                              ) : (
                                <Thumbnail
                                  alt={'No image'}
                                  style={{
                                    width: 25,
                                    height: 25,
                                    marginHorizontal: 10,
                                    resizeMode: 'contain',
                                    tintColor: Colors.calendarBg,
                                  }}
                                  source={require('../../assets/check.png')}
                                />
                              )}
                              </TouchableOpacity>
                              */}
                            <CheckBox
                              checked={
                                this.state.Active == index ? true : false
                              }
                              onPress={() => {
                                if (this.state.Active == index) {
                                  this.setState(
                                    {Active: -1, LeaveType: ''},
                                    function () {},
                                  );
                                } else {
                                  this.setState({Active: index}, function () {
                                    this.setState(
                                      {LeaveType: item.leaveId},
                                      function () {
                                        // console.log(
                                        //   'Selected LeaveType = ',
                                        //   this.state.LeaveType,
                                        // ),
                                        this.GetDetailedLeaves();
                                        this.LeaveIdentifier(item.leaveId);
                                      },
                                    );
                                  });
                                }
                              }}
                              checkedCheckBoxColor="#1B6AEC"
                              uncheckedColor={ThemeColor}
                            />
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={{marginTop: 10, alignItems: 'center'}}>
                      {/* <ActivityIndicator /> */}
                      <Text>No data found</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            ) : (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 100,
                }}>
                <ActivityIndicator color={ThemeColor} />
              </View>
            )}
            {/* ) : null} */}
            {/* {this.state.LeaveType ? (
              <CustomTabs
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
              />
            ) : null} */}
            {this.state.LeaveType && this.state.AvailableLeaves != 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  width: wp('100'),
                  alignSelf: 'center',
                  justifyContent: 'space-around',
                  backgroundColor: 'white',
                  paddingVertical: 10,
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
                        () => this.GetDetailedLeaves(),
                      );
                    }}
                    //style={{backgroundColor: SubThemeColor}}
                    textStyle={{color: ThemeColor}}
                    onCancel={() => this.setState({dateVisible: false})}
                  />
                </View>
                <View style={{width: wp('45')}}>
                  <CustomCalendar
                    title={'Ending Date'}
                    date={this.state.ToDate}
                    AvailableLeaves={this.getAvailableLeaves()}
                    FromDate={this.state.FromDate}
                    onPress={() => this.setState({dateVisible1: true})}
                    isVisible={this.state.dateVisible1}
                    onConfirm={date => {
                      this.setState(
                        {
                          ToDate: date,
                          dateVisible1: false,
                          SelectedDate: true,
                          GetDetailedLeaves: [],
                        },
                        () => {
                          this.DateCheckerFunction();
                          this.GetDetailedLeaves();
                        },
                      );
                    }}
                    //style={{backgroundColor: SubThemeColor}}
                    textStyle={{color: ThemeColor}}
                    onCancel={() => this.setState({dateVisible1: false})}
                  />
                </View>
              </View>
            ) : null}
            {this.state.SelectedDate &&
            this.state.LeaveType &&
            this.state.AvailableLeaves != 0 ? (
              <View style={{paddingVertical: 10, backgroundColor: 'white'}}>
                <CustomList2
                  width="95%"
                  title1="Date"
                  title2="Session 1"
                  title3="Session 2"
                  t //itle4="Select"
                  color={SubThemeColor}
                  headerColor={'#236DE7'}>
                  <ScrollView nestedScrollEnabled={true}>
                    {this.state.GetDetailedLeaves.length ? (
                      this.state.GetDetailedLeaves.map((item, index) => {
                        let checkBoxFirst = null;
                        let checkBoxSecond = null;
                        if (item.includeInLeaves) {
                          if (item.isWeekOff) {
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
                              <CheckBox
                                checked={true}
                                title="WEEK-OFF"
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  padding: 0,
                                  borderColor: 'transparent',
                                }}
                                checkedColor={Colors.calendarBg}
                                disabled
                              />
                            );
                            checkBoxSecond = (
                              <CheckBox
                                checked={true}
                                title="WEEK-OFF"
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  padding: 0,
                                  borderColor: 'transparent',
                                }}
                                checkedColor={Colors.calendarBg}
                                disabled
                              />
                            );
                          }
                          if (!item.isWeekOff && !item.isStaffHoliday) {
                            checkBoxFirst = (
                              <CheckBox
                                title={'Morning'}
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  padding: 0,
                                  borderColor: 'transparent',
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
                                  padding: 0,
                                  borderColor: 'transparent',
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
                          if (item.isStaffHoliday) {
                            if (
                              item.isStaffHolidayFirstHalf &&
                              item.isStaffHolidaySecondHalf
                            ) {
                              checkBoxFirst = (
                                <CheckBox
                                  checked={true}
                                  title={item.holidayName}
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                  }}
                                  checkedColor={Colors.calendarBg}
                                  disabled
                                />
                              );
                              checkBoxSecond = (
                                <CheckBox
                                  checked={true}
                                  title={item.holidayName}
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                  }}
                                  checkedColor={Colors.calendarBg}
                                  disabled
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
                                    borderColor: 'transparent',
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
                                    borderColor: 'transparent',
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
                            // this.state.GetDetailedLeaves[
                            //   index
                            // ].FirstHalf = false;
                            // this.state.GetDetailedLeaves[
                            //   index
                            // ].SecondHalf = false;
                            // this.setState({
                            //   GetDetailedLeaves: [
                            //     ...this.state.GetDetailedLeaves,
                            //   ],
                            // });

                            checkBoxFirst = (
                              <CheckBox
                                checked={false}
                                title="WEEK-OFF"
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  padding: 0,
                                  borderColor: 'transparent',
                                }}
                                checkedColor={Colors.calendarBg}
                                disabled
                              />
                            );
                            checkBoxSecond = (
                              <CheckBox
                                checked={false}
                                title="WEEK-OFF"
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  padding: 0,
                                  borderColor: 'transparent',
                                }}
                                checkedColor={Colors.calendarBg}
                                disabled
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
                                  padding: 0,
                                  borderColor: 'transparent',
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
                                  padding: 0,
                                  borderColor: 'transparent',
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
                                <CheckBox
                                  checked={false}
                                  title={item.holidayName}
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                  }}
                                  checkedColor={Colors.calendarBg}
                                  disabled
                                />
                              );
                              checkBoxSecond = (
                                <CheckBox
                                  checked={false}
                                  title={item.holidayName}
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                  }}
                                  checkedColor={Colors.calendarBg}
                                  disabled
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
                                    borderColor: 'transparent',
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
                                    borderColor: 'transparent',
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
                        //console.log(item);
                        return (
                          <View
                            key={index}
                            style={[
                              styles.headerContainer,
                              {
                                marginBottom: 10,
                                padding: 0,
                              },
                            ]}>
                            <View style={[styles.headerTitleContainer]}>
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
            ) : null}
            {/* {this.state.allStaffs.length > 0 && ( */}
            {/* {  this.state.FinalArr.length > 0 &&
              this.state.FinalArr[0].isAlternateStaff && this.state.FinalArr[0].isAlternateStaffSameDepartment ? (
                <View style={{marginVertical: 5, backgroundColor: 'white'}}>
                  <AlternateStaffComp
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
                    selectedStaff={staff => {
                      this.setState({selectedStaff: staff});
                    }}
                    textValue={value => this.setState({alternateReason: value})}
                  />
                </View>
              )
              : */}
            {this.state.FinalArr.length > 0 &&
            this.state.FinalArr[0].isAlternateStaff &&
            this.state.FinalArr[0].isAlternateStaffSameDepartment ? (
              <View style={{marginVertical: 5, backgroundColor: 'white'}}>
                <CustomLabel
                  title={'Alternate Staff'}
                  containerStyle={{marginLeft: 20}}
                  size={14}
                />
                <CustomSelect
                  items={this.state.departments}
                  onSelectedItemsChange={value => {
                    //console.log('vvv', value);
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
                        //console.log('newStaff = ', newStaff);
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
                      //console.log('vvv', value);
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
            ) : null}
            {/* )} */}

            <View style={{marginTop: 5}}>
              <CustomTextArea
                isAttachmentMandatory={
                  this.state.FinalArr.length > 0 &&
                  this.state.FinalArr[0].isAttachmentMandatory
                }
                onPress2={() => {
                  this.setState(
                    {
                      Attachment: '',
                    },
                    function () {
                      //console.log('Deleted => ', this.state.Attachment);
                    },
                  );
                }}
                SelectedImage={Attachment => {
                  //console.log(Attachment);
                  this.setState({Attachment});
                }}
                text={this.state.Attachment.FileName || 'No files attached'}
                title="Reason For Leave"
                backgroundColor={SubThemeColor}
                placeholderTextColor={ThemeColor}
                width="100%"
                height={100}
                placeholder="Write reason for leave"
                value={this.state.Reason}
                onChangeText={text => {
                  //console.log('reson =', text);
                  this.setState({Reason: text});
                }}
                onPress={() => {
                  if (this.state.LeaveType == '') {
                    this.displayMsg('Please Select Leave', true, true);
                  } else if (this.state.FromDate == '') {
                    this.displayMsg('Please Select From Date', true, true);
                  } else if (this.state.ToDate == '') {
                    this.displayMsg('Please Select To Date', true, true);
                    // } else if (
                    //   this.state.FinalArr[0].isAlternateStaff &&
                    //   (this.state.selectedStaff.length === 0 ||
                    //     this.state.alternateReason === '')
                    // ) {
                    //   this.displayMsg(
                    //     'Please Select Alternate Staff and reason',
                    //     true,
                    //     true,
                    //   );
                  } else if (this.state.Reason == '') {
                    this.displayMsg(
                      'Please Enter The Reason For Leaves',
                      true,
                      true,
                    );
                  } else if (
                    this.state.FinalArr[0]?.isAttachmentMandatory &&
                    !this.state.Attachment.FileName
                  ) {
                    this.displayMsg('Attachment is missing.', true, true);
                  } else {
                    let tempGetDetailedLeaves = this.state.GetDetailedLeaves;
                    let NewLeavesArr = tempGetDetailedLeaves.filter(
                      item =>
                        item.FirstHalf != false || item.SecondHalf != false,
                    );
                    //console.log('NewLeavesArr = ', NewLeavesArr);
                    if (NewLeavesArr.length) {
                      this.setState({loader: true});
                      this.AddUpdateLeaveRequestNew(NewLeavesArr);
                    } else {
                      this.displayMsg(
                        'Please select atleast one Session (Morning/Evening)',
                        true,
                        true,
                      );
                    }
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
                  title="Approval Stages"
                  color={SubThemeColor}
                  key={0}
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
          {/*<View style={{ flex: 1 }}>*/}
        </ScrollView>
        {/*</View>*/}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    //height: 60,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5,
  },
  headerTitleContainer: {
    width: '20%',
    //height: '100%',
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
    fontSize: 12,
    lineHeight: 18,
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
});
