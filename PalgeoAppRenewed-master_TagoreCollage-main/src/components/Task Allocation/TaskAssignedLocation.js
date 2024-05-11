import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {VStack} from 'native-base';
import {Input} from 'react-native-elements';
import SubHeader from '../common/DrawerHeader';
import Loader from '../common/Loader';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'react-native-check-box';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import DocumentPicker from 'react-native-document-picker';
import CustomPicker from '../common/CustomPicker';
import moment from 'moment';
import {TouchableOpacity} from 'react-native';
import {CustomCalendar} from '../common/CustomCalendar';
import CustomLabel from '../common/CustomLabel';
import CustomModalTextArea from '../common/CustomModalTextArea';
import CustomSelect from '../common/CustomSelect';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import {Colors} from '../../utils/configs/Colors';
import {ScrollView} from 'react-native';
import {CustomButton} from '../common/CustomButton';
import {isIOS} from '../../utils/configs/Constants';
import AnimatedLoader from '../common/AnimatedLoader';
import SuccessError from '../common/SuccessError';
import Stepper from '../common/Stepper';
import axios from 'axios';
const SubThemeColor = '#FFEDEE';
const ThemeColor = '#F15761';
const screenWidth = Dimensions.get('window').width;
export default class TaskAssignedLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      showAlert: false,
      isMustComplete: true,
      TaskFrequency: [
        {name: 'Not-Repeat', id: 1},
        {name: 'Daily', id: 2},
        {name: 'Weekly', id: 3},
        {name: 'Monthly', id: 4},
      ],
      SelectedInstitute: this.props.route.params
        ? this.props.route.params.SelectedInstitute
          ? this.props.route.params.SelectedInstitute
          : []
        : [],
      SelectedTaskType: this.props.route.params
        ? this.props.route.params.SelectedTaskType
          ? this.props.route.params.SelectedTaskType
          : []
        : [],
      SelectedBranch: this.props.route.params
        ? this.props.route.params.SelectedBranch
          ? this.props.route.params.SelectedBranch
          : []
        : [],
      SelectedStaffTypes: this.props.route.params
        ? this.props.route.params.SelectedStaffTypes
          ? this.props.route.params.SelectedStaffTypes
          : []
        : [],
      SelectedDepartment: this.props.route.params
        ? this.props.route.params.SelectedDepartment
          ? this.props.route.params.SelectedDepartment
          : []
        : [],
      SelectedDesignation: this.props.route.params
        ? this.props.route.params.SelectedDesignation
          ? this.props.route.params.SelectedDesignation
          : []
        : [],
      SelectedStaffMembers: this.props.route.params
        ? this.props.route.params.SelectedStaffMembers
          ? this.props.route.params.SelectedStaffMembers
          : []
        : [],
      subject: '',
      bearer_token: '',
      institute_id: '',
      showAlert1: false,
      error_message: '',
      org_id: '',
      SelectedTaskFrequency: [],
      time: new Date(),
      time2: new Date(),
      FromDate: new Date(),
      ToDate: new Date(),
      File: null,
      IsMon: false,
      IsTue: false,
      IsWed: false,
      IsThu: false,
      IsFri: false,
      IsSat: false,
      IsSun: false,
    };
  }
  componentDidMount() {
    console.log('props == ', this.props.route?.params);
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      AsyncStorage.getItem('institute_id').then(institute_id => {
        AsyncStorage.getItem('org_id').then(org_id => {
          this.setState({
            bearer_token: bearer_token,
            institute_id: institute_id,
            org_id: org_id,
          });
        });
      });
    });
  }

  handleConfirm1 = time => {
    console.log('time', time);
    this.setState({time}, () => this.hideDatePicker1());
  };
  handleConfirm2 = time => {
    this.setState({time2: time}, () => this.hideDatePicker2());
  };

  hideDatePicker1 = () => {
    if (this.state.time && this.state.time2) {
      //this.DateCheckerFunction()
    }
    this.setState({showFirstTime: false});
  };
  hideDatePicker2 = () => {
    if (this.state.time && this.state.time2) {
      // this.DateCheckerFunction();
    }
    this.setState({showSecondTime: false});
  };

  validate = (subject, description, frequency) => {
    if (subject === '') {
      return false;
    }
    if (description === '') {
      return false;
    }
    if (frequency.length === 0) {
      return false;
    }
    return true;
  };

  displayMsg = (error, error_message, showAlert1) => {
    this.setState(
      {
        error,
        error_message,
        showAlert1,
      },
      // () => {
      //   if (isIOS) {
      //     alert(error_message);
      //   }
      // },
    );
  };

  AddOrUpdateStaffTaskDetail = async () => {
    const org_id = await AsyncStorage.getItem('org_id');
    const url =
      'http://182.71.102.212/palgeoapi/api/StaffTaskAllotment/AddOrUpdateStaffTaskDetail';
    //console.log('url = ', url);

    const check = this.validate(
      this.state.subject,
      this.state.Task,
      this.state.SelectedTaskFrequency,
    );
    if (!check) {
      return this.displayMsg(true, 'Please fill required fields', true);
    }

    this.setState({showAlert: true});
    let formData = new FormData();
    formData.append('id', 0);
    formData.append('instituteId', parseInt(this.state.SelectedInstitute));
    formData.append('departmentId', 0);
    formData.append('designationId', 0);
    formData.append('isMon', this.state.IsMon);
    formData.append('isTue', this.state.IsTue);
    formData.append('isWed', this.state.IsWed);
    formData.append('isThu', this.state.IsThu);
    formData.append('isFri', this.state.IsFri);
    formData.append('isSat', this.state.IsSat);
    formData.append('isSun', this.state.IsSun);
    formData.append('orgId', Number(org_id));
    formData.append('staffName', this.state.SelectedStaffMembers);
    formData.append('staffCodes', this.state.SelectedStaffMembers);
    //staffName: ["1000222"],
    formData.append('task_Description', this.state.Task);
    formData.append('task_subject', this.state.subject);
    formData.append(
      'task_StartDate',
      moment(this.state.FromDate).format('YYYY/MM/DD'),
    );
    formData.append(
      'task_EndDate',
      moment(this.state.ToDate).format('YYYY/MM/DD'),
    );
    formData.append(
      'task_StartTime',
      moment(this.state.time).format('YYYY-MM-DD HH:mm:00'),
    );
    formData.append(
      'task_EndTime',
      moment(this.state.time2).format('YYYY-MM-DD HH:mm:00'),
    );
    formData.append('task_Type', this.state.SelectedTaskFrequency[0]);
    formData.append('isMust', this.state.isMustComplete);
    formData.append('dates', '');
    this.state.File && formData.append('attachments', this.state.File);
    console.log('formdata == ', JSON.stringify(formData, null, 4));
    try {
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: 'Bearer ' + this.state.bearer_token,
          'Content-Type': 'multipart/form-data',
        },
      });
      const json = response.data;
      this.setState({showAlert: false});
      this.displayMsg(false, json.message, true);
    } catch (error) {
      this.setState({showAlert: false});
      alert(error.message);
    }
  };
  handleCheckbox1 = () => {
    this.setState({isMustComplete: !this.state.isMustComplete});
  };
  SelectTaskImage = async () => {
    try {
      const res = await DocumentPicker.pick({
        includeBase64: true,
        type: [DocumentPicker.types.allFiles],
      });
      let typeIdentifier = res.type.split('/');
      console.log(typeIdentifier[1]);
      //alert(typeIdentifier[1]);
      RNFetchBlob.fs
        .readFile(res.uri, 'base64')
        .then(data => {
          var Attachment = {
            FileName:
              'TaskImage' + new Date().getTime() + '.' + typeIdentifier[1],
            FileType: res.type,
            Attachment: data,
          };

          this.setState({File: Attachment});
        })
        .catch(err => {});
    } catch (err) {
      console.log('Unknown Error: ' + JSON.stringify(err));
    }
  };

  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <AnimatedLoader isVisible={this.state.showAlert} doNotShowDeleteIcon />
        <SuccessError
          isVisible={this.state.showAlert1}
          subTitle={this.state.error_message}
          error={this.state.error}
          deleteIconPress={() => this.setState({showAlert1: false})}
        />

        <SubHeader
          title="Task Allocation"
          showBack={true}
          backScreen="TaskPreferences"
          navigation={this.props.navigation}
        />
        <Stepper step2 />
        <ScrollView>
          <View style={styles.cardContainer}>
            <View style={{}}>
              <CustomLabel
                title={'Subject'}
                labelStyle={{marginLeft: '3%', marginTop: '4%'}}
              />
              <View>
                <Input
                  placeholder=""
                  inputContainerStyle={styles.input}
                  value={this.state.subject}
                  onChangeText={subject => {
                    this.setState({subject: subject});
                  }}
                />
              </View>
              {this.state.error && (
                <CustomLabel
                  margin={0}
                  title={'This is required field'}
                  labelStyle={{
                    color: 'red',
                    fontFamily: 'Roboto-Italic',
                    marginLeft: '4%',
                  }}
                />
              )}
            </View>
            {
              <View
                style={{
                  marginTop: '2%',
                  marginLeft: '2%',
                  marginRight: '2%',
                }}>
                <View style={styles.labelContainer}>
                  <View style={styles.row}>
                    <CustomLabel title={'Description'} />
                  </View>
                </View>
                <CustomModalTextArea
                  rowSpan={4}
                  bordered
                  value={this.state.Task}
                  onChangeText={Task => {
                    this.setState({Task: Task});
                  }}
                />
                {this.state.error && (
                  <CustomLabel
                    margin={0}
                    title={'This is required field'}
                    labelStyle={{
                      color: 'red',
                      fontFamily: 'Roboto-Italic',
                      marginLeft: '4%',
                    }}
                  />
                )}
              </View>
            }
            <View style={{marginTop: '4%'}}>
              <CustomLabel
                title={'Task Frequency'}
                labelStyle={{marginLeft: '4%'}}
              />
              <CustomSelect
                items={this.state.TaskFrequency}
                uniqueKey="id"
                single
                onSelectedItemsChange={value => {
                  this.setState({SelectedTaskFrequency: value});
                }}
                selectedItems={this.state.SelectedTaskFrequency}
              />
              {this.state.error && (
                <CustomLabel
                  margin={0}
                  title={'This is required field'}
                  labelStyle={{
                    color: 'red',
                    fontFamily: 'Roboto-Italic',
                    marginLeft: '4%',
                  }}
                />
              )}
            </View>
            <View
              style={{
                width: '90%',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
                alignSelf: 'center',
                marginVertical: 15,
                //marginTop: "4%",
              }}>
              <TouchableOpacity
                onPress={() => this.setState({showFirstTime: true})}>
                <View style={{width: '100%'}}>
                  <View style={styles.labelContainer}>
                    <CustomLabel title={'Start Time'} />
                    <View
                      style={{
                        width: screenWidth / 2.9,
                        backgroundColor: Colors.secondary,
                        height: 50,
                        borderRadius: 5,
                        justifyContent: 'center',
                        //alignItems: 'center',
                        paddingLeft: 10,
                      }}>
                      <Text style={[styles.label, {color: Colors.calendarBg}]}>
                        {moment(this.state.time).format('h:mm a')}
                      </Text>
                    </View>
                  </View>
                  <DateTimePickerModal
                    isVisible={this.state.showFirstTime}
                    mode="time"
                    onConfirm={this.handleConfirm1}
                    onCancel={this.hideDatePicker1}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({showSecondTime: true})}>
                <View style={{width: '100%'}}>
                  <View style={styles.labelContainer}>
                    <CustomLabel title={'End Time'} />
                    <View
                      style={{
                        width: screenWidth / 2.9,
                        backgroundColor: Colors.secondary,
                        height: 50,
                        borderRadius: 5,
                        justifyContent: 'center',
                        paddingLeft: 10,
                        //alignItems: 'center',
                      }}>
                      <Text style={[styles.label, {color: Colors.calendarBg}]}>
                        {moment(this.state.time2).format('h:mm a')}
                      </Text>
                    </View>
                  </View>
                  <DateTimePickerModal
                    isVisible={this.state.showSecondTime}
                    mode="time"
                    onConfirm={this.handleConfirm2}
                    onCancel={this.hideDatePicker2}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                width: wp('100'),
                alignSelf: 'center',
                justifyContent: 'space-around',
              }}>
              <View style={{width: wp('35')}}>
                <CustomCalendar
                  title={'Start Date'}
                  AvailableLeaves={1000}
                  FromDate={this.state.FromDate}
                  date={this.state.FromDate}
                  onPress={() => this.setState({dateVisible: true})}
                  isVisible={this.state.dateVisible}
                  onConfirm={date => {
                    this.setState({
                      FromDate: date,
                      dateVisible: false,
                    });
                  }}
                  style={{backgroundColor: Colors.secondary}}
                  textStyle={{color: Colors.calendarBg}}
                  onCancel={() => this.setState({dateVisible: false})}
                />
              </View>
              <View style={{width: wp('35')}}>
                <CustomCalendar
                  title={'End Date'}
                  date={this.state.ToDate}
                  AvailableLeaves={1000}
                  //AvailableLeaves={this.state.AvailableLeaves}
                  FromDate={this.state.FromDate}
                  onPress={() => this.setState({dateVisible1: true})}
                  isVisible={this.state.dateVisible1}
                  onConfirm={date => {
                    this.setState({
                      ToDate: date,
                      dateVisible1: false,
                      SelectedDate: true,
                    });
                  }}
                  style={{backgroundColor: Colors.secondary}}
                  textStyle={{color: Colors.calendarBg}}
                  onCancel={() => this.setState({dateVisible1: false})}
                />
              </View>
            </View>

            <View
              style={{marginTop: '4%', marginLeft: '2%', marginRight: '2%'}}>
              <TouchableWithoutFeedback onPress={this.SelectTaskImage}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: Colors.button[0],
                    padding: 5,
                    borderRadius: 8,
                  }}>
                  <Icon
                    name={'attach'}
                    type={'ionicon'}
                    color={Colors.button[0]}
                    //size={30}
                    //style={{alignSelf: 'center', marginBottom: 20}}
                  />
                  <CustomLabel title={'Choose File'} />
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View
              style={{marginTop: '4%', marginLeft: '2%', marginRight: '2%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: wp('3'),
                  alignItems: 'center',
                }}>
                <CheckBox
                  checkedCheckBoxColor={Colors.button[0]}
                  isChecked={this.state.isMustComplete}
                  onClick={this.handleCheckbox1}
                />
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
                    marginLeft: 10,
                  }}>
                  Is Must Complete
                </Text>
              </View>
            </View>
            {this.state.SelectedTaskFrequency.length > 0 &&
              this.state.SelectedTaskFrequency[0] === 3 && (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                  }}>
                  <View
                    style={{
                      marginTop: '4%',
                      marginLeft: '2%',
                      marginRight: '2%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: wp('3'),
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        checkedCheckBoxColor="#f05760"
                        isChecked={this.state.IsMon}
                        onClick={() => {
                          this.setState({IsMon: !this.state.IsMon});
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 13,
                          marginLeft: 10,
                        }}>
                        Mon
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: '4%',
                      marginLeft: '2%',
                      marginRight: '2%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: wp('3'),
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        checkedCheckBoxColor="#f05760"
                        isChecked={this.state.IsTue}
                        onClick={() => {
                          this.setState({IsTue: !this.state.IsTue});
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 13,
                          marginLeft: 10,
                        }}>
                        Tue
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: '4%',
                      marginLeft: '2%',
                      marginRight: '2%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: wp('3'),
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        checkedCheckBoxColor="#f05760"
                        isChecked={this.state.IsWed}
                        onClick={() => {
                          this.setState({IsWed: !this.state.IsWed});
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 13,
                          marginLeft: 10,
                        }}>
                        Wed
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: '4%',
                      marginLeft: '2%',
                      marginRight: '2%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: wp('3'),
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        checkedCheckBoxColor="#f05760"
                        isChecked={this.state.IsThu}
                        onClick={() => {
                          this.setState({IsThu: !this.state.IsThu});
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 13,
                          marginLeft: 10,
                        }}>
                        Thu
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: '4%',
                      marginLeft: '2%',
                      marginRight: '2%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: wp('3'),
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        checkedCheckBoxColor="#f05760"
                        isChecked={this.state.IsFri}
                        onClick={() => {
                          this.setState({IsFri: !this.state.IsFri});
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 13,
                          marginLeft: 10,
                        }}>
                        Fri
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: '4%',
                      marginLeft: '2%',
                      marginRight: '2%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: wp('3'),
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        checkedCheckBoxColor="#f05760"
                        isChecked={this.state.IsSat}
                        onClick={() => {
                          this.setState({IsSat: !this.state.IsSat});
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 13,
                          marginLeft: 10,
                        }}>
                        Sat
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: '4%',
                      marginLeft: '2%',
                      marginRight: '2%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: wp('3'),
                        alignItems: 'center',
                      }}>
                      <CheckBox
                        checkedCheckBoxColor="#f05760"
                        isChecked={this.state.IsSun}
                        onClick={() => {
                          this.setState({IsSun: !this.state.IsSun});
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 13,
                          marginLeft: 10,
                        }}>
                        Sun
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            <CustomButton
              radius={20}
              marginTop={10}
              marginBottom={10}
              padding={10}
              width={'30%'}
              color={Colors.mainHeader[0]}
              title={'Save'}
              onPress={this.AddOrUpdateStaffTaskDetail}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  header: {
    backgroundColor: '#089bf9',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: '#ffffff',
  },
  cardContainer: {
    width: '95%',
    alignSelf: 'center',
    // marginTop: '5%',
    // marginLeft: '2%',
    // marginRight: '2%',
    //justifyContent: 'center',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
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
    backgroundColor: '#ffffff',
    paddingLeft: '5%',
    borderRadius: 10,
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: hp('7'),
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },

  item1: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  textarea: {
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderRadius: 8,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('30'),
    paddingRight: wp('7'),
    marginTop: '4%',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#ffffff',
  },
  btImage: {
    width: 54,
    height: 39,
  },
  row: {
    flexDirection: 'row',
  },
  optional: {
    fontFamily: 'Poppins-Regular',
    color: 'red',
    fontSize: 12,
    margin: 2,
  },
});
