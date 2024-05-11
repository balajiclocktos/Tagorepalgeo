import React from 'react';
import {ActivityIndicator} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../utils/configs/Colors';

const CustomLoader = props => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 2,
        backgroundColor: 'rgba(0, 0, 0, .4)',
      }}>
      <View
        style={{
          minWidth: 120,
          maxWidth:250,
          minHeight: 100,
          borderRadius: 7,
          justifyContent: 'space-evenly',
          alignSelf: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          elevation: 3,
          shadowColor: 'silver',
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.6,
          padding:10
        }}>
        <ActivityIndicator style={{marginVertical:10}} size="large" color={Colors.button[0]} />
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: 14,
            textAlign: 'center',
            marginHorizontal:10
          }}>
          {props.loaderText || 'Loading...'}
        </Text>
      </View>
    </View>
  );
};

export default CustomLoader;

const styles = StyleSheet.create({});
