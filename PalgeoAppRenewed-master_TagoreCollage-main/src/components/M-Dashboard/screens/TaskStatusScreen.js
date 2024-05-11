import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import TaskWheel from '../components/TaskWheel';
import CalendarStrip from '../../common/CalendarStrip';
import {FlatList} from 'react-native';

const TaskStatusScreen = props => {
  return (
    <View>
      <CalendarStrip
        //style={{marginTop: 10}}
        calendarColor={'#F5F5F5'}
        onDateSelected={props.onDateSelected}
      />
      {!props.loader && (
        <>
          <View style={{alignSelf: 'center'}}>
            <TaskWheel
              total={props.total}
              pending={props.pending}
              completed={props.completed}
            />
          </View>
          <View style={{margin: 10}}>
            <FlatList
              horizontal
              data={['Total', 'Completed', 'Pending']}
              showsHorizontalScrollIndicator={false}
              renderItem={props.renderItemHorizontal}
              extraData={props.extraData}
              keyExtractor={props.keyExtractorHorizontal}
              //ListFooterComponent={<View style={{width: 105}}></View>}
            />
          </View>
          {props.taskData?.length > 0 && (
            <FlatList
              data={props.taskData}
              keyExtractor={props.keyExtractor}
              renderItem={props.renderItem}
              nestedScrollEnabled
            />
          )}
        </>
      )}
    </View>
  );
};

export default TaskStatusScreen;

const styles = StyleSheet.create({});
