import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const CustomLabel = props => {
  const styles = StyleSheet.create({
    labelContainer: {
      margin: props.margin || '1.5%',
    },
    label: {
      fontFamily: props.family || 'Poppins-SemiBold',
      fontSize: props.size || 13,
      color: props.color || '#000000',
    },
  });
  return (
    <View style={[styles.labelContainer, props.containerStyle]}>
      <Text style={[styles.label, props.labelStyle]}>{props.title}</Text>
      {props.required && <Text style={{color: 'red'}}>*</Text>}
    </View>
  );
};

export default CustomLabel;
