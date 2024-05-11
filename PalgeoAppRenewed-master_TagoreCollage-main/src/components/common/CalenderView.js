import React, {Component} from 'react';
import {Text, TouchableOpacity, StyleSheet, View} from 'react-native';
export class CalenderView extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let {date, mainTitle, title, backgroundColor, height, width, onPress} =
      this.props;
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: width,
          padding: 10,
          backgroundColor: backgroundColor,
          borderRadius: 10,
          alignItems: 'center',
          margin: 10,
        }}>
        <Text style={[styles.text, {lineHeight: 30}]}>{mainTitle}</Text>
        {title && <Text style={styles.text}>{title}</Text>}
        {date && <Text style={[styles.text, {fontSize: 40}]}>{date}</Text>}
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    textAlign: 'center',
    color: 'white',
  },
});
