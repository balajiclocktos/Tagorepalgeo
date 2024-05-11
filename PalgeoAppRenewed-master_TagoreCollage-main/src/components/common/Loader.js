import AnimatedLottieView from 'lottie-react-native';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
} from 'react-native';
import {Colors} from '../../utils/configs/Colors';

export default Loader = () => {
  return (
    <View style={[styles.container, styles.horizontal]}>
      <StatusBar backgroundColor={Colors.mainHeader[0]} />

      <AnimatedLottieView
        loop
        autoPlay
        autoSize
        style={{height: 200, width: 200}}
        source={require('../../assets/lottie/loadernew.json')}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
