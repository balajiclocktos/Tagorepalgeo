import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../utils/configs/Colors';
import {CustomButton} from './CustomButton';
import CustomPopUp from './CustomPopUp';

const SuccessError = props => {
  return (
    <CustomPopUp
      isVisible={props.isVisible}
      bgColor={props.error ? Colors.red : Colors.green}
      name={props.error ? 'error' : 'check'}
      type={props.error ? 'material' : 'ant-design'}
      color={'white'}
      size={50}
      iconStyle={{
        backgroundColor: props.error ? Colors.red : 'transparent',
        borderRadius: 40,
      }}
      headerTextStyle={{
        color: props.error ? Colors.red : Colors.green,
        fontSize: 18,
        marginTop: 20,
      }}
      deleteIconPress={props.deleteIconPress}
      title={props.error ? 'Oops!' : 'Awesome!'}
      subTitle={props.subTitle}>
      <CustomButton
        title={'Ok'}
        color={props.error ? Colors.red : Colors.green}
        width={'90%'}
        onPress={props.deleteIconPress}
        alignSelf={'center'}
      />
    </CustomPopUp>
  );
};

export default SuccessError;

const styles = StyleSheet.create({});
