import {Image as Im, Button} from 'native-base';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SectionList,
  SafeAreaView,
  Animated,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {Modalize} from 'react-native-modalize';
import {CheckBox, Icon, Overlay} from 'react-native-elements';
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {CustomTabs} from '../common/CustomTabs';
import NoData from '../common/NoData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';
import moment from 'moment';
import Loader from '../common/Loader';
import CustomModal from '../common/CustomModal';
import {CustomButton} from '../common/CustomButton';
import CustomModalTextArea from '../common/CustomModalTextArea';
import CustomLabel from '../common/CustomLabel';
import {ExpandableListView} from 'react-native-expandable-listview';
import {ApprovalStages} from '../common/ApprovalStages';
import {Colors} from '../../utils/configs/Colors';
import {TouchableWithoutFeedback} from 'react-native';
import Calendar from 'react-native-calendar-range-picker';
import {Alert} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

import EmptyView from '../common/EmptyView';
import LinearGradient from 'react-native-linear-gradient';
import CustomSwipeModal from '../common/CustomSwipeModal';
import SubHeader from '../common/DrawerHeader';
import {Swipeable} from 'react-native-gesture-handler';
import {tokenApi} from '../../utils/apis';
import {CustomSelect, SuccessError} from '../common';
import AnimatedLottieView from 'lottie-react-native';
import {isIOS} from '../../utils/configs/Constants';
import CustomLoader from '../Task Allocation/CustomLoader';
import {Searchbar} from 'react-native-paper';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.calendarBg;
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default class Leaves extends Component {
  constructor(props) {
    super(props);
    this.state = {
      TempIndex: -1,
      LeaveType: '',
      LeaveArr: [],
      LeaveArrDates: [],
      LeaveArrTypes: [],
      filterredLeaveArr: [],
      filterredLeaveArr2: [],
      selectedDate: 'All Dates',
      FabButtons: [],
      activeTab: 'All',
      refreshing: false,
      visible: false,
      ApproverLeaveArray: [],
      filteredApproverLeaveArray: [],
      approvedListArray: [],
      filteredApprovedListArray: [],
      ApprovalStages: [],
      //ActiveTab: 'Requested',
      ActiveTab: 'To Approve',
      fab: false,
      ApiLoader: false,
      user_id: '',
      institute_id: '',
      modalVisible: false,
      ModifiedApproverLeaveArray: [],
      request: null,
      approved: false,
      rejected: false,
      ActiveTab2: 'Leave',
      SelectedLeaveIdArr: [],
      filterDataText: '',
    };
  }

  componentDidMount() {
    this.retrieveData('');
    this.focus = this.props.navigation.addListener('focus', () => {
      this.retrieveData('focus');
      this.setState({filterDataText: ''});
    });
    //this.clearInterval = setInterval(() => {
    //  console.log('timer hit');
    //  this.retrieveData();
    //}, 20000);
  }
  componentWillUnmount() {
    this.props.navigation.removeListener(this.focus);
    clearInterval(this.clearInterval);
  }
  retrieveData = async path => {
    try {
      const institute_id = await AsyncStorage.getItem('institute_id');

      const user_id = await AsyncStorage.getItem('user_id');
      if (institute_id && user_id) {
        this.setState({institute_id, user_id, ActiveTab2: 'Leave'}, () => {
          // if (path == 'focus') {
          //this.setState({ActiveTab: 'Requested'});
          this.getLeaveArray(institute_id, user_id);
          this.getLeaveArrayOthers(institute_id, user_id);
          // } else {
          this.FabButtons(institute_id, user_id);
          this.getapproverLeaveArray(institute_id, user_id);
          this.getApprovedListArray(institute_id, user_id);
        });
      }
    } catch (e) {
      alert('Error retrieving data');
    }
  };

  filterData = text => {
    this.setState({filterDataText: text});
    // this.setState({ filterred: this.state.Find });
    const newData = this.state.filterredLeaveArr2.filter(function (item) {
      const itemData = item.requesterStaffName
        ? item.requesterStaffName.toUpperCase()
        : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({filterredLeaveArr: newData}, () => {
      console.log('newData = ', newData);
    });
  };
  s = text => {
    this.setState({filterDataText: text});
    // this.setState({ filterred: this.state.Find });
    const newData = this.state.filteredLeaveArrayOthers.filter(function (item) {
      const itemData = item.requesterStaffName
        ? item.requesterStaffName.toUpperCase()
        : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({filteredLeaveArrayOthers: newData}, () => {
      console.log('newData = ', newData);
    });
  };
  filterData2 = text => {
    this.setState({filterDataText: text});
    // this.setState({ filterred: this.state.Find });
    const newData = this.state.ApproverLeaveArray.filter(function (item) {
      const itemData = item.leaveCategoryName
        ? item.leaveCategoryName.toUpperCase()
        : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({filteredApproverLeaveArray: newData}, () => {
      console.log('newData = ', newData);
    });
  };
  filterData3 = text => {
    this.setState({filterDataText: text});
    // this.setState({ filterred: this.state.Find });
    const newData = this.state.approvedListArray.filter(function (item) {
      const itemData = item.requesterStaffName
        ? item.requesterStaffName.toUpperCase()
        : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({filteredApprovedListArray: newData}, () => {
      console.log('newData = ', newData);
    });
  };
  GetLeaveTypeSubCategoriesByInstituteId = async id => {
    this.setState({loader: true});
    const url =
      Const +
      'api/Leave/GetLeaveTypeSubCategoriesByInstituteId?instituteId=' +
      this.state.institute_id +
      '&leaveRequestId=' +
      id +
      '&staffCode=' +
      this.state.user_id;
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
      this.setState({SelectedLeaveIdArr}, function () {
        if (this.state.SelectedLeaveIdArr.length) {
          this.setState(
            {LeaveType: this.state.SelectedLeaveIdArr[0].id},
            () => {
              this.checkPermission(this.state.LeaveType, id);
            },
          );
        } else {
          this.setState({Loader: false});
          Alert.alert(
            'Alert',
            'You have not assigned any Permission. You can Select different Permission types.',
            [
              {
                text: 'Dismiss',
                // onPress: () => this.props.navigation.goBack(),
              },
            ],
            {
              cancelable: false,
            },
          );
        }
      });
    } catch (error) {
      this.setState({loader: false});
      alert(error);
    }
  };
  checkPermission = async (LeaveType, id) => {
    const url = `${Const}api/Leave/RemainingPermissionsLeft`;
    console.log(url);
    const body = {
      StaffCode: this.state.user_id,
      InstituteId: Number(this.state.institute_id),
      LeaveTypeId: Number(LeaveType),
    };
    //console.log(body);
    try {
      const response = await axios.post(url, body);
      console.log(url, body, response.data);
      let {data} = response;
      this.setState({loader: false});
      if (data.status == true) {
        this.props.navigation.navigate('Permission', {
          SelectedLeaveId: id,
        });
      } else {
        Alert.alert(
          'Alert',
          data.message,
          [
            //{
            //  text: 'Stay Here',
            //  onPress: () => console.log('cancel pressed'),
            //  style: 'cancel',
            //},
            {
              text: 'Dismiss',
              // onPress: () =>  this.actionSheet.close(),
            },
          ],
          {
            cancelable: false,
          },
        );
      }
      // this.setState({FabButtons: data});
    } catch (e) {
      this.setState({loader: false});
      alert(e);
      //alert(`FabButtons = ${e.message}`);
      console.log('catch error = ', e.message);
    }
  };

  FabButtons = async (instituteId, user_id) => {
    const url = `${Const}api/Leave/GetMasterLeaveTypesForInstitute`;
    const body = {
      staffCode: user_id,
      InstituteId: Number(instituteId),
      Date: new Date().toISOString(),
    };
    //console.log(body);
    try {
      const response = await axios.post(url, body);
      console.log(url, 'FabButtons', response.data);
      console.log('----------------------------');
      console.log(JSON.stringify(body));
      console.log('0000000000000000000000000000000000000000000000000000000000');
      console.log(url);
      console.log(JSON.stringify(response.data));
      console.log(
        '0000000000000000000000000000000000000000000000000000000000',
        response,
      );
      let {data} = response;

      this.setState({FabButtons: data});
    } catch (e) {
      //alert(`FabButtons = ${e.message}`);
      console.log('FabButtons = ', e.message);
    }
  };
  getLeaveArray = async (instituteId, approverStaffCode, newArr) => {
    this.setState({ApiLoader: true});
    const url = `${Const}api/Leave/GetRequestedLeavesByStaff/${instituteId}/${approverStaffCode}`;
    console.log(url);
    try {
      const response = await axios.get(url);
      //
      //console.log('GetRequestedLeavesByStaff response ==>', JSON.stringify(response.data));

      //return;
      let data = [];
      if (response.data?.requests?.length > 0) {
        data = response.data.requests.sort(
          (e1, e2) =>
            new Date(e1.createdDate).getTime() <
            new Date(e2.createdDate).getTime(),
        );
      }

      this.setState({
        ApproverLeaveArray: newArr ? newArr : data,
        filteredApproverLeaveArray: newArr ? newArr : data,
        //ApproverLeaveArray: response.data,
        refreshing: false,
        ApiLoader: false,
      });
    } catch (e) {
      this.setState({ApiLoader: false});
      alert('Error retrieving requests:' + e);
      console.log('getLeaveArray = ', e.message);
    }
  };
  getLeaveArrayOthers = async (instituteId, staffCode, newArr) => {
    this.setState({ApiLoader: true});
    const url = `${Const}api/Leave/GetRequestedLeavesForOthersByStaff/${instituteId}/${staffCode}`;
    console.log(url);
    try {
      const response = await axios.get(url);
      //
      //console.log('GetRequestedLeavesByStaff response ==>', JSON.stringify(response.data));

      //return;
      let data = [];
      if (response.data?.requests?.length > 0) {
        data = response.data.requests.sort(
          (e1, e2) =>
            new Date(e1.createdDate).getTime() <
            new Date(e2.createdDate).getTime(),
        );
      }

      this.setState({
        OthersLeaveArray: newArr ? newArr : data,
        filteredLeaveArrayOthers: newArr ? newArr : data,
        //ApproverLeaveArray: response.data,
        refreshing: false,
        ApiLoader: false,
      });
    } catch (e) {
      this.setState({ApiLoader: false});
      alert('Error retrieving requests:' + e);
      console.log('getLeaveArray = ', e.message);
    }
  };

  getapproverLeaveArray = async (instituteId, approverStaffCode) => {
    // alert("12")
    this.setState({ApiLoader: true});
    const url = `${Const}api/Leave/GetLeaveRequestsForApprover/${instituteId}/${approverStaffCode}`;
    console.log('*************************************');
    console.log(url);
    try {
      const response = await axios.get(url);
      console.log('******************Responses*******************');
      console.log(JSON.stringify(response));
      console.log('*************************************');
      // return;
      let data = [];
      let LeaveArrDates = [];
      let LeaveArrTypes = [];
      let finalLeaveArrDates = [];
      let finalLeaveArrTypes = [];
      if (response.data?.requests?.length > 0) {
        data = response.data.requests.sort(
          (e1, e2) =>
            new Date(e1.createdDate).getTime() <
            new Date(e2.createdDate).getTime(),
        );
        data = data.filter(e => e.status === 0);
        data.map((item, index) => {
          // LeaveArrDates.push("All Dates")
          LeaveArrDates.push(moment(item.createdDate).format('DD/MM/YYYY'));
          LeaveArrTypes.push(item.leaveCategoryName);
        });
        finalLeaveArrDates = LeaveArrDates.filter((item, index) => {
          // console.log(item);
          return LeaveArrDates.indexOf(item) == index;
        });

        finalLeaveArrTypes = LeaveArrTypes.filter((item, index) => {
          // console.log(item);
          return LeaveArrTypes.indexOf(item) == index;
        });
      }
      //console.log(data.filter((e) => e.status == 0).length);
      // console.log("GetLeaveRequestsForApprover = ",response.data.requests);
      // console.log("finalLeaveArrDates = ",finalLeaveArrDates);
      // console.log("finalLeaveArrTypes = ",finalLeaveArrTypes);
      this.setState(
        {
          LeaveArr: data,
          refreshing: false,
          LeaveArrDates: finalLeaveArrDates,
          LeaveArrTypes: finalLeaveArrTypes,
          filterredLeaveArr: data,
          filterredLeaveArr2: data,
          selectedDate: 'All Dates',
          activeTab: 'All',
        },
        () => {
          this.setState({ApiLoader: false});
        },
      );
      //this.setState({
      //  LeaveArr: [...this.state.LeaveArr, ...response.data],
      //  refreshing: false,
      //});
    } catch (e) {
      alert('Error retrieving requests:' + e);
      this.setState({ApiLoader: false});
      console.log('getapproverLeaveArray88888888 = ', e);
    }
  };

  openModal = async (item, i, original) => {
    //this.setState({Loader: true, LeaveItemData: item});
    console.log('item - ', item);
    try {
      const request = await this.getRequest(item);
      console.log('requesttt = ', request);
      // if (!request) {
      //   //this.setState({Loader: false});
      //   return alert('No request found');
      // }
      return request;
      //   () =>
      //     this.setState({Loader: false}, () => {
      //       console.log(
      //         'LeaveItemData = ',
      //         JSON.stringify(this.state.LeaveItemData, null, 2),
      //       );
      //     }),
      // );
    } catch (e) {
      alert(e.message);
    }
  };
  getLeaveName = id => {
    //console.log('fab id = ', id);
    const findId = this.state.FabButtons.find(item => item.id === id);
    //console.log('findId = ', findId);
    return findId.name;
  };
  getRequest = async item => {
    const LeaveId = item.leaveRequestId;
    const instituteId = item.instituteId;
    //const StaffCode = await AsyncStorage.getItem('user_id');
    const StaffCode = item.requesterStaffCode;
    let url = '';
    if (item.leaveCategory === 8) {
      url =
        'https://insproplus.com/palgeoapi/api/Leave/GetComplaintDetailsById/' +
        LeaveId;
    } else {
      url = `${Const}api/Leave/GetLeaveRequestDetailsByRequestId/${LeaveId}/${instituteId}/${StaffCode}`;
      //url = `${Const}api/Leave/GetLeaveRequestDetailsByRequestId/${LeaveId}/${instituteId}/${this.state.request.staffCode}`;
    }
    console.log('url ===== ', url);
    try {
      const response = await axios.get(url);
      console.log('getRequesttt response = ', response.data);
      return response.data;
    } catch (e) {
      //alert('getRequest = ', e.message);
      console.log('getRequest = ', e.message);
      return null;
    }
  };

  renderEmpty = () => {
    let emptyMessage = null;
    if (!this.state.ApiLoader) {
      if (
        (this.state.LeaveArr.length === 0 &&
          this.state.ActiveTab === 'To Approve') ||
        (this.state.ApproverLeaveArray.length === 0 &&
          this.state.ActiveTab === 'Requested') ||
        (this.state.OthersLeaveArray.length === 0 &&
          this.state.ActiveTab === 'Others Request') ||
        (this.state.approvedListArray.length === 0 &&
          this.state.ActiveTab === 'Approved')
      ) {
        emptyMessage = <EmptyView title={'No Requests Found'} />;
      }
    }
    return emptyMessage;
  };

  renderItem3 = (item, index) => {
    // console.log('item = ', item);
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          this.setState({fab: false});
          if (item.id == 3) {
            this.props.navigation.navigate('LeaveRequest', {
              SelectedLeaveId: item.id,
            });
          } else if (item.id == 4) {
            this.props.navigation.navigate('OutsideDuty', {
              SelectedLeaveId: item.id,
            });
          } else if (item.id == 5) {
            this.props.navigation.navigate('Permission', {
              SelectedLeaveId: item.id,
            });
          } else if (item.id == 8) {
            this.props.navigation.navigate('Complaints', {
              SelectedLeaveId: item.id,
            });
          } else if (item.id == 7) {
            this.props.navigation.navigate('Punch', {
              SelectedLeaveId: item.id,
            });
          } else {
            null;
          }
        }}
        style={styles.buttonStyle}>
        <Image
          style={{
            ...styles.imageStyle,
            backgroundColor:
              item.id == 3
                ? '#F15761'
                : item.id == 4
                ? '#31BD3F'
                : item.id == 5
                ? '#0C9F7C'
                : item.id == 8
                ? '#0599EC'
                : item.id == 7
                ? require('../../assets/punch.png')
                : null,
          }}
          source={
            item.id == 3
              ? require('../../assets/leave.png')
              : item.id == 4
              ? require('../../assets/od.png')
              : item.id == 5
              ? require('../../assets/permission.png')
              : item.id == 8
              ? require('../../assets/complaint.png')
              : item.id == 7
              ? require('../../assets/punch.png')
              : null
          }
        />
        <Text style={styles.text2}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  renderItem = (item, index) => {
    //console.log('item = ', item);
    return (
      <TouchableOpacity
        style={{backgroundColor: SubThemeColor}}
        disabled={this.state.ActiveTab === 'Requested'}
        onPress={() => this.openModal(item, index)}>
        <View
          key={index}
          style={{
            margin: 5,
            borderRadius: 10,
            backgroundColor: index % 2 ? 'white' : 'transparent',
          }}>
          <Text
            numberOfLines={4}
            style={[
              styles.text,
              {
                color: '#7B7B7B',
                fontSize: 12,
                width: '50%',
                marginRight: 20,
                alignSelf: 'center',
                marginTop: 5,
              },
            ]}>
            {item.reason || 'No comment'}
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={[
                styles.headerTitleContainer,
                {
                  alignItems: 'flex-start',
                  paddingLeft: 10,
                  flex: 0.5,
                },
              ]}></View>
            <View
              style={[styles.headerTitleContainer, {alignItems: 'flex-start'}]}>
              <Text
                style={[
                  styles.text,
                  {
                    color: 'black',
                    fontSize: 12,
                    marginRight: 20,
                    marginVertical: 5,
                  },
                ]}>
                No. of days {item.noOfDays.toString() || '0'}
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    color: ThemeColor,
                    fontSize: 12,
                    marginRight: 20,
                    marginBottom: 5,
                  },
                ]}>
                {item.modifiedDate
                  ? moment(item.modifiedDate).format('Do MMM, YYYY')
                  : item.createdDate
                  ? moment(item.createdDate).format('Do MMM, YYYY')
                  : ''}
              </Text>
            </View>
            <View
              style={[
                styles.headerTitleContainer,
                {alignItems: 'flex-end', marginRight: 20},
              ]}>
              <View
                style={{
                  backgroundColor: '#D8F4F4',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}>
                <Text
                  style={[
                    styles.text,
                    {
                      color:
                        item.status === 1
                          ? 'green'
                          : item.status === 2
                          ? 'red'
                          : 'orange',
                      fontSize: 13,
                    },
                  ]}>
                  {item.overAllStatus === 0
                    ? 'Pending'
                    : item.overAllStatus === 1
                    ? 'Approved'
                    : 'Rejected'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  renderItem2 = ({item, index}) => {
    console.log(
      '***************************************************************************1111111111',
    );
    console.log(
      JSON.stringify(item.requesterStaffName) +
        ':' +
        JSON.stringify(item.status),
    );
    console.log(
      '***************************************************************************1111111111',
    );

    const original = item.requestDetails.find(
      e => e.version == 1 || e.version == 0,
    );
    // if (original?.leaveDetails) {
    //   console.log('item??????', original.leaveDetails[0]);
    // }
    const ApproverArr = item.approvalDetails
      .sort(
        (e1, e2) =>
          new Date(e1.createdDate).getTime() <
          new Date(e2.createdDate).getTime(),
      )
      .map((item2, index2) => {
        return {
          approverLevel: item2.approverLevel,
          designation: item2.approverDesignation,
          approverName: item2.approverStaffName,
          imagePath: item2.approverImage,
          reason: item2.approverComment,
          status: item2.leaveApprovalStatus,
        };
      });
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          // console.log(JSON.stringify(item));
          if (
            this.state.ActiveTab === 'Requested' ||
            this.state.ActiveTab === 'Others Request'
          ) {
            // if (item.status === 1 || item.status === 2) {

            //console.log("item==========", item)
            this.props.navigation.navigate('RequestDetails', {
              item,
              path: 'requested',
            });
            return;
            // }

            if (this.state.TempIndex == index) {
              this.setState({TempIndex: -1});
            } else {
              this.setState(
                {TempIndex: index, approverArr: ApproverArr},
                () => {
                  this.actionSheet2.open();
                },
              );
            }
            return;
          }
          if (this.state.ActiveTab === 'Approved') {
            this.props.navigation.navigate('RequestDetails', {
              item,
              path: 'approved',
            });
            return;
          }

          this.props.navigation.navigate('ApprovalScreen', {
            //request,
            LeaveItemData: item,
            user_id: this.state.user_id,
            institute_id: this.state.institute_id,
            original,
            //ApproverArr2:ApproverArr2
          });
          // console.log("Mydata=====", item)
        }}>
        <View>
          <View
            key={index}
            style={{
              //margin: 5,
              borderRadius: 10,
              backgroundColor: 'white',
              marginTop: 20,
            }}>
            <View style={{width: '100%', padding: 10}}>
              <View
                style={{
                  minWidth: '35%',
                  // height: 30,
                  paddingHorizontal: '3%',
                  borderBottomLeftRadius: 50,
                  borderTopRightRadius: 50,
                  backgroundColor: Colors.mainHeader[0],
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'flex-end',
                  marginTop: -20,
                  padding: 7,
                }}>
                <Text
                  style={[
                    styles.text,
                    {
                      color: 'white',
                      fontSize: 12,
                      textTransform: 'capitalize',
                      marginHorizontal: 10,
                    },
                  ]}>
                  {item.leaveCategoryName}{' '}
                  {
                    item.approvalDetails.filter(
                      e => e.leaveApprovalStatus == 1 || e.status == 1,
                    ).length
                  }{' '}
                  / {item.approvalDetails.length}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  paddingBottom: 10,
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'silver',
                  //alignItems: 'center',
                }}>
                <View>
                  <Image
                    //square
                    // alt={'No image'}
                    size="12"
                    style={{
                      borderRadius: 50,
                      height: 54,
                      width: 54,
                      resizeMode: 'cover',
                    }}
                    source={
                      item?.requestedImageUrl
                        ? {uri: item.requestedImageUrl}
                        : require('../../assets/ic_proile1.png')
                    }
                    // defaultSource={require('../../assets/ic_proile1.png')}
                  />
                </View>
                <View style={{marginHorizontal: 10, flex: 1}}>
                  <Text
                    style={[
                      styles.text,
                      {
                        color: 'black',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      },
                    ]}>
                    {item.requesterStaffName || 'No name'}
                  </Text>
                  <Text style={[styles.text, {color: 'black', fontSize: 12}]}>
                    {item.requestedDesignation || ' '}
                  </Text>
                  <Text style={[styles.text, {color: 'black', fontSize: 12}]}>
                    {item.requestedDepartment || ' '}
                  </Text>
                  {/* {item?.requestedMailId && (
                    <Text style={[styles.text, {color: 'black', fontSize: 12}]}>
                      {item.requestedMailId}
                    </Text>
                  )}
                  {item?.requestedMobileNumber && (
                    <Text style={[styles.text, {color: 'black', fontSize: 12}]}>
                      {item.requestedMobileNumber}
                    </Text>
                  )} */}
                </View>
              </View>
              {item?.requestDetails?.map(item2 => {
                return item2?.leaveDetails?.map(item3 => {
                  return item3.reason ? (
                    <View style={{width: '100%', justifyContent: 'center'}}>
                      <Text
                        numberOfLines={10}
                        style={[
                          styles.text,
                          {
                            //alignSelf: 'center',
                            fontSize: 13,
                            lineHeight: 20,
                            textTransform: 'capitalize',
                            color: 'gray',
                            marginTop: 10,
                          },
                        ]}>
                        {moment(item3.leaveAppliedDate).format('DD/MM/YYYY')}
                      </Text>
                      <Text
                        numberOfLines={10}
                        style={[
                          styles.text,
                          {
                            //alignSelf: 'center',
                            fontSize: 13,
                            lineHeight: 20,
                            textTransform: 'capitalize',
                            color: 'gray',
                            paddingBottom: 10,
                          },
                        ]}>
                        {item3.reason}
                      </Text>
                    </View>
                  ) : null;
                });
              })}

              {item.reason ? (
                <Text
                  numberOfLines={10}
                  style={[
                    styles.text,
                    {
                      //alignSelf: 'center',
                      fontSize: 13,
                      lineHeight: 20,
                      textTransform: 'capitalize',
                      color: 'gray',
                      paddingVertical: 10,
                    },
                  ]}>
                  {item.reason}
                </Text>
              ) : null}

              {item.leaveCategory !== 5 &&
                item.noOfDays > 0 &&
                original.leaveDetails[0].fromTime &&
                original.leaveDetails[0].toTime && (
                  <View style={{width: '100%'}}>
                    <CustomLabel
                      family={'Poppins-Regular'}
                      size={14}
                      color={Colors.calendarBg}
                      title={`Applied for: ${moment
                        .utc(original.leaveDetails[0].fromTime)
                        .local()
                        .format('DD.MM.YYYY')} to ${moment
                        .utc(original.leaveDetails[0].toTime)
                        .local()
                        .format('DD.MM.YYYY')}`}
                    />
                  </View>
                )}

              <View
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  //height: 40,
                }}>
                {item.leaveCategory != 5
                  ? item?.noOfDays !== 0 && (
                      <CustomLabel
                        color={Colors.calendarBg}
                        title={`No of days ${item.noOfDays}`}
                      />
                    )
                  : null}
                <View
                  style={{
                    //width: '100%',
                    alignItems: 'center',
                    flexDirection: 'row',
                    //height: '100%',
                  }}>
                  {item.leaveCategory === 5 ? (
                    <View>
                      <Icon
                        size={16}
                        name="calendar"
                        color={Colors.calendarBg}
                        type={'entypo'}
                      />
                    </View>
                  ) : null}

                  {item.leaveCategory === 5 ? (
                    <Text
                      style={[
                        styles.text,
                        {
                          color: Colors.calendarBg,
                          fontSize: 13,
                          marginLeft: 10,
                        },
                      ]}>
                      {moment
                        .utc(original.leaveDetails[0].fromTime)
                        .local()
                        .format('h:mm a')}{' '}
                      to{' '}
                      {moment
                        .utc(original.leaveDetails[0].toTime)
                        .local()
                        .format('h:mm a')}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  flexDirection: 'row',
                  height: 40,
                }}>
                <View>
                  <Icon
                    size={16}
                    name="calendar-today"
                    color={Colors.calendarBg}
                    type={'MaterialCommunityIcons'}
                  />
                  {/*<Image
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      marginRight: 10,
                    }}
                    source={require('../../assets/ic_proile1.png')}></Image>*/}
                </View>
                {item.createdDate && (
                  <View style={{alignItems: 'center'}}>
                    <Text
                      style={[
                        styles.text,
                        {
                          color: Colors.calendarBg,
                          fontSize: 14,
                          marginLeft: 10,
                        },
                      ]}>
                      Applied on :
                      {moment(item.createdDate).format('DD.MM.YYYY')} ({' '}
                      {moment(item.createdDate).format('h:mm a')})
                    </Text>
                  </View>
                )}
              </View>
              <View
                style={{
                  backgroundColor:
                    item.status === 1
                      ? 'green'
                      : item.status === 2
                      ? 'red'
                      : 'orange',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  width: '30%',
                }}>
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  {item.status === 0 ? (
                    <Icon
                      size={16}
                      name="clock"
                      color={'white'}
                      type={'entypo'}
                    />
                  ) : item.status === 1 ? (
                    <Icon
                      size={16}
                      name="check"
                      color={'white'}
                      type={'entypo'}
                    />
                  ) : (
                    <Icon
                      size={16}
                      name="cross"
                      color={'white'}
                      type={'entypo'}
                    />
                  )}
                  <Text
                    style={[
                      styles.text,
                      {
                        color: 'white',
                        fontSize: 13,
                        marginLeft: 10,
                      },
                    ]}>
                    {item.status === 0
                      ? 'Pending'
                      : item.status === 1
                      ? 'Approved'
                      : 'Rejected'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  displayMsg = (msg, error) => {
    this.setState({error_message: msg, error, showAlert: true});
  };

  _onRefresh() {
    this.setState({refreshing: true});
    if (this.state.ActiveTab == 'To Approve') {
      this.getapproverLeaveArray(this.state.institute_id, this.state.user_id);
      return;
    }
    if (this.state.ActiveTab == 'Approved') {
      this.getApprovedListArray(this.state.institute_id, this.state.user_id);
      return;
    }
    if (this.state.ActiveTab == 'Requested') {
      this.setState({ActiveTab2: 'Leave'});
      this.getLeaveArray(this.state.institute_id, this.state.user_id);

      return;
    }
  }

  getApprovedListArray = async (instituteId, approverStaffCode) => {
    this.setState({ApiLoader: true});
    const url = `${Const}api/Leave/GetApprovedLeaveRequestsByApprover/${instituteId}/${approverStaffCode}`;
    console.log(url);
    try {
      const response = await axios.get(url);

      // return;
      let data = [];
      if (response.data?.requests?.length > 0) {
        data = response.data.requests.sort(
          (e1, e2) =>
            new Date(e1.createdDate).getTime() <
            new Date(e2.createdDate).getTime(),
        );
        data = data.filter(e => e.status === 1);
      }
      console.log(
        'GetApprovedLeaveRequestsByApprover response = ',
        response.data,
      );
      this.setState({
        approvedListArray: data,
        filteredApprovedListArray: data,
        refreshing: false,
        ApiLoader: false,
      });
      //this.setState({
      //  LeaveArr: [...this.state.LeaveArr, ...response.data],
      //  refreshing: false,
      //});
    } catch (e) {
      alert('Error retrieving requests:' + e);
      this.setState({ApiLoader: false});
      console.log('getapproverLeaveArrayyyyyyyyyyyyyy = ', e);
    }
  };

  render() {
    if (this.state.Loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        {this.state.loader && (
          <CustomLoader loaderText={'Fetching Permission Detail ...'} />
        )}
        <SubHeader
          title="R-Dashboard"
          showBack
          backScreen="HomeScreen"
          showBell={false}
          navigation={this.props.navigation}
        />
        <SuccessError
          isVisible={this.state.showAlert}
          deleteIconPress={() => this.setState({showAlert: false})}
          error={this.state.error}
          subTitle={this.state.error_message}
        />
        <View style={{flex: 1}}>
          <View
            style={{
              width: '100%',
              height: 70,
              justifyContent: 'center',
              backgroundColor: '#1B6AEC',
            }}>
            {/*<LinearGradient colors={Colors.mainHeader}>*/}
            <CustomTabs
              scroll
              borderRadius={20}
              height={50}
              width={'100%'}
              textSize={15}
              color={ThemeColor}
              textColor="white"
              //backgroundColor={SubThemeColor}
              backgroundColor={'transparent'}
              ActiveTab={this.state.ActiveTab}
              // tab1Width={'35%'}
              // tab2Width={'35%'}
              // tab3Width={'35%'}
              // tab4Width={'35%'}
              tab1="To Approve"
              tab2="Requested"
              tab3="Approved"
              tab4="Others Request"
              onPress={value => {
                this.setState(
                  {ActiveTab: value, filterDataText: ''},
                  function () {
                    if (this.state.ActiveTab == 'To Approve') {
                      this.getapproverLeaveArray(
                        this.state.institute_id,
                        this.state.user_id,
                      );
                      console.log('Selected tab = ', value);
                      return;
                    }
                    if (this.state.ActiveTab == 'Requested') {
                      this.getLeaveArray(
                        this.state.institute_id,
                        this.state.user_id,
                      );
                      console.log('Selected tab = ', value);
                      return;
                    }
                    if (this.state.ActiveTab == 'Others Request') {
                      this.getLeaveArrayOthers(
                        this.state.institute_id,
                        this.state.user_id,
                      );
                      console.log('Selected tab = ', value);
                      return;
                    }
                    if (this.state.ActiveTab == 'Approved') {
                      this.getApprovedListArray(
                        this.state.institute_id,
                        this.state.user_id,
                      );
                      console.log('Selected tab = ', value);
                      return;
                    }
                    //this.getRequestArray();
                  },
                );
              }}
            />
          </View>
          {/*</LinearGradient>*/}
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              // backgroundColor: 'red',
              borderRadius: 10,
              padding: 5,
              flex: 1,
              //marginTop: 20,
            }}>
            <Searchbar
              style={{marginBottom: 5}}
              placeholder={
                this.state.ActiveTab == 'Requested'
                  ? 'Search By Leave Category...'
                  : 'Search By Name...'
              }
              onChangeText={text => {
                if (this.state.ActiveTab == 'To Approve') {
                  this.filterData(text);
                } else if (this.state.ActiveTab == 'Requested') {
                  this.filterData2(text);
                } else if (this.state.ActiveTab == 'Others Request') {
                  this.s(text);
                } else if (this.state.ActiveTab == 'Approved') {
                  this.filterData3(text);
                }
              }}
              value={this.state.filterDataText}
              // inputContainerStyle={{
              //   //padding: 0,
              //   borderWidth: 1,
              //   borderBottomWidth: 1,
              //   height: 45,
              //   borderColor: Colors.overlay,
              // }}
            />
            {this.state.ActiveTab == 'To Approve' &&
              this.state.LeaveArr?.length > 0 && (
                <View
                  style={{
                    //paddingBottom: 150,
                    flex: 1,
                    width: '100%',
                    // marginBottom: Dimensions.get('window').height * 0.19,
                  }}>
                  <View
                    style={{
                      width: '100%',
                      height: 45,
                      alignItems: 'center',
                      alignSelf: 'center',
                      flexDirection: 'row',
                      borderRadius: 0,
                      padding: 5,
                      backgroundColor: 'white',
                      marginVertical: 5,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({visibleDatePicker: true});
                      }}
                      style={{
                        width: 50,
                        backgroundColor: 'white',
                        height: 45,
                        borderRightWidth: 5,
                        borderRightColor: '#EFEFEF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        tintColor={ThemeColor}
                        style={{
                          width: 20,
                          height: 20,
                          resizeMode: 'contain',
                          marginHorizontal: 10,
                        }}
                        source={require('../../assets/calender.png')}
                      />
                    </TouchableOpacity>
                    {/* <SelectDropdown buttonStyle={{width:50,backgroundColor:"white",height:45,borderRightWidth:5,borderRightColor:"#EFEFEF"}}
            dropdownStyle={{width:"40%",backgroundColor:"white"}}
            renderDropdownIcon={()=>{
            return  <Image tintColor={ThemeColor} style={{width:20,height:20,resizeMode:"contain",marginHorizontal:10}} source={require("../../assets/calender.png")} />
            }}
	data={this.state.LeaveArrDates}
	onSelect={(selectedItem, index) => {
    if(selectedItem == "All Dates"){
    this.setState({filterredLeaveArr:this.state.LeaveArr,filterredLeaveArr2:this.state.LeaveArr,selectedDate:selectedItem})
    }else{
    let filterredLeaveArr= this.state.LeaveArr
   let newArr=[]
  newArr =  filterredLeaveArr.filter((item,index)=>{
   return moment(item.createdDate).format("DD/MM/YYYY") == selectedItem})
  // console.log("newArr = ",newArr);
this.setState({filterredLeaveArr:newArr,filterredLeaveArr2:newArr,selectedDate:selectedItem})
		// console.log(selectedItem, index)
  }}}
/> */}

                    <ScrollView
                      showsHorizontalScrollIndicator={false}
                      horizontal>
                      <TouchableOpacity
                        onPress={() => {
                          this.setState({activeTab: 'All'}, () => {
                            this.setState({
                              filterredLeaveArr: this.state.filterredLeaveArr2,
                            });
                          });
                        }}
                        style={{
                          //flex: 1,
                          // width: tab1Width,
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 10,
                          borderRadius: 0,
                          marginLeft: 5,
                          borderBottomWidth:
                            this.state.activeTab == 'All' ? 3 : 0,
                          backgroundColor: 'transparent',
                          borderBottomColor: ThemeColor,
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            textTransform: 'capitalize',
                            color:
                              this.state.activeTab == 'All'
                                ? ThemeColor
                                : 'black',
                          }}>
                          {'All'}
                        </Text>
                      </TouchableOpacity>
                      {this.state.LeaveArrTypes.map((item, index) => {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({activeTab: item}, () => {
                                // console.log("activeTab = ",this.state.activeTab);
                                let filterredLeaveArr = [
                                  ...this.state.filterredLeaveArr2,
                                ];
                                var newArr = filterredLeaveArr.filter(item => {
                                  return (
                                    item.leaveCategoryName ==
                                    this.state.activeTab
                                  );
                                });
                                console.log(
                                  '==============',
                                  newArr,
                                  newArr.length,
                                );
                                this.setState({filterredLeaveArr: newArr});
                              });
                            }}
                            style={{
                              //flex: 1,
                              // width: tab1Width,
                              height: '100%',
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingHorizontal: 10,
                              borderRadius: 0,
                              borderBottomWidth:
                                this.state.activeTab == item ? 3 : 0,
                              backgroundColor: 'transparent',
                              borderBottomColor: ThemeColor,
                            }}>
                            <Text
                              style={[
                                styles.text,
                                {
                                  fontSize: 14,
                                  textTransform: 'capitalize',
                                  color:
                                    this.state.activeTab == item
                                      ? ThemeColor
                                      : 'black',
                                },
                              ]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    {/* <TouchableOpacity onPress={()=>{
              this.actionSheet3.open();
            }}>
              <Image tintColor={ThemeColor} style={{width:20,height:20,resizeMode:"contain",marginHorizontal:10}} source={require("../../assets/calender.png")} />
            </TouchableOpacity> */}
                  </View>
                  {/* <View style={{marginVertical: 5, backgroundColor: 'white',justifyContent:"space-between",flexDirection:"row",alignItems:"center"}}>
                <CustomSelect
          items={this.state.LeaveArrTypes}
          onSelectedItemsChange={value => {
            console.log('vvv', value);
            this.setState({selectedLeaveType: value});
          }}
          borderColor={'#ccc'}
          width={'48%'}
          selectedItems={this.state.selectedLeaveType}
          selectText="Select Leave Type"
          searchInputPlaceholderText="Search Department . . ."
          single
        />
                <CustomSelect
          items={this.state.LeaveArrDates}
          onSelectedItemsChange={value => {
            console.log('vvv', value);
            this.setState({selectedDate: value});
          }}
          borderColor={'#ccc'}
          width={'48%'}
          selectedItems={this.state.selectedDate}
          selectText="Select Date"
          searchInputPlaceholderText="Search Date . . ."
          single
        />
        </View> */}
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'gray',
                      marginVertical: 5,
                    }}>
                    Showing Result For{' '}
                    {this.state.selectedDate == 'All Dates'
                      ? 'All Dates ( You Can Change Date With The Help Of Above Calender Icon )'
                      : this.state.selectedDate}{' '}
                  </Text>
                  <FlatList
                    contentContainerStyle={{paddingBottom: 100}}
                    keyExtractor={(item, index) => index + ''}
                    data={[...this.state.filterredLeaveArr]}
                    renderItem={this.renderItem2}
                    extraData={[...this.state.filterredLeaveArr]}
                    //style={{paddingBottom: 100}}
                    refreshControl={
                      <RefreshControl
                        //style={{backgroundColor: '#E0FFFF'}}
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        tintColor="#ff0000"
                        title="Loading..."
                        titleColor="#00ff00"
                      />
                    }
                    ListEmptyComponent={() => {
                      return (
                        <NoData
                          title={
                            'No Data Available For ' + this.state.activeTab
                          }
                        />
                      );
                    }}
                    refreshing={this.state.refreshing}
                  />
                </View>
              )}
            {this.state.ApiLoader && (
              <View>
                <ActivityIndicator size={30} />
                <CustomLabel
                  containerStyle={{alignSelf: 'center'}}
                  title={'Fetching requests'}
                />
              </View>
            )}
            {this.state.ActiveTab == 'Requested' &&
              this.state.ApproverLeaveArray?.length > 0 && (
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    //paddingBottom: 20,
                    //marginBottom: Dimensions.get('window').height * 0.2,
                  }}>
                  <FlatList
                    data={this.state.filteredApproverLeaveArray}
                    renderItem={this.renderItem2}
                    keyExtractor={(item, i) => i + ''}
                    contentContainerStyle={{paddingBottom: 100}}
                    refreshControl={
                      <RefreshControl
                        //style={{backgroundColor: '#E0FFFF'}}
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        tintColor="#ff0000"
                        title="Loading..."
                        titleColor="#00ff00"
                        //colors={['#ff0000', '#00ff00', '#0000ff']}
                        //progressBackgroundColor="#ffff00"
                      />
                    }
                    refreshing={this.state.refreshing}
                  />
                </View>
              )}
            {this.state.ActiveTab == 'Others Request' &&
              this.state.OthersLeaveArray?.length > 0 && (
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    //paddingBottom: 20,
                    //marginBottom: Dimensions.get('window').height * 0.2,
                  }}>
                  <FlatList
                    data={this.state.filteredLeaveArrayOthers}
                    renderItem={this.renderItem2}
                    keyExtractor={(item, i) => i + ''}
                    contentContainerStyle={{paddingBottom: 100}}
                    refreshControl={
                      <RefreshControl
                        //style={{backgroundColor: '#E0FFFF'}}
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        tintColor="#ff0000"
                        title="Loading..."
                        titleColor="#00ff00"
                        //colors={['#ff0000', '#00ff00', '#0000ff']}
                        //progressBackgroundColor="#ffff00"
                      />
                    }
                    refreshing={this.state.refreshing}
                  />
                </View>
              )}
            {this.state.ActiveTab == 'Approved' &&
              this.state.approvedListArray?.length > 0 && (
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    //paddingBottom: 20,
                    //marginBottom: Dimensions.get('window').height * 0.2,
                  }}>
                  <FlatList
                    data={this.state.filteredApprovedListArray}
                    renderItem={this.renderItem2}
                    keyExtractor={(item, i) => i + ''}
                    contentContainerStyle={{paddingBottom: 100}}
                    refreshControl={
                      <RefreshControl
                        //style={{backgroundColor: '#E0FFFF'}}
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        tintColor="#ff0000"
                        title="Loading..."
                        titleColor="#00ff00"
                        //colors={['#ff0000', '#00ff00', '#0000ff']}
                        //progressBackgroundColor="#ffff00"
                      />
                    }
                    refreshing={this.state.refreshing}
                  />
                </View>
              )}

            {this.renderEmpty()}
          </View>
        </View>

        <Modalize
          modalStyle={{
            backgroundColor: 'white',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
          handlePosition={'inside'}
          withHandle={false}
          HeaderComponent={
            <View
              style={{
                backgroundColor: Colors.mainHeader[0],
                alignItems: 'center',
                padding: 10,
                //justifyContent: 'center',
                minHeight: 54,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
              }}>
              <CustomLabel title={'Request'} size={20} color="white" />
              <View
                style={{
                  alignSelf: 'flex-end',
                  position: 'absolute',
                  top: 20,
                  right: 10,
                }}>
                <Icon
                  onPress={() => this.actionSheet.close()}
                  name={'cross'}
                  type={'entypo'}
                  color={'white'}
                />
              </View>
            </View>
          }
          snapPoint={400}
          ref={ref => (this.actionSheet = ref)}>
          <View style={{backgroundColor: Colors.mainHeader[0]}}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: 10,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,

                backgroundColor: 'white',
              }}>
              {this.state.FabButtons.map((item, index) => {
                return (
                  <View
                    style={{
                      width: '30%',
                      minHeight: 70,
                      marginLeft: 10,
                      marginBottom: 10,
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        this.actionSheet.close();
                        if (item.id == 3) {
                          this.props.navigation.navigate('LeaveRequest', {
                            SelectedLeaveId: item.id,
                          });
                        } else if (item.id == 4) {
                          this.props.navigation.navigate('OutsideDuty', {
                            SelectedLeaveId: item.id,
                          });
                        } else if (item.id == 5) {
                          this.GetLeaveTypeSubCategoriesByInstituteId(item.id);
                        } else if (item.id == 8) {
                          this.props.navigation.navigate('Complaints', {
                            SelectedLeaveId: item.id,
                          });
                        } else if (item.id == 7) {
                          this.props.navigation.navigate('Punch', {
                            SelectedLeaveId: item.id,
                          });
                        } else if (item.id == 9) {
                          this.props.navigation.navigate('BackDatedLeave', {
                            SelectedLeaveId: item.id,
                            od: false,
                          });
                        } else if (item.id == 10) {
                          this.props.navigation.navigate('OfflineAttendance', {
                            SelectedLeaveId: item.id,
                          });
                        } else if (item.id == 11) {
                          this.props.navigation.navigate('BackDatedLeave', {
                            SelectedLeaveId: item.id,
                            od: true,
                          });
                        }
                        // else if (item.id == 12) {
                        //   this.props.navigation.navigate('HolidayWork', {
                        //     SelectedLeaveId: item.id,
                        //     od: true,
                        //   });
                        // }
                        else {
                          null;
                        }
                      }}
                      style={{
                        ...styles.buttonStyle,
                        backgroundColor:
                          item.id == 3
                            ? '#F15761'
                            : item.id == 4
                            ? '#31BD3F'
                            : item.id == 5
                            ? '#0C9F7C'
                            : item.id == 8
                            ? '#0599EC'
                            : item.id == 7
                            ? '#381CA8'
                            : item.id == 9
                            ? '#EC05D5'
                            : item.id == 10
                            ? '#FE0000'
                            : '#FBB605',
                      }}>
                      <Image
                        style={styles.imageStyle}
                        source={
                          item.id == 3
                            ? require('../../assets/leave_icon.png')
                            : item.id == 4
                            ? require('../../assets/od.png')
                            : item.id == 5
                            ? require('../../assets/permission.png')
                            : item.id == 8
                            ? require('../../assets/complaint.png')
                            : item.id == 7
                            ? require('../../assets/punch.png')
                            : item.id == 9
                            ? require('../../assets/bda.png')
                            : item.id == 10
                            ? require('../../assets/offline_icon.png')
                            : item.id == 11
                            ? require('../../assets/bda.png')
                            : null
                        }
                      />
                    </TouchableOpacity>
                    <Text style={styles.text2}>{item.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Modalize>
        <Modalize
          modalStyle={{backgroundColor: 'white', zIndex: 1000}}
          handlePosition={'inside'}
          snapPoint={300}
          ref={ref => (this.actionSheet2 = ref)}>
          <View style={{margin: 5}}>
            <ApprovalStages
              //horizontal
              onPress={() => {}}
              width="100%"
              // key={1}
              title="Approval Stages"
              color={SubThemeColor}
              headerColor={ThemeColor}
              Arr={this.state.approverArr}
            />
          </View>
        </Modalize>

        {/* {this.state.fab && (
          <Overlay
            isVisible={this.state.fab}
            onBackdropPress={() => this.setState({fab: false})}
            overlayStyle={{
              position: 'absolute',
              bottom: 50,
              right: 0,
              backgroundColor: Colors.secondary,
              //width: 105
            }}>
            {this.state.FabButtons.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    this.setState({fab: false});
                    if (item.id == 3) {
                      this.props.navigation.navigate('LeaveRequest', {
                        SelectedLeaveId: item.id,
                      });
                    } else if (item.id == 4) {
                      this.props.navigation.navigate('OutsideDuty', {
                        SelectedLeaveId: item.id,
                      });
                    } else if (item.id == 5) {
                      this.props.navigation.navigate('Permission', {
                        SelectedLeaveId: item.id,
                      });
                    } else if (item.id == 8) {
                      this.props.navigation.navigate('Complaints', {
                        SelectedLeaveId: item.id,
                      });
                    } else if (item.id == 7) {
                      this.props.navigation.navigate('Punch', {
                        SelectedLeaveId: item.id,
                      });
                    } else {
                      null;
                    }
                  }}
                  style={styles.buttonStyle}>
                  <Image
                    style={styles.imageStyle}
                    source={
                      item.id == 3
                        ? require('../../assets/leave.png')
                        : item.id == 4
                        ? require('../../assets/od.png')
                        : item.id == 5
                        ? require('../../assets/permission.png')
                        : item.id == 8
                        ? require('../../assets/complaint.png')
                        : item.id == 7
                        ? require('../../assets/punch.png')
                        : null
                    }
                  />
                  <Text style={styles.text2}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </Overlay>
        )} */}

        <TouchableOpacity
          onPress={() => {
            this.setState({showFAB: false});
            this.actionSheet.open();
          }}
          //onPress={() => this.setState({visible: !this.state.visible})}
          style={{
            width: 60,
            height: 60,
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: ThemeColor,
            position: 'absolute',
            bottom: 30,
            right: 20,
            zIndex: 2,
            marginLeft: screenWidth - 80,
            //marginTop: screenHeight - 80,
            elevation: 3,
            shadowOffset: {width: 0, height: 0},
            shadowColor: SubThemeColor,
            shadowOpacity: 0.5,
          }}>
          <Text
            style={[
              styles.text,
              {color: SubThemeColor, fontSize: 18, fontWeight: 'bold'},
            ]}>
            +
          </Text>
        </TouchableOpacity>
        <Modal
          isVisible={this.state.visibleDatePicker}
          deviceWidth={screenWidth}
          deviceHeight={screenHeight}>
          <View
            style={{
              width: screenWidth - 50,
              height: screenHeight / 2,
              borderRadius: 7,
            }}>
            <Calendar
              style={{borderRadius: 7}}
              // startDate="2010-05-05"
              singleSelectMode
              endDate={moment(new Date()).format('YYYY-MM-DD')}
              // onChange={({ startDate, endDate }) => {console.log({ startDate, endDate })
              onChange={selectedItem => {
                // console.log("selectedItem = ",selectedItem);
                let filterredLeaveArr = this.state.LeaveArr;
                let newArr = [];
                newArr = filterredLeaveArr.filter((item, index) => {
                  // console.log(moment(item.createdDate).format("YYYY-MM-DD"));
                  return (
                    moment(item.createdDate).format('YYYY-MM-DD') ==
                    selectedItem
                  );
                });
                console.log('newArr = ', newArr);
                this.setState({
                  filterredLeaveArr: newArr,
                  filterredLeaveArr2: newArr,
                  selectedDate: selectedItem,
                  visibleDatePicker: false,
                  activeTab: 'All',
                });
                // console.log(selectedItem, index)
              }}
              // }
            />
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  filterredLeaveArr: this.state.LeaveArr,
                  filterredLeaveArr2: this.state.LeaveArr,
                  selectedDate: 'All Dates',
                  visibleDatePicker: false,
                  activeTab: 'All',
                });
              }}
              style={{
                width: '100%',
                height: 60,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
              }}>
              <View
                style={{
                  width: '80%',
                  height: '60%',
                  borderRadius: 7,
                  backgroundColor: ThemeColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{alignSelf: 'center', color: 'white'}}>
                  Press Here For All Dates
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    //backgroundColor: Colors.header,
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
  text3: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  text2: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginTop: 5,
    //fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  buttonStyle: {
    backgroundColor: 'transparent',
    width: 50,
    height: 50,
    borderRadius: 25,
    //backgroundColor: "rgba(0, 0, 0, 0.1)",
    //width: 200,
    //marginLeft: -100,
    //flexDirection: 'row',
    //marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    //marginHorizontal: 10,
  },
  headerContainer: {
    width: '100%',
    //height: 40,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    //paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderStyle: {
    //backgroundColor: 'white',
    fontSize: 20,
    padding: 5,
    //marginTop: 20,
    color: ThemeColor,
  },
  sectionListItemStyle: {
    fontSize: 15,
    padding: 5,
    paddingVertical: 10,
    color: 'black',
    backgroundColor: 'white',
  },
  listItemSeparatorStyle: {
    height: 0.5,
    width: '100%',
    //backgroundColor: '#C8C8C8',
  },
  swipedRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingLeft: 5,
    backgroundColor: 'transparent',
    margin: 20,
    minHeight: 50,
  },
  swipedConfirmationContainer: {
    flex: 1,
  },
  deleteConfirmationText: {
    color: Colors.mainHeader[0],
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#b60000',
    borderRadius: 5,
    flexDirection: 'column',
    justifyContent: 'center',
    height: 40,
  },
  deleteButtonText: {
    color: '#fcfcfc',
    fontWeight: 'bold',
    padding: 3,
  },
});
