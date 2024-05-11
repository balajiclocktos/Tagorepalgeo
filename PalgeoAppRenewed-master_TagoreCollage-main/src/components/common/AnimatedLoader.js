import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LottieView from 'lottie-react-native';
import CustomModal from './CustomModal';
import CustomLabel from './CustomLabel';
const AnimatedLoader = props => {
  return (
    <CustomModal
      isVisible={props.isVisible}
      doNotShowDeleteIcon={props.doNotShowDeleteIcon}
      {...props}>
      <LottieView
        source={props.source || require('../../assets/lottie/loadernew.json')}
        style={{width: '50%', alignSelf: 'center'}}
        resizeMode="contain"
        autoPlay
        loop
        speed={0.5}
      />
      {props.message && (
        <CustomLabel title={props.message} labelStyle={{textAlign: 'center'}} />
      )}
    </CustomModal>
  );
};

export default AnimatedLoader;

const styles = StyleSheet.create({});
