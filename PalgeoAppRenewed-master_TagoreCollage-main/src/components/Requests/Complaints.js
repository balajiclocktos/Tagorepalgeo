import {VStack} from 'native-base';
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SubHeader from '../common/DrawerHeader';
import CustomPicker from '../common/CustomPicker';
import {CustomTextArea} from '../common/CustomTextArea';
import {ApprovalStages} from '../common/ApprovalStages';
import axios from 'axios';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../utils/configs/Colors';
import Error from '../popups/error';
import {SuccessError} from '../common';
import {tokenApi} from '../../utils/apis';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];

export default class Complaints extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LeaveType: '',
      Loader: true,
      ApprovalStages: [],
      SelectedLeaveIdArr: [],
      SuggestionSummary: '',
      ApproverLoading: false,
      Complaint: '',
      //Attachment: {Attachment: '', FileName: '', FileType: ''},
      Attachment: '',
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
        this.setState({StaffCode: value}, function () {
          this.setState({LeaveType: ''}, () => {
            this.GetLeaveTypeSubCategoriesByInstituteId();
          });
          this.GetMasterLeaveApproverDetails();
        });
      }
    } catch (error) {
      alert('Error retrieving data');
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
      this.setState({Loader: false, SelectedLeaveIdArr}, function () {
        response.data.length == 1 &&
          this.setState({LeaveType: this.state.SelectedLeaveIdArr[0].id});
        response.data.length == 0 &&
          Alert.alert(
            'Alert',
            'You have not assigned any Complaint. You can Select different Complaint types.',
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
      alert('Error fetching complaint types: ' + error.message);
    }
  };

  GetMasterLeaveApproverDetails = async () => {
    //const url = `http://182.71.102.212/palgeoapi/api/Leave/GetMasterLeaveApproverDetails/${this.state.institute_id}/${this.state.StaffCode}/${this.state.SelectedLeaveId}`;
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
      this.displayErrorMsg(true, error.message);
    }
  };
  AddUpdateComplaint = async () => {
    const url = 'api/Leave/AddUpdateComplaint';
    let body = {
      Id: 0,
      RequestTypeId: this.state.LeaveType,
      StaffCode: this.state.StaffCode.toString(),
      InstituteId: parseInt(this.state.institute_id),
      CreatedDate: new Date().toISOString(),
      ModifiedDate: new Date().toISOString(),
      ComplaintSummary: this.state.Complaint,
      SuggestionSummary: this.state.SuggestionSummary,
      ComplaintAttachment: this.state.Attachment,
    };
    //console.log(JSON.stringify(body));
    try {
      const res = await tokenApi();
      const response = await res.post(url, body);
      console.log('comp res = ', JSON.stringify(response.data));
      if (response.data.status == true) {
        this.setState(
          {
            Loader: false,
          },
          function () {
            setTimeout(() => this.props.navigation.navigate('Leaves'), 3000);
            this.displayErrorMsg(false, response.data.message);
          },
        );
      } else {
        this.displayErrorMsg(true, response.data.message);
      }
    } catch (error) {
      this.displayErrorMsg(true, error.message);
    }
  };

  displayErrorMsg = (error, msg) => {
    this.setState({showAlert: true, error_message: msg, error});
  };

  render() {
    if (this.state.Loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <SuccessError
          error={this.state.error}
          subTitle={this.state.error_message}
          isVisible={this.state.showAlert}
          deleteIconPress={() => this.setState({showAlert: false})}
        />
        <SubHeader
          title="Suggestion Box"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
        <VStack>
          {this.state.SelectedLeaveIdArr.length > 1 && (
            <View style={{marginTop: 10}}>
              <Text style={[styles.label, {margin: 10}]}>
                Select Suggestion Type
              </Text>
              <CustomPicker
                label="You can choose type here"
                selectedValue={this.state.LeaveType}
                options={this.state.SelectedLeaveIdArr}
                onValueChange={value => {
                  this.setState({LeaveType: value}, () => {
                    this.setState({ApproverLoading: true});
                  });
                }}
              />
            </View>
          )}
          <View style={{marginTop: 10}}>
            <Text style={[styles.label, {margin: 10}]}>Topic Name</Text>

            <TextInput
              multiline
              backgroundColor={SubThemeColor}
              placeholderTextColor={ThemeColor}
              style={{
                alignSelf: 'center',
                width: '90%',
                minHeight: 40,
                maxHeight: 120,
                padding: 10,
                borderRadius: 10,
              }}
              placeholder="Name a topic"
              value={this.state.Complaint}
              blurOnSubmit={true}
              onChangeText={text => {
                this.setState({Complaint: text});
              }}
            />
          </View>
          <View style={{marginTop: 20}}>
            <CustomTextArea
              onPress2={() => {
                this.setState({
                  Attachment: '',
                });
              }}
              SelectedImage={Attachment => {
                this.setState({Attachment});
              }}
              text={this.state.Attachment.FileName || 'No files attached'}
              title="Suggestion"
              backgroundColor={SubThemeColor}
              placeholderTextColor={ThemeColor}
              width="95%"
              placeholder="Write your suggestion"
              value={this.state.SuggestionSummary}
              onChangeText={text => {
                this.setState({SuggestionSummary: text});
              }}
              onPress={() => {
                if (this.state.LeaveType == '') {
                  this.displayErrorMsg(true, 'Please Select Complaint Type');
                } else if (this.state.Complaint == '') {
                  this.displayErrorMsg(true, 'Please Enter Complaint Title');
                } else if (this.state.SuggestionSummary == '') {
                  this.displayErrorMsg(true, 'Please Enter Suggestion');
                } else {
                  this.AddUpdateComplaint();
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
                //key={0}
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
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
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
