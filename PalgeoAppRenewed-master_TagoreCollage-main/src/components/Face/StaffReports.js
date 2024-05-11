import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {
  Container,
  //DatePicker,
  Toast,
  Card,
  Row,
  Picker,
  Item,
} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Loader from '../common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Const from '../common/Constants';
import SubHeader from '../common/SubHeader';
import AwesomeAlert from 'react-native-awesome-alerts';
import DatePicker from 'react-native-datepicker';
import {Icon, ListItem} from 'react-native-elements';
import {Colors} from '../../utils/configs/Colors';

var moment = require('moment');
var current = new Date();
var p = current.setDate(current.getDate() - 7);
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      date1: new Date(p),
      loader: true,
      StaffNo: '',
      institute_id: '',
      showAlert: false,
      report: [],
      json: [],
      show: false,
      shiftName: '',
      pressed: false,
      sectionDate: '',
    };
    this.setDate = this.setDate.bind(this);
    this.setDate1 = this.setDate1.bind(this);
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({loader: false});
    }, 700);
    AsyncStorage.getItem('user_id').then(user_id => {
      AsyncStorage.getItem('institute_id').then(institute_id => {
        this.setState({institute_id, StaffNo: user_id});
        this.getStaffReport(user_id, institute_id);
      });
    });
  }
  getStaffReport = async (user_id, institute_id) => {
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    console.log('bearer', bearer_token);
    var to_date = moment(this.state.date).format('YYYY-MM-DD');
    var from_date = moment(this.state.date1).format('YYYY-MM-DD');
    console.log(to_date, from_date);
    this.setState({showAlert: true});
    var body = {
      fromDate: from_date,
      toDate: to_date,
      InstituteId: Number(institute_id),
      ManagerStaffCode: user_id,
      // InstituteId: Number('1'),
      // ManagerStaffCode: 'ct1011',
    };
    console.log('body', body);
    var url = `${Const}api/Attendance/GetCumulativeAttendanceReportForMobileApp`;
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        fromDate: from_date,
        toDate: to_date,
        InstituteId: Number(institute_id),
        ManagerStaffCode: user_id,
        // InstituteId: Number('27244'),
        // ManagerStaffCode: 'EMP05',
      }),
      headers: {
        Authorization: 'Bearer ' + bearer_token,
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
      },
    })
      .then(response => response.json())
      .then(json => {
        console.log('josn', json);
        if (json.length > 0) {
          //this.setState({json});
          //var groupedShifts = this.groupBy(json, (o) => [o.shiftId]);

          var dateWiseResult = json.map(each => {
            return {
              accessDate: each.accessDate,
              data: [...each.shiftInfo],
            };
          });
          // groupedShifts.forEach((element) => {
          //   element.forEach((item) => {
          //     item.checkAndOutTimeList.forEach((detail) => {
          //       if (
          //         dateWiseResult.findIndex(
          //           (x) => x.date === detail.actualDate,
          //         ) > -1
          //       ) {
          //         var dateRecord = dateWiseResult.find(
          //           (x) => x.date === detail.actualDate,
          //         );
          //         var shiftRecord = dateRecord.data.find(
          //           (y) => y.shiftName == element[0].shiftName,
          //         );
          //         if (shiftRecord) {
          //           shiftRecord.present =
          //             shiftRecord.present + (detail.status == 'P' ? 1 : 0);
          //           shiftRecord.absent =
          //             shiftRecord.absent + (detail.status == 'A' ? 1 : 0);
          //         } else {
          //           dateRecord.data.push({
          //             shiftName: element[0].shiftName,
          //             present: detail.status == 'P' ? 1 : 0,
          //             absent: detail.status == 'A' ? 1 : 0,
          //           });
          //         }
          //       } else {
          //         dateWiseResult.push({
          //           date: detail.actualDate,
          //           data: [
          //             {
          //               shiftName: element[0].shiftName,
          //               present: detail.status == 'P' ? 1 : 0,
          //               absent: detail.status == 'A' ? 1 : 0,
          //             },
          //           ],
          //         });
          //       }
          //     });
          //   });
          // });

          console.log('report', JSON.stringify(dateWiseResult, null, 4));
          this.setState({showAlert: false, report: dateWiseResult});
        } else {
          return this.error();
        }
      })
      .catch(error => {
        this.setState({showAlert: false});
        console.error(error);
      });
  };

  error = () => {
    Toast.show({
      text: 'No staff report found',
      duration: 3500,
      type: 'warning',
      textStyle: {
        fontFamily: 'Poppins-Regular',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 14,
      },
    });
    this.setState({report: [], showAlert: false});
  };

  groupBy(array, f) {
    let groups = {};
    array.forEach(o => {
      var group = JSON.stringify(f(o));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    return Object.keys(groups).map(group => groups[group]);
  }

  groupByKey = (array, key) => {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) return hash;
      return Object.assign(hash, {
        [obj[key]]: (hash[obj[key]] || []).concat(obj),
      });
    }, {});
  };

  openDrawer = () => {
    this.drawer._root.open();
  };
  setDate(newDate) {
    this.setState({date: newDate});
  }
  setDate1(newDate) {
    this.setState({date1: newDate});
  }
  goToPaperView = () => {
    this.props.navigation.navigate('QuestionPaperView');
  };

  actionHandler = (shiftName, date, present, staffInfo) => {
    const total = staffInfo.length;
    const staffInfoModified = staffInfo.map(item => {
      return {
        staffCode: item.staffCode,
        staffName: item.name,
        staffPhoto: item.staffPhoto,
        designation: item.designation,
        checkInTime: item.checkInTime
          ? moment(item.checkInTime).format('h:mm a')
          : null,
        checkoutTime: item.checkOutTime
          ? moment(item.checkOutTime).format('h:mm a')
          : null,
        status: item.status,
        expanded: false,
        shiftName,
        date,
      };
    });
    console.log('staffInfoModified', staffInfoModified);
    this.props.navigation.navigate('StaffReports', {
      staffInfo: staffInfoModified,
      shiftName,
      date: moment(date).format('YYYY-MM-DD'),
      total,
      present: present.toString(),
    });

    //this.setState({pressed: true});
    // const total = this.getTotalStaff(shiftName).toString();
    // const shiftData = this.groupByKey(this.state.json, 'shiftName');
    // console.log('shift', shiftData);
    // if (!shiftData[`${shiftName}`]) {
    //   return this.error();
    // }

    // const newData = shiftData[`${shiftName}`].map((item) => {
    //   const {checkInTime} = item.checkAndOutTimeList.find(
    //     (each) => each.actualDate === date,
    //   );
    //   const {checkOutTime} = item.checkAndOutTimeList.find(
    //     (each) => each.actualDate === date,
    //   );
    //   const {status} = item.checkAndOutTimeList.find(
    //     (each) => each.actualDate === date,
    //   );

    //   console.log('item', item);
    // return {
    //   staffCode: item.staffCode,
    //   staffName: item.name,
    //   staffPhoto: item.staffPhoto,
    //   designation: item.designation,
    //   checkInTime: checkInTime ? moment(checkInTime).format('h:mm a') : null,
    //   checkoutTime: checkOutTime
    //     ? moment(checkOutTime).format('h:mm a')
    //     : null,
    //   status,
    //   expanded: false,
    //   shiftName,
    //   date,
    // };
    // });

    //console.log('date', date);
    // return this.props.navigation.navigate('StaffReports', {
    //   newData,
    //   shiftName,
    //   date: moment(date).format('YYYY-MM-DD'),
    //   total,
    //   present: present.toString(),
    // });
  };

  getTotalStaff = shiftName => {
    const shiftData = this.groupByKey(this.state.json, 'shiftName');
    if (!shiftData[shiftName]) {
      return 0;
    }
    return shiftData[shiftName].length;
  };

  renderItem = ({item, index, section}) => {
    return (
      <ListItem>
        <ListItem.Content>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                textTransform: 'capitalize',
                fontFamily: 'Poppins-Regular',
                fontSize: 15,
                alignSelf: 'center',
                fontWeight: 'bold',
              }}>
              {item.shiftName}
              {/* {'Second Shift (9am - 6pm)'} */}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 17,
                  fontFamily: 'Poppins-Regular',
                }}>
                {item.staffinfo.length.toString()}
              </Text>
              <Icon
                name={'account-group'}
                type={'material-community'}
                size={20}
                color={'brown'}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 17,
                  fontFamily: 'Poppins-Regular',
                }}>
                {item.presentCount.toString()}
              </Text>
              <Icon
                name={'check-circle'}
                type={'material-community'}
                size={20}
                color={'green'}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 17,
                  fontFamily: 'Poppins-Regular',
                }}>
                {item.absentCount.toString()}
              </Text>
              <Icon
                name={'circle-with-cross'}
                type={'entypo'}
                size={20}
                color={'red'}
              />
            </View>
          </View>
        </ListItem.Content>
        <ListItem.Chevron
          color={'black'}
          size={25}
          onPress={() =>
            this.actionHandler(
              item.shiftName,
              section.accessDate,
              item.presentCount,
              item.staffinfo,
            )
          }
        />
      </ListItem>
      // <Card style={styles.walletContainer}>
      //   <View style={styles.row}>
      //     <View style={{width: wp('50'), justifyContent: 'center'}}>
      //       <Text style={styles.header}>Shift</Text>
      //     </View>
      //     <View style={{width: wp('50')}}>
      //       <Text style={styles.headerVal}>{item.shiftName}</Text>
      //     </View>
      //   </View>
      //   <View style={styles.row}>
      //     <View style={{width: wp('50'), justifyContent: 'center'}}>
      //       <Text style={styles.header}>Total Staff</Text>
      //     </View>
      //     <View style={{width: wp('50')}}>
      //       <Text style={styles.headerVal}>
      //         {this.getTotalStaff(item.shiftName).toString()}
      //       </Text>
      //     </View>
      //   </View>
      //   <View style={styles.row}>
      //     <View style={{width: wp('50'), justifyContent: 'center'}}>
      //       <Text style={styles.header}>Staffs Present</Text>
      //     </View>
      //     <View style={{width: wp('50')}}>
      //       <Text style={styles.headerVal}>{item.present.toString()}</Text>
      //     </View>
      //   </View>
      //   <View style={styles.row}>
      //     <View style={{width: wp('50'), justifyContent: 'center'}}>
      //       <Text style={styles.header}>Staffs Absent</Text>
      //     </View>
      //     <View style={{width: wp('50')}}>
      //       <Text style={styles.headerVal}>{item.absent.toString()}</Text>
      //     </View>
      //   </View>
      //   <View style={styles.row}>
      //     <View style={{width: wp('50'), justifyContent: 'center'}}>
      //       <Text style={styles.header}>Action</Text>
      //     </View>
      //     <View style={{width: wp('50')}}>
      // <TouchableWithoutFeedback
      //   onPress={() => this.actionHandler(item.shiftName, section.date)}>
      //   <Text style={styles.headerVal5}>View Staffs</Text>
      // </TouchableWithoutFeedback>
      //     </View>
      //   </View>
      // </Card>
    );
  };

  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title="Loading"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        />

        <SubHeader
          title="Manager Reports"
          showBack={true}
          backScreen="Home"
          navigation={this.props.navigation}
        />
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: '4%',
            marginLeft: '3%',
            marginRight: '2%',
          }}>
          <View style={{width: wp('35')}}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>From Date</Text>
            </View>
            <View style={styles.dateContainer}>
              <DatePicker
                showIcon={false}
                style={{width: wp('40')}}
                date={this.state.date1}
                mode="date"
                placeholder={moment(this.state.date1)
                  .format('DD/MM/YYYY')
                  .toString()}
                format="YYYY-MM-DD"
                minDate="2016-05-01"
                maxDate={moment().format('YYYY-MM-DD').toString()}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateInput: {
                    //marginLeft: 36
                    borderColor: 'white',
                    marginTop: 10,
                    marginRight: 36,
                    padding: 0,
                  },
                  dateText: {
                    color: '#959394',
                    textAlign: 'center',
                    fontFamily: 'Poppins-Regular',
                  },
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={date => {
                  this.setState({date1: date});
                }}
              />
            </View>
          </View>

          <View style={{width: wp('35'), marginLeft: wp('1')}}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>To Date</Text>
            </View>
            <View style={styles.dateContainer}>
              <DatePicker
                showIcon={false}
                style={{width: wp('40')}}
                date={this.state.date}
                mode="date"
                placeholder={moment(this.state.date)
                  .format('DD/MM/YYYY')
                  .toString()}
                format="YYYY-MM-DD"
                minDate="2016-05-01"
                maxDate={moment().format('YYYY-MM-DD').toString()}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateInput: {
                    //marginLeft: 36
                    borderColor: 'white',
                    marginTop: 10,
                    marginRight: 36,
                    padding: 0,
                  },
                  dateText: {
                    color: '#959394',
                    textAlign: 'center',
                    fontFamily: 'Poppins-Regular',
                  },
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={date => {
                  this.setState({date: date});
                }}
              />
            </View>
          </View>
          <View
            style={{
              width: wp('20'),
              marginTop: hp('3.5'),
              marginLeft: wp('2'),
            }}>
            <TouchableWithoutFeedback
              onPress={() =>
                this.getStaffReport(this.state.StaffNo, this.state.institute_id)
              }>
              <View style={styles.buttonContainer}>
                <Text style={styles.buttonText1}>Go</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        {this.state.report.length > 0 && (
          <SectionList
            sections={this.state.report.reverse()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this.renderItem}
            renderSectionHeader={({section}) => {
              //console.log('section', section);
              // if (this.state.pressed) {
              //   console.log('pressed', this.state.pressed);
              //   this.setState({sectionDate: section.date});
              // }
              return (
                <View
                  style={{
                    marginVertical: 15,
                    backgroundColor: Colors.maroon,
                    paddingVertical: wp('2%'),
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 14,
                      fontFamily: 'Poppins-SemiBold',
                      textAlign: 'center',
                    }}>
                    {' '}
                    {moment(section.accessDate).format('YYYY-MM-DD')}{' '}
                  </Text>
                </View>
              );
            }}
          />
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
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
    borderWidth: 1.5,
    borderColor: '#f1f1f1',
    height: hp('6.7'),
    borderRadius: 8,
    backgroundColor: '#ffffff',
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
  walletContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    width: wp('94'),
    alignSelf: 'center',
    paddingVertical: wp('3%'),
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
    paddingLeft: '4%',
    paddingTop: '1%',
    paddingBottom: '1%',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    margin: '2%',
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
  selectText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#67747d',
  },
  labelContainer: {
    margin: '1.5%',
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 1,
    height: hp('6'),
  },
  headerVal5: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#f05760',
  },
});
