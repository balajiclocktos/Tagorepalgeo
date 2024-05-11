import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {TextInput} from 'react-native';
import {Colors} from '../../utils/configs/Colors';

const CustomModalTextArea = props => {
  return (
    <View style={styles.item1}>
      <TextInput
        placeholder={props.placeholder}
        multiline={true}
        style={{
          height: 100,
          textAlignVertical: 'top',
          borderRadius: 8,
          padding: 10,
          backgroundColor: props.backgroundColor,
          width: props.width,
        }}
        numberOfLines={props.rowSpan || 3}
        // bordered={props.bordered || true}
        //style={styles.textarea}
        value={props.value}
        onChangeText={props.onChangeText}
        disabled={props.disabled || false}
        blurOnSubmit={true}
      />
    </View>
  );
};

export default CustomModalTextArea;

const styles = StyleSheet.create({
  item1: {
    borderRadius: 8,
    margin: 10,
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  textarea: {
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderRadius: 8,
  },
});
