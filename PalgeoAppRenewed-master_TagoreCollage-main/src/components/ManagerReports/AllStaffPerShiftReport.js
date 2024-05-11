import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
  Image,
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
import {ListItem, Avatar, Badge, Icon, Overlay} from 'react-native-elements';
import AwesomeAlert from 'react-native-awesome-alerts';

import axios from 'axios';
import Nodata from '../common/NoData';
import {Colors} from '../../utils/configs/Colors';
import {ActionSheet} from 'native-base';
var moment = require('moment');

const AllStaffPerShiftReport = ({navigation, route}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState(route.params.staffInfo);

  useEffect(() => {
    console.log('data', data);
    // getStaffReport()
    //getAllStaffsReport();
    setTimeout(() => setLoader(false), 1000);
  }, []);

  // const handlePress = (item) => {
  //   return
  // }

  const renderItem = ({item, index}) => {
    //console.log(item.expanded);
    return (
      <ListItem bottomDivider>
        <Avatar
          // containerStyle={{
          //   width: 50,
          //   height: 50,
          //   borderRadius: 50,
          //   borderWidth: 2,
          // }}
          avatarStyle={{
            width: '100%',
            height: '100%',
            //borderRadius: 50,
            resizeMode: 'stretch',
          }}
          rounded
          size={'medium'}
          source={{
            uri:
              item.staffPhoto ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtOqCkEk1bHWlechHBJVOMBkfxoe9vXRO9SH0aTfy8mhNfXVH0DPk0Iu7LEYGg4YlIeAE&usqp=CAU',
          }}
        />
        {/* <View style={{width: 50, height: 50, }}>
          <Image
            source={{
              uri:
                item.staffPhoto ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtOqCkEk1bHWlechHBJVOMBkfxoe9vXRO9SH0aTfy8mhNfXVH0DPk0Iu7LEYGg4YlIeAE&usqp=CAU',
            }}
            style={{
              width: '100%',
              height: '100%',
              //borderRadius: 50,
              resizeMode: 'contain',
            }}
          />
        </View> */}
        <ListItem.Content>
          <View style={styles.staffNameStyle}>
            <Text style={{textTransform: 'capitalize', marginRight: 5}}>
              {item.staffName}
            </Text>
            <Badge
              textStyle={{fontSize: 17}}
              value={item.status}
              badgeStyle={{
                minWidth: 25,
                minHeight: 25,
                borderRadius: 15,
                padding: 3,
              }}
              status={
                item.status === 'P'
                  ? 'success'
                  : item.status === 'A'
                  ? 'error'
                  : 'warning'
              }
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '40%',
              }}>
              <Icon
                size={20}
                name="arrow-up-right"
                type="feather"
                color="green"
              />
              <Text>{item.checkInTime || 'N/A'}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '40%',
              }}>
              <Icon
                size={20}
                name="arrow-down-left"
                type="feather"
                color="red"
              />
              <Text>
                {item.checkInTime
                  ? item.checkoutTime || moment().format('h:mm a')
                  : 'N/A'}
              </Text>
            </View>
          </View>
          {/* </ListItem.Title> */}
          <ListItem.Subtitle style={{textTransform: 'capitalize'}}>
            {item.designation}
          </ListItem.Subtitle>
        </ListItem.Content>
        <Icon
          name="dots-three-vertical"
          type="entypo"
          onPress={() => {
            const BUTTONS = ['Track Attendance', 'Track Location', 'Cancel'];
            const CANCEL_INDEX = 2;
            // console.log('item.ex', item.expanded);
            // data[index].expanded = !data[index].expanded;
            //setData([...data]);
            ActionSheet.show(
              {
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                title: 'Choose one option',
              },
              buttonIndex => {
                if (buttonIndex === 0) {
                  return navigation.navigate('StaffAttendance', {
                    StaffCode: item.staffCode,
                    ShiftName: item.shiftName,
                  });
                }
                if (buttonIndex === 1) {
                  navigation.navigate('StaffLocation', {
                    StaffCode: item.staffCode,
                    StaffName: item.staffName,
                    StaffPhoto: item.staffPhoto,
                    date: item.date,
                  });
                }
              },
            );
          }}
        />

        {/* <Overlay
          overlayStyle={styles.overlayStyle}
          isVisible={item.expanded}
          backdropStyle={{backgroundColor: Colors.overlay}}
          onBackdropPress={() => {
            data[index].expanded = !data[index].expanded;
            setData([...data]);
          }}>
          <TouchableOpacity
            onPress={() => {
              data[index].expanded = !data[index].expanded;
              setData([...data]);
              navigation.navigate('StaffAttendance', {
                StaffCode: item.staffCode,
              });
            }}
            style={{
              alignSelf: 'center',
              backgroundColor: Colors.header,
              padding: 10,
              borderRadius: 20,
              marginBottom: 20,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Poppins-Regular',
                fontSize: 20,
              }}>
              Track Attendance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              data[index].expanded = !data[index].expanded;
              setData([...data]);
              navigation.navigate('StaffLocation', {
                StaffCode: item.staffCode,
                StaffName: item.staffName,
                StaffPhoto: item.staffPhoto,
              });
            }}
            style={{
              alignSelf: 'center',
              backgroundColor: Colors.header,
              padding: 10,
              borderRadius: 20,
              marginBottom: 20,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Poppins-Regular',
                fontSize: 20,
              }}>
              Track Location
            </Text>
          </TouchableOpacity>
        </Overlay> */}
      </ListItem>
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
        title="My Team"
        showBack={true}
        backScreen="ManagerReports"
        navigation={navigation}
      />
      <Card style={{...styles.walletContainer, marginTop: 10}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Text style={styles.headerVal1}>{route.params.shiftName}</Text>
          <Text style={styles.headerVal1}>{route.params.date}</Text>
          <Text style={styles.headerVal1}>
            {`${route.params.present}/${route.params.total}`}
          </Text>
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

export default AllStaffPerShiftReport;

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
    backgroundColor: Colors.maroon,
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
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.white,
    //paddingLeft: '3%',
    textTransform: 'capitalize',
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
  staffNameStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',

    //justifyContent: 'space-between',
    //paddingVertical: 10,
  },
  overlayStyle: {
    width: '70%',
    minHeight: '30%',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
});
