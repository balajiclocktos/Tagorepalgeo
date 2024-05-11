import React from 'react';
import { TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../utils/configs/Colors';
import AttendanceChart from '../../common/AttendanceChart';
import CalendarStrip from '../../common/CalendarStrip';
import CustomLabel from '../../common/CustomLabel';
import { TABS } from '../constants';
const TimeSheetScreen = props => {
  console.log("props==", props)
  return (
    <View>
      <CalendarStrip
        //style={{marginTop: 10}}
        calendarColor={'#F5F5F5'}
        onDateSelected={props.onDateSelected}
      />
      {props.options.length > 0 && (
        <View
          style={{
            alignSelf: 'center',
            //marginBottom: 120,
            //marginTop: 150,
          }}>
          <AttendanceChart
            selectedValue={props.selectedValue}
            onValueChange={props.onValueChange}
            options={props.options}
            present={props.present}
            absent={props.absent}
            total={props.total}
            late={props.late}
            early={props.early}
          />
        </View>
      )}
      {!props.loader && (
        <FlatList
          horizontal
          data={TABS}
          showsHorizontalScrollIndicator={false}
          renderItem={props.renderItemHorizontal}
          extraData={props.extraData}
          keyExtractor={props.keyExtractorHorizontal}
          contentContainerStyle={{
            marginLeft: 10,
            borderBottomWidth: 1,
            borderBottomColor: Colors.overlay,
            paddingBottom: 10,
            marginBottom: 10,
          }}
        //ListFooterComponent={<View style={{width: 105}}></View>}
        />
      )}
      {props.currentIndex !== 6 && props.currentIndex !== 7 && (
        <View
          style={{
            maxHeight: props.height,
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              //width: '90%',
              marginLeft: 10,
              maxHeight: props.height,
              overflow: 'hidden',
              alignItems: 'center',
              //zIndex: 1,
              // backgroundColor: 'yellow',
            }}>
            {props.getFilters}
          </View>

          {props.currentIndex !== 0 &&
            props.currentIndex !== 1 &&
            props.currentIndex !== 2 &&
            props.currentIndex !== 3 &&
            props.currentIndex !== 5 &&
            props.currentIndex !== 12 &&
            props.currentIndex !== 4 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  //backgroundColor: 'red',
                }}>
                <TouchableOpacity
                  style={{ alignSelf: 'flex-end', alignItems: 'center' }}
                  onPress={props.decrease}>
                  <CustomLabel
                    labelStyle={{ color: Colors.button[0] }}
                    margin={0}
                    title="... Less"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignSelf: 'flex-end', alignItems: 'center' }}
                  onPress={props.increase}>
                  <CustomLabel
                    labelStyle={{ color: Colors.button[0] }}
                    margin={0}
                    title="... More"
                  />
                </TouchableOpacity>
              </View>
            )}
        </View>
      )}
      {props.data.length > 0 && (
        <FlatList
          nestedScrollEnabled
          data={props.data}
          keyExtractor={props.keyExtractor}
          renderItem={props.renderItem}
          contentContainerStyle={{ marginTop: 10 }}
        />
      )}
    </View>
  );
};

export default TimeSheetScreen;

const styles = StyleSheet.create({});
