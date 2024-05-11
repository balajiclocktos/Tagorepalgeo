import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import VersionNumber from 'react-native-version-number';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {loginAPI} from '../../utils/helperFunctions';
import VersionCheck from 'react-native-version-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class AskForUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      oldVersion: '',
      newVersion: '',
      bearer_token: null,
    };
  }

  async componentDidMount() {
    const bearer_token = await AsyncStorage.getItem('bearer_token');
    this.setState({
      oldVersion: VersionCheck.getCurrentVersion(),
      newVersion: await VersionCheck.getLatestVersion(),
      bearer_token,
    });
  }

  // goToHome = async () => {
  //   console.log('I am pressed');
  //   if (this.state.bearer_token) {
  //     return await loginAPI();
  //   }
  // };

  // goToPlayStore = () => {
  //   Linking.openURL('market://details?id=' + VersionNumber.bundleIdentifier)
  //     .catch((e) =>
  //       alert('Something went wrong while updating the app. Please try again.'),
  //     )
  //     .then((success) => this.goToHome());
  // };

  //goBack = () => this.props.navigation.navigate('Home');

  render() {
    const {oldVersion, newVersion} = this.state;
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Image
          source={require('../../assets/update.jpg')}
          style={styles.updateImage}
          resizeMode="contain"
        />
        <Text style={styles.updateText}>
          Hey! You are using an older version ({oldVersion}). New Update
          Available! ({newVersion})
        </Text>
        <View style={{marginTop: 10}}>
          <View style={styles.center}>
            <TouchableWithoutFeedback onPress={this.props.goToPlayStore}>
              <View style={styles.buttonContainer}>
                <Text style={styles.footerText}>Update Now</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          {/* <View style={styles.center}>
            <TouchableWithoutFeedback onPress={this.props.onClose}>
              <View style={styles.buttonContainer}>
                <Text style={styles.footerText}>Later</Text>
              </View>
            </TouchableWithoutFeedback>
          </View> */}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  updateImage: {
    width: 350,
    height: 350,
  },
  updateText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ff4f5a',
    textAlign: 'center',
    maxWidth: '80%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: wp('80'),
    backgroundColor: '#f05760',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: hp('1'),
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
});
