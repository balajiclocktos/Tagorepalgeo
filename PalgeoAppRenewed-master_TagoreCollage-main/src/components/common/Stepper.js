import React from 'react';
import {Image} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';

const Stepper = props => {
  return (
    <View
      style={{
        width: '90%',
        height: 40,
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 10,
      }}>
      <Image
        source={
          props.step1
            ? require('../../assets/step1.png')
            : props.step2
            ? require('../../assets/step2.png')
            : require('../../assets/step3.png')
        }
        style={{
          width: '100%',
          resizeMode: 'contain',
          height: '100%',
          //xbackgroundColor: 'transparent',
        }}
      />
    </View>
  );
};

export default Stepper;

const styles = StyleSheet.create({});
