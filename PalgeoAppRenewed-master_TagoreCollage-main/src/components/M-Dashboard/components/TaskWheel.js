import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CustomCard from '../../common/CustomCard';
import Attendance from '../../../assets/attendance.svg';
import ProgressCircle from 'react-native-progress-circle';
import CustomLabel from '../../common/CustomLabel';
import {Colors} from '../../../utils/configs/Colors';
const TaskWheel = props => {
  const getPercent = (count, total) => {
    return (count * 100) / total;
  };
  return (
    <CustomCard>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <ProgressCircle
          percent={100}
          radius={45}
          borderWidth={10}
          color="#DD4545"
          shadowColor="#CCCCCC"
          bgColor="#fff">
          <CustomLabel size={10} family={'Poppins-Regular'} title={'Total'} />
          <CustomLabel size={14} title={props.total} />
        </ProgressCircle>
        <ProgressCircle
          percent={getPercent(props.completed, props.total)}
          radius={45}
          borderWidth={10}
          color="#0061FF"
          shadowColor="#CCCCCC"
          bgColor="#fff">
          <CustomLabel
            size={10}
            family={'Poppins-Regular'}
            title={'Completed'}
          />
          <CustomLabel size={14} title={props.completed} />
        </ProgressCircle>
        <ProgressCircle
          percent={getPercent(props.pending, props.total)}
          radius={45}
          borderWidth={10}
          color={Colors.button[0]}
          shadowColor="#CCCCCC"
          bgColor="#fff">
          <CustomLabel size={10} family={'Poppins-Regular'} title={'Pending'} />
          <CustomLabel size={14} title={props.pending} />
        </ProgressCircle>
      </View>
    </CustomCard>
  );
};

export default TaskWheel;

const styles = StyleSheet.create({});
