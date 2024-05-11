import React from 'react';
import {StatusBar} from 'react-native';
import {StyleSheet, Text, View, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const height = StatusBar.currentHeight;
const LoginBackGround = props => {
  return (
    <View
      style={{
        alignItems: 'center',
        height: props.height || '50%',
        width: '100%',
        alignSelf: 'center',
        marginTop: -height,
        // position: 'absolute',
        // top: 0,
        // left: 0,
      }}>
      <StatusBar hidden />
      <Image
        source={require('../../assets/loginBg1.png')}
        resizeMode={'stretch'}
        style={{
          width: '100%',
          height: '100%',

          // marginTop: 20,
          //alignSelf: 'center',
        }}
      />
    </View>
  );
};

export default LoginBackGround;

const styles = StyleSheet.create({});
