import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Attendance from '../../assets/wheel.svg';
import CustomLabel from './CustomLabel';
import ProgressCircle from 'react-native-progress-circle';
import LinearGradient from 'react-native-linear-gradient';

import { Icon } from 'react-native-elements';

import CustomCard from './CustomCard';
import { Select } from 'native-base';
import { Colors } from '../../utils/configs/Colors';

const AttendanceChart = ({
  data,
  width,
  selectedValue,
  onValueChange,
  options,
  present,
  absent,
  late,
  early,
  total = 100,
}) => {
  const percent = type => {
    const percentage = (type / total) * 100;
    //console.log(Number(percentage.toFixed(1)));
    return Number(percentage.toFixed(1));
  };
  return (
    <CustomCard>
      <View
        style={{
          width: '100%',
          borderRadius: 8,
        }}>
        <Attendance
          style={{
            position: 'absolute',
            top: -17,
            left: -22,
            alignSelf: 'center',
          }}
        />
        <View
          style={{
            width: '100%',

            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          {/* <CustomLabel title={'Attendance Wheel'} /> */}
          <ProgressCircle
            percent={percent(present)}
            radius={50}
            borderWidth={8}
            color="#108B1D"
            shadowColor="#CCCCCC"
            bgColor="#fff">
            <ProgressCircle
              percent={percent(absent)}
              radius={40}
              borderWidth={8}
              color="#E40E4F"
              shadowColor="#CCCCCC"
              bgColor="#fff">
              <ProgressCircle
                percent={percent(late)}
                radius={30}
                borderWidth={8}
                color="#F09707"
                shadowColor="#CCCCCC"
                bgColor="#fff">
                <ProgressCircle
                  percent={percent(early)}
                  radius={20}
                  borderWidth={8}
                  color="#9B57F1"
                  shadowColor="#CCCCCC"
                  bgColor="#fff"></ProgressCircle>
              </ProgressCircle>
            </ProgressCircle>
          </ProgressCircle>
          <View style={{ width: '65%' }}>
            <View
              style={{
                maxHeight: 40,
                //width: '40%',
                borderRadius: 7,
                backgroundColor: Colors.mainHeader[0],
                //paddingHorizontal: 3,
                // marginBottom: 10,
                // alignSelf: 'flex-end',
              }}>
              <Select
                minWidth="120"
                style={{
                  borderWidth: 0,
                  padding: 0,
                  //minWidth: 120,
                  textAlign: 'center',
                  color: 'white',
                  //alignItems: 'center',
                }}
                //color="white"
                selectedValue={selectedValue}
                onValueChange={onValueChange}>
                {options.map((op, i) => {
                  return <Select.Item label={op} value={op} key={i} />;
                })}
              </Select>
            </View>
            <CustomLabel title={`Total: ${total}`} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                //backgroundColor: 'yellow',
                width: '100%',
              }}>
              <View>
                <PercentComp
                  title={'Present'}
                  percent={present}
                  color={'#108B1D'}
                />
                <PercentComp
                  title={'Absent'}
                  percent={absent}
                  color={'#E40E4F'}
                />
              </View>
              <View style={{ width: '50%' }}>
                <PercentComp
                  title={'Late IN'}
                  percent={late}
                  color={'#F09707'}
                />
                <PercentComp
                  title={'Early OUT'}
                  percent={early}
                  color={'#9B57F1'}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </CustomCard>
  );
};

const PercentComp = props => {
  return (
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
          justifyContent: 'space-between',
          //width: '70%',

          marginRight: 13,
        }}>
        <Text>{props.title}:</Text>
        {/* <Text>:</Text> */}
      </View>
      <Icon name="primitive-dot" type="octicon" color={props.color} />
      <Text style={{ marginLeft: 5 }}>{props.percent}</Text>
    </View>
  );
};

export default AttendanceChart;

const styles = StyleSheet.create({});
