import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SubHeader from '../common/DrawerHeader';
import moment from 'moment';

import { CustomTextArea } from '../common/CustomTextArea';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';
import CustomPicker from '../common/CustomPicker';
import CustomLoader from '../Task Allocation/CustomLoader';
import { CheckBox, Icon } from 'react-native-elements';
import { Colors } from '../../utils/configs/Colors';
import { CustomButton } from '../common/CustomButton';
import { getAllReportees, tokenApi } from '../../utils/apis';
import SuccessError from '../common/SuccessError';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];

export default class BackDatedLeave extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ApprovalStages: [],
      Attachment: { FileName: '' },
      SelectedLeaveIdArr: [],
      datesArray: [],
      leaveTypes: [],
      leaveRequestTypeId: 0,
      currentIndex: -1,
      prevType: [0],
      reportees: [],
      reporteeStaffCode: '',
      showReporteesDropdown: false,
      StaffCode: '',
      user_id: '',
      institute_id: '',
      selectedLeaveId: this.props.route?.params?.SelectedLeaveId || '',
    };
  }
  componentDidMount() {
    this.getUserInfo();
  }

  getUserInfo = async () => {
    this.setState({ loader: true });
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const device_token = await AsyncStorage.getItem('device_token');
      this.setState(
        { user_id, StaffCode: user_id, institute_id, bearer_token, device_token },
        () => {
          this.getAbsentDates();
          this.getLeaveTypes();
          this.getType();
          this.fetchAllReportees(user_id);
        },
      );
    } catch (e) {
      this.setState({ loader: false });
      alert('Something went wrong.');
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

  getAbsentDates = async () => {
    const { StaffCode, institute_id } = this.state;
    try {
      const res = await tokenApi();
      const response = await res.post('api/Attendance/GetAbsentDates', {
        StaffCode,
        InstituteId: Number(institute_id),
        Month: new Date().getMonth() + 1,
        Year: new Date().getFullYear(),
      });
      const { data } = response;
      console.log("response", {
        StaffCode,
        InstituteId: Number(institute_id),
        Month: new Date().getMonth() + 1,
        Year: new Date().getFullYear(),
      })
      if (data.length === 0) {
        return this.setState({ navigate: true }, () => {
          return this.displayMsg(
            true,
            'Sorry, You do not have any back dates to apply.',
            true,
          );
        });
      }

      if (data.length > 0) {
        const newDates = data.map(e => {
          return {
            date: e.date,
            isFirstHalfSelected: false,
            isSecondHalfSelected: false,
            isFirstHalfPresent: false,
            isSecondHalfPresent: false,
            firstHalfLeaveTypeId: 0,
            secondHalfLeaveTypeId: 0,
            reason: '',
            Attachment: '',
          };
        });
        this.setState({ datesArray: newDates }, () => {
          console.log("newDates", data)
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  getLeaveTypes = async () => {
    const od = this.props.route?.params?.od || false;
    const id = od ? 4 : 3;
    // this.state.selectedLeaveId;
    const url =
      Const +
      'api/Leave/GetLeaveTypeSubCategoriesByInstituteId?instituteId=' +
      this.state.institute_id +
      '&leaveRequestId=' +
      id +
      '&staffCode=' +
      this.state.StaffCode;
    console.log('GetLeaveTypeSubCategoriesByInstituteId Url = ', url);
    try {
      const response = await axios.get(url);
      console.log('GetLeaveTypeSubCategoriesByInstituteId =', response.data);
      let newData = [];
      if (response.data?.length > 0) {
        if (id === 4) {
          response.data.forEach(e => {
            newData.push({ name: e.leaveName, id: e.leaveId });
          });
          return;
        }

        response.data.forEach(e => {
          if (e.remainingLeaveCount > 0) {
            newData.push({
              name: e.leaveName,
              id: e.leaveId,
              addCount: 0,
              remainingLeaveCount: e.remainingLeaveCount,
            });
          }
        });
      }
      // console.log('newDate===', newData);
      newData.push({ name: 'Present', id: 0 });
      this.setState({
        loader: false,
        leaveTypes: newData,
        SelectedLeaveIdArr: response.data,
        // CustomListLoader: false,
      });
    } catch (error) {
      console.log('getSub==', error);

      this.setState({ loader: false });
      alert(error.message);
    }
  };

  getType = async () => {
    const mainId = this.props.route?.params?.SelectedLeaveId || 0;
    const id = mainId;
    // this.state.selectedLeaveId;
    const url =
      Const +
      'api/Leave/GetLeaveTypeSubCategoriesByInstituteId?instituteId=' +
      this.state.institute_id +
      '&leaveRequestId=' +
      id +
      '&staffCode=' +
      this.state.StaffCode;
    console.log('GetLeaveTypeSubCategoriesByInstituteId Url = ', url);
    try {
      const response = await axios.get(url);
      console.log('GetLeaveTypeSubCategoriesByInstituteId =', response.data);

      this.setState({
        loader: false,
        leaveRequestTypeId: response.data[0].leaveId,
        isAttachmentMandatory: response.data[0].isAttachmentMandatory,
        // CustomListLoader: false,
      });
      console.log('typeId ==', response.data[0].leaveId);
    } catch (error) {
      console.log('getSub==', error);

      this.setState({ loader: false });
      alert(error.message);
    }
  };

  makeRequest = async () => {
    const dates = this.state.datesArray.filter((d) => d.isFirstHalfSelected || d.isSecondHalfSelected);
    const withReason = dates.find(e => e.reason !== '');
    if (!withReason) {
      return this.displayMsg(true, 'Reason is required.', true);
    }
    // if (!this.state.isAttachmentMandatory && !this.state.Attachment.FileName) {
    //   return this.displayMsg(true, 'Attachment is required.', true);
    // }
    // if (!this.state.Reason || this.state.Reason === '') {

    // }

    let check = false;

    const arr = this.state.SelectedLeaveIdArr;
    const array = this.state.datesArray;

    const filtered = array.filter(
      e => !e.isFirstHalfSelected && !e.isSecondHalfSelected,
    );
    if (filtered.length === array.length) {
      return this.displayMsg(true, 'Select atleast one session.', true);
    }
    if (this.state.selectedLeaveId === 9) {
      arr.forEach(e => {
        if (e.addCount > e.remainingLeaveCount) {
          return (check = true);
        }
      });
      if (check) {
        return this.displayMsg(
          true,
          'You cannot apply more leaves than allowed maximum.',
          true,
        );
      }
    }
    this.setState({ customLoader: true });
    const body = {
      LeaveRequestId: 0,
      StaffCode: this.state.StaffCode,
      RaisedByStaffCode: this.state.user_id,
      InstituteId: Number(this.state.institute_id),
      LeaveTypeId: this.state.leaveRequestTypeId,
      Reason: '',
      MobileDeviceToken: this.state.device_token,
      LeaveAttachment: this.state.Attachment,
      ModifiedDates: dates,
    };
    console.log('BackDateAttendanceLeaveRequest body ==', body);
    try {
      const res = await tokenApi();
      const response = await res.post(
        'api/Leave/BackDateAttendanceLeaveRequest',
        body,
      );
      console.log("url = 'api/Leave/BackDateAttendanceLeaveRequest'");
      console.log('BackDateAttendanceLeaveRequest response ===', response.data);
      if (!response.data.status) {
        return this.displayMsg(true, response.data.message, true);
      }
      this.displayMsg(false, response.data.message, true);
    } catch (e) {
      this.displayMsg(true, e.message, true);
    }
  };

  displayMsg = (error, error_message, showAlert) =>
    this.setState({
      error,
      error_message,
      showAlert,
      customLoader: false,
    });

  render() {
    if (this.state.loader && this.state.datesArray.length === 0) {
      return <Loader />;
    }

    //console.log('iiiiii', this.state.leaveTypes);

    return (
      <View style={styles.container}>
        <SubHeader
          title={`Back Dated ${!this.props.route?.params?.od ? 'Leave' : 'On Duty'
            }`}
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
        {this.state.customLoader && (
          <CustomLoader loaderText={'Trying to raise your request'} />
        )}
        <SuccessError
          isVisible={this.state.showAlert}
          error={this.state.error}
          subTitle={this.state.error_message}
          deleteIconPress={() =>
            this.setState({ showAlert: false }, () => {
              if (this.state.navigate) {
                return this.props.navigation.goBack();
              }
            })
          }
        />
        <ScrollView>
          {this.state.showReporteesDropdown && (
            <CustomPicker
              label={'Select Reportee'}
              height={hp('11')}
              selectedValue={this.state.StaffCode}
              onValueChange={value =>
                this.setState({ StaffCode: value }, () => {
                  //this.GetDetailedLeaves();
                  this.getType();
                  this.getLeaveTypes();
                  this.getAbsentDates();
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

          {this.state.selectedLeaveId === 9 && (
            <View
              style={{
                width: '95%',
                alignSelf: 'center',
                backgroundColor: SubThemeColor,
                borderRadius: 10,
                marginVertical: 10,
              }}>
              <View
                style={[styles.headerContainer, { backgroundColor: '#236DE7' }]}>
                <View style={[styles.headerTitleContainer, { width: '30%' }]}>
                  <Text style={[styles.text, { color: 'white' }]}>
                    {'Eligible Leave'}
                  </Text>
                </View>
                <View style={[styles.headerTitleContainer, { width: '30%' }]}>
                  <Text style={[styles.text, { color: 'white', numberOfLines: 2 }]}>
                    {'Remaining Leaves'}
                  </Text>
                </View>
                <View style={[styles.headerTitleContainer, { width: '30%' }]}>
                  <Text style={[styles.text, { color: 'white', numberOfLines: 2 }]}>
                    {'Added Leaves'}
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
                {this.state.SelectedLeaveIdArr.length > 0 ? (
                  this.state.SelectedLeaveIdArr.filter(
                    e => e.remainingLeaveCount > 0,
                  ).map((item, index) => {
                    //console.log('item', item);
                    return (
                      <View
                        key={index}
                        style={[
                          styles.headerContainer,
                          { justifyContent: 'space-between', padding: 5 },
                        ]}>
                        <View
                          style={[
                            styles.headerTitleContainer,
                            { width: '30%' },
                            // {alignItems: 'flex-start', flex: 1},
                          ]}>
                          <Text style={[styles.text, { color: 'black' }]}>
                            {item.leaveName}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.headerTitleContainer,
                            //{flex: 1}
                            { width: '30%' },
                          ]}>
                          <Text style={[styles.text, { color: 'red' }]}>
                            {item.remainingLeaveCount || ''}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.headerTitleContainer,
                            //{flex: 1}
                            { width: '30%' },
                          ]}>
                          <Text style={[styles.text, { color: 'red' }]}>
                            {item.addCount || ''}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ marginTop: 10, alignItems: 'center' }}>
                    {/* <ActivityIndicator /> */}
                    <Text>No data found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}>
            {this.state.datesArray?.length > 0 &&
              this.state.datesArray.map((item, i) => {
                return (
                  <>
                    <View
                      key={i}
                      style={{
                        width: '100%',
                        backgroundColor: 'white',
                        alignItems: 'center',
                        paddingBottom: 20,
                      }}>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            width: '50%',
                            justifyContent: 'space-evenly',
                            alignItems: 'center',
                            flexDirection: 'row',
                          }}>
                          <Text>{moment(item.date).format('DD.MM.YYYY')}</Text>

                          <Text style={{ color: 'red' }}>Absent</Text>
                        </View>
                        <View
                          style={{
                            width: '50%',
                            justifyContent: 'space-evenly',
                            alignItems: 'center',
                            flexDirection: 'row',
                          }}>
                          <CheckBox
                            containerStyle={{
                              padding: 0,
                              backgroundColor: 'transparent',
                              //minHeight: 50,
                              borderWidth: 0,
                              elevation: 0,
                            }}
                            title={'Morning'}
                            checked={item.isFirstHalfSelected}
                            onPress={() => {
                              let original = this.state.datesArray;
                              original[i].isFirstHalfSelected =
                                !original[i].isFirstHalfSelected;
                              this.setState({ datesArray: [...original] });
                            }}
                            checkedColor={Colors.calendarBg}
                          />
                          <CheckBox
                            containerStyle={{
                              padding: 0,
                              backgroundColor: 'transparent',
                              //minHeight: 50,
                              borderWidth: 0,
                              elevation: 0,
                            }}
                            title={'Evening'}
                            checked={item.isSecondHalfSelected}
                            onPress={() => {
                              let original = this.state.datesArray;
                              original[i].isSecondHalfSelected =
                                !original[i].isSecondHalfSelected;
                              this.setState({ datesArray: [...original] });
                            }}
                            checkedColor={Colors.calendarBg}
                          />
                        </View>
                      </View>
                      {this.state.leaveTypes?.length > 0 && (
                        <CustomPicker
                          label={`Select Eligible ${this.state.selectedLeaveId === 9 ? 'Leave' : 'OD'
                            }`}
                          selectedValue={
                            this.state.datesArray[i].firstHalfLeaveTypeId
                          }
                          options={this.state.leaveTypes}
                          onValueChange={value => {
                            const dates = this.state.datesArray;
                            const { SelectedLeaveIdArr, leaveTypes } = this.state;
                            if (value === 0) {
                              dates[i].firstHalfLeaveTypeId = value;
                              dates[i].secondHalfLeaveTypeId = value;
                              dates[i].isFirstHalfPresent = true;
                              dates[i].isSecondHalfPresent = true;
                              this.setState({ datesArray: [...dates] });
                              return;
                            }
                            dates[i].firstHalfLeaveTypeId = value;
                            dates[i].secondHalfLeaveTypeId = value;
                            const findLeave = SelectedLeaveIdArr.find(
                              e => e.leaveId === value,
                            );
                            if (
                              this.state.currentIndex === i &&
                              this.state.prevType.indexOf(value) > -1
                            ) {
                              console.log('fff');
                            } else {
                              const indexOf =
                                SelectedLeaveIdArr.indexOf(findLeave);
                              leaveTypes[indexOf].addCount += 1;
                              if (SelectedLeaveIdArr[indexOf].addCount) {
                                SelectedLeaveIdArr[indexOf].addCount += 1;
                              } else {
                                SelectedLeaveIdArr[indexOf].addCount = 1;
                              }
                            }
                            this.setState(
                              {
                                currentIndex: i,
                                prevType: [...this.state.prevType, value],
                                datesArray: [...dates],
                                SelectedLeaveIdArr: [...SelectedLeaveIdArr],
                                leaveTypes: [...leaveTypes],
                              },
                              () => {
                                console.log(
                                  'Selected ==',
                                  SelectedLeaveIdArr,
                                  this.state.prevType,
                                );
                              },
                            );
                          }}
                        />
                      )}
                    </View>
                    <View style={{ marginBottom: 10 }}>
                      <CustomTextArea
                        isAttachmentMandatory={this.state.isAttachmentMandatory}
                        onPress2={() => {
                          const Attachment = this.state.datesArray;
                          Attachment[i].Attachment = '';
                          this.setState({
                            datesArray: [...Attachment],
                            Attachment: '',
                          });
                        }}
                        SelectedImage={img => {
                          const Attachment = this.state.datesArray;
                          Attachment[i].Attachment = img;
                          this.setState({
                            datesArray: [...Attachment],
                            Attachment: img,
                          });

                          // this.setState({Attachment});
                        }}
                        title="Reason"
                        noBtn
                        //buttonTitile={'Add'}
                        text={
                          this.state.datesArray[i].Attachment.FileName ||
                          'No files attached'
                        }
                        backgroundColor={SubThemeColor}
                        placeholderTextColor={ThemeColor}
                        width="100%"
                        height={50}
                        buttonWidth={'40%'}
                        placeholder="Write reason here"
                        value={this.state.datesArray[i].reason}
                        onChangeText={text => {
                          const dates = this.state.datesArray;
                          dates[i].reason = text;
                          this.setState({ datesArray: [...dates] });
                        }}
                        onPress={() => { }}
                      />
                    </View>
                  </>
                );
              })}

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
        </ScrollView>
        <View
          style={{
            justifyContent: 'flex-end',
            marginBottom: 20,
            paddingTop: 10,
          }}>
          <CustomButton
            title={'MAKE REQUEST'}
            width={'80%'}
            color={ThemeColor}
            onPress={this.makeRequest}
          />
        </View>
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
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 10,
    marginTop: 5,
  },
  headerTitleContainer: {
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
