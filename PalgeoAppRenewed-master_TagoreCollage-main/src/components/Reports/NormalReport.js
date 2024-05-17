import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import {Toast, Card, Box} from 'native-base';
import React, {Component} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import {Calendar} from 'react-native-calendars';
import Timeline from 'react-native-timeline-flatlist';
import {Colors} from '../../utils/configs/Colors';
import Loader from '../common/Loader';
import Const from '../../components/common/Constants';
import CustomLabel from '../common/CustomLabel';
import {Badge, Icon} from 'react-native-elements';
import {Modalize} from 'react-native-modalize';
import SearchBar from 'react-native-elements/dist/searchbar/SearchBar-ios';
import {CustomButton} from '../common/CustomButton';
import PrimaryCard from '../common/PrimaryCard';
import AnimatedLoader from '../common/AnimatedLoader';

export class NormalReport extends Component {
  state = {
    report: [],
    date: moment().format('YYYY-MM-DD'),
    //loader: true,
    StaffNo: '',
    institute_id: '',
    bearer_token: '',
    showAlert: false,
    items: [],
    activeTab: 'Normal Check-in',
    CurrentMonth: moment(new Date()).format('MM'),
    marker: {},
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({loader: false});
    }, 700);
    this.retreiveData();
  }

  retreiveData = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');

      this.setState({StaffNo: user_id, institute_id, bearer_token}, () => {
        this.getStaffReport(user_id, institute_id, bearer_token);
        // this.getAppointments(user_id, institute_id, bearer_token);
        this.getTasks(user_id, institute_id, bearer_token);
      });
    } catch (e) {
      alert('Error retreiving data. Please try again.');
    }
  };

  getTasks = async (user_id, institute_id, bearer_token, long) => {
    const url = `${Const}api/Staff/StaffTasks`;
    const body = {
      staffCode: user_id,
      InstituteId: Number(institute_id),
      Date: long ? this.state.taskDate : this.state.date,
    };
    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: 'Bearer ' + bearer_token,
        },
      });
      console.log('taskssssssssssss', response);
      const {data} = response;
      console.log('payload', body);
      console.log('tasks', data);
      if (data.length === 0) return;
      const tasks = data.map(task => {
        return {
          title: task.task,
          startTime: task.start_Time,
          endTime: task.end_Date,
          startDateTime: moment(task.task_Date).format('YYYY-MM-DD'),
          status: task.isCompleted ? 'Completed' : 'Not Completed',
        };
      });
      const obj = Object.fromEntries(
        tasks.map(item => [
          moment(item.startTime).format('YYYY-MM-DD'),
          {
            selected: true,
            marked: true,
            //status: item.status,
            selectedColor: '#23C4D7',
            //   item.status == 'A'
            //     ? 'red'
            //     : item.status == 'P'
            //     ? 'green'
            //     : item.status == 'H'
            //     ? 'orange'
            //     : item.status == 'WO'
            //     ? 'grey'
            //     : 'white',
          },
        ]),
      );
      //const obj = this.groupByKey(tasks, 'startDateTime');
      console.log('tasksobject ==', obj);
      this.setState({items: [...tasks], marker: obj}, () =>
        console.log(this.state.items),
      );
    } catch (e) {
      alert('Error retreiving current tasks: ' + e);
    }
  };

  getAppointments = async (user_id, institute_id, bearer_token) => {
    const instituteId = institute_id;
    const StaffCode = user_id;
    const calendarView = 'month';
    const url = `${Const}api/GeoFencing/travelcheckin/Details/${instituteId}/${StaffCode}/${calendarView}`;

    try {
      const response = await axios.get(url);
      const marked = response.data;
      const modified = marked.map(each => {
        return {
          title: each.title,
          startTime: each.startDateTime,
          endTime: each.endDateTime,
          startDateTime: moment(each.startDateTime).format('YYYY-MM-DD'),
          status: each.status || 'Not Completed',
        };
      });
      //console.log('marked', modified);
      // const obj = this.groupByKey(modified, 'startDateTime');
      const obj = Object.fromEntries(
        modified.map(item => [
          item.startDateTime,
          {
            selected: true,
            marked: true,
            //status: item.status,
            selectedColor: '#23C4D7',
            //   item.status == 'A'
            //     ? 'red'
            //     : item.status == 'P'
            //     ? 'green'
            //     : item.status == 'H'
            //     ? 'orange'
            //     : item.status == 'WO'
            //     ? 'grey'
            //     : 'white',
          },
        ]),
      );
      console.log('obj', obj);
      this.setState({items: [...modified], marker: obj});
    } catch (e) {
      console.log('err', e);
    }
  };
  // getTravelReport = async (user_id, institute_id, bearer_token) => {
  //   const url = `${Const}api/Staff/StaffCummulativeTravelCheckInActivities`;
  //   try {
  //     const response = await axios.post();
  //   } catch (e) {}
  // };

  groupByKey = (array, key) => {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) return hash;
      return Object.assign(hash, {
        [obj[key]]: (hash[obj[key]] || []).concat(obj),
      });
    }, {});
  };

  getStaffReport = async user_id => {
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    const institute_id = await AsyncStorage.getItem('institute_id');
    console.log('date', this.state.date);
    const sub = moment(this.state.date)
      .subtract(24, 'hours')
      .format('YYYY-MM-DD');
    var from_date =
      this.state.activeTab === 'Normal Check-in'
        ? sub
        : moment(this.state.date).format('YYYY-MM-DD');
    var to_date =
      this.state.activeTab === 'Normal Check-in'
        ? sub
        : moment(this.state.date).format('YYYY-MM-DD');
    //console.log('from and to ==', from_date, to_date);
    this.setState({showAlert: true});
    //var url = `${Const}api/Staff/GetStaffEntryExitReport/${user_id}/${from_date}/${to_date}`;
    var url =
      this.state.activeTab === 'Normal Check-in'
        ? `${Const}api/Staff/StaffCummulativeActivities`
        : `${Const}api/Staff/StaffCummulativeTravelCheckInActivities`;
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        FromDate: from_date,
        ToDate: to_date,
        InstituteId: institute_id,
        StaffCodes: [user_id],
        IsTravelReport: true,
        IsMobileApp: true,
      }),
      headers: {
        Authorization: 'Bearer ' + bearer_token,
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
      },
    })
      .then(response => {
        console.log('Response status:', response);
        return response.json();
      })
      .then(json => {
        console.log('normalcheckin reportssss', json);
        console.log(
          'Request Body:',
          JSON.stringify({
            FromDate: from_date,
            ToDate: to_date,
            InstituteId: institute_id,
            StaffCodes: [user_id],
            IsTravelReport: true,
            IsMobileApp: true,
          }),
        );
        console.log('normalcheckin reportssss', json.staffReport);
        if (json?.staffReport?.length >= 1) {
          const report = json.staffReport;
          const dateWiseReport = report.filter(e => e.dateWiseActivities);
          //console.log('dateWiseReport', dateWiseReport);
          const find = dateWiseReport.find((e, i) => i === 0);
          //console.log('find', find);
          const dateWise = find.dateWiseActivities;
          console.log(
            'dateWise',
            dateWise,
            moment(this.state.date).format('YYYY-MM-DD'),
          );

          const currentDateReport = dateWise.find(
            e =>
              moment(e.captureDate).format('YYYY-MM-DD') ===
              moment(this.state.date).format('YYYY-MM-DD'),
          );
          console.log('currentdateReport', currentDateReport);
          const activities = currentDateReport?.activities;
          const reverse = activities?.reverse();
          console.log('activities', activities);
          if (this.state.activeTab === 'Travel Check-in') {
            const locations = activities.filter(each => each.coordinates);
            if (locations?.length > 0) {
              const origin = locations[0];
              const destination = locations[locations.length - 1];
              const slicedArray = locations.slice(1, -1);
              const inn = slicedArray.map(e =>
                e.coordinates ? e.coordinates : COORDINATES,
              );
              this.setState({locations, origin, destination, inn});
            }
          }

          //console.log('currentDateReport', activities);

          this.setState({report: reverse || [], showAlert: false});
        } else {
          Toast.show({
            render: () => {
              return (
                <Box bg="emerald.500" px="2" py="1" rounded="sm" mb={5}>
                  'No records found'
                </Box>
              );
            },
          });
          this.setState({report: [], showAlert: false});
        }
      })
      .catch(error => {
        this.setState({showAlert: false});
        console.error(error);
      });
  };

  loadItems = day => {
    console.log('day', day);
  };

  renderItem = ({item}) => {
    //console.log(item);
    return (
      <PrimaryCard width={'85'} backgroundColor="#E8E7FD">
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: '#23C4D7',
              width: 42,
              height: 50,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <CustomLabel
              title={moment(this.state.taskDate).format('ddd')}
              color={'white'}
            />
            <CustomLabel
              title={moment(this.state.taskDate).format('D')}
              color={'white'}
            />
          </View>
          <View style={{marginLeft: 10}}>
            <CustomLabel title={item.title} />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon
                name={'clock'}
                type={'evilicon'}
                color={Colors.button[0]}
                size={25}
              />
              <CustomLabel
                margin={0}
                family="Poppins-Regular"
                title={`${moment(item.startTime).format('h:mm a')} to ${moment(
                  item.endTime,
                ).format('h:mm a')}`}
              />
            </View>
            <CustomLabel
              color={'white'}
              containerStyle={{
                backgroundColor: item.isCompleted ? '#23A428' : '#F15761',
                borderRadius: 20,
                minWidth: 60,
                width: 100,
                alignItems: 'center',
                // alignSelf: 'flex-end',
                padding: 5,
              }}
              title={item.isCompleted ? 'Completed' : 'Pending'}
            />
          </View>
        </View>
      </PrimaryCard>
    );
  };

  renderEmptyDate() {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <Text>No appointment.</Text>
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  render() {
    //console.log('report', this.state.report);
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <>
        {/* <AnimatedLoader
          isVisible={this.state.showAlert}
          source={require('../../assets/lottie/location.json')}
        /> */}
        <Calendar
          theme={{
            arrowColor: Colors.mainHeader[0],
            monthTextColor: Colors.mainHeader[0],
            textMonthFontFamily: 'Poppins-Regular',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 20,
            'stylesheet.calendar.header': {
              week: {
                marginTop: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
              },
            },
          }}
          //markingType={'multi-dot'}
          markedDates={this.state.marker}
          dayComponent={d => {
            return (
              <TouchableOpacity
                disabled={this.state.CurrentMonth != d.date.month}
                onPress={() => {
                  console.log('ffd', d.date.dateString);
                  this.setState({date: d.date.dateString}, () =>
                    this.retreiveData(),
                  );
                }}
                style={{
                  backgroundColor:
                    this.state.CurrentMonth == d.date.month &&
                    this.state.date == d.date.dateString
                      ? Colors.button[0]
                      : 'transparent',
                  width: 40,
                  height: 40,
                  borderRadius: 50,
                  padding: 5,
                  // alignItems: 'center',
                  // justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    alignSelf: 'center',
                    fontFamily: 'Poppins-Regular',
                    //fontWeight: 'bold',
                    //color: 'black',
                    color:
                      this.state.CurrentMonth == d.date.month
                        ? this.state.date == d.date.dateString
                          ? 'white'
                          : Colors.button[0]
                        : 'silver',
                  }}>
                  {d.date.day}
                </Text>
              </TouchableOpacity>
            );
          }}
          // dayComponent={d => {
          //   // const holidays = this.state.Holidays.map(e =>
          //   //   moment(e.holidayDate).format('D'),
          //   // );
          //   // const weekoffs = this.state.WeekOff.map(e =>
          //   //   moment(e.date, 'DD-MM-YYYY').format('D'),
          //   // );

          //   //console.log('d== ', d);
          //   return (
          //     <TouchableOpacity
          //       disabled={this.state.CurrentMonth != d.date.month}
          //       onPress={() => {
          //         this.setState({date: d.date.dateString});
          //       }}
          //       style={{
          //         backgroundColor:
          //           this.state.CurrentMonth == d.date.month &&
          //           this.state.date == d.date.dateString
          //             ? '#f05760'
          //             : 'transparent',
          //         width: 50,
          //         height: 50,
          //         borderRadius: 50,
          //         padding: 5,
          //         // alignItems: 'center',
          //         // justifyContent: 'center',
          //       }}>
          //       <Text
          //         style={{
          //           fontSize: 20,
          //           alignSelf: 'center',
          //           fontFamily: 'Poppins-Regular',
          //           fontWeight: 'bold',
          //           //color: 'black',
          //           color:
          //             this.state.CurrentMonth == d.date.month
          //               ? this.state.date == d.date.dateString
          //                 ? 'white'
          //                 : '#f05760'
          //               : 'silver',
          //         }}>
          //         {d.date.day}
          //       </Text>
          //       <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          //         {/* {holidays.includes(JSON.stringify(d.date.day)) &&
          //           parseInt(this.state.CurrentMonth) ==
          //             parseInt(d.date.month) && (
          //             <Image
          //               source={require('../../assets/ic_privacy.png')}
          //               style={{
          //                 width: 15,
          //                 height: 15,
          //                 resizeMode: 'contain',
          //                 marginHorizontal: 5,
          //                 tintColor: '#4000ff',
          //               }}
          //             />
          //           )}
          //         {weekoffs.includes(JSON.stringify(d.date.day)) &&
          //           parseInt(this.state.CurrentMonth) ==
          //             parseInt(d.date.month) && (
          //             <Image
          //               source={require('../../assets/ic_privacy.png')}
          //               style={{
          //                 width: 15,
          //                 height: 15,
          //                 resizeMode: 'contain',
          //                 //marginHorizontal: 5,
          //                 tintColor: 'green',
          //               }}
          //             />
          //           )} */}
          //       </View>
          //     </TouchableOpacity>
          //   );
          // }}
          // onDayPress={day => {
          //   //console.log('selected day', day);
          //   //console.log('selected day', day.dateString);
          //   this.setState({date: day.dateString}, () => this.retreiveData());
          // }}
          onDayLongPress={day => {
            this.setState({taskDate: day.dateString}, () => {
              this.getTasks(
                this.state.StaffNo,
                this.state.institute_id,
                this.state.bearer_token,
                true,
              ).then(() => {
                this.actionSheet.open();
              });
            });
          }}
          onMonthChange={month => {
            //console.log('month changed', month);
            this.setState({
              CurrentMonth: month.month,
            });
          }}
        />
        {this.state.marker !== {} && (
          <Modalize
            modalStyle={{backgroundColor: '#23C4D7'}}
            handlePosition={'inside'}
            snapPoint={500}
            //adjustToContentHeight
            //alwaysOpen={200}
            HeaderComponent={
              <View
                style={{
                  width: '80%',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: 10,
                }}>
                <CustomLabel title={'Tasks'} />
              </View>
            }
            flatListProps={{
              data: this.state.items,
              renderItem: this.renderItem,
              keyExtractor: (item, i) => i + '',
              showsVerticalScrollIndicator: false,

              contentContainerStyle: {alignItems: 'center'},
            }}
            ref={ref => (this.actionSheet = ref)}
          />
        )}
        {this.state.report.length > 0 && (
          <Timeline
            data={this.state.report
              .filter(e => e.activity !== null && e.geoLocatioName !== null)
              .map((rr, index) => {
                return {
                  time: moment(rr.capturedTime).format('h:mm:ss a'),
                  title: rr.activity || 'Location',
                  description: rr.geoLocatioName || rr.activity,
                  titleStyle: {
                    color:
                      index % 2 === 0
                        ? '#5A189A'
                        : index % 3 === 0
                        ? '#FAA307'
                        : '#4361EE',
                  },
                  lineColor:
                    index % 2 === 0
                      ? '#5A189A'
                      : index % 3 === 0
                      ? '#FAA307'
                      : '#4361EE',
                };
              })}
            style={{padding: 10}}
            //circleColor={'#4361EE'}
            renderCircle={(row, index) => {
              return (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    borderWidth: 1,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: '#4361EE',
                    position: 'absolute',
                    left: 105,
                  }}>
                  <CustomLabel
                    title={row.title.charAt(0)}
                    size={15}
                    color="white"
                    containerStyle={{
                      backgroundColor:
                        index % 2 === 0
                          ? '#5A189A'
                          : index % 3 === 0
                          ? '#FAA307'
                          : '#4361EE',
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </View>
              );
            }}
            timeStyle={{
              textAlign: 'center',
              backgroundColor: Colors.button[0],
              color: 'white',
              padding: 5,
              borderRadius: 13,
              //color: Colors.header,
              fontFamily: 'Poppins-Regular',
            }}
            timeContainerStyle={{minWidth: 100}}
            // innerCircle={'dot'}
            lineColor={'#4361EE'}
            options={{
              nestedScrollEnabled: true,
            }}
          />
        )}
      </>
    );
  }
}

export default NormalReport;
