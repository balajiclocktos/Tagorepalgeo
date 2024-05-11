import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import {Colors} from '../../utils/configs/Colors';
import moment from 'moment';
const CalenderStrip = props => {
  return (
    <View style={{flex: 1, ...props.style}}>
      <CalendarStrip
        scrollable
        calendarAnimation={{type: 'sequence', duration: 30}}
        daySelectionAnimation={{
          type: 'background',
          duration: 300,
          //highlightColor: Colors.header,
        }}
        style={{
          height: 100,

          paddingVertical: 10,
        }}
        calendarHeaderStyle={{
          color: props.headerColor || 'black',
          fontSize: 14,
        }}
        calendarColor={props.calendarColor || 'transparent'}
        dateNumberStyle={{
          color: props.headerColor || 'black',
          fontSize: 16,
        }}
        iconLeft={require('../../assets/left.png')}
        dateNameStyle={{
          color: props.headerColor || 'black',
          opacity: 0.7,
          fontSize: 12,
        }}
        //maxDayComponentSize={100}
        dayComponentHeight={50}
        iconContainer={{flex: 0.1}}
        highlightDateNameStyle={{color: 'white'}}
        highlightDateNumberStyle={{color: 'white'}}
        highlightDateContainerStyle={{
          backgroundColor: Colors.calendarBg,
          borderRadius: 10,
        }}
        iconRight={require('../../assets/right.png')}
        selectedDate={moment()}
        //minDate={moment().subtract(3, 'days')}
        //maxDate={moment()}
        onDateSelected={props.onDateSelected}
        //useIsoWeekday={false}
      />
    </View>
  );
};

export default CalenderStrip;

const styles = StyleSheet.create({});
