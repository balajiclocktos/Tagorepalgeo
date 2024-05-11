import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { Card } from 'native-base';
import { Icon } from 'react-native-elements';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Loader from '../common/Loader';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoData from '../common/NoData';
import CheckBox from 'react-native-check-box';
import CalenderStrip from '../common/CalendarStrip';
import CustomCard from '../common/CustomCard';
import CustomLabel from '../common/CustomLabel';
import { Colors } from '../../utils/configs/Colors';
import { Define } from '../M-Dashboard/components/StaffMaster';

import { TouchableOpacity } from 'react-native';
import AnimatedLoader from '../common/AnimatedLoader';
import LinearGradient from 'react-native-linear-gradient';
import SuccessError from '../common/SuccessError';
import { isIOS } from '../../utils/configs/Constants';
import { fileViewer } from '../../utils/helperFunctions';
import NoTask from '../../assets/noTask.svg';


var moment = require('moment');
export default class CurrentTasks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //loader: true,
      showAlert: false,
      StaffNo: '',
      data: [],
      bearer_token: '',
      showAlert1: false,
      error_message: '',
      date: new Date(),
      institute_id: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      this.setState({ bearer_token: bearer_token });
    });
    AsyncStorage.getItem('user_id').then(user_id => {
      AsyncStorage.getItem('institute_id').then(institute_id => {
        this.setState({ StaffNo: user_id, institute_id }, () => {
          this.getTasks(user_id, institute_id);
        });
      });
    });
  }
  getTasks = (user_id, institute_id) => {
    this.setState({ showAlert: true });
    const bearer = this.state.bearer_token;
    fetch(Const + 'api/Staff/StaffTasks', {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: bearer,
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify({
        staffCode: user_id,
        instituteId: institute_id,
        date: this.state.date,
      }),
    })
      .then(response => response.json())
      .then(json => {
        console.log("body", JSON.stringify({
          staffCode: user_id,
          instituteId: institute_id,
          date: this.state.date,
        }))
        console.log('tasks ==>', json);
        this.setState({ showAlert: false });
        if (json.length > 0) {
          this.setState({ data: json });
        } else {
          this.setState({ data: [] });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({ showAlert: false });
      });
  };
  handleCheckbox = (index, status) => {
    const newArray = [...this.state.data];
    newArray[index].isCompleted = !status;
    this.setState({ data: newArray });
  };
  saveTasks = item => {
    this.setState({ showAlert: true });
    var success = false;
    // for (var i = 0; i < this.state.data.length; i++) {
    if (item.isMust == 1) {
      if (item.isCompleted) {
        success = true;
      } else {
        success = false;
      }
    } else {
      success = true;
    }

    if (success) {
      let temArr = [];
      // this.state.data.map(item => {
      if (item.isCompleted) {
        var obj = {
          StaffCode: item.staff_code,
          TaskId: item.id,
          StartTime: item.taskStartTime,
          InstituteId: this.state.institute_id,
          StsId: item.stsId,
        };
        temArr.push(obj);
      }
      // });
      console.log("payload => ", JSON.stringify(temArr));
      const bearer = this.state.bearer_token;
      fetch(Const + 'api/Staff/UpdateStaffTasksAttended', {
        method: 'POST',
        withCredentials: true,
        credentials: 'include',
        headers: {
          Authorization: bearer,
          Accept: 'text/plain',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(temArr),
      })
        .then(response => response.json())
        .then(json => {
          console.log('SAVE_TASKS ==>', json);
          this.setState({ showAlert: false });
          if (json.status) {
            this.setState(
              {
                showAlert1: true,
                error_message: 'Tasks saved successfully',
                error: false,
              },
              () => {
                if (isIOS) {
                  alert(this.state.error_message);
                }
              },
            );

            this.getTasks(this.state.StaffNo, this.state.institute_id);
          } else {
            this.setState(
              {
                showAlert1: true,
                error_message: json.message,
                //howAlert: false,
                error: true,
              },
              () => {
                if (isIOS) {
                  alert(this.state.error_message);
                }
              },
            );
          }
        })
        .catch(error => {
          this.setState(
            {
              showAlert1: true,
              error_message: error.message,
              showAlert: false,
              error: true,
            },
            () => {
              if (isIOS) {
                alert(error.message);
              }
            },
          );
        });
    } else {
      console.log('I ran');
      this.setState({
        showAlert1: true,
        error_message:
          'Please select all the necessary tasks which are to be completed',
        showAlert: false,
        error: true,
      });
    }
  };
  render() {
    //console.log('state', this.state);
    return (
      <View style={styles.container}>
        <AnimatedLoader
          doNotShowDeleteIcon
          isVisible={this.state.showAlert}
        //ource={require('../../assets/lottie/loader.json')}
        />
        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({ showAlert1: false })}
          subTitle={this.state.error_message}
        />
        <View style={{ height: '10%' }}>
          <CalenderStrip
            calendarColor={'#F2F7FA'}
            headerColor={'black'}
            onDateSelected={date =>
              this.setState({ date }, () =>
                this.getTasks(this.state.StaffNo, this.state.institute_id),
              )
            }
          />
        </View>
        {this.state.data.length > 0 && (
          <View
            style={{
              ...styles.row,
              justifyContent: 'space-around',
              marginBottom: 10,
            }}>
            <LinearGradient
              colors={Colors.button}
              style={{ width: 40, height: 40, borderRadius: 30, padding: 4 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CustomLabel
                  title={moment(this.state.date).format('D')}
                  color={'white'}
                />
                <CustomLabel
                  size={10}
                  title={moment(this.state.date).format('ddd')}
                  color={'white'}
                />
              </View>
            </LinearGradient>
            <View
              style={{
                alignSelf: 'center',
                justifyContent: 'center',
                height: 1,
                borderColor: '#DDDDDD',
                borderWidth: 1,
                width: '80%',
              }}
            />
          </View>
        )}
        {this.state.data.length > 0 && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={this.state.data}
              renderItem={({ item, index }) => {
                return (
                  <CustomCard
                    marginRight={hp('1')}
                    width={'90'}
                    backgroundColor={'#FBE8E4'}>
                    <View
                      style={{
                        borderBottomColor: Colors.overlay,
                        borderBottomWidth: 1,
                        paddingBottom: 8,
                      }}>
                      <CustomLabel color={Colors.button[0]} title={item.task} />
                      <CustomLabel
                        family={'Poppins-Regular'}
                        size={12}
                        title={item.task_Description}
                      />
                     
                    </View>
                    <View>
                      <View style={styles.row}>
                        <Define
                          family={'Poppins-Regular'}
                          icon
                          name="clock"
                          type={'evilicon'}
                          size={15}
                          value={`${moment(item.taskStartTime).format(
                            'h:mm a',
                          )} to ${moment(item.taskEndTime).format('h:mm a')}`}
                        />
                        <CustomLabel
                          color={Colors.button[0]}
                          containerStyle={{
                            borderLeftWidth: 1,
                            paddingLeft: 10,
                            borderLeftColor: Colors.overlay,
                          }}
                          family={'Poppins-Regular'}
                          title={item.isMust === 1 ? 'Mandatory' : 'Optional'}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <View style={styles.row}>
                          <CheckBox
                            checkedCheckBoxColor={Colors.button[0]}
                            isChecked={item.isCompleted}
                            onClick={() =>
                              this.handleCheckbox(index, item.isCompleted)
                            }
                          />
                          <CustomLabel
                            family={'Poppins-Regular'}
                            title={'Mark as completed'}
                          />
                        </View>
                        <TouchableOpacity onPress={() => this.saveTasks(item)}>
                          <View
                            style={{
                              minWidth: 80,
                              borderRadius: 50,
                              backgroundColor: '#EAE3E3',
                              padding: 8,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Define
                              icon
                              name="md-save-sharp"
                              type={'ionicon'}
                              size={15}
                              color={'#777777'}
                              value={'Save Task'}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {item.files.length >0 &&
                      <Pressable onPress={() => {
                        const parsedUrl = JSON.parse(item.files)
                        parsedUrl.forEach((f) => fileViewer(f))
                      }}>
                        <Define
                        icon
                        o
                        name='attachment' type='entypo' size={15}
                        color={'#777777'}
                        value={`${JSON.parse(item.files).length} file(s) attached`}
                      />
                      </Pressable>
                      }
                    </View>
                  </CustomCard>
                );
              }}
              keyExtractor={item => item.id}
              contentContainerStyle={{
                paddingBottom: hp('1'),
                backgroundColor: '#ffffff',
                alignSelf: 'flex-end',

                // justifyContent: 'center',
                //alignItems: 'center',
              }}
            />
          </View>
        )}
        {this.state.data.length === 0 && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              width: '60%',
              alignSelf: 'center',
            }}>
            <NoTask width={300} height={300} />
            <CustomLabel
              size={16}
              family={'Roboto-Regular'}
              color={'#7C7C7C'}
              labelStyle={{ textAlign: 'center' }}
              title={'You do not have any tasks to perform'}
            />
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#c9c3c5',
  },
  nodata: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'red',
  },
  label1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#c9c3c5',
    paddingLeft: wp('3'),
  },
  labelContainer: {
    margin: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#f1f1f1',
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('7'),
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    height: hp('7'),
  },
  dateContainer: {
    borderWidth: 1,
    borderColor: '#f1f1f1',
    height: hp('6.7'),
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8%',
    backgroundColor: '#4dbd74',
    height: hp('6.2'),
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
  },
  walletContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    width: wp('93'),
    paddingTop: '3%',
    paddingLeft: '4%',
    paddingRight: '4%',
    paddingBottom: '3%',
  },
  header: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#67747d',
    margin: '1%',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
    margin: '1%',
  },
  headerVal1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
    paddingLeft: '3%',
  },
  row: {
    flexDirection: 'row',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    margin: '2%',
  },
  divider2: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    margin: '1%',
  },
  divider1: {
    borderWidth: 1,
    borderColor: '#f3f3f3',
    margin: '2%',
  },
  statusContainer: {
    backgroundColor: '#f86c6b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
    height: hp('4.5'),
    borderRadius: 5,
    width: wp('23'),
  },
  statusContainer1: {
    backgroundColor: '#63c2de',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
    height: hp('4.5'),
    borderRadius: 5,
    width: wp('23'),
  },
  actionContainer: {
    backgroundColor: '#63c2de',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
    height: hp('4.5'),
    borderRadius: 5,
    width: wp('25'),
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#ffffff',
  },
  note: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: 'red',
    margin: '1%',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
});
