import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AnimatedLoader from '../common/AnimatedLoader';

const Error = props => {
  return (
    <AnimatedLoader
      source={
        !props.success
          ? require('../../assets/lottie/error.json')
          : require('../../assets/lottie/success.json')
      }
      isVisible={props.isVisible}
      {...props}
    />
  );
};

export default Error;

const styles = StyleSheet.create({});
