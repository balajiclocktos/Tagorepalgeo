import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const HighLightedText = props => {
  const styles = StyleSheet.create({
    link: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      color: '#2460a5',
      textDecorationLine: props.underline ? 'underline' : 'none',
      textAlign: props.textAlign,
    },
  });

  return (
    <TouchableOpacity onPress={props.onPress}>
      <Text style={styles.link}>{props.text}</Text>
    </TouchableOpacity>
  );
};

export default HighLightedText;
