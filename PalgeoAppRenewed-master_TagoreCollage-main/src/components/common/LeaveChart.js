import {Picker} from '@react-native-picker/picker';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Attendance from '../../assets/wheel.svg';
import CustomLabel from './CustomLabel';
import ProgressCircle from 'react-native-progress-circle';
import LinearGradient from 'react-native-linear-gradient';

import {Icon} from 'react-native-elements';

import CustomCard from './CustomCard';
import {Select} from 'native-base';
import {Colors} from '../../utils/configs/Colors';

const LeaveChart = ({
  data,
  width,
  selectedValue,
  onValueChange,
  options,
  totalLeaves,
  fullyAvailed,
  notAvailed,
  partiallyAvailed,
}) => {
  const percent = type => {
    const percentage = (type / totalLeaves) * 100;
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
            percent={percent(totalLeaves)}
            radius={50}
            borderWidth={8}
            color="#108B1D"
            shadowColor="#CCCCCC"
            bgColor="#fff">
            <ProgressCircle
              percent={percent(fullyAvailed)}
              radius={40}
              borderWidth={7}
              color="#E40E4F"
              shadowColor="#CCCCCC"
              bgColor="#fff">
              <ProgressCircle
                percent={percent(partiallyAvailed)}
                radius={30}
                borderWidth={6}
                color="#F09707"
                shadowColor="#CCCCCC"
                bgColor="#fff">
                <ProgressCircle
                  percent={percent(notAvailed)}
                  radius={20}
                  borderWidth={5}
                  color="#9B57F1"
                  shadowColor="#CCCCCC"
                  bgColor="#fff"></ProgressCircle>
              </ProgressCircle>
            </ProgressCircle>
          </ProgressCircle>
          <View style={{width: '65%'}}>
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
                  return <Select.Item label={op.name} value={i} key={i} />;
                })}
              </Select>
            </View>
            <CustomLabel title={`Total: ${totalLeaves}`} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                //backgroundColor: 'yellow',
                width: '100%',
              }}>
              <View style={{width: '40%'}}>
                <LeaveComp
                  title={'Total'}
                  percent={totalLeaves}
                  color={'#108B1D'}
                  width={'80%'}
                />
                <LeaveComp
                  title={'Availed'}
                  percent={fullyAvailed}
                  color={'#E40E4F'}
                  width={'80%'}
                />
              </View>
              <View style={{width: '50%'}}>
                <LeaveComp
                  title={'Partially Availed'}
                  percent={partiallyAvailed}
                  color={'#F09707'}
                  width={'80%'}
                />
                <LeaveComp
                  title={'Not Availed'}
                  percent={notAvailed}
                  color={'#9B57F1'}
                  width={'80%'}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </CustomCard>
  );
};

const LeaveComp = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: props.width,
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
      <Text style={{marginLeft: 5}}>{props.percent}</Text>
    </View>
  );
};

export default LeaveChart;

const styles = StyleSheet.create({});
