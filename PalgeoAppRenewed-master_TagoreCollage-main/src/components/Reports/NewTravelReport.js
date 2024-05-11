import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import {Toast, Card, Select, Box} from 'native-base';
import React, {Component} from 'react';
import {Text, View, StyleSheet, Image} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import {Calendar} from 'react-native-calendars';
import Timeline from 'react-native-timeline-flatlist';
import {Colors} from '../../utils/configs/Colors';
import Loader from '../common/Loader';
import Const from '../../components/common/Constants';
import CustomLabel from '../common/CustomLabel';
import {Avatar, Badge, Icon} from 'react-native-elements';
import MapView, {Marker, Polyline} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {GOOGLE_MAPS_APIKEY} from '../../utils/configs/Constants';
import haversine from 'haversine';
import {Dimensions} from 'react-native';
import CustomSelect from '../common/CustomSelect';
import {Modalize} from 'react-native-modalize';
import PrimaryCard from '../common/PrimaryCard';
import {CustomButton} from '../common/CustomButton';
import CustomModal from '../common/CustomModal';
import {getUserInfo} from '../../utils/helperFunctions';
import AnimatedLoader from '../common/AnimatedLoader';
import SuccessError from '../common/SuccessError';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableOpacity} from 'react-native';
const LAT_DELTA = 0.01;
const LONG_DELTA = 0.01;
const COORDINATES = {
  latitude: 19.0339284,
  longitude: 72.9502294,
};
const {width, height} = Dimensions.get('window');
export class TravelReport extends Component {
  mapView = null;
  state = {
    report: [],
    date: moment().format('YYYY-MM-DD'),
    //loader: true,
    StaffNo: '',
    institute_id: '',
    bearer_token: '',
    showAlert: false,
    items: {},
    activeTab: 'Travel Check-in',
    origin: null,
    destination: null,
    inn: [],
    locations: [],
    message: null,
    distance: '0',
    photo: '',
    tripsArray: [],
    pickerTrips: [],
    currentTrip: [],
    currentIndex: 0,
    currentTripPicker: 'Trip 1',
    CurrentMonth: moment(new Date()).format('MM'),
    marker: {},
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({loader: false});
    }, 400);
    //this.retreiveData();
    this.retreiveDataNew();
  }

  retreiveDataNew = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const profile_pic = await AsyncStorage.getItem('profile_pic');
      const userInfo = await getUserInfo(user_id, institute_id);
      this.setState(
        {
          StaffNo: user_id,
          institute_id,
          bearer_token,
          photo: profile_pic,
          name: userInfo.name,
        },
        () => {
          this.getStaffReportNew(user_id, institute_id, bearer_token);
          this.getAppointments(user_id, institute_id, bearer_token);
          //this.getTasks(user_id, institute_id, bearer_token);
        },
      );
    } catch (e) {
      this.setState({
        showAlert1: true,
        error: true,
        error_message: 'Error retreiving data. Please try again.',
      });
      //alert('Error retreiving data. Please try again.');
    }
  };

  getActivities = json => {
    const report = json.staffReport;
    const dateWiseReport = report.filter(e => e.dateWiseActivities);
    const find = dateWiseReport.find((e, i) => i === 0);
    const dateWise = find.dateWiseActivities;
    const currentDateReport = dateWise.find(
      e =>
        moment(e.captureDate).format('YYYY-MM-DD') ===
        moment(this.state.date).format('YYYY-MM-DD'),
    );
    //this.setState({distance: currentDateReport.distance});
    const activities = currentDateReport?.activities;
    return activities;
  };

  getAllIndexes = (arr, val) => {
    var indexes = [],
      i;
    for (i = 0; i < arr.length; i++)
      if (arr[i].travelCheckInType === val) indexes.push(i);
    return indexes;
  };

  getStaffReportNew = async (user_id, institute_id, bearer_token) => {
    const from_date = moment(this.state.date).format('YYYY-MM-DD');
    const to_date = from_date;
    this.setState({showAlert: true, error: false});
    const url = `${Const}api/Staff/StaffCummulativeTravelCheckInActivities`;
    const body = {
      FromDate: from_date,
      ToDate: to_date,
      InstituteId: institute_id,
      StaffCodes: [user_id],
      IsTravelReport: true,
      IsMobileApp: true,
    };
    const headers = {
      headers: {
        Authorization: 'Bearer ' + bearer_token,
      },
    };
    try {
      const response = await axios.post(url, body, headers);
      const json = response.data;

      if (json?.staffReport?.length > 0) {
        const activities = this.getActivities(json);
        console.log('json', activities);
        if (activities.length > 0) {
          const tripsIndexes = this.getAllIndexes(activities, 4);
          //console.log('tripsIndexes', tripsIndexes);
          let tripsArray = [];
          let j = 0;
          //console.log('j', j);
          for (let i = 0; i < tripsIndexes.length; i++) {
            let u = tripsIndexes[i] + 1;
            const trip = activities.slice(j, u);
            tripsArray.push(trip);
            j = tripsIndexes[i] + 1;
          }
          const pickerTrips = tripsArray.map((e, i) => `Trip ${i + 1}`);
          //console.log('tripsArray', tripsArray);
          this.setState({
            tripsArray,
            pickerTrips,
            currentTrip: tripsArray[this.state.currentIndex],
          });
          const locations = tripsArray[this.state.currentIndex].filter(
            each => each.coordinates,
          );
          console.log('locations', locations);
          if (locations?.length > 0) {
            const origin = locations[0];
            const destination = locations[locations.length - 1];
            const slicedArray = locations.slice(1, -1);
            const inn = slicedArray.map(e =>
              e.coordinates ? e.coordinates : COORDINATES,
            );
            this.setState({locations, origin, destination, inn});
          }
          const reverse = tripsArray[this.state.currentIndex].reverse();
          //console.log('reverse', reverse);
          this.setState({report: reverse || []});
        }
        this.setState({showAlert: false});
      } else {
        Toast.show({
          render: () => {
            return (
              <Box bg="emerald.500" px="2" py="1" rounded="sm" mb={5}>
                'No trips found'
              </Box>
            );
          },
        });
        this.setState({report: [], showAlert: false});
      }
    } catch (error) {
      this.setState({showAlert: false});
    }
  };

  getTasks = async (user_id, institute_id, bearer_token) => {
    const url = `${Const}api/Staff/StaffTasks`;
    const body = {
      staffCode: user_id,
      InstituteId: Number(institute_id),
      Date: this.state.date,
    };
    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: 'Bearer ' + bearer_token,
        },
      });
      const {data} = response;
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
      const obj = this.groupByKey(tasks, 'startDateTime');
      console.log('tasksobject ==', obj);
      this.setState({items: {...this.state.items, ...obj}}, () =>
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

  calc = (prevLatLng, newLatLng) => {
    return haversine(prevLatLng, newLatLng) || 0;
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
              title={moment(this.state.date).format('ddd')}
              color={'white'}
            />
            <CustomLabel
              title={moment(this.state.date).format('D')}
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
    const {origin, destination} = this.state;

    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <>
        <AnimatedLoader
          isVisible={this.state.showAlert}
          doNotShowDeleteIcon
          //source={require('../../assets/lottie/location.json')}
          // message={'LOADING...'}
        />

        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({showAlert1: false})}
          subTitle={this.state.error_message}
        />
        {/* <Agenda
          items={this.state.items}
          loadItemsForMonth={() => {}}
          selected={this.state.date}
          onDayPress={day =>
            this.setState(
              {
                date: day.dateString,
                origin: null,
                destination: null,
                inn: [],
                locations: [],
                distance: '0',
              },
              () => {
                this.getStaffReportNew(
                  this.state.StaffNo,
                  this.state.institute_id,
                  this.state.bearer_token,
                );
                this.getTasks(
                  this.state.user_id,
                  this.state.institute_id,
                  this.state.bearer_token,
                );
                console.log('day', day);
                // this.getTotalWorkingDays(
                //   this.state.user_id,
                //   this.state.institute_id,
                //   this.state.bearer_token,
                //   day.dateString,
                // );
              },
            )
          }
          renderItem={this.renderItem}
          renderEmptyDate={this.renderEmptyDate}
          renderEmptyData={this.renderEmptyDate}
          rowHasChanged={this.rowHasChanged}
          showClosingKnob={true}
          futureScrollRange={100}
          style={{maxHeight: 300}}
          displayLoadingIndicator={false}
          theme={{
            agendaKnobColor: Colors.header,
            agendaDayNumColor: Colors.maroon,
            agendaTodayColor: Colors.header,
            selectedDayBackgroundColor: Colors.header,
            selectedDayTextColor: Colors.white,
            dotColor: Colors.maroon,
            todayTextColor: Colors.maroon,
          }}
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
            // const holidays = this.state.Holidays.map(e =>
            //   moment(e.holidayDate).format('D'),
            // );
            // const weekoffs = this.state.WeekOff.map(e =>
            //   moment(e.date, 'DD-MM-YYYY').format('D'),
            // );

            //console.log('d== ', d);
            return (
              <TouchableOpacity
                disabled={this.state.CurrentMonth != d.date.month}
                onPress={() => {
                  this.setState(
                    {
                      date: d.date.dateString,
                      currentIndex: 0,
                      currentTripPicker: 'Trip 1',
                    },
                    () => this.retreiveDataNew(),
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
          // onDayPress={day => {
          //   //console.log('selected day', day);
          //   //console.log('selected day', day.dateString);
          //   this.setState(
          //     {
          //       date: day.dateString,
          //       currentIndex: 0,
          //       currentTripPicker: 'Trip 1',
          //     },
          //     () => this.retreiveDataNew(),
          //   );
          // }}
          onDayLongPress={day => {
            this.actionSheet.open();
          }}
          onMonthChange={month => {
            //console.log('month changed', month);
            this.setState({
              CurrentMonth: month.month,
            });
          }}
        />
        {origin && destination && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '95%',
              alignSelf: 'center',
            }}>
            <CustomButton
              title={'Map View'}
              color={Colors.calendarBg}
              onPress={() =>
                this.props.navigation.navigate('StaffLocation', {
                  StaffCode: this.state.StaffNo,
                  StaffName: this.state.name,
                  StaffPhoto: this.state.photo,
                  date: this.state.date,
                })
              }
            />
            {this.state.pickerTrips?.length > 1 && (
              <LinearGradient
                colors={Colors.mainHeader}
                style={{
                  maxHeight: 60,
                  width: 100,
                  borderRadius: 7,
                  //paddingHorizontal: 3,
                  // marginBottom: 10,
                  alignSelf: 'flex-end',
                }}>
                <Select
                  style={{
                    borderWidth: 0,
                    padding: 0,
                    //minWidth: 120,
                    //textAlign: 'center',
                    color: 'white',
                    //alignItems: 'center',
                  }}
                  selectedValue={this.state.currentTripPicker}
                  onValueChange={(value, i) => {
                    console.log('val', value);
                    this.setState(
                      {
                        currentTripPicker: value,
                        currentIndex: this.state.pickerTrips.indexOf(value),
                      },
                      () => this.retreiveDataNew(),
                      // this.getStaffReportNew(
                      //   this.state.institute_id,
                      //   this.state.bearer_token,
                      // ),
                    );
                  }}>
                  {this.state.pickerTrips.map((e, i) => (
                    <Select.Item label={e} key={i} value={e} />
                  ))}
                </Select>
              </LinearGradient>
            )}
          </View>
        )}

        {this.state.marker !== {} && (
          <Modalize
            modalStyle={{backgroundColor: '#23C4D7'}}
            handlePosition={'inside'}
            snapPoint={500}
            HeaderComponent={
              <View
                style={{
                  width: '80%',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: 10,
                }}>
                <CustomLabel title={'Appointments'} />
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
            circleColor={Colors.header}
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
            innerCircle={'dot'}
            lineColor={Colors.header}
            options={{
              nestedScrollEnabled: true,
            }}
          />
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    //marginTop: 30,
  },
});

export default TravelReport;
