import React, {Component} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomLabel from './CustomLabel';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Icon} from 'react-native-elements';
//import CalendarStrip from 'react-native-calendar-strip';
// let datesWhitelist = [
//   {
//     start: moment(),
//     end: moment().add(2000000, 'days'), // total 4 days enabled
//   },
// ];
// let datesBlacklist = [moment().add(1, 'days')]; // 1 day disabled
export const CustomCalendar = props => {
  var myFutureDate = new Date(props.FromDate);
  var availableLeaves = props.AvailableLeaves;
  if (props.AvailableLeaves === 0) {
    availableLeaves = 100;
  }
  // if (props.AvailableLeaves !== 0) {
  myFutureDate.setDate(myFutureDate.getDate() + parseInt(availableLeaves - 1));
  //}
  //console.log('date identifier = ', myFutureDate);
  return (
    // <View style={{width: '100%', alignItems: 'center'}}>
    //   <CalendarStrip
    //     scrollable
    //     scrollerPaging
    //     onDateSelected={(value) => {
    //       onPress(value);
    //     }}
    //     selectedDate={selectedDate}
    //     calendarAnimation={{type: 'sequence', duration: 30}}
    //     daySelectionselectedDateAnimation={{
    //       type: 'background',
    //       duration: 200,
    //       highlightColor: themeColor,
    //     }}
    //     style={{
    //       height: 100,
    //       width: '95%',
    //       alignSelf: 'center',
    //       paddingTop: 10,
    //       paddingBottom: 10,
    //       borderRadius: 5,
    //       elevation: 3,
    //       shadowColor: color,
    //       shadowOpacity: 0.4,
    //       shadowOffset: {width: 0, height: 0},
    //     }}
    //     calendarHeaderStyle={{color: themeColor}}
    //     calendarColor={'white'}
    //     dateNumberStyle={{color: 'black'}}
    //     dateNameStyle={{color: 'black'}}
    //     highlightDateNumberStyle={{color: themeColor}}
    //     highlightDateNameStyle={{color: themeColor}}
    //     disabledDateNameStyle={{color: 'black'}}
    //     disabledDateNumberStyle={{color: 'black'}}
    //     datesWhitelist={datesWhitelist}
    //     //datesBlacklist={datesBlacklist}
    //     iconContainer={{flex: 0.1}}
    //   />
    // </View>
    <View>
      {props.title && <CustomLabel title={props.title} />}
      <TouchableOpacity onPress={props.onPress}>
        <View style={[styles.dateContainer, props.style]}>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Icon size={16} name="calendar" color={'black'} type={'entypo'} />
            <Text style={[styles.text, props.textStyle, {marginLeft: 10}]}>
              {moment(props.date).format('YYYY-MM-DD')}
            </Text>
          </View>
          <DateTimePickerModal
            {...props}
            minimumDate={props.FromDate}
            maximumDate={myFutureDate}
            isVisible={props.isVisible}
            mode={props.mode || 'date'}
            onConfirm={date => props.onConfirm(date)}
            onCancel={props.onCancel}
            date={props.date || new Date()}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    //height: hp('6.7'),
    borderRadius: 8,
    borderWidth: 0.5,
    backgroundColor: 'white',
    padding: 10,
    marginTop: 10,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#959394',
    //textAlign: 'center',
  },
  arrow: {
    backgroundColor: 'white',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
  },
  thumbnail: {
    borderRadius: 10,
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  monthView: {
    padding: 5,
    borderRadius: 10,
    //height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
