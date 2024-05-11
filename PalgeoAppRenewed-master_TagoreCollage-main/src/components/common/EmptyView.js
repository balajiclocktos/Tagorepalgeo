import AnimatedLottieView from 'lottie-react-native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CustomLabel from './CustomLabel';

const EmptyView = props => {
  return (
    <View
      style={{
        width: '80%',
        height: '80%',
        alignSelf: 'center',
        alignContent: 'center',
      }}>
      <AnimatedLottieView
        //loop
        //autoSize
        autoPlay
        style={{width: '100%', alignSelf: 'center'}}
        resizeMode="cover"
        source={require('../../assets/lottie/noData.json')}
      />
      <CustomLabel
        containerStyle={{alignSelf: 'center'}}
        title={props.title}
        margin={0}
      />
    </View>
  );
};

export default EmptyView;

const styles = StyleSheet.create({});
