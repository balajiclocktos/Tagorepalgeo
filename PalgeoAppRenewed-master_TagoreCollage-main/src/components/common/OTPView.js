import OTPInputView from '@twotalltotems/react-native-otp-input';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors } from '../../utils/configs/Colors';
const OTPView = props => {
  const styles = StyleSheet.create({
    inputFeilds: {
      //backgroundColor: '#ffffff',
      borderWidth: props.borderWidth || 0,
      borderBottomWidth: props.borderBottomWidth || 2,
      borderBottomColor: props.borderBottomColor || 'black',
      color: 'black',
      //borderRadius: 10,
    },
    inputFeildsFocus: {
      //backgroundColor: '#ffffff',
      borderWidth: props.borderWidthFocus || 0,
      borderBottomWidth: props.bottomWidth || 2,
      borderBottomColor: props.bottomColor || Colors.button[0],
      color: '#000000',
      // borderRadius: 10,
    },
  });

  return (
    <OTPInputView
      style={{ width: wp('80'), height: 80, alignSelf: 'center' }}
      pinCount={4}
      autoFocusOnLoad={false}
      secureTextEntry={true}
      codeInputFieldStyle={styles.inputFeilds}
      codeInputHighlightStyle={styles.inputFeildsFocus}
      onCodeFilled={props.onCodeFilled}
    />
  );
};

export default OTPView;
