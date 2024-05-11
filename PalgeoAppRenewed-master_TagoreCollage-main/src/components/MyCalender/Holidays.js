import moment from 'moment';
import { Card } from 'react-native-elements';
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../utils/configs/Colors';
import { TabView, SceneMap } from 'react-native-tab-view';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image } from 'react-native';
import { ScrollView } from 'react-native';
import Const from '../common/Constants';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Dimensions } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import CustomMap from '../common/CustomMap';
import { Overlay } from 'react-native-elements';
import Layout from '../common/Layout';
import {
  arrayWithoutDuplicates,
  groupByKey,
  showErrorMsg,
} from '../../utils/helperFunctions';
import { SafeAreaView } from 'react-native';
import SubHeader from '../common/SubHeader';
import CustomHCard from './CustomHCard';
import { CustomTabs } from '../common/CustomTabs';

export default class Holidays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SelectedDay: moment().format('YYYY-MM-DD'),
      Holidays: [],
      WeekOff: [],
      Shifts: [],
      HolidayLoader: true,
      WeekOffLoader: true,
      ShiftLoader: true,
      index: 0,
      ActiveTab: 'Holidays',

      routes: [
        { key: 'first', title: 'Holidays' },
        { key: 'second', title: 'Week-Off' },
        { key: 'third', title: 'Shift' },
      ],
      CurrentMonth: moment(new Date()).format('MM'),
    };
    this.renderScene = SceneMap({
      first: this.renderHolidays,
      second: this.renderWeekOff,
      third: this.renderShifts,
    });
  }
  componentDidMount() {
    this.retrieveData();
  }
  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('bearer_token');
      if (value !== null) {
        //alert(value);
        this.setState({ Token: value }, function () { });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('institute_id');
      if (value !== null) {
        this.setState({ institute_id: value }, function () { });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
    try {
      const value = await AsyncStorage.getItem('user_id');
      if (value !== null) {
        //alert(value);
        this.setState({ StaffCode: value }, () => {
          this.Holidays();
          // this.WeekOff();
          // this.Shifts();
        });
      }
    } catch (error) {
      alert('Error retrieving data');
    }
  };
  Holidays = async () => {
    const url =
      'http://182.71.102.212/palgeoapi/api/Master/GetStaffHolidayMondayDetails';
    console.log('url = ', url);
    let bodyData = {};
    bodyData = {
      StaffCode: this.state.StaffCode.toString(),
      InstituteId: parseInt(this.state.institute_id),
      Month:
        this.state.CurrentMonth == 1
          ? 'January'
          : this.state.CurrentMonth == 2
            ? 'February'
            : this.state.CurrentMonth == 3
              ? 'March'
              : this.state.CurrentMonth == 4
                ? 'April'
                : this.state.CurrentMonth == 5
                  ? 'May'
                  : this.state.CurrentMonth == 6
                    ? 'June'
                    : this.state.CurrentMonth == 7
                      ? 'July'
                      : this.state.CurrentMonth == 8
                        ? 'August'
                        : this.state.CurrentMonth == 9
                          ? 'September'
                          : this.state.CurrentMonth == 10
                            ? 'October'
                            : this.state.CurrentMonth == 11
                              ? 'November'
                              : this.state.CurrentMonth == 12
                                ? 'December'
                                : 'December',
      //Month: this.state.CurrentMonth.toString(),
    };
    console.log('bodyData = ', bodyData);
    try {
      const response = await axios.post(url, bodyData);
      let data = [];
      if (response?.data?.length > 0) {
        data = response.data.sort((e1, e2) => e1.holidayDate >= e2.holidayDate);
      }
      console.log('GetStaffHolidayMondayDetails response - ', data);
      this.setState({ Holidays: data, HolidayLoader: false }, () => {
        //alert(response.data);
      });
    } catch (e) {
      this.setState({ HolidayLoader: false }, () => {
        //alert(response.data);
        showErrorMsg(e);
      });
      //alert('GetStaffHolidayMondayDetails = ', e);
      //console.log('GetStaffHolidayMondayDetails = ', e);
    }
  };
  WeekOff = async () => {
    const url =
      'http://182.71.102.212/palgeoapi/api/Master/GetAllMandatoryHolidayMonthDetails';
    //const url = Const + 'api​/Master​/GetAllMandatoryHolidayMonthDetails';
    //console.log('url = ', url);
    let bodyData = {};
    bodyData = {
      StaffCode: this.state.StaffCode.toString(),
      InstituteId: parseInt(this.state.institute_id),
      Month:
        this.state.CurrentMonth == 1
          ? 'January'
          : this.state.CurrentMonth == 2
            ? 'February'
            : this.state.CurrentMonth == 3
              ? 'March'
              : this.state.CurrentMonth == 4
                ? 'April'
                : this.state.CurrentMonth == 5
                  ? 'May'
                  : this.state.CurrentMonth == 6
                    ? 'June'
                    : this.state.CurrentMonth == 7
                      ? 'July'
                      : this.state.CurrentMonth == 8
                        ? 'August'
                        : this.state.CurrentMonth == 9
                          ? 'September'
                          : this.state.CurrentMonth == 10
                            ? 'October'
                            : this.state.CurrentMonth == 11
                              ? 'November'
                              : this.state.CurrentMonth == 12
                                ? 'December'
                                : 'December',
      //Month: this.state.CurrentMonth.toString(),
    };
    //console.log('bodyData = ', bodyData);
    try {
      const response = await axios.post(url, bodyData);
      let data = [];
      if (response?.data?.length > 0) {
        data = response.data.sort((e1, e2) => e1.date >= e2.date);
      }
      console.log(
        'GetAllMandatoryHolidayMonthDetails response - ',
        data,
      );
      this.setState({ WeekOff: data, WeekOffLoader: false }, () => {
        // console.log(JSON.stringify(response.data, null, 4));
      });
    } catch (e) {
      this.setState({ WeekOffLoader: false }, () => {
        //alert(response.data);
        showErrorMsg(e);
      });
      //alert('GetAllMandatoryHolidayMonthDetails = ', e);
      // console.log('GetAllMandatoryHolidayMonthDetails = ', e);
    }
  };
  Shifts = async () => {
    const url =
      'http://182.71.102.212/palgeoapi/api/GeoFencing/shift/MonthDetails';
    //console.log('url = ', url);
    let bodyData = {};
    bodyData = {
      StaffCode: this.state.StaffCode.toString(),
      InstituteId: parseInt(this.state.institute_id),
      Month:
        this.state.CurrentMonth == 1
          ? 'January'
          : this.state.CurrentMonth == 2
            ? 'February'
            : this.state.CurrentMonth == 3
              ? 'March'
              : this.state.CurrentMonth == 4
                ? 'April'
                : this.state.CurrentMonth == 5
                  ? 'May'
                  : this.state.CurrentMonth == 6
                    ? 'June'
                    : this.state.CurrentMonth == 7
                      ? 'July'
                      : this.state.CurrentMonth == 8
                        ? 'August'
                        : this.state.CurrentMonth == 9
                          ? 'September'
                          : this.state.CurrentMonth == 10
                            ? 'October'
                            : this.state.CurrentMonth == 11
                              ? 'November'
                              : this.state.CurrentMonth == 12
                                ? 'December'
                                : 'December',
      //Month: this.state.CurrentMonth.toString(),
    };
    // console.log('bodyData = ', bodyData);
    try {
      const response = await axios.post(url, bodyData);
      let data = [];

      let uniques = [];
      if (response?.data?.length > 0) {
        data = response.data.sort((e1, e2) => e1.startDate >= e2.startDate);
        const newData = data.map(e => {
          return {
            date: e.startDate,
            data: data.filter(ee => ee.startDate === e.startDate),
          };
        });
        uniques = arrayWithoutDuplicates(newData, 'date');
      }

      this.setState({ Shifts: uniques, ShiftLoader: false }, () => {
        // console.log(JSON.stringify(uniques, null, 2));
      });
    } catch (e) {
      this.setState({ ShiftLoader: false }, () => {
        showErrorMsg(e);
        //alert(response.data);
      });

      console.log('MonthDetails = ', JSON.stringify(e));
    }
  };
  renderHolidays = () => {
    return (
      <ScrollView nestedScrollEnabled>
        <View style={{ width: '100%', minHeight: 200 }}>
          {!this.state.HolidayLoader ? (
            this.state.Holidays.length ? (
              this.state.Holidays.map((item, index) => {
                // alert(item.holidayDate)
                return (
                  <CustomHCard
                    key={index}
                    date={moment(item.holidayDate).format("DD-MM-YYYY")}
                    holidayName={item.description}
                    description={
                      item.isFullDay
                        ? 'Full Day'
                        : item.isEvening
                          ? 'Half Day : Evening'
                          : item.isMorning
                            ? 'Half Day : Morning'
                            : null
                    }
                  />
                  // <Card
                  //   key={index}
                  //   style={{
                  //     width: '90%',
                  //     justifyContent: 'space-between',
                  //     //alignItems: 'center',
                  //     alignSelf: 'center',
                  //     flexDirection: 'row',
                  //     padding: 10,

                  //   }}>

                  //   <View style={[styles.ListSubView, {width: '90%'}]}>
                  //     <Text style={styles.ListText}>
                  //       {' '}
                  //       {moment(item.holidayDate).format('DD')}
                  //       {' - '}
                  //       {item.isFullDay || item.isEvening || item.isMorning ? (
                  //         <Text
                  //           style={
                  //             ([styles.ListText], {textTransform: 'capitalize'})
                  //           }>
                  //           {item.description}
                  //           {' ('}
                  // {item.isFullDay
                  //   ? 'Full Day'
                  //   : item.isEvening
                  //   ? 'Half Day : Evening'
                  //   : item.isMorning
                  //   ? 'Half Day : Morning'
                  //   : null}
                  //           {' )'}
                  //         </Text>
                  //       ) : null}
                  //     </Text>
                  //     {/*<Text style={styles.ListText}>{item.description}</Text>*/}
                  //   </View>
                  // </Card>
                );
              })
            ) : (
              <Text style={[styles.ListText, { padding: 10 }]}>
                No Holiday Available
              </Text>
            )
          ) : (
            <View
              style={{
                justifyContent: 'space-evenly',
                alignSelf: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: 10,
              }}>
              <ActivityIndicator size="large" color={Colors.mainHeader} />
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                }}>
                Fetching Holidays Data...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };
  renderWeekOff = () => {
    return (
      <ScrollView nestedScrollEnabled>
        <View style={{ width: '100%', minHeight: 200 }}>
          {!this.state.WeekOffLoader ? (
            this.state.WeekOff.length ? (
              this.state.WeekOff.map((item, index) => {
                console.log(moment(item.date).format());
                return (
                  <CustomHCard
                    key={index}
                    date={item.date}
                    holidayName={item.description}
                    description={item.holidays}
                  />
                  // <View
                  //   key={index}
                  //   style={{
                  //     width: '100%',
                  //     justifyContent: 'space-between',
                  //     //alignItems: 'center',
                  //     flexDirection: 'row',
                  //     padding: 10,
                  //   }}>
                  //   <View style={[styles.ListSubView, {width: '10%'}]}>
                  //     <Text style={styles.ListText}>{index + 1}.</Text>
                  //   </View>
                  //   <View style={styles.ListSubView}>
                  //     <Text style={styles.ListText}>
                  //       {moment(item.date, 'DD-MM-YYYY').format('DD MMM')}
                  //     </Text>
                  //   </View>
                  //   <View style={styles.ListSubView}>
                  //     <Text style={styles.ListText}>{item.holidays}</Text>
                  //   </View>
                  // </View>
                );
              })
            ) : (
              <Text style={[styles.ListText, { padding: 10 }]}>
                No Week Off Available
              </Text>
            )
          ) : (
            <View
              style={{
                justifyContent: 'space-evenly',
                alignSelf: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: 10,
              }}>
              <ActivityIndicator size="large" color={Colors.mainHeader} />
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                }}>
                Fetching WeekOff Data...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  goToMap = item => {
    const { coordinates, radius } = item;
    const parsedCoo = JSON.parse(coordinates);
    const newCoo = parsedCoo.map(e => {
      return {
        latitude: e.Latitude,
        longitude: e.Longitude,
      };
    });
    console.log('neww', newCoo);

    if (parsedCoo.length > 1) {
      this.props.navigation.navigate('PolygonMapView', {
        coordinates: newCoo,
        back: true,
      });
      return;
    }
    // const newCoo = [
    //   {
    //     latitude: parsedCoo[0].Latitude,
    //     longitude: parsedCoo[0].Longitude,
    //   },
    // ];
    this.props.navigation.navigate('CircleMapView', {
      coordinates: newCoo,
      radius,
      back: true,
    });
  };

  renderShifts = () => {
    return (
      <ScrollView nestedScrollEnabled>
        <View style={{ width: '100%', flex: 1 }}>
          {!this.state.ShiftLoader ? (
            this.state.Shifts.length ? (
              this.state.Shifts.map((itemm, index) => {
                console.log('iiii', itemm);
                return (
                  <CustomHCard
                    key={index}
                    date={moment(itemm.date).format("DD-MM-YYYY")}
                    noShift={
                      itemm.data.length > 0 &&
                      itemm.data.map((item, i) => {
                        return (
                          <View key={i}>
                            <View
                              style={{
                                width: '100%',
                                justifyContent: 'space-between',
                                //alignItems: 'center',
                                flexDirection: 'row',
                                // padding: 10,
                              }}>
                              <View
                                style={[styles.ListSubView, { width: '90%' }]}>
                                <Text
                                  style={[styles.ListText, { color: 'black' }]}>
                                  {item.shiftName}
                                  {': ' +
                                    moment
                                      .utc(item.checkInTime, 'HH:mm')
                                      .local()
                                      .format('h:mm a') +
                                    ' - ' +
                                    moment
                                      .utc(item.checkOutTime, 'HH:mm')
                                      .local()
                                      .format('h:mm a')}
                                </Text>
                                <TouchableWithoutFeedback
                                  onPress={() => this.goToMap(item)}>
                                  <Text
                                    style={[
                                      styles.ListText,
                                      {
                                        color: Colors.button[0],
                                        textDecorationLine: 'underline',
                                      },
                                    ]}>
                                    {item.geoFencingName}
                                  </Text>
                                </TouchableWithoutFeedback>
                              </View>
                            </View>
                          </View>
                        );
                      })
                    }
                  />
                  // <Card key={index}>
                  //   <View
                  //     style={{
                  //       marginVertical: 15,
                  //       backgroundColor: Colors.button[0],
                  //       paddingVertical: widthPercentageToDP('2%'),
                  //     }}>
                  //     <Text
                  //       style={{
                  //         color: 'white',
                  //         fontSize: 14,
                  //         fontFamily: 'Poppins-SemiBold',
                  //         textAlign: 'center',
                  //       }}>
                  //       {' '}
                  //       {moment(itemm.date).format('DD MMM, YYYY')}{' '}
                  //     </Text>
                  //   </View>
                  //   {itemm.data.length > 0 &&
                  //     itemm.data.map((item, i) => {
                  //       return (
                  //         <View key={i}>
                  //           <View
                  //             style={{
                  //               width: '100%',
                  //               justifyContent: 'space-between',
                  //               //alignItems: 'center',
                  //               flexDirection: 'row',
                  //               padding: 10,
                  //             }}>
                  //             <View
                  //               style={[styles.ListSubView, {width: '10%'}]}>
                  //               <Text style={styles.ListText}>{i + 1}.</Text>
                  //             </View>
                  //             <View
                  //               style={[styles.ListSubView, {width: '90%'}]}>
                  //               <Text
                  //                 style={[styles.ListText, {color: 'black'}]}>
                  //                 {item.shiftName}
                  //                 {'( ' +
                  //                   moment
                  //                     .utc(item.checkInTime, 'HH:mm')
                  //                     .local()
                  //                     .format('HH:mm') +
                  //                   ' - ' +
                  //                   moment
                  //                     .utc(item.checkOutTime, 'HH:mm')
                  //                     .local()
                  //                     .format('HH:mm') +
                  //                   ' )'}
                  //               </Text>
                  //               <TouchableWithoutFeedback
                  //                 onPress={() => this.goToMap(item)}>
                  //                 <Text
                  //                   style={[
                  //                     styles.ListText,
                  //                     {
                  //                       color: Colors.button[0],
                  //                       textDecorationLine: 'underline',
                  //                     },
                  //                   ]}>
                  //                   {item.geoFencingName}
                  //                 </Text>
                  //               </TouchableWithoutFeedback>
                  //             </View>
                  //           </View>
                  //         </View>
                  //       );
                  //     })}
                  // </Card>
                );
              })
            ) : (
              <Text style={[styles.ListText, { padding: 10 }]}>
                No Shift Available
              </Text>
            )
          ) : (
            <View
              style={{
                justifyContent: 'space-evenly',
                alignSelf: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: 10,
              }}>
              <ActivityIndicator size="large" color={Colors.mainHeader} />
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                }}>
                Fetching Shifts Data...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };
  render() {
    return (
      <Layout
        nestedScrollEnabled
        headerTitle="My Calendar"
        normal
        scroll
        navigation={this.props.navigation}>
        <View>
          <Calendar
            theme={{
              arrowColor: Colors.mainHeader,
              monthTextColor: Colors.mainHeader,
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
            markingType={'multi-dot'}
            dayComponent={d => {
              const holidays = this.state.Holidays.map(e =>
                moment(e.holidayDate).format('D'),
              );
              const weekoffs = this.state.WeekOff.map(e =>
                moment(e.date, 'DD-MM-YYYY').format('D'),
              );

              //console.log('d== ', d);
              return (
                <TouchableOpacity
                  disabled={this.state.CurrentMonth != d.date.month}
                  onPress={() => {
                    this.setState({ SelectedDay: d.date.dateString });
                  }}
                  style={{
                    backgroundColor:
                      this.state.CurrentMonth == d.date.month &&
                        this.state.SelectedDay == d.date.dateString
                        ? Colors.calendarBg
                        : 'transparent',
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    padding: 5,
                    // alignItems: 'center',
                    // justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      alignSelf: 'center',
                      fontFamily: 'Poppins-Regular',
                      fontWeight: 'bold',
                      //color: 'black',
                      color:
                        this.state.CurrentMonth == d.date.month
                          ? this.state.SelectedDay == d.date.dateString
                            ? 'white'
                            : Colors.button[0]
                          : 'silver',
                    }}>
                    {d.date.day}
                  </Text>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {holidays.includes(JSON.stringify(d.date.day)) &&
                      parseInt(this.state.CurrentMonth) ==
                      parseInt(d.date.month) && (
                        <Image
                          source={require('../../assets/ic_privacy.png')}
                          style={{
                            width: 15,
                            height: 15,
                            resizeMode: 'contain',
                            marginHorizontal: 5,
                            tintColor: '#4000ff',
                          }}
                        />
                      )}
                    {weekoffs.includes(JSON.stringify(d.date.day)) &&
                      parseInt(this.state.CurrentMonth) ==
                      parseInt(d.date.month) && (
                        <Image
                          source={require('../../assets/ic_privacy.png')}
                          style={{
                            width: 15,
                            height: 15,
                            resizeMode: 'contain',
                            //marginHorizontal: 5,
                            tintColor: 'green',
                          }}
                        />
                      )}
                  </View>
                </TouchableOpacity>
              );
            }}
            onDayPress={day => {
              //console.log('selected day', day);
              //console.log('selected day', day.dateString);
              this.setState({ SelectedDay: day.dateString });
            }}
            onMonthChange={month => {
              //console.log('month changed', month);
              this.setState(
                {
                  CurrentMonth: month.month,
                  HolidayLoader: true,
                  WeekOffLoader: true,
                  ShiftLoader: true,
                },
                () => {
                  this.Holidays();
                  this.WeekOff();
                  this.Shifts();
                },
              );
            }}
          />
          <View
            style={{
              width: '100%',
              height: 70,
              justifyContent: 'center',
              backgroundColor: Colors.header,
            }}>
            {/*<LinearGradient colors={Colors.mainHeader}>*/}
            <CustomTabs
              borderRadius={20}
              height={50}
              width={'100%'}
              textSize={15}
              color={Colors.calendarBg}
              textColor="black"
              //backgroundColor={SubThemeColor}
              backgroundColor={'transparent'}
              ActiveTab={this.state.ActiveTab}
              tab1Width={'30%'}
              tab2Width={'30%'}
              tab3Width={'30%'}
              tab1="Holidays"
              tab2="Week Off"
              tab3="Shift"
              onPress={value => {
                this.setState({ ActiveTab: value }, function () {
                  if (this.state.ActiveTab == 'Holidays') {
                    this.Holidays();
                    console.log('Selected tab = ', value);
                    return;
                  }
                  if (this.state.ActiveTab == 'Week Off') {
                    this.WeekOff();
                    console.log('Selected tab = ', value);
                    return;
                  }
                  if (this.state.ActiveTab == 'Shift') {
                    this.Shifts();
                    console.log('Selected tab = ', value);
                    return;
                  }
                  //this.getRequestArray();
                });
              }}
            />
          </View>
          {this.state.ActiveTab === 'Holidays' && this.renderHolidays()}
          {this.state.ActiveTab === 'Week Off' && this.renderWeekOff()}
          {this.state.ActiveTab === 'Shift' && this.renderShifts()}
          {/* <View
            style={{
              width: '100%',
              flex: 1,
              minHeight: Dimensions.get('window').height,
              //marginBottom: 100,
            }}>
            <TabView
              sceneContainerStyle={
                {
                  // flex: 1,
                  // backgroundColor: 'white',
                  //marginBottom: 100,
                }
              }
              navigationState={{
                index: this.state.index,
                routes: this.state.routes,
              }}
              renderScene={this.renderScene}
              onIndexChange={index => {
                if (index == 2) {
                  this.Shifts();
                }
                if (index == 1) {
                  this.WeekOff();
                }
              }}
              initialLayout={{width: Dimensions.get('window').width}}
            />
          </View> */}
        </View>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  ListSubView: { width: '45%' },
  ListText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
});
