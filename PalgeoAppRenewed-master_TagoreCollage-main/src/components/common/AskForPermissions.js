import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Linking,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import VersionNumber from 'react-native-version-number';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../../utils/configs/Colors';
import Permission from '../../assets/Permission.svg';
import CustomLabel from './CustomLabel';
import {CustomButton} from './CustomButton';
export default class AskForPermissions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {onPress, onPressCancel} = this.props;
    return (
      <ScrollView>
        <View style={styles.container}>
          <StatusBar backgroundColor={Colors.button[0]} />
          <CustomLabel
            color={Colors.mainHeader[0]}
            title={'Access Your Location'}
            size={24}
            family={'Roboto-Medium'}
          />
          {/* <Image
            source={require('../../assets/locPermission.png')}
            style={styles.updateImage}
            resizeMode="contain"
          /> */}

          <Permission />
          <View style={{marginVertical: 15}} />

          <Text style={styles.updateText}>
            This app collects location data to generate entry and exit reports
            of employees and hence monitor a employee's movement during login
            hours. During login hours, the app will track your movement and will
            collect the location data even if the app runs in background or if
            it is closed.
          </Text>
          <View style={{marginTop: 60}}>
            <View style={styles.center}>
              <CustomButton
                title="Agree"
                onPress={onPress}
                color={Colors.button[0]}
                radius={8}
                width={'90%'}
              />

              <TouchableWithoutFeedback onPress={onPressCancel}>
                <View style={styles.buttonContainer}>
                  <Text style={styles.footerText}>No, thanks</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    marginTop: '20%',
  },
  updateImage: {
    width: 291,
    height: 278,
  },
  updateText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    lineHeight: 18.75,
    color: '#5A5A5A',
    textAlign: 'justify',
    width: '95%',
    alignSelf: 'center',
    //letterSpacing: '4%',

    //textAlign: 'center',
  },
  center: {
    //justifyContent: 'space-around',
    alignItems: 'center',
    //flexDirection: 'row',
  },
  buttonContainer: {
    width: wp('100'),
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: hp('1'),
  },
  footerText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.button[0],
  },
});
