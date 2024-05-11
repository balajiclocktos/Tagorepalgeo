import React from 'react';

import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CustomButton} from './CustomButton';
import * as Animatable from 'react-native-animatable';
const GradientButton = props => {
  return props.normal ? (
    <LinearGradient style={props.style} colors={props.colors}>
      <CustomButton
        disabled={props.disabled}
        onPress={props.onPress}
        title={props.title}
        {...props}
      />
    </LinearGradient>
  ) : (
    <Animatable.View animation={'zoomIn'} duration={5000}>
      <LinearGradient style={props.style} colors={props.colors}>
        <CustomButton
          disabled={props.disabled}
          onPress={props.onPress}
          title={props.title}
          {...props}
        />
      </LinearGradient>
    </Animatable.View>
  );
};

export default GradientButton;

const styles = StyleSheet.create({});
