import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Container, VStack, Toast, Card, CardItem, Body, Row} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Loader from '../common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Const from '../common/Constants';
import SubHeader from '../common/SubHeader';

import AwesomeAlert from 'react-native-awesome-alerts';

import axios from 'axios';
import Nodata from '../common/NoData';
var moment = require('moment');

const StaffActivities = ({navigation, route}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    // getStaffReport()
    getActivities();
    setTimeout(() => setLoader(false), 1000);
  }, []);

  const getActivities = async () => {
    setShowAlert(true);
    const arr = route.params.date.split('-');
    const sub = moment(route.params.date)
      .subtract(24, 'hours')
      .format('YYYY-MM-DD');
    console.log(sub, route.params.date);
    // arr[arr.length - 1] = eval(arr[arr.length - 1] - 1).toString();
    // console.log('dd', arr.join('-'));
    try {
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      const response = await axios.post(
        Const + 'api/Staff/StaffCummulativeActivities',
        {
          FromDate: sub,
          ToDate: sub,
          InstituteId: Number(institute_id),
          //InstituteId: 18073,
          StaffCodes: [route.params.StaffCode],
        },
        {
          headers: {
            Authorization: 'Bearer ' + bearer_token,
          },
        },
      );

      if (response.data.staffReport.length !== 0) {
        setData(response.data.staffReport[0].dateWiseActivities[0].activities);
        const captureDate = moment(
          response.data.staffReport[0].dateWiseActivities[0].captureDate,
        ).format('YYYY-MM-DD');
        setDate(captureDate);
        setShowAlert(false);
      } else {
        setShowAlert(false);
        alert('No activity found');
      }
    } catch (error) {
      console.log(error);
      setShowAlert(false);
    }
  };

  const renderItem = ({item, index}) => {
    return (
      <Card style={styles.walletContainer}>
        <View style={styles.row}>
          <View style={{width: wp('40'), justifyContent: 'center'}}>
            <Text style={styles.header}>Sno</Text>
          </View>
          <View style={{width: wp('60')}}>
            <Text style={styles.headerVal}>{index + 1}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{width: wp('40'), justifyContent: 'center'}}>
            <Text style={styles.header}>Activity</Text>
          </View>
          <View style={{width: wp('60')}}>
            <Text style={styles.headerVal}>{item.activity}</Text>
          </View>
        </View>
        {item.geoLocatioName !== '' && (
          <View style={styles.row}>
            <View style={{width: wp('40'), justifyContent: 'center'}}>
              <Text style={styles.header}>Location</Text>
            </View>
            <View style={{width: wp('60')}}>
              <Text style={styles.headerVal}>{item.geoLocatioName}</Text>
            </View>
          </View>
        )}
        <View style={styles.row}>
          <View style={{width: wp('40'), justifyContent: 'center'}}>
            <Text style={styles.header}>Captured Time</Text>
          </View>
          <View style={{width: wp('60')}}>
            <Text style={styles.headerVal}>
              {moment
                .utc(item.capturedTime, 'YYYY-MM-DD HH:mm:ss')
                .local()
                .format('h:mm A')}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

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
        title="Staff Movement Report"
        showBack={true}
        backScreen="StaffReports"
        navigation={navigation}
      />
      <Card style={{...styles.walletContainer, marginTop: 10}}>
        <View style={styles.row}>
          <View style={{width: wp('50')}}>
            <Text style={styles.headerVal1}>
              Staff Code: {route.params.StaffCode}
            </Text>
          </View>
          <View style={{width: wp('50')}}>
            <Text style={styles.headerVal1}>Date: {route.params.date}</Text>
          </View>
        </View>
      </Card>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={data}
        renderItem={renderItem}
      />
    </View>
  );
};

export default StaffActivities;

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
    // paddingTop: '3%',
    // paddingLeft: '4%',
    // paddingRight: '4%',
    // paddingBottom: '3%',
  },
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,

    color: '#f05760',
    margin: '1%',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
    margin: '1%',
  },
  headerVal5: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#f05760',
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
