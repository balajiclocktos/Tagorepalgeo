import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Card} from 'native-base';
import CustomCard from './CustomCard';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const PrimaryCard = props => {
  const styles = StyleSheet.create({
    walletContainer: {
      backgroundColor: props.backgroundColor || '#ffffff',
      borderRadius: props.radius || 10,
      elevation: 5,

      width: props.width || wp('93'),
      marginBottom: props.marginBottom || hp('1.5'),
    },
  });

  return (
    <CustomCard {...props}>
      <Image
        source={require('../../assets/wave.png')}
        style={{
          //width: '100%',
          resizeMode: 'stretch',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }}
      />

      {props.children}
    </CustomCard>
  );
};

export default PrimaryCard;
