import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card} from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const CustomCard = props => {
  // const styles = StyleSheet.create({
  //   container: {
  //     minHeight: props.minHeight || 100,
  //     width: '90%',
  //     borderRadius: props.radius || 6,
  //     alignSelf: 'center',
  //     backgroundColor: props.backgroundColor || 'white',
  //     elevation: props.elevation || 4,
  //     shadowOpacity: 0.25,
  //     shadowColor: 'black',
  //     padding: props.padding || 8,
  //     borderWidth: 0,
  //     marginVertical: 10,
  //     justifyContent: props.justifyContent,
  //   },
  //   innerWrapper: {
  //     width: '100%',
  //     borderRadius: props.radius || 6,
  //     alignSelf: 'center',
  //     backgroundColor: props.backgroundColor || 'white',
  //   },
  // });
  const styles = StyleSheet.create({
    walletContainer: {
      backgroundColor: props.backgroundColor || '#ffffff',
      borderRadius: props.radius || 10,
      elevation: 5,
      shadowOffset: {width: 0, height: 5},
      shadowRadius: 5,
      shadowColor: 'black',
      shadowOpacity: 0.3,
      width: wp(props.width) || wp('93'),
      marginBottom: hp('1.5'),
      marginRight: props.marginRight,
      alignSelf: props.alignSelf,
      padding: 0,
      borderWidth: props.borderWidth,
      borderColor: 'silver',
      marginTop: props.marginTop,
    },
  });

  return (
    <Card {...props} key={props.key} style={styles.walletContainer}>
      {props.children}
    </Card>
  );
};

export default CustomCard;
