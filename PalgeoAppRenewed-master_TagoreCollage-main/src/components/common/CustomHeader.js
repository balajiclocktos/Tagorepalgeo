import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
//import {Header, Body} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import { Colors } from '../../utils/configs/Colors';
import { getUserInfo } from '../../utils/helperFunctions';
import { SafeAreaView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { isIOS } from '../../utils/configs/Constants';

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar]}>
    <SafeAreaView>
      <LinearGradient colors={Colors.mainHeader}>
        <StatusBar translucent backgroundColor={'transparent'} {...props} />
      </LinearGradient>
    </SafeAreaView>
  </View>
);

export default function CustomHeader(props) {
  const [profile_pic, setProfile] = useState(null);
  const [mobile, setMobile] = useState('');

  const [name, setName] = useState('');
  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const profile_pic = await AsyncStorage.getItem('profile_pic');
    const user_id = await AsyncStorage.getItem('user_id');
    const institute_id = await AsyncStorage.getItem('institute_id');
    const mobile = await AsyncStorage.getItem('mobile');
    setProfile(profile_pic);
    console.log("profile_pic = ", profile_pic);
    const getUserInf = await getUserInfo(user_id, institute_id);
    console.log("getUserInf == ", getUserInf);
    setName(getUserInf?.name);
    setMobile(mobile);
  };
  const notifications = () => {
    props.navigation.navigate('CircularList');
  };

  return (
    <LinearGradient
      start={{ x: 0, y: 0.75 }}
      end={{ x: 1, y: 0.25 }}
      style={styles.header}
      colors={Colors.mainHeader}>
      <MyStatusBar backgroundColor={'transparent'} barStyle="light-content" />
      <View style={styles.row}>
        <View style={styles.row}>
          <View style={styles.imageContainer}>
            <Image
              source={
                profile_pic
                  ? { uri: profile_pic }
                  : require('../../assets/user_1.png')
              }
              resizeMode="cover"
              style={styles.barImage}
            />
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{name}</Text>
            <Text
              style={[styles.headerText, { fontSize: 14, fontWeight: '400' }]}>
              {mobile}
            </Text>
            {/* <Text style={styles.locationText}>PalGeo</Text> */}
          </View>
          {/* <TouchableOpacity onPress={openDrawer}>
            <Text>Open</Text>
          </TouchableOpacity> */}
        </View>
        <TouchableWithoutFeedback onPress={notifications}>
          <Animatable.View
            animation={'jello'}
            direction={'alternate'}
            iterationCount={'infinite'}
            style={styles.imageContainer1}>
            <Image
              source={require('../../assets/bell.png')}
              resizeMode="contain"
              style={styles.notificationStyle}
            />
          </Animatable.View>
        </TouchableWithoutFeedback>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  header: {
    //backgroundColor: Colors.mainHeader,
    width: '100%',
    //flex: 1,
    paddingTop: isIOS ? '5%' : 0,
    paddingBottom: '3%',
    minHeight: '10%',
    //paddingTop: 30,
    //flex: 1,
    //height: Platform.OS === 'ios' ? 44 : 56,
  },
  row: {
    flexDirection: 'row',

    // paddingTop: Platform.OS == 'android' ? '3%' : '0%',
    //paddingBottom: '5%',

    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barImage: {
    width: 50,
    height: 50,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'white',
    //tintColor: Colors.maroon,
  },
  notificationStyle: {
    width: 20,
    height: 20,

    //borderRadius: 7,
    tintColor: '#6C53CE',
  },
  headerContainer: {
    //alignSelf: 'center',
    // marginLeft: '3%',
    // marginTop: '2%',
  },
  headerText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.white,
    //textAlign: 'center',
  },
  imageContainer: {
    //marginLeft: '1%',
    //marginTop: '2.5%',
    //backgroundColor: 'green',
    paddingLeft: 20,
    paddingRight: 15,
  },
  imageContainer1: {
    alignSelf: 'center',
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    margin: 10,

    //padding: 8,

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
  statusBar: {
    height: StatusBar.currentHeight,
    marginBottom: '3%',
  },
});
