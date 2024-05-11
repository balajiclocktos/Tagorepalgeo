import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CheckBox, Icon, Overlay } from 'react-native-elements';

//import ImageView from 'react-native-image-viewing';
import { Card, VStack, Image as Thumbnail } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import Const from '../common/Constants';
import moment from 'moment';
import { CustomButton } from '../common/CustomButton';
import CustomModalTextArea from '../common/CustomModalTextArea';
import CustomLabel from '../common/CustomLabel';
import { CustomList2 } from '../common/CustomList2';
import { Colors } from '../../utils/configs/Colors';
import { ApprovalStages } from '../common/ApprovalStages';
import SubHeader from '../common/DrawerHeader';
//import Timeline from 'react-native-timeline-flatlist';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native';
import CustomCard from '../common/CustomCard';
import AnimatedLoader from '../common/AnimatedLoader';
import Error from '../popups/error';
import { tokenApi } from '../../utils/apis';
import SuccessError from '../common/SuccessError';
import { isIOS } from '../../utils/configs/Constants';
import Pdf from 'react-native-pdf';
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer"
import { Alert } from 'react-native';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];
export default class ApprovalScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LeaveDates: [],
      LeaveDatesOriginal: [],
      approverArr: [],
      Visible: false,
      //request: this.props.route?.params?.request,
      LeaveItemData: this.props.route?.params?.LeaveItemData,
      urlExtension: this.get_url_extension(this.props.route?.params?.LeaveItemData.leaveAttachment),
      user_id: this.props.route?.params?.user_id || '',
      institute_id: this.props.route?.params?.institute_id || '',
      Comment: '',
      leaveAnalysis: [],
      approved:
        this.props?.route?.params?.LeaveItemData.status === 1 ? true : false,
      rejected:
        this.props?.route?.params?.LeaveItemData.status === 2 ? true : false,
    };
    console.log('props = ', JSON.stringify(this.props?.route?.params?.LeaveItemData));
  }

  get_url_extension = ( url ) => {
    return url.split(/[#?]/)[0].split('.').pop().trim();
}
  componentDidMount() {
    this.getLeaveAnalysis();
    this.arrayModifier();
  }

  getLeaveAnalysis = async () => {
    const LeaveItemData = this.props.route.params.LeaveItemData;
    console.log("LeaveItemData===", this.props.route.params.LeaveItemData)
    const url = 'api/Leave/LeaveRequestsAnalysisByDate';
    const body = {
      LeaveReqId: LeaveItemData.leaveRequestId,
      StaffCode: LeaveItemData.requesterStaffCode,
      InstituteId: Number(this.props.route?.params?.institute_id),
    };
    console.log('LeaveRequestsAnalysisByDate body', body);
    try {
      const res = await tokenApi();
      const response = await res.post(url, body);
      this.setState({ leaveAnalysis: response.data });
      console.log('response', response.data);
    } catch (error) {
      console.log('LeaveRequestsAnalysisByDate err', error);
    }
  };

  arrayModifier = async () => {
    const requestDetails = this.props.route.params.LeaveItemData.requestDetails;
    let ll = [];
    if (requestDetails.length > 0) {
      const leavesDatesArray =
        this.props.route.params.LeaveItemData.requestDetails.find((e, i, s) => {
          const length =
            this.props.route.params.LeaveItemData.leaveCategory === 7
              ? 0
              : this.props.route.params.LeaveItemData.requestDetails.length;
          return e.version === length;
        });
      const filtered = leavesDatesArray.leaveDetails.filter(
        e => e.firstHalf || e.secondHalf,
      );

      ll =
        this.props.route.params.LeaveItemData.leaveCategory === 5
          ? leavesDatesArray.leaveDetails.map(e => {
            return {
              id: e.id,
              datesSelected: e.leaveAppliedDate,
              firstHalf: e.firstHalf,
              fromTime: e.fromTime,
              toTime: e.toTime,
              secondHalf: e.secondHalf,
              // disableMorning: e.firstHalf ? false : true,
              // disableEvening: e.secondHalf ? false : true,
              // isModified: false,
            };
          })
          : filtered.map(e => {
            return {
              id: e.id,
              datesSelected: e.leaveAppliedDate,
              firstHalf: e.firstHalf,

              secondHalf: e.secondHalf,
              disableMorning: e.firstHalf ? false : true,
              disableEvening: e.secondHalf ? false : true,
              isModified: false,
            };
          });
    }
    // const firstVersion = this.props.route.params.LeaveItemData.requestDetails.find((e, i, s) => {
    //   const length = 1
    //   return e.version === length;
    // });

    console.error('data', ll);
    // if (data.length === 1) {
    //   return this.setState({LeaveDates: Arr, approverArr: []});
    // }

    const currentUser =
      this.props.route.params.LeaveItemData.approvalDetails.find(
        each => each.approverStaffCode.trim() === this.state.user_id,
      );
    console.log('currentUser', currentUser);
    let approversData = [];
    approversData =
      this.props.route.params.LeaveItemData.approvalDetails.length > 0 &&
      this.props.route.params.LeaveItemData.approvalDetails.filter(
        each => each.isActive === false,
      );
    let approverModifications = [];
    let data = [];
    if (requestDetails.length > 0) {
      this.props.route.params.LeaveItemData.requestDetails.forEach(item =>
        data.push(...item.leaveDetails),
      );
      approversData.length > 0 &&
        approversData.forEach(e => {
          data.forEach(w => {
            //console.log('w', w);
            if (w.ownerOfVersion === e.approverStaffCode.trim()) {
              approverModifications.push({
                firstHalf: w.firstHalf,
                secondHalf: w.secondHalf,
                fromTime: w.fromTime,
                toTime: w.toTime,
                datesSelected: w.leaveAppliedDate,
                approverStaffCode: w.ownerOfVersion.trim(),
              });
            }
          });
        });
    }
    //console.warn('ww', approverModifications);
    const mod =
      approversData.length > 0 &&
      approversData.map(item => {
        return {
          approverLevel: item.level,
          approverName: item.approverName || 'No Name',
          designation: item.approverDesignation || '',
          imagePath: item.image,
          status: item.status,
          reason: item.comments || 'No Comment',
          leaveDates:
            approverModifications.length === 0
              ? []
              : approverModifications.filter(
                e => e.approverStaffCode === item.approverStaffCode,
              ),
        };
      });

    // this.props.route.params.LeaveItemData.leaveApprovalsAndRequests.map(
    //   (item, index) => {
    //     //console.log('itemmm = ', item);
    //     data.push({
    //       approverLevel: item.approverLevel,
    //       approverName: item.approverName || 'No Name',
    //       designation: item.approverDesignation,
    //       imagePath: item.approverImageUrl,
    //       status: item.status,
    //       reason: item.approverComment || 'No Comment',
    //     });
    //   },
    // );
    // LeaveItemData.leaveApprovalsAndRequests[0]
    //.requestedLeaveAttachment
    this.setState(
      {
        LeaveDates: ll || [],
        LeaveDatesOriginal: ll || [],
        approverArr: mod || [],
        currentUser,
      },
      () => {
        console.log(
          'LeaveDates = ',
          this.state.LeaveDates === this.state.LeaveDatesOriginal,
        );
      },
    );
  };
  submitHandler = () => {
    if (this.state.LeaveItemData.leaveCategory !== 8) {
      if (!this.state.approved && !this.state.rejected) {
        this.displayErrorMsg(
          'Either approve or reject the request first',
          true,
        );
        return;
      }
    }
    if (!this.state.Comment && !this.state.approved) {
      return this.displayErrorMsg('Enter your comment before submitting', true);
    }
    this.setState({ showAlert: true });
    console.log('I am ready to be submitted');

    this.approverResponse();
  };

  displayErrorMsg = (msg, error) => {
    this.setState({ showAlert: false }, () => {
      setTimeout(
        () =>
          this.setState({
            showAlert2: true,
            error_message: msg,
            error,
          }),
        400,
      );
    });
  };

  getArrayBasedOnLeaveCategory = () => {
    const cat = this.state.LeaveItemData.leaveCategory;
    if (cat === 9 || cat === 11) {
      if (this.state.LeaveDates.length > 0) {
        return this.state.LeaveDates.map(e => {
          return {
            date: e.datesSelected,
            isFirstHalfSelected: e.firstHalf,
            isSecondHalfSelected: e.secondHalf,
            isFirstHalfPresent: e.isFirstHalfPresent,
            isSecondHalfPresent: e.isSecondHalfPresent,
            firstHalfLeaveTypeId: e.firstHalfLeaveTypeId,
            secondHalfLeaveTypeId: e.secondHalfLeaveTypeId,
            reason: e.reason,
          };
        });
      }
    }
    if (this.state.LeaveDates?.length > 0) {
      return this.state.LeaveDates.map(e => {
        return {
          id: e.id,
          firstHalf: e.firstHalf,
          secondHalf: e.secondHalf,
          datesSelected: e.datesSelected,
          fromTime: e.fromTime,
          toTime: e.toTime,
        };
      });
    }
    return [];
    // }
  };

  checkIsModified = datesArray => {
    const res = datesArray.some(
      e => e.isMorningModified || e.isEveningModified,
    );
    console.log('isModified ==', res);
    return res;
  };

  approverResponse = async () => {
    const { LeaveItemData, LeaveDates } = this.state;
    if (
      LeaveItemData.leaveCategory === 9 ||
      LeaveItemData.leaveCategory === 11
    ) {
      const url = `api/Leave/ApproveModifiedBackDateAttedance`;
      const body = {
        LeaveRequestId: this.state.LeaveItemData.leaveRequestId || 0,
        LeaveTypeId: this.state.LeaveItemData.leaveTypeId,
        InstituteId: parseInt(this.state.institute_id),
        StaffCode:
          this.state.LeaveItemData.requesterStaffCode.trim() || 'string',
        ApproverStaffCode: this.state.user_id.toString(),
        LeaveApprovalStatus:
          this.state.LeaveItemData.leaveCategory === 8
            ? 1
            : this.state.approved
              ? 1
              : this.state.rejected
                ? 2
                : 0,
        ApproverLevel: this.state.currentUser.level,
        Priority: this.state.LeaveItemData.priority || 0,
        CreatedDate:
          this.props.route.params.LeaveItemData?.requestDetails[0]
            ?.leaveDetails[0]?.createdDate || new Date().toISOString(),
        IsRequestModified: this.checkIsModified(this.state.LeaveDates),
        ModifiedDate: new Date().toISOString(),
        ApproverComment: this.state.Comment,
        UpdatedFromDate:
          this.state.LeaveItemData?.requestDetails[0]?.leaveDetails[0]
            ?.fromTime ||
          // this.state.request.fromDate ||
          new Date().toISOString(),
        UpdatedEndDate:
          this.state.LeaveItemData?.requestDetails[0]?.leaveDetails[0]
            ?.toTime ||
          // this.state.request.endDate ||
          new Date().toISOString(),
        ModifiedDates: this.getArrayBasedOnLeaveCategory(),
      };
      console.log("^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&")
      console.log("url==="+url)
      console.log("bodyy=="+body)
      console.log("^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&^&")
      try {
        const res = await tokenApi();
        const response = await res.post(url, body);
        const { data } = response;
        const error = !data.status;
        this.displayErrorMsg(data.message, error);
        if (!error) {
          setTimeout(() => this.props.navigation.goBack(), 1200);
        }
      } catch (e) {
        console.log(e.message);
        this.displayErrorMsg(e.message, true);
      }
    }

    const url =
      this.state.LeaveItemData.leaveCategory === 10
        ? `${Const}api/Leave/OfflineAttendanceApproverFeedback`
        : `${Const}api/Leave/AddUpdateLeaveRequestsFromApprover`;
    const body2 = {
      LeaveRequestId: this.state.LeaveItemData.leaveRequestId || 0,
      LeaveTypeId: this.state.LeaveItemData.leaveTypeId,
      InstituteId: parseInt(this.state.institute_id),
      StaffCode: this.state.LeaveItemData.requesterStaffCode.trim() || 'string',
      ApproverStaffCode: this.state.user_id.toString(),
      LeaveApprovalStatus:
        this.state.LeaveItemData.leaveCategory === 8
          ? 1
          : this.state.approved
            ? 1
            : this.state.rejected
              ? 2
              : 0,
      ApproverLevel: this.state.currentUser.level,
      Priority: this.state.LeaveItemData.priority || 0,
      ApproverComment: this.state.Comment,
    };
    let bodyData = {
      UpdatedLeaveDates: this.getArrayBasedOnLeaveCategory(),
      LeaveRequestId: this.state.LeaveItemData.leaveRequestId || 0,
      LeaveTypeId: this.state.LeaveItemData.leaveTypeId,
      InstituteId: parseInt(this.state.institute_id),
      StaffCode: this.state.LeaveItemData.requesterStaffCode.trim() || 'string',
      ApproverStaffCode: this.state.user_id.toString(),
      LeaveApprovalStatus:
        this.state.LeaveItemData.leaveCategory === 8
          ? 1
          : this.state.approved
            ? 1
            : this.state.rejected
              ? 2
              : 0,
      ApproverLevel: this.state.currentUser.level,
      Priority: this.state.LeaveItemData.priority || 0,
      CreatedDate:
        this.props.route.params.LeaveItemData?.requestDetails[0]
          ?.leaveDetails[0]?.createdDate || new Date().toISOString(),
      IsRequestModified: this.checkIsModified(this.state.LeaveDates),
      ModifiedDate: new Date().toISOString(),
      ApproverComment: this.state.Comment,
      UpdatedFromDate:
        this.state.LeaveItemData?.requestDetails[0]?.leaveDetails[0]
          ?.fromTime ||
        // this.state.request.fromDate ||
        new Date().toISOString(),
      UpdatedEndDate:
        this.state.LeaveItemData?.requestDetails[0]?.leaveDetails[0]?.toTime ||
        // this.state.request.endDate ||
        new Date().toISOString(),
    };
    const bodyy =
      this.state.LeaveItemData.leaveCategory === 10 ? body2 : bodyData;
      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%555")
    console.log(url);
    console.log(JSON.stringify(bodyy))
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%555")
    try {
      const response = await axios.post(url, bodyy);

      console.log('response - ', response.data);
      this.setState({ AddUpdateLeaveRequestsFromApprover: response.data }, () => {
        if (!response.data.status) {
          return this.displayErrorMsg(response.data?.message, true);
        }
        this.displayErrorMsg(response.data?.message, false);
        setTimeout(() => this.props.navigation.goBack(), 1200);
        return;
      });
    } catch (e) {
      this.displayErrorMsg(e.message, true);
      console.log('approverResponse = ', e.message);
    }
  };

  renderDetail = (rowData, sectionID, rowID) => {
    let title = <Text style={[styles.title]}>{rowData.title}</Text>;
    var desc = null;
    if (rowData.description && rowData.imageUrl)
      desc = (
        <View style={styles.descriptionContainer}>
          <Image source={{ uri: rowData.imageUrl }} style={styles.image} />
          <Text style={[styles.textDescription]}>{rowData.description}</Text>
        </View>
      );

    return (
      <View style={{ flex: 1 }}>
        {title}
        {desc}
      </View>
    );
  };

  render() {
    const { LeaveItemData, LeaveDates, LeaveDatesOriginal } = this.state;
    console.log(LeaveItemData);
    return (
      <View style={styles.container}>
        <SuccessError
          isVisible={this.state.showAlert2}
          deleteIconPress={() =>
            this.setState({ showAlert2: false, error: false })
          }
          error={this.state.error}
          subTitle={this.state.error_message}
        />
        <AnimatedLoader doNotShowDeleteIcon isVisible={this.state.showAlert} />
        <SubHeader
          title="Approval Request"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <VStack>
            {LeaveItemData.leaveCategory === 8 ? (
              <View style={{ padding: 0 }}>
                <View style={{ backgroundColor: 'white' }}>
                  <CustomLabel title={'Complaint'} />
                  <CustomLabel
                    labelStyle={{ fontFamily: 'Poppins-Regular' }}
                    title={LeaveItemData?.complaintSummary || ''}
                  />
                </View>
                <View style={{ marginVertical: 10, backgroundColor: 'white' }}>
                  <CustomLabel title={'Suggestion'} />
                  <CustomModalTextArea
                    disabled
                    value={LeaveItemData?.reason || ''}
                  />
                </View>
                <View style={{ backgroundColor: 'white' }}>
                  <CustomLabel title={'Comment'} />
                  <CustomModalTextArea
                    placeholder="write comment here..."
                    value={this.state.Comment}
                    onChangeText={Comment => this.setState({ Comment })}
                  />
                </View>
                <CustomButton
                  color={ThemeColor}
                  width="90%"
                  title={'Submit'}
                  onPress={this.submitHandler}
                  marginTop={15}
                />

                <View style={{ marginTop: 15 }}>
                  {this.state.approverArr.length ? (
                    <ApprovalStages
                      onPress={() => { }}
                      title={'Approval Stages'}
                      headerColor={ThemeColor}
                      Arr={this.state.approverArr}
                      color={SubThemeColor}
                      width={'95%'}
                      reverse
                    />
                  ) : (
                    <View>
                      <Text style={{ alignSelf: 'center', marginTop: 10 }}></Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    width: '100%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    marginTop: 10,
                    backgroundColor: 'white',
                    padding: 10,
                  }}>
                  <View style={{ alignItems: 'center', width: '15%' }}>
                    <Thumbnail
                      //square
                      size={12}
                      alt={'No image'}
                      style={{ borderRadius: 50 }}
                      //source={{uri: LeaveItemData.requestedImageUrl}}
                      source={
                        LeaveItemData.requestedImageUrl
                          ? {
                            uri: LeaveItemData.requestedImageUrl,
                          }
                          : require('../../assets/ic_proile1.png')
                      }
                    />
                  </View>
                  <View
                    style={{
                      alignItems: 'flex-start',
                      paddingLeft: 10,
                      width: '40%',
                    }}>
                    {LeaveItemData?.requesterStaffName && (
                      <Text
                        style={[
                          styles.text,
                          { color: 'black', textTransform: 'capitalize' },
                        ]}>
                        {LeaveItemData.requesterStaffName}
                      </Text>
                    )}
                    {LeaveItemData.requestedMailId && (
                      <Text
                        style={[styles.text, { color: 'black', fontSize: 12 }]}>
                        {LeaveItemData.requestedMailId}
                      </Text>
                    )}
                    {LeaveItemData?.requestedMobileNumber && (
                      <Text
                        style={([styles.text], { color: 'black', fontSize: 12 })}>
                        {LeaveItemData.requestedMobileNumber}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      // width: '40%',
                      flex: 1
                    }}>
                    <View
                      style={{
                        borderRadius: 20,
                        backgroundColor: Colors.mainHeader[0],
                        // paddingHorizontal: 10,
                      }}>
                      <Text
                        style={[
                          styles.text,
                          {
                            color: 'white',
                            fontSize: 12, paddingHorizontal: 10,
                            paddingVertical: 2
                          },
                        ]}>
                        {LeaveItemData.leaveCategoryName}
                      </Text>
                    </View>
                    <View
                      style={{
                        borderRadius: 20,
                        backgroundColor: Colors.mainHeader[0],
                        // paddingHorizontal: 10,
                        marginTop: 10,
                      }}>
                      <Text style={[styles.text, { color: 'white', fontSize: 12, paddingVertical: 2, paddingHorizontal: 10 }]}>
                        {LeaveItemData.leaveTypeName}
                      </Text>
                    </View>
                    {LeaveItemData.leaveCategory === 5 ? (
                      <Text style={[styles.text, { color: 'black' }]}>
                        {moment
                          .utc(
                            this.props.route.params.original.leaveDetails[0]
                              .fromTime,
                          )
                          .local()
                          .format('h:mm a')}{' '}
                        to{' '}
                        {moment
                          .utc(
                            this.props.route.params.original.leaveDetails[0]
                              .toTime,
                          )
                          .local()
                          .format('h:mm a')}
                      </Text>
                    ) : (
                      LeaveItemData?.noOfDays !== 0 && (
                        <Text
                          style={[
                            styles.text,
                            {
                              color: 'black',
                              fontSize: 14,
                              //width: '100%',
                              alignSelf: 'center',
                              //marginRight: 20,
                              marginVertical: 5,
                            },
                          ]}>
                          {LeaveItemData.noOfDays}
                          {LeaveItemData.noOfDays === 1 ? ' day' : ' days'}
                        </Text>
                      )
                    )}
                    
                    <Text
                          style={[
                            styles.text,
                            {
                              color: 'black',
                              fontSize: 14,
                              //width: '100%',
                              alignSelf: 'center',
                              //marginRight: 20,
                              marginVertical: 5,
                            },
                          ]}>
                            Total availed
                         
                        </Text>
                        <Text
                          style={[
                           
                            {
                              color: 'black',
                              fontSize: 18,
                              fontSize: 18,
                              fontWeight:'bold',
                              alignSelf: 'center',
                              //marginRight: 20,
                        
                            },
                          ]}>
                     
                          {LeaveItemData.noOfDays}
                         
                        </Text>
                        <Text
                          style={[
                            styles.text,
                            {
                              color: 'black',
                              fontSize: 14,
                              //width: '100%',
                              alignSelf: 'center',
                              //marginRight: 20,
                              marginVertical: 5,
                            },
                          ]}>
                            Total remaining
                            
                        </Text>

                        <Text
                          style={[
                           
                            {
                              color: 'black',
                              fontSize: 18,
                              fontWeight:'bold',
                              alignSelf: 'center',
                              //marginRight: 20,
                        
                            },
                          ]}>
                     
                          {LeaveItemData.leavesRemainingInCurrentMonth}
                          
                         
                        </Text>

                  </View>

                  
                </View>
                <View style={{ backgroundColor: 'white', paddingBottom: 10 }}>
                  {LeaveItemData?.reason ?
                    <Text
                      style={[
                        styles.text,
                        {
                          color: '#7B7B7B',
                          fontSize: 12,
                          width: '90%',
                          //marginRight: 20,
                          alignSelf: 'center',
                          marginTop: 5,
                        },
                      ]}>
                      {LeaveItemData?.reason || LeaveItemData.reason !== ''
                        ? LeaveItemData.reason
                        : 'No reason'}
                    </Text> : null}
                  {LeaveItemData?.alternateStaffReason ?
                    <Text
                      style={[
                        styles.text,
                        {
                          color: '#7B7B7B',
                          fontSize: 12,
                          width: '90%',
                          //marginRight: 20,
                          alignSelf: 'center',
                          marginTop: 5,
                        },
                      ]}>
                      {LeaveItemData?.alternateStaffReason || LeaveItemData.alternateStaffReason !== ''
                        ? LeaveItemData.alternateStaffReason
                        : 'No alternateStaffReason'}
                    </Text> : null}
                  {LeaveItemData?.requestDetails.map((item, index) => {
                    return item.leaveDetails.map((item2, index2) => {
                      return item2.reason ? <View style={{ backgroundColor: 'white', paddingBottom: 5 }}>
                        <Text
                          style={[
                            styles.text,
                            {
                              color: '#7B7B7B',
                              fontSize: 12,
                              width: '90%',
                              //marginRight: 20,
                              alignSelf: 'center',
                              // marginTop: 5,
                              // paddingTop:10
                            },
                          ]}>
                          {moment(item2.leaveAppliedDate).format("DD/MM/YYYY")}
                        </Text>
                        <Text
                          style={[
                            styles.text,
                            {
                              color: '#7B7B7B',
                              fontSize: 12,
                              width: '90%',
                              //marginRight: 20,
                              alignSelf: 'center',
                              // marginTop: 5,
                              // paddingTop:10
                            },
                          ]}>
                          {item2.reason}
                        </Text>
                      </View> : null
                    })
                  })}
                  {(LeaveItemData?.alternateStaff ||
                    LeaveItemData?.alternateStaff !== '') && (
                      <CustomLabel
                        containerStyle={{ paddingLeft: 15 }}
                        family={'Poppins-Regular'}
                        title={LeaveItemData.alternateStaff}
                      />
                    )}
                    {/* <Text>{LeaveItemData.leaveAttachment</Text> */}
                  {(LeaveItemData?.leaveAttachment ||
                    LeaveItemData?.leaveAttachment !== '') && (
                      <TouchableOpacity
                        onPress={() => {
                          this.setState({ Visible: true });
                          console.log(this.urlExtension);
                        }}
                        style={{
                          width: '100%',
                          alignSelf: 'center',
                          marginVertical: 10,
                        }}>
                       
                        
                        {/* <Text>{LeaveItemData.leaveAttachment}</Text> */}
                        {this.state.urlExtension == "pdf" || this.state.urlExtension == "docx" ? (
                          <TouchableOpacity
                          onPress={() => {
                            // this.props.navigation.navigate("DocumentViewr",{uri:LeaveItemData.leaveAttachment,
                            //  url_extension: this.get_url_extension(LeaveItemData.leaveAttachment)});

                            const extension = this.get_url_extension(LeaveItemData.leaveAttachment);
                            const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;
                            const options = {
                              fromUrl:  LeaveItemData.leaveAttachment,
                              toFile: localFile,
                            };

                            RNFS.downloadFile(options)
                            .promise.then(() => FileViewer.open(localFile))
                            .then(() => {
                              // success
                              console.log("Success");
                            })
                            .catch((error) => {
                              // error
                              console.log("Error"+error)
                            });


                          }}
                          >
                              <Text style={{paddingLeft: 10, color: 'blue',textDecorationLine: 'underline'}}>Click here to view Document</Text>
                          </TouchableOpacity>
                          
                        ):(
                          <View>
                          
                          <Thumbnail
                          alt="No image"
                          style={{
                            borderRadius: 10,
                            width: '100%',
                            height: 100,
                            resizeMode: 'contain',
                          }}
                          source={{
                            uri: LeaveItemData.leaveAttachment,
                          }}
                        />
                        
                          </View>
                        )}
                      </TouchableOpacity>

                      // {this.state.urlExtension == "" (
                      //   <View></View>
                      // ):(
                      //   <View></View>
                      // )}
                    )}
                </View>
                <Overlay
                  overlayStyle={{ alignSelf: 'center', width: '80%' }}
                  isVisible={this.state.Visible}
                  onBackdropPress={() => this.setState({ Visible: false })}>
                  <View
                    style={{ width: '100%', height: 300, alignSelf: 'center' }}>
                    <Image
                      style={{
                        height: '100%',
                        width: '100%',
                        resizeMode: 'contain',
                      }}
                      source={{
                        uri: LeaveItemData.leaveAttachment,
                      }}
                    />
                  </View>
                </Overlay>
                {this.state.LeaveDates.length ? (
                  <View
                    style={{
                      marginTop: 10,
                      alignItems: 'center',
                      width: '100%',
                      paddingVertical: 10,
                      backgroundColor: 'white',
                    }}>
                    <CustomList2
                      width="98%"
                      title1={
                        LeaveItemData.leaveCategory === 5
                          ? 'Permission Asked'
                          : 'Leave Dates'
                      }
                      color={SubThemeColor}
                      headerColor={Colors.mainHeader[0]}>
                      <ScrollView nestedScrollEnabled={true}>
                        {this.state.LeaveDates.length ? (
                          this.state.LeaveDates.map((item, index) => {
                            //console.log(item);
                            return (
                              <View
                                key={index}
                                style={[
                                  styles.headerContainer,
                                  {
                                    width: '100%',
                                    height: 40,
                                    flexDirection: 'row',
                                    borderRadius: 15,
                                    //justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    marginTop: 5,
                                  },
                                ]}>
                                <View
                                  style={[
                                    styles.headerTitleContainer,
                                    {
                                      width: '24%',
                                      height: '100%',
                                      flex:
                                        LeaveItemData.leaveCategory === 5
                                          ? null
                                          : 1,
                                      borderRadius: 10,
                                    },
                                  ]}>
                                  <Text
                                    style={[
                                      styles.text,
                                      {
                                        color: 'black',
                                      },
                                    ]}>
                                    {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
                                    {moment(item.datesSelected).format(
                                      'DD.MM.YYYY',
                                    )}
                                  </Text>
                                </View>

                                {LeaveItemData.leaveCategory === 5 && (
                                  <Text style={[styles.text, { color: 'black' }]}>
                                    {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
                                    {moment
                                      .utc(
                                        this.state.LeaveDates[index].fromTime,
                                      )
                                      .local()
                                      .format('h:mm a')}
                                  </Text>
                                )}

                                {LeaveItemData.leaveCategory === 5 && (
                                  <Text
                                    style={[
                                      styles.text,
                                      { color: 'black', marginHorizontal: 10 },
                                    ]}>
                                    {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
                                    To
                                  </Text>
                                )}
                                {LeaveItemData.leaveCategory === 5 && (
                                  <Text
                                    style={[
                                      styles.text,
                                      { color: 'black', marginHorizontal: 10 },
                                    ]}>
                                    {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
                                    {moment
                                      .utc(this.state.LeaveDates[index].toTime)
                                      .local()
                                      .format('h:mm a')}
                                  </Text>
                                )}
                                {LeaveItemData.leaveCategory !== 5 && (
                                  <CheckBox
                                    title={'Morning'}
                                    containerStyle={{
                                      backgroundColor: 'transparent',
                                      minHeight: 50,
                                    }}
                                    checked={
                                      this.state.LeaveDates[index].firstHalf
                                    }
                                    checkedColor={Colors.calendarBg}
                                    disabled={item.disableMorning}
                                    onPress={() => {
                                      let modifiedArr = this.state.LeaveDates;
                                      if (modifiedArr[index].firstHalf) {
                                        modifiedArr[index].firstHalf = false;
                                        modifiedArr[
                                          index
                                        ].isMorningModified = true;
                                        this.setState({
                                          LeaveDates: [...modifiedArr],
                                        });

                                        //alert(item.firstHalf);
                                        console.log(this.state.LeaveDates);
                                      } else {
                                        modifiedArr[index].firstHalf = true;
                                        modifiedArr[
                                          index
                                        ].isMorningModified = false;
                                        this.setState({
                                          LeaveDates: [...modifiedArr],
                                        });
                                        //alert(item.firstHalf);
                                        console.log(this.state.LeaveDates);
                                      }
                                    }}
                                  />
                                )}

                                {LeaveItemData.leaveCategory !== 5 && (
                                  <CheckBox
                                    title={'Evening'}
                                    containerStyle={{
                                      backgroundColor: 'transparent',
                                      minHeight: 50,
                                    }}
                                    checked={
                                      this.state.LeaveDates[index].secondHalf
                                    }
                                    disabled={item.disableEvening}
                                    checkedColor={Colors.button[0]}
                                    onPress={() => {
                                      let modifiedArr = this.state.LeaveDates;
                                      if (modifiedArr[index].secondHalf) {
                                        console.log('if');
                                        modifiedArr[index].secondHalf = false;
                                        modifiedArr[
                                          index
                                        ].isEveningModified = true;
                                        this.setState({
                                          LeaveDates: [...modifiedArr],
                                        });

                                        console.log(this.state.LeaveDates);
                                      } else {
                                        console.log('else');
                                        modifiedArr[index].secondHalf = true;
                                        modifiedArr[
                                          index
                                        ].isEveningModified = false;
                                        this.setState({
                                          LeaveDates: [...modifiedArr],
                                        });

                                        console.log(this.state.LeaveDates);
                                      }
                                    }}
                                  />
                                )}

                                {/*) : null}*/}
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
                            <Text>No Data Found</Text>
                          </View>
                        )}
                      </ScrollView>
                    </CustomList2>
                  </View>
                ) : null}
                {LeaveItemData.leaveCategory === 7 && (
                  <View style={{ backgroundColor: 'white' }}>
                    <View style={{ backgroundColor: '#EEEEEE' }}>
                      <CustomLabel title="Missed Punch Details" />
                    </View>
                    {LeaveItemData.requestDetails?.length > 0 &&
                      LeaveItemData.requestDetails[0].leaveDetails.map(
                        (e, i) => {
                          return (
                            <CustomCard
                              alignSelf="center"
                              marginTop={10}
                              borderWidth={0.5}
                              key={i}
                              backgroundColor="white">
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <CustomLabel
                                  containerStyle={{ width: '60%' }}
                                  title={'Missed Punch Date'}
                                //labelStyle={{color: Colors.button[0]}}
                                />
                                <CustomLabel
                                  title={moment(e.leaveAppliedDate).format(
                                    'DD.MM.YYYY',
                                  )}
                                  labelStyle={{ color: Colors.button[0] }}
                                />
                              </View>
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <CustomLabel
                                  containerStyle={{ width: '60%' }}
                                  title={'Scheduled Punch Time'}
                                //labelStyle={{color: Colors.button[0]}}
                                />
                                <CustomLabel
                                  title={moment(
                                    e.scheduledMissedPunchTime,
                                  ).format('h:mm a')}
                                  labelStyle={{ color: Colors.button[0] }}
                                />
                              </View>
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <CustomLabel
                                  containerStyle={{ width: '60%' }}
                                  title={'Actual Punch Time'}
                                //labelStyle={{color: Colors.button[0]}}
                                />
                                <CustomLabel
                                  title={moment(e.actualMissedPunchTime).format(
                                    'h:mm a',
                                  )}
                                  labelStyle={{ color: Colors.button[0] }}
                                />
                              </View>
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <CustomLabel
                                  containerStyle={{ width: '60%' }}
                                  title={'Type'}
                                //labelStyle={{color: Colors.button[0]}}
                                />
                                <CustomLabel
                                  title={
                                    e.missedPunchIsCheckIn
                                      ? 'Check In'
                                      : 'Check Out'
                                  }
                                  labelStyle={{ color: Colors.button[0] }}
                                />
                              </View>
                            </CustomCard>
                          );
                        },
                      )}
                  </View>
                )}
                <View
                  style={{
                    marginTop: 10,
                    alignItems: 'center',
                    width: '100%',
                    paddingVertical: 10,
                    backgroundColor: 'white',
                  }}>
                  <CustomList2
                    width="98%"
                    style={{ width: "20%" }}
                    title1={'Date'}
                    title3={'FHA'}
                    title4={'FHP'}
                    title5={'SHA'}
                    title6={'SHP'}
                    // title2={'Total'}
                    color={SubThemeColor}
                    headerColor={Colors.mainHeader[0]}>
                    <ScrollView nestedScrollEnabled={true}>
                      {this.state.leaveAnalysis.length > 0 &&
                        this.state.leaveAnalysis.map((e, index) => {
                          console.log("e----------", e);
                          return (
                            <View
                              key={index}
                              style={[
                                styles.headerContainer,
                                {
                                  width: '100%',
                                  height: isIOS ? 60 : 40,
                                  flexDirection: 'row',
                                  borderRadius: 15,
                                  //justifyContent: 'space-evenly',
                                  alignItems: 'center',
                                  marginTop: 5,
                                },
                              ]}>
                              <View
                                style={[
                                  styles.headerTitleContainer,
                                  {
                                    // width: '20%',
                                    height: '100%',
                                    overflow: 'scroll',
                                    flex: 1,
                                    borderRadius: 10,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.text,
                                    {
                                      color: 'black',
                                    },
                                  ]}>
                                  {moment(e.date).format('DD.MM.YY')}
                                </Text>
                              </View>
                              {/* <View
                                style={[
                                  styles.headerTitleContainer,
                                  {
                                    // width: '16.16%',
                                    height: '100%',
                                    flex: 1,
                                    borderRadius: 10,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.text,
                                    {
                                      color: 'black',
                                    },
                                  ]}>
                                  {e.totalStaff}
                                </Text>
                              </View> */}
                              <View
                                style={[
                                  styles.headerTitleContainer,
                                  {
                                    // width: '16.16%',
                                    height: '100%',
                                    flex: 1,
                                    borderRadius: 10,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.text,
                                    {
                                      color: 'black',
                                    },
                                  ]}>
                                  {e.firstHalfRequestsApproved}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.headerTitleContainer,
                                  {
                                    // width: '16.16%',
                                    height: '100%',
                                    flex: 1,
                                    borderRadius: 10,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.text,
                                    {
                                      color: 'black',
                                    },
                                  ]}>
                                  {e.firstHalfRequestsPending}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.headerTitleContainer,
                                  {
                                    // width: '16.16%',
                                    height: '100%',
                                    flex: 1,
                                    borderRadius: 10,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.text,
                                    {
                                      color: 'black',
                                    },
                                  ]}>
                                  {e.secondHalfRequestsApproved}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.headerTitleContainer,
                                  {
                                    // width: '16.16%',
                                    height: '100%',
                                    flex: 1,
                                    borderRadius: 10,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.text,
                                    {
                                      color: 'black',
                                    },
                                  ]}>
                                  {e.secondHalfRequestsPending}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                    </ScrollView>
                  </CustomList2>
                </View>
                <View
                  style={{
                    width: '100%',
                    backgroundColor: 'white',
                    marginTop: 10,
                  }}>
                  <CustomLabel title={'  Comment'} />
                  <CustomModalTextArea
                    value={this.state.Comment}
                    placeholder="Write comment here"
                    onChangeText={Comment => this.setState({ Comment })}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    width: '100%',
                    justifyContent: 'space-evenly',
                    paddingVertical: 10,
                    backgroundColor: 'white',
                    marginVertical: 10,
                  }}>
                  <CustomButton
                    color={'#39BB47'}
                    width="40%"
                    radius={5}
                    //title={'Approve'}
                    onPress={() =>
                      this.setState({ approved: true, rejected: false }, () =>
                        this.submitHandler(),
                      )
                    }>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <Icon
                        size={20}
                        name="check-circle"
                        color={'white'}
                        type={'FontAwesome'}
                      />
                      <Text
                        style={{ color: 'white', fontSize: 14, marginLeft: 10 }}>
                        Accept
                      </Text>
                    </View>
                  </CustomButton>
                  <CustomButton
                    width="40%"
                    color={'#EF5964'}
                    radius={5}
                    //title={'Reject'}
                    onPress={() =>
                      this.setState({ approved: false, rejected: true }, () =>
                        this.submitHandler(),
                      )
                    }
                  //marginTop={8}
                  >
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <Icon
                        size={20}
                        name="circle-with-cross"
                        color={'white'}
                        type={'entypo'}
                      />
                      <Text
                        style={{ color: 'white', fontSize: 14, marginLeft: 10 }}>
                        Reject
                      </Text>
                    </View>
                  </CustomButton>
                </View>
                {/* {LeaveItemData?.leaveAttachment ? (
                  <ImageView
                    //images={images}
                    images={[LeaveItemData.leaveAttachment]}
                    imageIndex={0}
                    visible={this.state.Visible}
                    onRequestClose={() => this.setState({Visible: false})}
                  />
                ) : null} */}
                {/* {LeaveItemData?.leaveApprovalsAndRequests.length &&
                LeaveItemData?.leaveApprovalsAndRequests[0]
                  .requestedImageUrl ? (
                  <ImageView
                    images={[
                      LeaveItemData.leaveApprovalsAndRequests[0]
                        .requestedImageUrl,
                    ]}
                    imageIndex={0}
                    visible={this.state.Visible2}
                    onRequestClose={() => this.setState({Visible2: false})}
                  />
                ) : null} */}
              </View>
            )}

            <View style={{ margin: 5 }}>
              {this.state.approverArr.length ? (
                <ApprovalStages
                  onPress={() => { }}
                  title={'Approval Stages'}
                  headerColor={ThemeColor}
                  Arr={this.state.approverArr}
                  color={SubThemeColor}
                  width={'95%'}
                  reverse
                />
              ) : (
                <View>
                  <Text style={{ alignSelf: 'center', marginTop: 10 }}></Text>
                </View>
              )}
            </View>
          </VStack>
        </ScrollView>
      </View>
    );
  }
}
const images = [require('../../assets/taskall.jpg')];
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
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
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'white',
  },
  text2: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  buttonStyle: {
    backgroundColor: SubThemeColor,
    //backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: 200,
    //marginLeft: -100,
    justifyContent: 'flex-start',
  },
  imageStyle: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginHorizontal: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
