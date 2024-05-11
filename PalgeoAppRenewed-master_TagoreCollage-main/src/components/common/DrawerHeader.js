import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
//import {Header, Body} from 'native-base';

import {StatusBar} from 'react-native';
import {Colors} from '../../utils/configs/Colors';
import {isIOS} from '../../utils/configs/Constants';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default function SubHeader(props) {
  const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={styles.statusBar}>
      <StatusBar
        translucent
        backgroundColor={Colors.mainHeader[0]}
        {...props}
      />
    </View>
  );
  const styles = StyleSheet.create({
    header: {
      backgroundColor: props.theme || Colors.mainHeader[0],
      width: '100%',
      //flex: 1,
      paddingTop: isIOS ? '10%' : '2%',
      paddingBottom: '3%',
      minHeight: '10%',
    },
    statusBar: {
      height: StatusBar.currentHeight,
      marginBottom: '3%',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    barImage: {
      width: 20,
      height: 20,
    },
    headerContainer: {
      alignSelf: 'center',
    },
    headerText: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 15,
      color: Colors.white,
      textAlign: 'center',
    },
    imageContainer: {
      //marginLeft: '1%',
      //marginTop: '2.5%',
      //backgroundColor: 'green',
      paddingHorizontal: 10,
    },
    imageContainer1: {
      alignSelf: 'center',
      //marginTop: 6,
      // position: 'absolute',
      // right: 0,
      // top: Platform.OS == 'android' ? hp('4') : null,
    },
    locationText: {
      fontFamily: 'Poppins-Regular',
      fontSize: 11,
      color: '#ffffff',
    },
  });
  const notifications = () => {
    props.navigation.navigate('CircularList');
  };

  return (
    <View style={styles.header}>
      <MyStatusBar barStyle="light-content" />
      <View style={styles.row}>
        {props.showBack && (
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/back-icon.png')}
                resizeMode="contain"
                style={styles.barImage}
              />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{props.title}</Text>
          {/* <Text style={styles.locationText}>PalGeo</Text> */}
        </View>
        {props.showBell && (
          <TouchableWithoutFeedback onPress={notifications}>
            <View style={styles.imageContainer1}>
              <Image
                source={require('../../assets/bell.png')}
                resizeMode="contain"
                style={styles.barImage}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </View>
  );
}
