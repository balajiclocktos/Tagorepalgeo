import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Layout from '../common/Layout';
import CalendarStrip from '../common/CalendarStrip';
import { CustomTabs } from '../common/CustomTabs';
import { Colors } from '../../utils/configs/Colors';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AttendanceChart from '../common/AttendanceChart';
import LinearGradient from 'react-native-linear-gradient';
import { noTokenAPi, tokenApi } from '../../utils/apis';
import { Icon } from 'react-native-elements';
import CustomLabel from '../common/CustomLabel';
import Arrow from '../../assets/arrow.svg';
import CalendarCard from '../../assets/dateModal.svg';
import CustomModal from '../common/CustomModal';
import DateTimePicker from 'react-native-modal-datetime-picker';
import StaffMaster, { Define } from './components/StaffMaster';
import CustomLoader from '../Task Allocation/CustomLoader';
import { Calendar } from './components/TimeSheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  TABS,
  TABS1,
  PRESENT_FILTERS,
  GENDER_FILTERS,
  EXP_FILTERS,
  AGE_FILTERS,
  EXP_FILTERS_PAYOUT,
  AGE_FILTERS_PAYOUT,
  MONTHS,
  YEARS,
  TABS2,
  //SHIFT_FILTERS,
} from './constants/index';
import { AbsentCard, LeaveCard, NewPresentCard } from './components/TimeSheet';

import { arrayWithoutDuplicates, fileViewer } from '../../utils/helperFunctions';
import Payout from './components/Payout';

import { ActivityIndicator } from 'react-native';
import TaskStatus from './components/TaskStatus';
import TaskWheel from './components/TaskWheel';
import { SafeAreaView } from 'react-native';
import DatePicker from 'react-native-datepicker';
import LeaveChart from '../common/LeaveChart';
import { Avatar } from 'react-native-elements/dist/avatar/Avatar';
import { Select } from 'native-base';
import TimeSheetScreen from './screens/TimeSheetScreen';
import TaskStatusScreen from './screens/TaskStatusScreen';
import PayoutScreen from './screens/PayoutScreen';
import StaffMasterScreen from './screens/StaffMasterScreen';
import LeaveStatusScreen from './screens/LeaveStatusScreen';
import CustomCard from '../common/CustomCard';
export class Entry extends Component {
  state = {
    //activeTab: 'Time Sheet',
    activeTab: 'Staff Master',
    activeTab2: 'All',
    date: moment(new Date),
    dateModalFrom: moment().startOf('month').format('YYYY-MM-DD'),
    dateModalTo: moment(),
    instituteId: null,
    bearer_token: null,
    options: [],
    data: [],
    selectedValue: '',
    originalData: [],
    selectedFilter: 'Default',
    filterOptions: ['Simple CheckIn', 'Travel CheckIn'],
    modal: false,
    currentIndex: 0,
    staffCurrentIndex: 0,
    present: 0,
    absent: 0,
    late: 0,
    early: 0,
    staffData: [],
    taskData: [],
    originalStaffData: [],
    payoutData: [],
    originalPayoutData: [],
    currentFilterIndex: 0,
    //showAtt: true,
    total: 0,
    SHIFT_FILTERS: [],
    DEPT_FILTERS: [],
    DESIG_FILTERS: [],
    STAFF_FILTERS: [],
    LOCATION_FILTERS: [],
    SHIFTS_ALL: [],
    DEPT_ALL: [],
    DESIG_ALL: [],
    LOCATION_ALL: [],
    STAFFTYPE_ALL: [],
    height: 90,
    dates: [],
    tabLoader: false,
    ageTab: false,
    expTab: true,
    shiftTab: false,
    staffTypeTab: false,
    geoTab: false,
    checkInTypeTab: false,
    depTab: false,
    desigTab: false,
    genderTab: false,
    fromAge: 0,
    toAge: 100,
    fromExp: 0,
    toExp: 100,
    shiftId: 0,
    departmentId: 0,
    designationId: 0,
    staffTypeId: 0,
    assignedTypeId: 0,
    geolocationId: 0,
    gender: 'na',
    year: moment().format('YYYY'),
    month: moment().format('MM'),
    pageNumber: 0,
    LeaveData: [{}, {}, {}, {}, {}, {}],
    currentFilterItem: {
      id: 0,
      value: 'All',
    },
    taskIndex: 0,
    selectedYear: 0,
    selectedYear1: 0,
    yearsArray: [],
    masterLeaves: [],
    leaveData: [],
    keys: [],
    values: ['0', '0', '0', '0'],
    selectedLeaveValue: 0,
    dataToShow: [],
  };

  componentDidMount() {
    this.getUserData();
    // this.focus = this.props.navigation.addListener('focus', () =>
    //   this.getUserData(),
    // );
  }

  componentWillUnmount() {
    //this.props.navigation.removeListener(this.focus);
  }

  getUserData = async () => {
    try {
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const org_id = await AsyncStorage.getItem('org_id');
      this.setState({ instituteId: institute_id, bearer_token, org_id }, () => {
        //this.getAttendance();
        this.getStaffData();
        this.getShifts(institute_id);
        this.getDepartments();
        this.getDesignations();
        this.getStaffTypes();
        this.getLocations();
        this.getYearsArray();
        this.getMasterLeaves(Number(institute_id), Number(org_id)).then(
          types => {
            console.log('types:', types[0]);
            this.getLeaveChartDetails(types[0].id);
            this.getLeaveDetails(null, types[0].id);
          },
        );
      });
    } catch (e) {
      alert('Error retrieving user data. Please login again.');
    }
  };

  getLeaveChartDetails = async id => {
    const url = `api/Leave/GetLeaveChartDetails`;
    const body = {
      ChartLeaveTypeId: id,
      FromDate: this.state.yearsArray[this.state.selectedYear],
      ToDate: this.state.yearsArray[this.state.selectedYear1],
      OrganizationId: Number(this.state.org_id),
      //OrganizationId: 19111,
    };
    try {
      const res = await tokenApi();
      const response = await res.post(url, body);
      const { data } = response;
      const { keys, values } = data[0];
      console.log('values ===', values);
      this.setState({ keys, values });
    } catch (e) {
      console.log(e.message);
    }
  };
  getLeaveDetails = async (item, id) => {
    this.setState({ loader: true });
    const url = `api/Leave/GetLeaveDetails`;
    console.log(url);
    const body = {
      //Institutes: JSON.stringify([29380]),
      Institutes: JSON.stringify([Number(this.state.instituteId)]),
      ChartLeaveTypeId: id,
      FromDate: this.state.yearsArray[this.state.selectedYear],
      ToDate: this.state.yearsArray[this.state.selectedYear1],
      //OrganizationId: 19111,
      OrganizationId: Number(this.state.org_id),
      IsDepartmentType: this.state.depTab,
      DepartmentTypeId: item ? item.id : 0,
      IsGender: this.state.genderTab,
      IsStaffType: this.state.staffTypeTab,
      StaffTypeId: item ? item.id : 0,
      Gender: this.state.gender,
      PageNumber: this.state.pageNumber,
      PageSize: 10,
    };
    console.log('body_Leave', body);
    try {
      const res = await tokenApi();
      const response = await res.post(url, body);
      const { data } = response;
      console.log('GetLeaveDetails response = ', data);
      this.setState({ leaveData: data, originalLeaveData: data, loader: false });
    } catch (e) {
      this.setState({ loader: false });
      console.log(e.message);
    }
  };

  getMasterLeaves = async (institute_id, organisation_id) => {
    const ii = `[${institute_id}]`;
    const url = `api/Leave/GetMasterLeaveTypesForInstitutes/${ii}/${organisation_id}`;
    console.log('master_url', url);
    try {
      const res = await tokenApi();
      const response = await res.get(url);
      console.log('master', response.data);
      this.setState({ masterLeaves: response.data });
      return response.data;
    } catch (e) {
      console.log('master_error', e.message);
    }
  };

  getYearsArray = async () => {
    const url = `api/Leave/GetHRMasterToday/${this.state.instituteId}/${this.state.org_id}`;
    //console.log('url', url);
    try {
      const res = await tokenApi();
      const response = await res.get(url);
      //console.log(response.data);
      this.setState({ yearsArray: response.data });
    } catch (e) {
      console.log('yearsError', e.message);
      // alert(e.message);
    }
  };

  getShifts = async id => {
    try {
      const response = await (
        await tokenApi()
      ).get('api/Shift/GetShiftList/' + id);
      const { data } = response;
      const shifts = data.map(e => `${e.shiftName}`);
      let a = shifts.reduce(function (res, current) {
        return res.concat([current, current]);
      }, []);
      let s = a;
      a.forEach((e, i) => {
        if (i % 2 === 0) {
          s[i] = e + ' (A)';
        } else {
          s[i] = e + ' (P)';
        }
      });
      a = ['All', ...s];

      this.setState({
        SHIFT_FILTERS: a,
        SHIFT_FILTERS_ORIG: shifts,
        SHIFTS_ALL: data,
      });
    } catch (e) {
      alert('Error in getting shifts:' + e.message);
    }
  };

  getDepartments = async () => {
    try {
      const response = await (
        await tokenApi()
      ).get('api/Master/GetDepartment/' + this.state.instituteId);
      const { data } = response;
      const depts = data.map(e => `${e.department}`);
      let a = depts.reduce(function (res, current) {
        return res.concat([current, current]);
      }, []);
      let s = a;
      a.forEach((e, i) => {
        if (i % 2 === 0) {
          s[i] = e + ' (A)';
        } else {
          s[i] = e + ' (P)';
        }
      });
      a = ['All', ...s];

      this.setState({
        DEPT_FILTERS: a,
        DEPT_FILTERS_ORIG: depts,
        DEPT_ALL: data,
      });
    } catch (e) {
      alert(e.message);
    }
  };

  getDesignations = async () => {
    try {
      const response = await (
        await tokenApi()
      ).get('api/Master/GetDesignation/' + this.state.instituteId);
      const { data } = response;
      const desigs = data.map(e => `${e.designation}`);
      let a = desigs.reduce(function (res, current) {
        return res.concat([current, current]);
      }, []);
      let s = a;
      a.forEach((e, i) => {
        if (i % 2 === 0) {
          s[i] = e + ' (A)';
        } else {
          s[i] = e + ' (P)';
        }
      });
      a = ['All', ...s];

      this.setState({
        DESIG_FILTERS: a,
        DESIG_FILTERS_ORIG: desigs,
        DESIG_ALL: data,
      });
    } catch (e) {
      alert(e.message);
    }
  };

  getStaffTypes = async () => {
    const url = `api/Master/GetStaffType/${this.state.instituteId}`;
    try {
      const res = await tokenApi();
      const response = await res.get(url);
      const { data } = response;

      const uniques = arrayWithoutDuplicates(data, 'type');
      console.log('uniques', uniques);
      const uu = uniques.map(a => `${a.type}`);
      this.setState({ STAFF_FILTERS: ['All', ...uu], STAFFTYPE_ALL: uniques });
    } catch (e) {
      alert(e.message);
    }
  };
  getLocations = async () => {
    const url = `api/GeoFencing/${this.state.instituteId}`;
    try {
      const res = await tokenApi();
      const response = await res.get(url);
      const { data } = response;
      const { rows } = data;
      const uu = rows.map(a => `${a.accessLocation} ${a.radius} m`);
      this.setState({ LOCATION_FILTERS: ['All', ...uu], LOCATION_ALL: rows });
    } catch (e) {
      alert(e.message);
    }
  };

  getAttendance = async () => {
    this.setState({ loader: true });
    const url = 'api/Attendance/GetAppDashBoardData';
    const url1 = 'api/Staff/GetTimesheetDetails';
    const body1 = {
      AbsentStatus: false,
      AttendDate: '2022-01-27T01:59:10.400Z',
      CheckinId: 0,
      Institutes: null,
      IsAbsent: false,
      IsDepartment: false,
      IsDesignation: false,
      IsEarlyOut: false,
      IsGender: false,
      IsGeolocation: false,
      IsIndividual: false,
      IsLateIn: false,
      IsLeave: false,
      IsOnDuty: false,
      IsOverTime: false,
      IsPermission: false,
      IsPresent: true,
      IsShift: false,
      OrganizationId: 2,
      PresentStatus: false,
    };
    const body = {
      instituteId: this.state.instituteId,
      //instituteId: 1,
      date: moment(this.state.date).format("YYYY-MM-DDTHH:mm:ss.SSSSZ"),
    };
    await console.log('GetAppDashBoardData url = ', url);
    await console.log('GetAppDashBoardData body = ', body);
    try {
      const response = await (await tokenApi()).post(url, body);
      const { data } = response;
      await console.log('GetAppDashBoardData response = ', data);
      const attendanceArray = data.data;
      this.setState({ loader: false });
      let depts = [];
      data.forEach(e => depts.push(e.department));
      console.log("depts=depts", depts)
      const { length } = depts;
      const present = data.filter(e => !e.absent).length;
      const absent = data.filter(e => e.absent).length;
      const late = data.filter(
        e => !e.absent && e.firstHalfStatus === 'Late',
      ).length;
      const early = data.filter(
        e => !e.absent && e.secondHalfStatus === 'Early',
      ).length;

      this.setState({ present, absent, late, early, total: length }, () => {
        // await console.log("absent === absent", absent)
      });

      const filteredData = response.data.filter((e, i) => e.absent === false);
      const filteredData2 = response.data.filter((e, i) => e.absent === true);
      await console.log("filteredData2", filteredData2)
      // const filteredData = response.data.filter((e, i) => e.firstHalfAttendance === "Present" || e.secondHalfAttendance == "Present");
      this.setState({
        data: filteredData,
        originalData: data,
        selectedValue: data[0].department,
        options: [...new Set(depts)],
      });
      console.log('deptss', new Set(depts));
      console.log('data =====>>>>1', filteredData.length, filteredData);
    } catch (e) {
      console.log('error====', e.message);
      this.setState({ loader: false });
    }
  };

  setDate = date => {
    console.log("date----", date);
    this.setState({ date }, () => this.getAttendance());
  };

  renderItem = ({ item, index }) => {
    const { activeTab, currentIndex, taskIndex } = this.state;
    const indexS = activeTab === 'Time Sheet' ? currentIndex : taskIndex;
    return (
      <TouchableOpacity
        onPress={() => {
          if (activeTab === 'Time Sheet') {
            this.setState({ currentFilterIndex: 0 }, () =>
              this.filterData(index),
            );
          } else {
            this.setState({ taskIndex: index }, () => this.getTaskData());
          }
        }}>
        <LinearGradient
          style={{
            //minWidth: '10%',
            borderRadius: 26,
            padding: 8,
            marginRight: 10,
            borderWidth: 1,
            borderColor: '#AAAAAA',
          }}
          colors={indexS === index ? Colors.button : ['white', 'white']}>
          <Text
            style={{
              textAlign: 'center',
              color: indexS === index ? Colors.white : 'black',
              fontFamily: 'Poppins-Regular',
            }}>
            {item}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  renderItemStaff = ({ item, index }) => {
    const { activeTab, staffCurrentIndex } = this.state;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState(
            { staffCurrentIndex: index, currentFilterIndex: 0, staffData: [] },
            () => {
              if (activeTab === 'Staff Master') {
                this.getStaffData();
              }
              if (activeTab === 'Payout') {
                this.getPayoutData({ id: 0, value: 'All' }, true);
              }
            },
          );
        }}>
        <LinearGradient
          style={{
            //minWidth: '10%',
            borderRadius: 26,
            padding: 8,
            marginRight: 10,
            borderWidth: 1,
            borderColor: '#AAAAAA',
          }}
          colors={
            staffCurrentIndex === index ? Colors.button : ['white', 'white']
          }>
          <Text
            style={{
              textAlign: 'center',
              color: staffCurrentIndex === index ? Colors.white : 'black',
              fontFamily: 'Poppins-Regular',
            }}>
            {item}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  renderItemLeave = ({ item, index }) => {
    const { activeTab, staffCurrentIndex } = this.state;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState(
            {
              staffCurrentIndex: index,
              currentFilterIndex: 0,
              leaveData: [],
              activeTab2: 'All',
            },
            () => {
              //this.getLeaveChartDetails(item.id);
              this.getLeaveDetails(null, item.id);
            },
          );
        }}>
        <LinearGradient
          style={{
            //minWidth: '10%',
            borderRadius: 26,
            padding: 8,
            marginRight: 10,
            borderWidth: 1,
            borderColor: '#AAAAAA',
          }}
          colors={
            staffCurrentIndex === index ? Colors.button : ['white', 'white']
          }>
          <Text
            style={{
              textAlign: 'center',
              color: staffCurrentIndex === index ? Colors.white : 'black',
              fontFamily: 'Poppins-Regular',
            }}>
            {item.name}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  filterList = (value, inc) => {
    const { activeTab } = this.state;
    console.log('val', value);
    const index =
      activeTab === 'Time Sheet'
        ? this.state.currentIndex
        : this.state.staffCurrentIndex;
    const { originalData, originalStaffData } = this.state;
    if (activeTab === 'Time Sheet') {
      const newData = originalData.filter(e => {
        let key;
        if (index == 0 || index == 2 || index == 3 || index == 4) {
          if (value === 'All') {
            return !e.absent;
          }
          key = e.modeOfCheckIn;
        }
        if (index === 8) {
          if (value === 'All') {
            return e;
          }
          if (value === 'Male (P)') {
            return e.gender.toLowerCase() === 'male' && !e.absent;
          }
          if (value === 'Male (A)') {
            return e.gender.toLowerCase() === 'male' && e.absent;
          }
          if (value === 'Female (P)') {
            return e.gender.toLowerCase() === 'female' && !e.absent;
          }
          if (value === 'Female (A)') {
            return e.gender.toLowerCase() === 'female' && e.absent;
          }
        }
        if (index === 9) {
          if (value === 'All') {
            return e;
          }
          let ii = value.slice(0, -4);
          if (inc % 2 == 0) {
            return e.shiftName === ii && !e.absent;
          }
          return e.shiftName === ii && e.absent;
        }

        if (index === 10) {
          if (value === 'All') {
            return e;
          }
          let ii = value.slice(0, -4);
          if (inc % 2 == 0) {
            return e.department === ii && !e.absent;
          }
          return e.department === ii && e.absent;
        }
        if (index === 11) {
          if (value === 'All') {
            return e;
          }
          let ii = value.slice(0, -4);
          if (inc % 2 == 0) {
            return e.designation === ii && !e.absent;
          }
          return e.designation === ii && e.absent;
        }
        if (index === 12) {
          key = e.name;
        }
        return key === value && !e.absent;
      });
      // console.log('nn', newData);
      this.setState({ data: newData, selectedFilter: value });
    } else if (activeTab === 'Staff Master') {
      const newData = originalStaffData.filter(e => {
        let key;
        if (value == 'All') {
          return e;
        }
        if (index === 0) {
          if (value === '0-1') {
            return e.experience >= 0 && e.experience < 1;
          }
          if (value === '1-2') {
            return e.experience >= 1 && e.experience < 2;
          }
          if (value === '2-3') {
            return e.experience >= 2 && e.experience < 3;
          }
          if (value === '3-5') {
            return e.experience >= 3 && e.experience < 5;
          }
          if (value === '5-10') {
            return e.experience >= 5 && e.experience < 10;
          }
          if (value === '10-15') {
            return e.experience >= 10 && e.experience < 15;
          }
          if (value === '15-20') {
            return e.experience >= 15 && e.experience < 20;
          }
          if (value === '20-25') {
            return e.experience >= 20 && e.experience < 25;
          }
          if (value === '25-30') {
            return e.experience >= 25 && e.experience < 30;
          }
          if (value === '>30') {
            return e.experience >= 30;
          }
        }
        if (index === 1) {
          if (value === '<20') {
            return e.age < 20;
          }
          if (value === '20-25') {
            return e.age >= 20 && e.age < 25;
          }
          if (value === '25-30') {
            return e.age >= 25 && e.age < 30;
          }
          if (value === '30-35') {
            return e.age >= 30 && e.age < 35;
          }
          if (value === '35-40') {
            return e.age >= 35 && e.age < 40;
          }
          if (value === '40-45') {
            return e.age >= 40 && e.age < 45;
          }
          if (value === '45-50') {
            return e.age >= 45 && e.age < 50;
          }
          if (value === '50-55') {
            return e.age >= 50 && e.age < 55;
          }
          if (value === '55-60') {
            return e.age >= 55 && e.age < 60;
          }
          if (value === '>60') {
            return e.age >= 60;
          }
        }
        if (index === 2) {
          return e.type.toLowerCase() === value.toLowerCase();
        }
        if (index === 3) {
          if (e.isLocationShiftMapped) {
            return value.includes(e.shiftData[0].locationsAssigned[0]);
          }
        }
        if (index === 4) {
          return e.managerName.toLowerCase() === value.toLowerCase();
        }
        if (index === 5) {
          if (!e.isLocationShiftMapped) {
            key = 'Not Assigned';
          } else {
            const { locationsAssigned } = e.shiftData[0];
            if (locationsAssigned[0] === 'Travel CheckIn') {
              key = 'Travel CheckIn';
            } else {
              key = 'Simple CheckIn';
            }
          }
          return key === value;
        }
        if (index === 6) {
          return e.gender.toLowerCase() === value.toLowerCase();
        }
        if (index === 7) {
          if (e.isLocationShiftMapped) {
            const { shiftName } = e.shiftData[0];
            return shiftName.toLowerCase() === value.toLowerCase();
          }
        }
        if (index === 8) {
          return e.department.toLowerCase() === value.toLowerCase();
        }
        if (index === 9) {
          return e.designation.toLowerCase() === value.toLowerCase();
        }
      });
      this.setState({ staffData: newData, selectedFilter: value });
    } else {
      this.getPayoutData(item);
    }
  };

  filterData = index => {
    this.setState(
      {
        currentIndex: index,
        count: null,
        tabLoader: true,
      },
      () => {
        const data = this.state.originalData;
        let filteredData = [];
        if (
          index == 0
          // index == 8 ||
          // index === 9 ||
          // index === 10 ||
          // index === 11 ||
          // index === 12
        ) {
          filteredData = data.filter((e, i) => !e.absent);
        }
        if (index == 1) {
          filteredData = data.filter((e, i) => e.absent);
        }
        if (index == 2) {
          filteredData = data.filter((e, i) => e.firstHalfStatus == 'Late');
        }
        if (index == 3) {
          filteredData = data.filter((e, i) => e.secondHalfStatus == 'Early');
        }
        if (index == 4) {
          filteredData = data.filter((e, i) => e.overTimeHours !== null);
        }
        if (index == 5) {
          filteredData = data.filter((e, i) => e.isLeave);
        }
        if (index == 6) {
          filteredData = data.filter(
            (e, i) =>
              e.firstHalfAttendance.includes('Permission') ||
              e.secondHalfAttendance.includes('Permission'),
          );
        }
        if (index == 7) {
          filteredData = data.filter(
            (e, i) =>
              e.firstHalfAttendance.includes('OD') ||
              e.secondHalfAttendance.includes('OD'),
          );
        }
        if (
          index === 8 ||
          index === 9 ||
          index === 10 ||
          index === 11 ||
          index === 12
        ) {
          filteredData = data;
        }

        //console.log('ff', filteredData);
        this.setState({ data: filteredData, tabLoader: false });
      },
    );
  };

  changeWheel = value => {
    this.setState({ selectedValue: value }, () => {
      const { originalData } = this.state;
      const dept = originalData.filter(e => e.department === value);
      const { length } = dept;
      const present = dept.filter(e => !e.absent).length;
      const absent = dept.filter(e => e.absent).length;
      const late = dept.filter(
        e => !e.absent && e.firstHalfStatus === 'Late',
      ).length;
      const early = dept.filter(
        e => !e.absent && e.secondHalfStatus === 'Early',
      ).length;
      this.setState({ present, absent, late, early, total: length });
    });
  };

  showModal = e => {
    this.setState({ currentStaff: e.staffCode }, () => {
      this.getCount().then(() => this.setState({ modal: true }));
    });
  };

  getCount = async () => {
    const { currentIndex } = this.state;
    const url = 'api/Attendance/GetAppDashBoardDataInDateRange';
    const body = {
      InstituteId: this.state.instituteId,
      FromDate: this.state.dateModalFrom,
      ToDate: this.state.dateModalTo,
      StaffCode: this.state.currentStaff,
    };
    const { FromDate, ToDate } = body;
    const diff = moment(ToDate, 'YYYY-MM-DDTHH:mm:ss.SSSSZ').diff(
      moment(FromDate, 'YYYY-MM-DDTHH:mm:ss.SSSSZ'),
      'days',
    );
    console.log('diff', diff);

    try {
      const response = await tokenApi();
      const result = await response.post(url, body);
      const allData = result.data[0].attendanceData.map(e => {
        return {
          date: moment(e.date, 'YYYY-MM-DDTHH:mm:ss').format('DD-MM-YYYY'),
          scheduledCheckInTime: moment(
            e.scheduledCheckInTime,
            'YYYY-MM-DDTHH:mm:ss',
          ).format('h:mm a'),
          scheduledCheckOutTime: moment(
            e.scheduledCheckOutTime,
            'YYYY-MM-DDTHH:mm:ss',
          ).format('h:mm a'),
          actualCheckInTime: moment(
            e.actualCheckInTime,
            'YYYY-MM-DDTHH:mm:ss',
          ).format('h:mm a'),
          actualCheckOutTime: moment(
            e.actualCheckOutTime,
            'YYYY-MM-DDTHH:mm:ss',
          ).format('h:mm a'),
          firstHalfStatus: e.firstHalfStatus,
          secondHalfStatus: e.secondHalfStatus,
          isLeave: e.isLeave,
          firstHalfAttendance: e.firstHalfAttendance,
          secondHalfAttendance: e.secondHalfAttendance,
          overTimeHours: e.overTimeHours,
          absent: e.absent,
        };
      });
      const dates = result.data[0].attendanceData.map(e =>
        moment(e.date, 'YYYY-MM-DDTHH:mm:ss').format('DD'),
      );

      console.log('ddtaata', allData);

      const count = result.data[0].attendanceData.length;
      const remain = diff + 1 - count;
      if (result.data[0].absentAllDays) {
        if (currentIndex === 1) {
          return this.setState({ count: 'All', dataToShow: allData });
        }
        return this.setState({ count: 0 });
      }
      if (currentIndex === 0) {
        const presentData = allData.filter(e => !e.absent);
        return this.setState({ count, dates, dataToShow: presentData });
      }
      if (currentIndex === 1) {
        const absentData = allData.filter(e => e.absent);

        return this.setState({ count: remain, dataToShow: absentData });
      }
      if (currentIndex === 2) {
        const lateLength = result.data[0].attendanceData.filter(
          e => e.firstHalfStatus === 'Late',
        ).length;
        const lateData = allData.filter(e => e.firstHalfStatus === 'Late');
        const dates = result.data[0].attendanceData
          .filter(e => e.firstHalfStatus === 'Late')
          .map(f => moment(f.date, 'YYYY-MM-DDTHH:mm:ss').format('DD'));
        return this.setState({ count: lateLength, dates, dataToShow: lateData });
      }
      if (currentIndex === 3) {
        const earlyLength = result.data[0].attendanceData.filter(
          e => e.secondHalfStatus === 'Early',
        ).length;
        const earlyData = allData.filter(e => e.secondHalfStatus === 'Early');
        const dates = result.data[0].attendanceData
          .filter(e => e.firstHalfStatus === 'Early')
          .map(f => moment(f.date, 'YYYY-MM-DDTHH:mm:ss').format('DD'));
        return this.setState({
          count: earlyLength,
          dates,
          dataToShow: earlyData,
        });
      }
      if (currentIndex === 4) {
        const lateLength = result.data[0].attendanceData.filter(
          e => e.overTimeHours > 0,
        ).length;
        const overTimeData = allData.filter(e => e.overTimeHours > 0);
        const dates = result.data[0].attendanceData
          .filter(e => e.overTimeHours > 0)
          .map(f => moment(f.date, 'YYYY-MM-DDTHH:mm:ss').format('DD'));
        return this.setState({
          count: lateLength,
          dates,
          dataToShow: overTimeData,
        });
      }
      if (currentIndex === 5) {
        const lateLength = result.data[0].attendanceData.filter(
          e => e.isLeave,
        ).length;
        const leaveData = allData.filter(e => e.isLeave);

        const dates = result.data[0].attendanceData
          .filter(e => e.isLeave)
          .map(f => moment(f.date, 'YYYY-MM-DDTHH:mm:ss').format('DD'));
        return this.setState({ count: lateLength, dates, dataToShow: leaveData });
      }
      if (currentIndex === 6) {
        const lateLength = result.data[0].attendanceData.filter(
          e =>
            e.firstHalfAttendance.includes('Permission') ||
            e.secondHalfAttendance.includes('Permission'),
        ).length;
        const permissionData = allData.filter(
          e =>
            e.firstHalfAttendance.includes('Permission') ||
            e.secondHalfAttendance.includes('Permission'),
        );
        const dates = result.data[0].attendanceData
          .filter(
            e =>
              e.firstHalfAttendance.includes('Permission') ||
              e.secondHalfAttendance.includes('Permission'),
          )
          .map(f => moment(f.date, 'YYYY-MM-DDTHH:mm:ss').format('DD'));
        return this.setState({
          count: lateLength,
          dates,
          dataToShow: permissionData,
        });
      }
      if (currentIndex === 7) {
        const lateLength = result.data[0].attendanceData.filter(
          e =>
            e.firstHalfAttendance.includes('OD') ||
            e.secondHalfAttendance.includes('OD'),
        ).length;
        const OData = allData.filter(
          e =>
            e.firstHalfAttendance.includes('OD') ||
            e.secondHalfAttendance.includes('OD'),
        );
        const dates = result.data[0].attendanceData
          .filter(
            e =>
              e.firstHalfAttendance.includes('OD') ||
              e.secondHalfAttendance.includes('OD'),
          )
          .map(f => moment(f.date, 'YYYY-MM-DDTHH:mm:ss').format('DD'));
        return this.setState({ count: lateLength, dates, dataToShow: OData });
      }
    } catch (e) {
      console.log('e', e.message);
    }
  };

  getStaffData = async () => {
    this.setState({ loader: true });
    const url = 'api/Attendance/GetAppLocationShiftData';
    console.log('url = ', url);
    const body = {
      instituteId: this.state.instituteId,
      //instituteId: 1,
      date: moment(),
    };
    console.log('body = ', body);
    try {
      const response = await (await tokenApi()).post(url, body);
      const { data } = response;
      console.log('response = ', data);
      this.setState({ loader: false });

      this.setState({ staffData: data, originalStaffData: data });
    } catch (e) {
      console.log('e', e);
      this.setState({ loader: false });
    }
  };

  getTaskData = async () => {
    this.setState({ loader: true });
    const url = 'api/StaffTaskAllotment/GetStaffTaskDetails';

    const body = {
      // instituteId: this.state.instituteId,
      // taskStatusId: this.state.taskIndex,
      // taskDate: this.state.date,
      // organisationId: org_id,
      // pageNumber: 0,
      // pageSize: 16,

      OrganizationId: Number(this.state.org_id),
      TaskDate: this.state.date,
      PageNumber: 0,
      PageSize: 16,
      TaskStatusId: this.state.taskIndex,
      InstituteId: Number(this.state.instituteId),
    };
    try {
      const response = await (await tokenApi()).post(url, body);
      const { data } = response;
      this.setState({ loader: false });
      console.log('dddd', data);
      this.setState({ taskData: data });
    } catch (e) {
      console.log('e', e);
      this.setState({ loader: false });
    }
  };
  getPayoutDataInitial = async item => {
    this.setState({ loader: true });
    const url = `api/Staff/GetStaffPayoutDetails`;
    const body = {
      InstituteId: Number(this.state.instituteId),
      OrganizationId: Number(this.state.org_id),
      FromAge: this.state.staffCurrentIndex === 1 ? item?.from : 0,
      ToAge: this.state.staffCurrentIndex === 1 ? item?.to : 0,
      //FromExperience: this.state.fromExp,
      FromExperience: this.state.staffCurrentIndex === 0 ? item?.from || 0 : 0,
      ToExperience: this.state.staffCurrentIndex === 0 ? 0 : 0,
      //ToExperience: this.state.toExp,
      IsExperience: this.state.staffCurrentIndex === 0,
      IsAge: this.state.staffCurrentIndex === 1,
      IsStaffType: this.state.staffCurrentIndex === 2,
      IsDepartmentType: this.state.staffCurrentIndex === 8,
      IsDesignationType: this.state.staffCurrentIndex === 9,
      IsReportingManager: this.state.staffCurrentIndex === 4,
      IsGeoLocation: this.state.staffCurrentIndex === 3,
      IsShiftType: this.state.staffCurrentIndex === 7,
      IsAssignedType: this.state.staffCurrentIndex === 5,
      IsGender: this.state.staffCurrentIndex === 6,
      StaffTypeId: this.state.staffCurrentIndex === 2 ? item?.id : 0,
      DepartmentTypeId: this.state.staffCurrentIndex === 8 ? item?.id : 0,
      DesignationId: this.state.staffCurrentIndex === 9 ? item?.id : 0,
      GeoLocationId: this.state.staffCurrentIndex === 3 ? item?.id : 0,
      AssignedTypeId: this.state.staffCurrentIndex === 5 ? item?.id : 0,
      ManagerStaffCode: this.state.staffCurrentIndex === 4 ? item?.id : 'false',
      Gender: this.state.gender,
      ShiftId: this.state.staffCurrentIndex === 7 ? item?.id : 0,
      Month: Number(this.state.month),
      Year: Number(this.state.year),
      PageSize: 20,
      PageNumber: 1,
    };
    console.log('body ===>', body);
    try {
      const response = await (await tokenApi()).post(url, body);
      const { data } = response;
      this.setState({ loader: false });
      if (!data.status) {
        return;
      }
      //console.log('dddd', data);
      this.setState({ payoutData: data.data, originalPayoutData: data.data });
    } catch (e) {
      console.log('e', e);
      this.setState({ loader: false });
    }
  };
  getPayoutData = async (item, check, update) => {
    console.log('item', item, check, update);
    this.setState({ loader: true });
    const url = `api/Staff/GetStaffPayoutDetails`;
    const body = {
      InstituteId: Number(this.state.instituteId),
      OrganizationId: Number(this.state.org_id),
      FromAge:
        this.state.staffCurrentIndex === 1 ? (item.from ? item.from : 0) : 0,
      ToAge: this.state.staffCurrentIndex === 1 ? (item.to ? item.to : 0) : 0,
      //FromExperience: this.state.fromExp,
      FromExperience: this.state.staffCurrentIndex === 0 ? item?.from || 0 : 0,
      ToExperience: this.state.staffCurrentIndex === 0 ? item?.to || 0 : 0,
      //ToExperience: this.state.toExp,
      IsExperience: this.state.staffCurrentIndex === 0,
      IsAge: this.state.staffCurrentIndex === 1,
      IsStaffType: this.state.staffCurrentIndex === 2,
      IsDepartmentType: this.state.staffCurrentIndex === 8,
      IsDesignationType: this.state.staffCurrentIndex === 9,
      IsReportingManager: this.state.staffCurrentIndex === 4,
      IsGeoLocation: this.state.staffCurrentIndex === 3,
      IsShiftType: this.state.staffCurrentIndex === 7,
      IsAssignedType: this.state.staffCurrentIndex === 5,
      IsGender: this.state.staffCurrentIndex === 6,
      StaffTypeId: this.state.staffCurrentIndex === 2 ? item?.id : 0,
      DepartmentTypeId: this.state.staffCurrentIndex === 8 ? item?.id : 0,
      DesignationId: this.state.staffCurrentIndex === 9 ? item?.id : 0,
      GeoLocationId: this.state.staffCurrentIndex === 3 ? item?.id : 0,
      AssignedTypeId: this.state.staffCurrentIndex === 5 ? item?.id : 0,
      ManagerStaffCode: this.state.staffCurrentIndex === 4 ? item?.id : 'false',
      Gender: this.state.gender,
      ShiftId: this.state.staffCurrentIndex === 7 ? item?.id : 0,
      Month: Number(this.state.month),
      Year: Number(this.state.year),
      PageSize: 20,
      PageNumber: this.state.pageNumber,
    };
    console.log('body ===>', body);
    try {
      const response = await (await tokenApi()).post(url, body);
      const { data } = response;
      this.setState({ loader: false });
      // if (data.data.length === 0) {
      //   return this.setState({payoutData: []});
      // }
      if (update) {
        this.setState({
          //pageNumber: this.state.pageNumber + 1,
          payoutData: [...this.state.payoutData, ...data.data],
          originalPayoutData: [...this.state.originalPayoutData, ...data.data],
        });
      } else {
        this.setState({ payoutData: [...data.data] });
      }
      //console.log('dddd', data);
      if (check) {
        this.setState({ originalPayoutData: data.data });
      }
    } catch (e) {
      console.log('e', e);
      this.setState({ loader: false });
    }
  };

  renderItem1 = ({ item, index }) => (
    <StaffMaster
      name={item.name}
      age={item.age.toString()}
      staffPhoto={item.staffPhoto}
      department={item.department}
      gender={item.gender}
      designation={item.designation}
      staffCode={item.staffCode}
      shiftData={item.shiftData}
      type={item.type || 'N/A'}
      experience={item.experience.toString()}
      email={item.emailId || 'N/A'}
      mobile={item.mobileNumber || 'N/A'}
      reportingManager={item.managerName || 'N/A'}
      managerPhoto={item.managerPhoto}
      rDesignation={item.managerDesignation || 'N/A'}
      scheduledCheckOutTime={item.scheduledCheckOutTime || 'N/A'}
      scheduledCheckInTime={item.scheduledCheckInTime || 'N/A'}
    />
  );
  renderItem2 = ({ item, index }) => {
    console.log('iii', item);
    return (
      <Payout
        name={item.staffName}
        onPress2={() => {
          // alert("hit")
        }}
        staffPhoto={item.staffImage}
        age={item.age.toString()}
        department={item.staffDepartment}
        gender={item.gender || 'male'}
        designation={item.staffDesignation}
        staffCode={item.staffCode}
        type={item.staffType || 'N/A'}
        experience={item.experience.toString()}
        email={item.emailId || 'N/A'}
        mobile={item.phoneNumber || 'N/A'}
        reportingManager={item.reportingStaff || 'N/A'}
        managerPhoto={item.reportingStaffImage}
        rDesignation={item.reportingStaffDesignation || 'N/A'}
        shiftName={item.shiftName}
        lop={item.lop}
        totalAllowances={item.totalAllowances}
        totalDeductions={item.totalDeductions}
        netSalary={item.netSalary}
        totalWorkingDays={item.totalWorkingDays}
        travelCheckin={item.travelCheckin}
        shiftCheckOutTime={item.shiftCheckOutTime}
        shiftCheckInTime={item.shiftCheckInTime}
        checkInType={item.checkInType}
        assignedLocation={item.assignedLocation}
      />
    );
  };
  renderItem3 = ({ item, index }) => (
    <TaskStatus
      name={item.staffName}
      staffPhoto={item.staffImage}
      department={item.departmentName}
      gender={item.gender || 'male'}
      designation={item.designationName}
      staffCode={item.staffCode}
      type={item.staffTypeName || 'N/A'}
      reportingManager={item.allotedStaffName || 'N/A'}
      managerPhoto={item.allotedStaffImage}
      rDesignation={item.allotedStaffDesignation || 'N/A'}
      status={item.status}
      mandatory={item.isMandatory}
      attachments={JSON.parse(item.attachments)}
      taskTitle={item.task_subject}
      taskTimings={item.taskTimings}
      taskDescription={item.task_Description}
      onPress={() => fileViewer(JSON.parse(item.attachments)[0])}
    />
  );

  filterStaffList = () => {
    const { originalStaffData, low, high, staffCurrentIndex } = this.state;
    const filteredData = originalStaffData.filter(e => {
      if (staffCurrentIndex === 0) {
        return e.experience >= low && e.experience <= high;
      }
      if (staffCurrentIndex === 1) {
        return e.age >= low && e.age <= high;
      }
    });
    this.setState({ staffData: filteredData, show: true });
  };

  renderTimeSheetCard = ({ item, index }) => {
    let e = item,
      i = index,
      card = null;

    if (e.absent) {
      console.log('hit AbsentCard'),
        (card = (
          <AbsentCard
            name={e.name}
            designation={e.designation}
            currentIndex={this.state.currentIndex}
            gender={e.gender}
            index={i}
            staffPhoto={e.staffPhoto}
            onPress={() => this.showModal(e)}
          />
        ));
    } else if (
      // console.log("hit LeaveCard"),
      (this.state.currentIndex === 5 ||
        this.state.currentIndex === 6 ||
        this.state.currentIndex === 7) &&
      (e.isLeave ||
        e.firstHalfAttendance.includes('Permission') ||
        e.firstHalfAttendance.includes('OD') ||
        e.secondHalfAttendance.includes('Permission') ||
        e.secondHalfAttendance.includes('OD'))
    ) {
      card = (
        <LeaveCard
          name={e.name}
          designation={e.designation}
          gender={e.gender}
          index={i}
          currentIndex={this.state.currentIndex}
          staffPhoto={e.staffPhoto}
          isLeave={e.isLeave}
          firstHalfAttendance={e.firstHalfAttendance}
          secondHalfAttendance={e.secondHalfAttendance}
          firstHalfLeaveCategory={e.firstHalfLeaveCategory}
          firstHalfReason={e.firstHalfReason}
          onPress={() => this.showModal(e)}
        />
      );
    } else if (!e.absent) {
      // console.log("hit NewPresentCard"),
      //console.log('eeeeee', e.actualCheckInTime);
      card = (

        <NewPresentCard
          name={e.name}
          department={e.department}
          designation={e.designation}
          gender={e.gender}
          scheduledCheckInTime={e.scheduledCheckInTime}
          scheduledCheckOutTime={e.scheduledCheckOutTime}
          actualCheckInTime={e.actualCheckInTime}
          actualCheckOutTime={e.actualCheckOutTime}
          shiftName={e.shiftName}
          currentIndex={this.state.currentIndex}
          modeOfCheckIn={e.modeOfCheckIn}
          checkInLocation={e.checkInLocation}
          checkOutLocation={e.checkOutLocation}
          firstHalfStatus={e.firstHalfStatus}
          secondHalfStatus={e.secondHalfStatus}
          firstHalfAttendance={e.firstHalfAttendance}
          secondHalfAttendance={e.secondHalfAttendance}
          overTimeHours={e.overTimeHours}
          isFirstHalfLeave={e.isFirstHalfLeave}
          isSecondHalfLeave={e.isSecondHalfLeave}
          firstHalfLeaveCategory={e.firstHalfLeaveCategory}
          secondHalfLeaveCategory={e.secondHalfLeaveCategory}
          staffPhoto={e.staffPhoto}
          checkInImagePath={e.checkInImagePath}
          checkOutImagePath={e.checkOutImagePath}
          onPress={() => this.showModal(e)}
          track={() =>
            this.props.navigation.navigate('StaffLocation', {
              StaffCode: e.staffCode,
              StaffName: e.name,
              StaffPhoto: e.staffPhoto,
              date: this.state.date,
            })
          }
        />
      );
    }
    return e.firstHalfAttendance == "OD" || e.secondHalfAttendance == "OD" ? null : card;
  };

  getCountOfFilter = (item, index) => {
    //console.log('Where!!!', item, index);
    if (this.state.activeTab === 'Time Sheet') {
      if (index === 0) {
        if (this.state.currentIndex === 0) {
          return this.state.originalData.filter(e => !e.absent).length;
        }
        if (this.state.currentIndex === 2) {
          return this.state.originalData.filter(
            e => !e.absent && e.firstHalfStatus === 'Late',
          ).length;
        }
        if (this.state.currentIndex === 3) {
          return this.state.originalData.filter(
            e => !e.absent && e.firstHalfStatus === 'Early',
          ).length;
        }
        if (this.state.currentIndex === 4) {
          return this.state.originalData.filter(
            e => !e.absent && e.overTimeHours > 0,
          ).length;
        }
        return this.state.originalData.length;
      }
      if (this.state.currentIndex === 0) {
        return this.state.originalData.filter(
          e => e.modeOfCheckIn === item && !e.absent,
        ).length;
      }
      if (this.state.currentIndex === 2) {
        return this.state.originalData.filter(
          e =>
            e.modeOfCheckIn === item &&
            !e.absent &&
            e.firstHalfStatus === 'Late',
        ).length;
      }
      if (this.state.currentIndex === 3) {
        return this.state.originalData.filter(
          e =>
            e.modeOfCheckIn === item &&
            !e.absent &&
            e.firstHalfStatus == 'Early',
        ).length;
      }
      if (this.state.currentIndex === 4) {
        return this.state.originalData.filter(
          e => e.modeOfCheckIn === item && !e.absent && e.overTimeHours > 0,
        ).length;
      }
      if (this.state.currentIndex === 8) {
        if (index === 1) {
          return this.state.originalData.filter(
            e => e.gender.toLowerCase() === 'male' && !e.absent,
          ).length;
        }
        if (index === 2) {
          return this.state.originalData.filter(
            e => e.gender.toLowerCase() === 'male' && e.absent,
          ).length;
        }
        if (index === 3) {
          return this.state.originalData.filter(
            e => e.gender.toLowerCase() === 'female' && !e.absent,
          ).length;
        }
        if (index === 4) {
          return this.state.originalData.filter(
            e => e.gender.toLowerCase() === 'female' && e.absent,
          ).length;
        }
      }
      if (this.state.currentIndex == 9) {
        let ii = item.slice(0, -4);
        if (index % 2 == 0) {
          return this.state.originalData.filter(
            e => e.shiftName === ii && !e.absent,
          ).length;
        }
        return this.state.originalData.filter(
          e => e.shiftName === ii && e.absent,
        ).length;
      }
      if (this.state.currentIndex == 10) {
        let ii = item.slice(0, -4);
        if (index % 2 == 0) {
          return this.state.originalData.filter(
            e => e.department === ii && !e.absent,
          ).length;
        }
        return this.state.originalData.filter(
          e => e.department === ii && e.absent,
        ).length;
      }
      if (this.state.currentIndex == 11) {
        let ii = item.slice(0, -4);
        if (index % 2 == 0) {
          return this.state.originalData.filter(
            e => e.designation === ii && !e.absent,
          ).length;
        }
        return this.state.originalData.filter(
          e => e.designation === ii && e.absent,
        ).length;
      }
    }
    if (this.state.activeTab === 'Staff Master') {
      const { originalStaffData, staffCurrentIndex } = this.state;

      if (item === 'All') {
        return originalStaffData.length;
      }
      if (staffCurrentIndex === 0) {
        if (item === '0-1') {
          return originalStaffData.filter(
            e => e.experience >= 0 && e.experience < 1,
          ).length;
        }
        if (item === '1-2') {
          return originalStaffData.filter(
            e => e.experience >= 1 && e.experience < 2,
          ).length;
        }
        if (item === '2-3') {
          return originalStaffData.filter(
            e => e.experience >= 2 && e.experience < 3,
          ).length;
        }
        if (item === '3-5') {
          return originalStaffData.filter(
            e => e.experience >= 3 && e.experience < 5,
          ).length;
        }
        if (item === '5-10') {
          return originalStaffData.filter(
            e => e.experience >= 5 && e.experience < 10,
          ).length;
        }
        if (item === '10-15') {
          return originalStaffData.filter(
            e => e.experience >= 10 && e.experience < 15,
          ).length;
        }
        if (item === '15-20') {
          return originalStaffData.filter(
            e => e.experience >= 15 && e.experience < 20,
          ).length;
        }
        if (item === '20-25') {
          return originalStaffData.filter(
            e => e.experience >= 20 && e.experience < 25,
          ).length;
        }
        if (item === '25-30') {
          return originalStaffData.filter(
            e => e.experience >= 25 && e.experience < 30,
          ).length;
        }
        if (item === '>30') {
          return originalStaffData.filter(e => e.experience >= 30).length;
        }
      }
      if (staffCurrentIndex === 1) {
        if (item === '<20') {
          return originalStaffData.filter(e => e.age < 20).length;
        }
        if (item === '20-25') {
          return originalStaffData.filter(e => e.age >= 20 && e.age < 25)
            .length;
        }
        if (item === '25-30') {
          return originalStaffData.filter(e => e.age >= 25 && e.age < 30)
            .length;
        }
        if (item === '30-35') {
          return originalStaffData.filter(e => e.age >= 30 && e.age < 35)
            .length;
        }
        if (item === '35-40') {
          return originalStaffData.filter(e => e.age >= 35 && e.age < 40)
            .length;
        }
        if (item === '40-45') {
          return originalStaffData.filter(e => e.age >= 40 && e.age < 45)
            .length;
        }
        if (item === '45-50') {
          return originalStaffData.filter(e => e.age >= 45 && e.age < 50)
            .length;
        }
        if (item === '50-55') {
          return originalStaffData.filter(e => e.age >= 50 && e.age < 55)
            .length;
        }
        if (item === '55-60') {
          return originalStaffData.filter(e => e.age >= 55 && e.age < 60)
            .length;
        }
        if (item === '>60') {
          return originalStaffData.filter(e => e.age >= 60).length;
        }
      }
      if (staffCurrentIndex === 2) {
        return originalStaffData.filter(
          e => e.type.toLowerCase() === item.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 3) {
        return originalStaffData.filter(e => {
          if (e.isLocationShiftMapped) {
            return item.includes(e.shiftData[0].locationsAssigned[0]);
          }
        }).length;
      }
      if (staffCurrentIndex === 4) {
        return originalStaffData.filter(
          e => e.managerName.toLowerCase() === item.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 5) {
        let travelLength = 0,
          normalLength = 0;
        const shiftData = originalStaffData.filter(
          a => a.isLocationShiftMapped,
        );
        let notLength = originalStaffData.length - shiftData.length;
        if (item === 'Not Assigned') {
          return notLength;
        }

        shiftData.forEach(a => {
          if (a.shiftData[0].locationsAssigned[0] === 'Travel CheckIn') {
            travelLength += 1;
          }
          if (a.shiftData[0].locationsAssigned[0] !== 'Travel CheckIn') {
            normalLength += 1;
          }
        });
        if (item === 'Travel CheckIn') {
          return travelLength;
        }
        if (item === 'Simple CheckIn') {
          return normalLength;
        }
      }
      if (staffCurrentIndex === 6) {
        return originalStaffData.filter(
          e => e.gender.toLowerCase() === item.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 7) {
        const yes = originalStaffData.filter(e => e.isLocationShiftMapped);
        return yes.filter(
          e => e.shiftData[0].shiftName.toLowerCase() === item.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 8) {
        return originalStaffData.filter(
          e => e.department.toLowerCase() === item.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 9) {
        return originalStaffData.filter(
          e => e.designation.toLowerCase() === item.toLowerCase(),
        ).length;
      }
    }
    if (this.state.activeTab === 'Payout') {
      const { originalPayoutData, staffCurrentIndex } = this.state;
      let value = item.value;
      if (value === 'All') {
        return originalPayoutData.length;
      }
      if (staffCurrentIndex === 0) {
        if (value === '0-1') {
          return originalPayoutData.filter(
            e => e.experience >= 0 && e.experience < 1,
          ).length;
        }
        if (value === '1-2') {
          return originalPayoutData.filter(
            e => e.experience >= 1 && e.experience < 2,
          ).length;
        }
        if (value === '2-3') {
          return originalPayoutData.filter(
            e => e.experience >= 2 && e.experience < 3,
          ).length;
        }
        if (value === '3-5') {
          return originalPayoutData.filter(
            e => e.experience >= 3 && e.experience < 5,
          ).length;
        }
        if (value === '5-10') {
          return originalPayoutData.filter(
            e => e.experience >= 5 && e.experience < 10,
          ).length;
        }
        if (value === '10-15') {
          return originalPayoutData.filter(
            e => e.experience >= 10 && e.experience < 15,
          ).length;
        }
        if (value === '15-20') {
          return originalPayoutData.filter(
            e => e.experience >= 15 && e.experience < 20,
          ).length;
        }
        if (value === '20-25') {
          return originalPayoutData.filter(
            e => e.experience >= 20 && e.experience < 25,
          ).length;
        }
        if (value === '25-30') {
          return originalPayoutData.filter(
            e => e.experience >= 25 && e.experience < 30,
          ).length;
        }
        if (value === '>30') {
          return originalPayoutData.filter(e => e.experience >= 30).length;
        }
      }
      if (staffCurrentIndex === 1) {
        if (value === '<20') {
          const length = originalPayoutData.filter(e => e.age < 20).length;

          return length;
        }
        if (value === '20-25') {
          const length = originalPayoutData.filter(
            e => e.age >= 20 && e.age < 25,
          ).length;

          return length;
        }
        if (value === '25-30') {
          return originalPayoutData.filter(e => e.age >= 25 && e.age < 30)
            .length;
        }
        if (value === '30-35') {
          return originalPayoutData.filter(e => e.age >= 30 && e.age < 35)
            .length;
        }
        if (value === '35-40') {
          return originalPayoutData.filter(e => e.age >= 35 && e.age < 40)
            .length;
        }
        if (value === '40-45') {
          return originalPayoutData.filter(e => e.age >= 40 && e.age < 45)
            .length;
        }
        if (value === '45-50') {
          return originalPayoutData.filter(e => e.age >= 45 && e.age < 50)
            .length;
        }
        if (value === '50-55') {
          return originalPayoutData.filter(e => e.age >= 50 && e.age < 55)
            .length;
        }
        if (value === '55-60') {
          return originalPayoutData.filter(e => e.age >= 55 && e.age < 60)
            .length;
        }
        if (value === '>60') {
          return originalPayoutData.filter(e => e.age >= 60).length;
        }
      }
      if (staffCurrentIndex === 2) {
        return originalPayoutData.filter(
          e => e.staffType.toLowerCase() === value.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 3) {
        return originalPayoutData.filter(e => {
          return e.assignedLocation?.toLowerCase() === value.toLowerCase();
        }).length;
      }
      if (staffCurrentIndex === 4) {
        return originalPayoutData.filter(
          e => e.reportingStaff.toLowerCase() === value.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 5) {
        return originalPayoutData.filter(
          e => e.checkInType?.toLowerCase() === value.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 6) {
        return originalPayoutData.filter(
          e => e.gender.toLowerCase() === value.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 7) {
        return originalPayoutData.filter(
          e => e.shiftName?.toLowerCase() === value.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 8) {
        return originalPayoutData.filter(
          e => e.staffDepartment.toLowerCase() === value.toLowerCase(),
        ).length;
      }
      if (staffCurrentIndex === 9) {
        return originalPayoutData.filter(
          e => e.staffDesignation.toLowerCase() === value.toLowerCase(),
        ).length;
      }
    }
    if (this.state.activeTab === 'Payout') {
      const { originalLeaveData, staffCurrentIndex, activeTab2 } = this.state;
      let value = item.value;
      if (value === 'All') {
        return originalLeaveData.length;
      }
      if (activeTab2 === 'Staff Type') {
        return originalLeaveData.filter((e = e.staffType === value)).length;
      }
      if (activeTab2 === 'Department') {
        return originalLeaveData.filter(
          e => e.staffDepartment.toLowerCase() === value.toLowerCase(),
        ).length;
      }
      if (activeTab2 === 'Gender') {
        return originalLeaveData.filter(
          e => e.gender.toLowerCase() === value.toLowerCase(),
        ).length;
      }
    }
  };

  renderFilterButton = (item, index) => (
    <TouchableOpacity
      onPress={() =>
        this.setState({ currentFilterIndex: index }, () =>
          this.filterList(item, index),
        )
      }>
      <View
        style={{
          backgroundColor:
            this.state.currentFilterIndex !== index ? '#F5F5F5' : '#F5F5F5',
          padding: 6,
          alignItems: 'center',
          borderRadius: 20,
          minWidth: 40,
          //marginTop: 10,
          borderColor:
            this.state.currentFilterIndex !== index
              ? '#F5F5F5'
              : Colors.button[0],
          borderWidth: 1,
        }}>
        <CustomLabel
          family={'Poppins-Regular'}
          labelStyle={{
            color:
              this.state.currentFilterIndex === index
                ? Colors.button[0]
                : 'black',
          }}
          title={`${item}(${this.getCountOfFilter(item, index)})`}
        />
      </View>
    </TouchableOpacity>
  );

  renderFooter = () => {
    return (
      //Footer View with Load More button
      <View style={styles.footer}>
        {this.state.loader ? (
          <TouchableOpacity
            activeOpacity={0.9}
            //onPress={getData}
            //On Click of button calling getData function to load more data
            style={styles.loadMoreBtn}>
            <Text style={styles.btnText}>Loading...</Text>

            <ActivityIndicator color="red" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };
  renderItem4 = ({ item, index }) => {
    return (
      <View
        style={{
          backgroundColor: 'white',
          marginTop: 10,
          paddingLeft: 15,
        }}>
        <View style={[styles.row, { width: '100%' }]}>
          <View>
            <Avatar
              rounded
              size={40}
              source={{
                uri:
                  item.staffImage ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWo3luud5KPZknLR5zdUUwzvYBztWgTxrkbA&usqp=CAU',
              }}
              containerStyle={{
                borderWidth: 1,
                //borderColor: Colors.white,
                marginRight: 5,
              }}
            />
          </View>
          {/*<View style={{alignSelf: 'flex-start', marginTop: 8}}>
    <Male />
  </View>*/}
          <View style={{}}>
            <CustomLabel
              title={`${item.staffCode} | ${item.staffName}`}
              margin={0}
              labelStyle={{
                //color: 'white',
                textTransform: 'capitalize',
              }}
            />
          </View>
        </View>
        <View style={styles.row}>
          <Define
            icon
            name={'suitcase'}
            type={'entypo'}
            color={Colors.button[0]}
            labelColor={'black'}
            value={item.staffDepartment}
            border
            family={'Poppins-Regular'}
            size={15}
          />
          <Define
            icon
            name={'suitcase'}
            type={'entypo'}
            labelColor={'black'}
            color={Colors.button[0]}
            family={'Poppins-Regular'}
            value={item.staffDesignation}
            size={15}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
          }}>
          <View style={{ alignItems: 'center' }}>
            <CustomLabel
              title={'Total Leave'}
              margin={0}
              family={'Poppins-Regular'}
              labelStyle={{
                //color: 'white',
                textTransform: 'capitalize',
              }}
            />
            <CustomLabel
              title={item.total}
              margin={0}
              labelStyle={{
                color: Colors.calendarBg,
                textTransform: 'capitalize',
              }}
            />
          </View>
          <View style={{ alignItems: 'center', padding: 10 }}>
            <CustomLabel
              title={'Avail Leave'}
              family={'Poppins-Regular'}
              margin={0}
              labelStyle={{
                //color: 'white',
                textTransform: 'capitalize',
              }}
            />
            <CustomLabel
              title={item.availed}
              margin={0}
              labelStyle={{
                color: Colors.calendarBg,
                textTransform: 'capitalize',
              }}
            />
          </View>
        </View>
      </View>
    );
  };
  renderFilterButtonPayout = (item, index) => (
    <TouchableOpacity
      onPress={() =>
        this.setState(
          {
            currentFilterIndex: index,
            currentFilterItem: item,
            payoutData: [],
            gender:
              this.state.staffCurrentIndex === 6 && index === 0
                ? 'na'
                : this.state.staffCurrentIndex === 6 && index === 1
                  ? 'Male'
                  : this.state.staffCurrentIndex === 6 && index === 2
                    ? 'Female'
                    : 'na',
          },
          () => this.getPayoutData(item),
        )
      }>
      <View
        style={{
          backgroundColor:
            this.state.currentFilterIndex !== index ? '#F5F5F5' : '#F5F5F5',
          padding: 6,
          alignItems: 'center',
          borderRadius: 20,
          minWidth: 40,
          // marginTop: 10,
          borderColor:
            this.state.currentFilterIndex !== index
              ? '#F5F5F5'
              : Colors.button[0],
          borderWidth: 1,
        }}>
        <CustomLabel
          family={'Poppins-Regular'}
          labelStyle={{
            color:
              this.state.currentFilterIndex === index
                ? Colors.button[0]
                : 'black',
          }}
          title={`${item.value}(${this.getCountOfFilter(item, index)})`}
        />
      </View>
    </TouchableOpacity>
  );
  renderFilterButtonLeave = (item, index) => (
    <TouchableOpacity
      onPress={() =>
        this.setState(
          {
            currentFilterIndex: index,
            currentFilterItem: item,
            leaveData: [],
            gender: this.state.gender,
          },
          () =>
            this.getLeaveDetails(
              item,
              this.state.masterLeaves[this.state.staffCurrentIndex].id,
            ),
        )
      }>
      <View
        style={{
          backgroundColor:
            this.state.currentFilterIndex !== index ? '#F5F5F5' : Colors.red,
          padding: 6,
          alignItems: 'center',
          borderRadius: 20,
          minWidth: 40,
          //marginTop: 10,
        }}>
        <CustomLabel
          family={'Poppins-Regular'}
          labelStyle={{
            color: this.state.currentFilterIndex === index ? 'white' : 'black',
          }}
          title={`${item.value}(${this.getCountOfFilter(item, index)})`}
        />
      </View>
    </TouchableOpacity>
  );

  getFilters = () => {
    const { currentIndex, activeTab2, staffCurrentIndex, activeTab } = this.state;
    if (activeTab === 'Time Sheet') {
      if (
        currentIndex === 0 ||
        currentIndex === 2 ||
        currentIndex === 3 ||
        currentIndex === 4
      ) {
        return PRESENT_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (currentIndex === 8) {
        return GENDER_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (currentIndex === 9) {
        return this.state.SHIFT_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (currentIndex === 10) {
        return this.state.DEPT_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (currentIndex === 11) {
        return this.state.DESIG_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
    }
    if (activeTab === 'Staff Master') {
      if (staffCurrentIndex === 0) {
        return EXP_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 1) {
        return AGE_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 2) {
        return this.state.STAFF_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 3) {
        return this.state.LOCATION_FILTERS.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 4) {
        const REP_FILTERS = this.state.originalStaffData.map(
          e => `${e.managerName}`,
        );
        return ['All', ...REP_FILTERS].map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 5) {
        return ['All', 'Simple CheckIn', 'Travel CheckIn', 'Not Assigned'].map(
          (e, i) => {
            return (
              <View key={i} style={{ flexDirection: 'row' }}>
                {this.renderFilterButton(e, i)}
              </View>
            );
          },
        );
      }
      if (staffCurrentIndex === 6) {
        return ['All', 'Male', 'Female'].map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 7) {
        return ['All', ...this.state.SHIFT_FILTERS_ORIG].map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 8) {
        return ['All', ...this.state.DEPT_FILTERS_ORIG].map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 9) {
        return ['All', ...this.state.DESIG_FILTERS_ORIG].map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButton(e, i)}
            </View>
          );
        });
      }
    }
    if (activeTab === 'Payout') {
      if (staffCurrentIndex === 0) {
        return EXP_FILTERS_PAYOUT.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 1) {
        return AGE_FILTERS_PAYOUT.map((e, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(e, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 2) {
        return ['All', ...this.state.STAFFTYPE_ALL].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: e.id,
                value: e.type,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(item, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 3) {
        return ['All', ...this.state.LOCATION_ALL].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: e.id,
                value: e.accessLocation,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(item, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 4) {
        const REP_FILTERS = this.state.originalPayoutData.map(e => {
          return {
            value: e.reportingStaff,
            id: e.reportingStaffCode,
          };
        });
        return ['All', ...REP_FILTERS].map((e, i) => {
          let item =
            i === 0
              ? {
                value: 'All',
                id: 0,
              }
              : e;
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(item, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 5) {
        return ['All', 'Simple CheckIn', 'Travel CheckIn', 'Not Assigned'].map(
          (e, i) => {
            let item =
              i === 0
                ? {
                  id: 0,
                  value: 'All',
                }
                : {
                  id: i,
                  value: e,
                };
            return (
              <View key={i} style={{ flexDirection: 'row' }}>
                {this.renderFilterButtonPayout(item, i)}
              </View>
            );
          },
        );
      }
      if (staffCurrentIndex === 6) {
        return ['All', 'Male', 'Female'].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: i,
                value: e,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(item, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 7) {
        return ['All', ...this.state.SHIFTS_ALL].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: e.id,
                value: e.shiftName,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(item, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 8) {
        return ['All', ...this.state.DEPT_ALL].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: e.id,
                value: e.department,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(item, i)}
            </View>
          );
        });
      }
      if (staffCurrentIndex === 9) {
        return ['All', ...this.state.DESIG_ALL].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: e.id,
                value: e.designation,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonPayout(item, i)}
            </View>
          );
        });
      }
    }
    if (activeTab === 'Leave Status') {
      if (activeTab2 === 'Staff Type') {
        return ['All', ...this.state.STAFFTYPE_ALL].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: e.id,
                value: e.type,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonLeave(item, i)}
            </View>
          );
        });
      }
      if (activeTab2 === 'Department') {
        return ['All', ...this.state.DEPT_ALL].map((e, i) => {
          let item =
            i === 0
              ? {
                id: 0,
                value: 'All',
              }
              : {
                id: e.id,
                value: e.department,
              };
          return (
            <View key={i} style={{ flexDirection: 'row' }}>
              {this.renderFilterButtonLeave(item, i)}
            </View>
          );
        });
      }
    }
  };

  renderEmpty = () => {
    let emptyMessage = null;
    if (!this.state.loader) {
      if (
        (this.state.data.length === 0 &&
          this.state.activeTab === 'Time Sheet') ||
        (this.state.taskData.length === 0 &&
          this.state.activeTab === 'Task Status') ||
        (this.state.staffData.length === 0 &&
          this.state.activeTab === 'Staff Master') ||
        (this.state.payoutData.length === 0 &&
          this.state.activeTab === 'Payout') ||
        (this.state.leaveData.length === 0 &&
          this.state.activeTab === 'Leave Status')
      ) {
        emptyMessage = (
          <CustomLabel
            containerStyle={{ alignSelf: 'center' }}
            title={'No data found'}
          />
        );
      }
    }
    return emptyMessage;
  };
  render() {
    const {
      activeTab,
      activeTab2,
      loader,
      //showAtt,
      staffData,
      data,
      options,
      tabLoader,
    } = this.state;
    // console.log(this.props.navigation);
    // console.log("data ======> ", data);
    return (
      <Layout
        nestedScrollEnabled
        normal
        scroll
        width={'100%'}
        headerTitle={'M-Dashboard'}
        //nestedScrollEnabled={true}
        // width={'100%'}
        navigation={this.props.navigation}>
        <SafeAreaView style={{ flex: 1, marginBottom: 100 }}>
          <View
            style={{
              width: '100%',
              // height: 70,
              justifyContent: 'center',
              backgroundColor: '#1B6AEC',
            }}>
            <CustomTabs
              borderRadius={20}
              scroll
              height={50}
              width={'100%'}
              textSize={14}
              color={Colors.calendarBg}
              textColor={Colors.white}
              backgroundColor={'transparent'}
              ActiveTab={activeTab}
              tab1="Time Sheet"
              tab2="Staff Master"
              tab3="Payout"
              tab4="Task Status"
              tab5="Leave Status"
              onPress={value => {
                this.setState(
                  { activeTab: value, currentFilterIndex: 0 },
                  function () {
                    if (value == 'Time Sheet') {
                      this.getAttendance();
                      return;
                    }
                    if (value == 'Staff Master') {
                      this.setState(
                        { staffCurrentIndex: 0, currentFilterIndex: 0 },
                        () => this.getStaffData(),
                      );

                      //console.log('Selected tab = ', value);
                      return;
                    }
                    if (value == 'Payout') {
                      this.setState(
                        { staffCurrentIndex: 0, currentFilterIndex: 0 },
                        () => this.getPayoutDataInitial(),
                      );

                      //console.log('Selected tab = ', value);
                      return;
                    }
                    if (value == 'Task Status') {
                      this.setState({ taskIndex: 0 }, () => this.getTaskData());

                      //console.log('Selected tab = ', value);
                      return;
                    }
                  },
                );
              }}
            />
          </View>
          {loader && <CustomLoader />}
          {tabLoader && <CustomLoader />}

          {activeTab === 'Time Sheet' && (
            <TimeSheetScreen
              onDateSelected={this.setDate}
              selectedValue={this.state.selectedValue}
              onValueChange={val => this.changeWheel(val)}
              options={options}
              // present={data.length}
              present={this.state.present}
              // absent={this.state.originalStaffData?.length - data.length}
              absent={this.state.absent}
              total={this.state.total}
              // total={this.state.originalStaffData?.length}
              late={this.state.late}
              early={this.state.early}
              loader={loader}
              renderItemHorizontal={this.renderItem}
              extraData={this.state.currentIndex}
              keyExtractorHorizontal={(item, index) => index.toString()}
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this.renderTimeSheetCard}
              currentIndex={this.state.currentIndex}
              //staffCurrentIndex={this.state.staffCurrentIndex}
              height={this.state.height}
              decrease={() =>
                this.setState({
                  height:
                    this.state.height > 90
                      ? this.state.height - 80
                      : this.state.height,
                })
              }
              increase={() => this.setState({ height: this.state.height + 80 })}
              getFilters={this.getFilters()}
            />
          )}
          {activeTab === 'Task Status' && (
            <TaskStatusScreen
              onDateSelected={this.setDate}
              total={this.state.taskData.length}
              pending={
                this.state.taskData.length > 0
                  ? this.state.taskData.filter(e => e.status === 'Pending')
                    .length
                  : 0
              }
              completed={
                this.state.taskData.length > 0
                  ? this.state.taskData.filter(e => e.status === 'Completed')
                    .length
                  : 0
              }
              loader={loader}
              renderItemHorizontal={this.renderItem}
              extraData={this.state.taskIndex}
              keyExtractorHorizontal={(item, index) => index.toString()}
              taskData={this.state.taskData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this.renderItem3}
            />
          )}
          {activeTab === 'Payout' && (
            <PayoutScreen
              current={Number(this.state.month)}
              onPress={(m, i) =>
                this.setState(
                  { month: (i + 1).toString() },
                  () => console.log('hit'),
                  this.getPayoutData(),
                )
              }
              selectedValue={this.state.year}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ year: itemValue }, () => this.getPayoutData())
              }
              selectedValueMonth={Number(this.state.month)}
              onValueChangeMonth={(itemValue, itemIndex) =>
                this.setState({ month: itemValue }, () => this.getPayoutData())
              }
              renderItemHorizontal={this.renderItemStaff}
              extraData={this.state.staffCurrentIndex}
              keyExtractorHorizontal={(item, index) => index.toString()}
              payoutData={this.state.payoutData}
              loader={loader}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this.renderItem2}
              ListFooterComponent={this.renderFooter}
              onEndReached={() => {
                if (this.state.payoutData.length >= 20)
                  this.setState({ pageNumber: this.state.pageNumber + 1 }, () =>
                    this.getPayoutData(
                      this.state.currentFilterItem,
                      false,
                      true,
                    ),
                  );
              }}
              //currentIndex={this.state.currentIndex}
              staffCurrentIndex={this.state.staffCurrentIndex}
              height={this.state.height}
              decrease={() =>
                this.setState({
                  height:
                    this.state.height > 90
                      ? this.state.height - 80
                      : this.state.height,
                })
              }
              increase={() => this.setState({ height: this.state.height + 80 })}
              getFilters={this.getFilters()}
            />
          )}

          {activeTab === 'Staff Master' && (
            <StaffMasterScreen
              renderItemHorizontal={this.renderItemStaff}
              extraData={this.state.staffCurrentIndex}
              keyExtractorHorizontal={(item, index) => index.toString()}
              loader={loader}
              staffData={staffData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this.renderItem1}
              //currentIndex={this.state.currentIndex}
              staffCurrentIndex={this.state.staffCurrentIndex}
              height={this.state.height}
              decrease={() =>
                this.setState({
                  height:
                    this.state.height > 90
                      ? this.state.height - 80
                      : this.state.height,
                })
              }
              increase={() => this.setState({ height: this.state.height + 80 })}
              getFilters={this.getFilters()}
            />
          )}
          <View style={{ flex: 1 }}>
            {activeTab === 'Leave Status' && (
              <LeaveStatusScreen
                leaveData={this.state.leaveData}
                yearsArray={this.state.yearsArray}
                masterLeaves={this.state.masterLeaves}
                selectedValue={this.state.selectedYear}
                onValueChange={val => this.setState({ selectedYear: val })}
                selectedValue1={this.state.selectedYear1}
                onValueChange1={val => this.setState({ selectedYear1: val })}
                renderItemHorizontal={this.renderItemLeave}
                extraData={this.state.staffCurrentIndex}
                keyExtractorHorizontal={(item, index) => index.toString()}
                selectedLeaveValue={this.state.selectedLeaveValue}
                onValueChangeLeave={val =>
                  this.setState({ selectedLeaveValue: val }, () =>
                    this.getLeaveChartDetails(this.state.masterLeaves[val].id),
                  )
                }
                totalLeaves={this.state.values[0]}
                notAvailed={this.state.values[3]}
                fullyAvailed={this.state.values[1]}
                partiallyAvailed={this.state.values[2]}
                renderItem={this.renderItem4}
                extraData1={this.state}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
          </View>
          {this.renderEmpty()}
          {/* </View> */}
          {this.state.modal && (
            <CustomModal
              title="Choose Date"
              isVisible={this.state.modal}
              deleteIconPress={() =>
                this.setState({
                  modal: false,
                  showDate1: false,
                  showDate2: false,
                  count: null,
                  dates: [],
                  dateModalFrom: moment().startOf('month').format('YYYY-MM-DD'),
                  dateModalTo: moment(),
                })
              }>
              {this.state.showDate1 && (
                <DateTimePicker
                  isVisible={this.state.showDate1}
                  mode="date"
                  onConfirm={date => {
                    this.setState({ dateModalFrom: date, showDate1: false });
                  }}
                  onCancel={() => this.setState({ showDate1: false })}
                />
              )}
              {this.state.showDate2 && (
                <DateTimePicker
                  isVisible={this.state.showDate2}
                  mode="date"
                  onConfirm={date => {
                    this.setState({ dateModalTo: date, showDate2: false });
                  }}
                  onCancel={() => this.setState({ showDate2: false })}
                />
              )}
              <CalendarCard width={'80%'} height={200} />
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Calendar
                  title={moment(this.state.dateModalFrom).format('DD/MM/YY')}
                  onPress={() => this.setState({ showDate1: true })}
                />
                <Arrow />
                <Calendar
                  title={moment(this.state.dateModalTo).format('DD/MM/YY')}
                  onPress={() => this.setState({ showDate2: true })}
                />
              </View>
              <TouchableOpacity onPress={this.getCount}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: Colors.button[0],
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon name="arrowright" type="antdesign" color="white" />
                </View>
              </TouchableOpacity>
              <CustomLabel
                title={this.state.count ? `${this.state.count} days` : ''}
                labelStyle={{ color: Colors.button[0] }}
              />
              {this.state.dataToShow.map((e, i) => (
                <CustomCard key={i} width={'100'}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={'Date'}
                    />
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={e.date}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={'Scheduled CheckIN Time'}
                    />
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={e.scheduledCheckInTime}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={'Scheduled CheckOUT Time'}
                    />
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={e.scheduledCheckOutTime}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={'Actual CheckIN Time'}
                    />
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={e.actualCheckInTime}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={'Actual CheckOUT Time'}
                    />
                    <CustomLabel
                      containerStyle={{ width: '40%' }}
                      title={e.actualCheckOutTime}
                    />
                  </View>
                </CustomCard>
              ))}

              <CustomLabel
                title={
                  this.state.dates.length > 0
                    ? `${this.state.dates.join()}`
                    : ''
                }
                labelStyle={{ color: Colors.button[0] }}
              />
            </CustomModal>
          )}
        </SafeAreaView>
      </Layout>
    );
  }
}

export default Entry;

const styles = StyleSheet.create({
  footer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 10,
    backgroundColor: '#800000',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
  },
  labelContainer: {
    margin: '1.5%',
  },

  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8%',
    backgroundColor: '#f05760',
    height: hp('6.2'),
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#f05760',
  },
  buttonText1: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
});
