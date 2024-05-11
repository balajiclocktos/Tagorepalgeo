import { VStack } from 'native-base';
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
import { CustomButton } from '../common/CustomButton';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];

const screenWidth = Dimensions.get('window').width;
export default class BackDatedOnDuty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ApprovalStages: [],
      Attachment: { FileName: 'FileName' },
      SelectedLeaveIdArr: ['sick leave', 'other leave'],
    };
  }

  render() {
    if (this.state.Loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <SubHeader
          title="Back Dated On Duty"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View
            style={{
              width: '100%',
              backgroundColor: 'white',
              alignItems: 'center',
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
                <Text>24.11.2021</Text>
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
                  checked={false}
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
                  checked={false}
                  checkedColor={Colors.calendarBg}
                />
              </View>
            </View>
            <CustomPicker
              label="Select Eligible Leave"
              selectedValue={this.state.LeaveType}
              options={this.state.SelectedLeaveIdArr}
              onValueChange={value => {
                this.setState({ LeaveType: value }, () => { });
              }}
            />
          </View>
          <View style={{ marginTop: 0 }}>
            <CustomTextArea
              onPress2={() => {
                this.setState({
                  Attachment: '',
                });
              }}
              SelectedImage={Attachment => {
                this.setState({ Attachment });
              }}
              title="Reason"
              buttonTitile={'Cancel'}
              text={this.state.Attachment.FileName || 'No files attached'}
              backgroundColor={SubThemeColor}
              placeholderTextColor={ThemeColor}
              width="100%"
              height={50}
              buttonWidth={'40%'}
              buttonColor={'red'}
              placeholder="Write reason here"
              value={this.state.Reason}
              onChangeText={text => {
                this.setState({ Reason: text });
              }}
              onPress={() => { }}
            />
          </View>

          <View
            style={{
              width: '100%',
              backgroundColor: 'white',
              alignItems: 'center',
              marginTop: 10,
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
                <Text>24.11.2021</Text>
                <Text style={{ color: 'red' }}>Casual Leave</Text>
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
                  checked={false}
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
                  checked={false}
                  checkedColor={Colors.calendarBg}
                />
              </View>
            </View>
            <CustomPicker
              label="Select Eligible Leave"
              selectedValue={this.state.LeaveType}
              options={this.state.SelectedLeaveIdArr}
              onValueChange={value => {
                this.setState({ LeaveType: value }, () => { });
              }}
            />
          </View>
          <View style={{ marginTop: 0 }}>
            <CustomTextArea
              onPress2={() => {
                this.setState({
                  Attachment: '',
                });
              }}
              SelectedImage={Attachment => {
                this.setState({ Attachment });
              }}
              title="Reason"
              buttonTitile={'Cancel'}
              text={this.state.Attachment.FileName || 'No files attached'}
              backgroundColor={SubThemeColor}
              placeholderTextColor={ThemeColor}
              buttonColor={'red'}
              width="100%"
              buttonWidth={'40%'}
              height={50}
              placeholder="Write reason here"
              value={this.state.Reason}
              onChangeText={text => {
                this.setState({ Reason: text });
              }}
              onPress={() => { }}
            />
          </View>
          <View style={{ marginVertical: 20 }}>
            <CustomButton
              title={'MAKE REQUEST'}
              width={'80%'}
              color={ThemeColor}
              onPress={() => {
                onPress();
              }}
            />
          </View>
          <View style={{ marginVertical: 10 }}>
            {/*{this.state.ApprovalStages.length > 0 ||
              !this.state.ApproverLoading ? (*/}
            <ApprovalStages
              onPress={() => { }}
              width="100%"
              key={0}
              title="Approval Stages"
              color={SubThemeColor}
              headerColor={ThemeColor}
              Arr={this.state.ApprovalStages}
            />
            {/*) : (
                <View>
                  <ActivityIndicator />
                  <Text style={{alignSelf: 'center', marginTop: 10}}>
                    Fetching Approver List...
                  </Text>
                </View>
              )}*/}
          </View>
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
