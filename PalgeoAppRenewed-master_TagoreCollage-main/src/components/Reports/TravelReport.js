import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import {Toast, Card} from 'native-base';
import React, {Component} from 'react';
import {Text, View, StyleSheet, Image, Platform} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import {Agenda} from 'react-native-calendars';
import Timeline from 'react-native-timeline-flatlist';
import {Colors} from '../../utils/configs/Colors';
import Loader from '../common/Loader';
import Const from '../../components/common/Constants';
import CustomLabel from '../common/CustomLabel';
import {Avatar, Badge} from 'react-native-elements';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  GOOGLE_MAPS_APIKEY,
  GOOGLE_MAPS_APIKEY_IOS,
} from '../../utils/configs/Constants';
const LAT_DELTA = 0.01;
const LONG_DELTA = 0.01;
const COORDINATES = {
  latitude: 19.0339284,
  longitude: 72.9502294,
};
export class TravelReport extends Component {
  state = {
    report: [],
    date: new Date(),
    loader: true,
    StaffNo: '',
    institute_id: '',
    bearer_token: '',
    showAlert: false,
    items: {},
    activeTab: 'Travel Check-in',
    origin: null,
    destination: null,
    locations: [],
    message: null,
    distance: '0',
    photo: '',
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({loader: false});
    }, 400);
    this.retreiveData();
  }

  retreiveData = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const profile_pic = await AsyncStorage.getItem('profile_pic');

      this.setState(
        {StaffNo: user_id, institute_id, bearer_token, photo: profile_pic},
        () => {
          this.getStaffReport(user_id, institute_id, bearer_token);
          this.getAppointments(user_id, institute_id, bearer_token);
          this.getTasks(user_id, institute_id, bearer_token);
        },
      );
    } catch (e) {
      alert('Error retreiving data. Please try again.');
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
      const obj = this.groupByKey(modified, 'startDateTime');
      console.log('obj', obj);
      this.setState({items: {...this.state.items, ...obj}});
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
      .then(response => response.json())
      .then(json => {
        if (json?.staffReport?.length > 0) {
          const report = json.staffReport;
          const dateWiseReport = report.filter(e => e.dateWiseActivities);
          //console.log('dateWiseReport', dateWiseReport);
          const find = dateWiseReport.find((e, i) => i === 0);
          //console.log('find', find);
          const dateWise = find.dateWiseActivities;
          //console.log('dateWise', dateWise);

          const currentDateReport = dateWise.find(
            e =>
              moment(e.captureDate).format('YYYY-MM-DD') ===
              moment(this.state.date).format('YYYY-MM-DD'),
          );
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
            text: 'No entry exit report found',
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

  renderItem(item) {
    return (
      <Card style={{padding: 10, marginTop: 10}}>
        <CustomLabel title={item.title} />

        <Text>
          {moment(item.startTime).format('h:mm a')} to{' '}
          {moment(item.endTime).format('h:mm a')}
        </Text>
        {Platform.OS === 'android' ? (
          <Badge
            value={item.status}
            textStyle={{fontFamily: 'Poppins-Regular'}}
            badgeStyle={{
              paddingVertical: 10,
              backgroundColor: Colors.header,
            }}
            containerStyle={{marginVertical: 5, alignSelf: 'flex-end'}}
          />
        ) : (
          <CustomLabel
            title={item.status}
            labelStyle={{color: Colors.white}}
            containerStyle={{
              paddingVertical: 10,
              backgroundColor: Colors.header,
              alignSelf: 'flex-end',
              borderRadius: 10,
              paddingHorizontal: 5,
            }}
          />
        )}
      </Card>
    );
  }

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
    const {origin, destination, locations, photo, inn} = this.state;
    //console.log('report', this.state.report);
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title={this.state.message || 'Loading'}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        />
        <Agenda
          items={this.state.items}
          loadItemsForMonth={() => {}}
          selected={this.state.date}
          onDayPress={day =>
            this.setState(
              {
                date: day.dateString,
                // origin: null,
                // destination: null,
                // inn: [],
                // locations: [],
                // distance: '0',
              },
              () => {
                this.getStaffReport(this.state.StaffNo);
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
        />
        {this.state.activeTab === 'Travel Check-in' && origin && destination && (
          <View style={styles.map}>
            <MapView
              style={{width: '100%', height: '100%'}}
              //mapType={'satellite'}
              provider="google"
              ref={c => (this.mapView = c)}
              loadingEnabled
              followUserLocation={true}
              //cacheEnabled={true}
              initialRegion={{
                latitude: parseFloat(
                  destination?.coordinates?.latitude || COORDINATES.latitude,
                ),
                longitude: parseFloat(
                  destination?.coordinates?.longitude || COORDINATES.longitude,
                ),
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LONG_DELTA,
              }}
              zoomEnabled={true}>
              {locations.length > 0 && (
                <>
                  <Marker
                    key={origin.capturedTime}
                    coordinate={destination.coordinates}
                    opacity={0.7}
                    //description={'Origin'}
                    title={moment(destination.capturedTime)
                      .local()
                      .format('h:mm a')}>
                    <Image
                      source={{
                        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_8jXWxkA50-ColElavoSs1x8pLcz5m9fj2A&usqp=CAU',
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 60,
                        //backgroundColor: 'transparent',
                        resizeMode: 'contain',
                        //tintColor: 'green',
                      }}
                    />
                  </Marker>
                  <Marker
                    key={destination.capturedTime}
                    coordinate={origin.coordinates}
                    //opacity={0.7}
                    description={'Destination'}
                    title={moment(origin.capturedTime)
                      .local()
                      .format('h:mm a')}>
                    <>
                      <Avatar
                        rounded
                        size="medium"
                        avatarStyle={{
                          width: '100%',
                          height: '100%',
                          //borderRadius: 50,
                          resizeMode: 'stretch',
                        }}
                        // containerStyle={{
                        //   position: 'absolute',
                        //   top: 0,
                        //   right: 0,
                        //   zIndex: 1,
                        // }}
                        source={{
                          uri:
                            photo ||
                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtOqCkEk1bHWlechHBJVOMBkfxoe9vXRO9SH0aTfy8mhNfXVH0DPk0Iu7LEYGg4YlIeAE&usqp=CAU',
                        }}
                      />
                    </>
                  </Marker>
                </>
              )}

              {locations.length > 0 && (
                <MapViewDirections
                  //optimizeWaypoints
                  onStart={
                    params => {}
                    // this.setState({
                    //   showAlert: true,
                    //   message: `Fetching distance between initial and latest/last location...`,
                    // })
                  }
                  onReady={result => {
                    this.setState({
                      showAlert: false,
                      distance: result.distance,
                    });
                    console.log(`Distance: ${result.distance} km`);
                    console.log(`Duration: ${result.duration} min.`);
                  }}
                  onError={err => alert('Error fetching path: ' + err)}
                  origin={origin.coordinates}
                  waypoints={inn}
                  splitWaypoints={true}
                  destination={destination.coordinates}
                  apikey={
                    Platform.OS === 'ios'
                      ? GOOGLE_MAPS_APIKEY_IOS
                      : GOOGLE_MAPS_APIKEY
                  }
                  strokeWidth={8}
                  strokeColor="red"
                />
              )}
            </MapView>
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1,
                borderWidth: 2,
                borderColor: Colors.header,
                padding: 5,
              }}>
              <Text>{Number(this.state.distance).toFixed(2) || '0'} km</Text>
            </View>
          </View>
        )}
        {this.state.report.length > 0 && (
          <Timeline
            data={this.state.report.map(rr => {
              return {
                time: moment(rr.capturedTime).format('h:mm a'),
                title: rr.activity || 'Location',
                description: rr.geoLocatioName || rr.activity,
              };
            })}
            style={{padding: 10}}
            circleColor={Colors.header}
            timeStyle={{
              color: Colors.header,
              fontFamily: 'Poppins-Regular',
            }}
            timeContainerStyle={{minWidth: 60}}
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
    height: 200,
    width: '100%',
    alignSelf: 'center',
    //marginTop: 30,
  },
});

export default TravelReport;
