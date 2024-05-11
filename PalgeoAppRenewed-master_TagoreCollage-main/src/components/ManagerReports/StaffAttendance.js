import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Container, DatePicker, Toast, Card, Row} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Loader from '../common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubHeader from '../common/SubHeader';
import AwesomeAlert from 'react-native-awesome-alerts';
import {Calendar} from 'react-native-calendars';
import axios from 'axios';
var moment = require('moment');

const StaffAttendance = props => {
  const [showAlert, setShowAlert] = useState(false);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [marker, setMarker] = useState({});
  const [pressed, setPressed] = useState(false);

  var current = new Date().getMonth();
  console.log('current', current);
  //var p = current.setDate(current.getDate() - 7);
  useEffect(() => {
    getStaffReport(null, null, false);
    setTimeout(() => setLoader(false), 1000);
  }, []);

  const getStaffReport = async (month, year, press) => {
    setShowAlert(true);
    let currentMonth = month ? month - 1 : new Date().getMonth();
    let currentYear = year ? year : new Date().getFullYear();

    // get the number of days for this month
    const daysInMonth = moment(
      `${currentYear}-${currentMonth + 1}`,
      'YY-MM',
    ).daysInMonth();
    console.log('days', daysInMonth);

    try {
      console.log('ssss', props.route.params.StaffCode);
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const user_id = await AsyncStorage.getItem('user_id');
      const response = await axios.post(
        `http://182.71.102.212/palgeoapi/api/Attendance/GetCumulativeAttendanceReportForManager`,
        {
          Instituteid: Number(institute_id),
          //Instituteid: Number('18073'),
          fromdate: moment(new Date(currentYear, currentMonth, 1)).format(
            'YYYY-MM-DD',
          ),
          todate: press
            ? moment(new Date(currentYear, currentMonth, daysInMonth)).format(
                'YYYY-MM-DD',
              )
            : moment(new Date()).format('YYYY-MM-DD'),
          ManagerStaffCode: user_id,
          //ManagerStaffCode: 'WFCH0163',
          StaffCode: props.route.params.StaffCode,
        },
        {
          headers: {
            Authorization: 'Bearer ' + bearer_token,
          },
        },
      );
      //console.log('json', response.data);
      if (response.data.length === 0) {
        setData([]);
        setShowAlert(false);
        return;
      }
      const shiftName = props.route.params.ShiftName;
      console.log('shiftName', shiftName);
      const currentShift = response.data.find(
        shift =>
          //shift.shiftName === shiftName &&
          shift.staffCode === props.route.params.StaffCode,
      );
      console.log(currentShift);
      setData(
        currentShift.checkAndOutTimeList.map(item => {
          return {
            date: moment(item.actualDate).format('YYYY-MM-DD'),
            status: item.status,
          };
        }),
      );

      const marked = currentShift.checkAndOutTimeList.map(item => {
        return {
          date: moment(item.actualDate).format('YYYY-MM-DD'),
          status: item.status,
        };
      });

      const obj = Object.fromEntries(
        marked.map(item => [
          item.date,
          {
            selected: true,
            marked: true,
            //status: item.status,
            selectedColor:
              item.status == 'A'
                ? 'red'
                : item.status == 'P'
                ? 'green'
                : item.status == 'H'
                ? 'orange'
                : item.status == 'WO'
                ? 'grey'
                : 'white',
          },
        ]),
      );
      setMarker(obj);
      setShowAlert(false);
      //console.log('json', obj);
    } catch (error) {
      console.log(error);
      setShowAlert(false);
    }
  };

  //console.log('json2', data);
  if (loader) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <AwesomeAlert
        show={showAlert}
        showProgress={true}
        title="Loading"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
      />

      <SubHeader
        title="Monthly Report"
        showBack={true}
        backScreen="StaffReports"
        navigation={props.navigation}
      />
      {/* {data.length > 0 ? ( */}
      <Calendar
        style={styles.calendar}
        hideExtraDays
        minDate={'2018-03-01'}
        markedDates={marker}
        onMonthChange={month => {
          console.log('month changed', month);
          if (month.month === current + 1) {
            setPressed(false);
            getStaffReport(month.month, month.year, false);
            return;
          } else {
            setPressed(true);
            getStaffReport(month.month, month.year, true);
          }
        }}
      />
      <Card style={styles.walletContainer}>
        <View style={styles.row}>
          <View style={{width: wp('50'), justifyContent: 'center'}}>
            <Text style={styles.header}>Color</Text>
          </View>
          <View style={{width: wp('50')}}>
            <Text style={styles.header}>Acronym</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{width: wp('50'), justifyContent: 'center'}}>
            <Text style={styles.headerVal}>Red</Text>
          </View>
          <View style={{width: wp('50')}}>
            <Text style={styles.headerVal}>Absent(A)</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{width: wp('50'), justifyContent: 'center'}}>
            <Text style={styles.headerVal}>Green</Text>
          </View>
          <View style={{width: wp('50')}}>
            <Text style={styles.headerVal}>Present(P)</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{width: wp('50'), justifyContent: 'center'}}>
            <Text style={styles.headerVal}>Grey</Text>
          </View>
          <View style={{width: wp('50')}}>
            <Text style={styles.headerVal}>Week Off(WO)</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{width: wp('50'), justifyContent: 'center'}}>
            <Text style={styles.headerVal}>Orange</Text>
          </View>
          <View style={{width: wp('50')}}>
            <Text style={styles.headerVal}>General Holiday(H)</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

export default StaffAttendance;

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
    fontFamily: 'Poppins-Bold',
    fontSize: 20,

    color: '#f05760',
    margin: '1%',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
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
});
