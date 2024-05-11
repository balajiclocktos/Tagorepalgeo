import React, {Component} from 'react';
import {Text, TouchableOpacity, StyleSheet, View} from 'react-native';
export class CalenderView2 extends Component {
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
          marginBottom: 10,
          flexDirection: 'row',
          height: 80,
        }}>
        <View
          style={{
            width: '60%',
            alignItems: 'flex-start',
          }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: '#CDDEFE',
              height: 35,
              justifyContent: 'center',
              width: '60%',
            }}>
            {title && (
              <Text style={[styles.text, {lineHeight: 30}]}>{title}</Text>
            )}
          </View>
        </View>
        <View
          style={{
            width: '40%',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          {<Text style={[styles.text, {fontSize: 12}]}>{mainTitle}</Text>}
          {date && (
            <Text
              style={[styles.text, {fontSize: 20, color: this.props.color}]}>
              {date}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    textAlign: 'center',
  },
});
