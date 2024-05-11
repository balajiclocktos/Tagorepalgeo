// import React from 'react';
// import {
//   View,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableWithoutFeedback,
//   Platform,
// } from 'react-native';
// import {HStack} from 'native-base';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {StatusBar} from 'react-native';
// import {Colors} from '../../utils/configs/Colors';
// export default SubHeader = props => {
//   const goBack = () => {
//     props.navigation.navigate(props.backScreen);
//   };
//   const notifications = () => {
//     props.navigation.navigate('Notifications');
//   };
//   return (
//     <View style={styles.header}>
//       <StatusBar backgroundColor={Colors.header} />
//       <View style={styles.row}>
//         {!props.showBack ? null : (
//           <TouchableWithoutFeedback onPress={goBack}>
//             <View style={styles.imageContainer}>
//               <Image
//                 source={require('../../assets/back-icon.png')}
//                 resizeMode="contain"
//                 style={styles.barImage}
//               />
//             </View>
//           </TouchableWithoutFeedback>
//         )}

//         <View style={styles.headerContainer}>
//           <Text style={styles.text}>{props.title}</Text>
//         </View>
//         {!props.showBell ? null : (
//           <TouchableWithoutFeedback onPress={notifications}>
//             <View style={styles.imageContainer2}>
//               <Image
//                 source={require('../../assets/bell.png')}
//                 resizeMode="contain"
//                 style={styles.barImage1}
//               />
//             </View>
//           </TouchableWithoutFeedback>
//         )}
//       </View>
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: '#f05760',
//     flex: 1,
//     height: Platform.OS == 'android' ? hp('8') : undefined,
//   },
//   row: {
//     flexDirection: 'row',
//     paddingTop: Platform.OS == 'android' ? '5%' : '0%',
//     paddingBottom: Platform.OS == 'android' ? '5%' : '4.5%',
//   },
//   barImage: {
//     width: 25,
//     height: 25,
//   },
//   headerContainer: {
//     marginLeft: '3%',
//     flex: 1,
//   },
//   text: {
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 15,
//     color: '#ffffff',
//   },
//   imageContainer: {
//     marginLeft: '1%',
//   },
//   imageContainer1: {
//     marginTop: '2.5%',
//     paddingLeft: wp('12'),
//   },
//   imageContainer2: {
//     position: 'absolute',
//     right: wp('2'),
//     top: hp('3'),
//   },
//   barImage1: {
//     width: 20,
//     height: 20,
//   },
// });

import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {StatusBar} from 'react-native';
import {Colors} from '../../utils/configs/Colors';
import Header from '../../assets/header3.svg';
import Header1 from '../../assets/staffMasterHeader.svg';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {isIOS} from '../../utils/configs/Constants';

export default function SubHeader(props) {
  const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar]}>
      <LinearGradient colors={Colors.mainHeader}>
        <StatusBar translucent backgroundColor={'transparent'} {...props} />
      </LinearGradient>
    </View>
  );
  const styles = StyleSheet.create({
    header: {
      //backgroundColor: props.theme || Colors.mainHeader,
      width: '100%',

      //flex: 1,
      // height: Platform.OS == 'android' ? hp('9') : undefined,
    },
    statusBar: {
      height: Platform.OS == 'android' ? StatusBar.currentHeight : '3%',
    },
    row: {
      flexDirection: 'row',
      paddingTop: Platform.OS == 'android' ? '5%' : '10%',
      // paddingBottom: '5%',
      //paddingHorizontal: '5%',
      alignItems: 'center',
      //justifyContent: 'space-between',
    },
    barImage: {
      width: 20,
      height: 20,
      //tintColor: Colors.maroon,
    },
    headerContainer: {
      alignSelf: 'center',
      // marginLeft: '3%',
      // marginTop: '2%',
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
  const openDrawer = () => {
    props.navigation.toggleDrawer();
  };

  return (
    <View style={styles.header}>
      <View
        style={{
          width: '100%',
          flex: 1,
          // resizeMode: 'contain',

          position: 'absolute',
          top: props.medium ? 0 : -20,
          left: 0,

          //right: 0,
        }}>
        {props.long ? (
          <Header width={'100%'} />
        ) : props.medium ? (
          <Image
            source={require('../../assets/payoutHeader.png')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              resizeMode: 'stretch',
            }}
          />
        ) : (
          <Header1 width={'100%'} />
        )}
      </View>
      <MyStatusBar barStyle="light-content" />
      <View style={styles.row}>
        {props.showBack ? (
          !isIOS ? (
            <TouchableWithoutFeedback onPress={() => props.navigation.goBack()}>
              <View style={styles.imageContainer}>
                <Image
                  source={require('../../assets/back-icon.png')}
                  resizeMode="contain"
                  style={styles.barImage}
                />
              </View>
            </TouchableWithoutFeedback>
          ) : (
            <TouchableOpacity
              style={{padding: 25}}
              onPress={() => props.navigation.goBack()}>
              <View style={styles.imageContainer}>
                <Image
                  source={require('../../assets/back-icon.png')}
                  resizeMode="contain"
                  style={styles.barImage}
                />
              </View>
            </TouchableOpacity>
          )
        ) : null}
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
