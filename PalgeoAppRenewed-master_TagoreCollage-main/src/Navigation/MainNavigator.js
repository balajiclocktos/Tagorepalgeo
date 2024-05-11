import React, {Component} from 'react';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../components/common/Loader';

export default class MainNavigator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bearer_token: '',
      loader: true,
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token')
      .then(bearer_token => {
        this.setState({
          bearer_token: bearer_token,
          loader: false,
        });
      })
      .catch(e => console.log(e));
    //this.ConfigureOneSignal();
  }
  // componentWillUnmount() {
  //   OneSignal.removeEventListener('ids', this.onIds);
  //   OneSignal.removeEventListener('received', this.onReceived);
  //   OneSignal.removeEventListener('opened', this.onOpened);
  // }
  // ConfigureOneSignal = () => {
  //   OneSignal.setLogLevel(7, 0);
  //   OneSignal.inFocusDisplaying(2);
  //   OneSignal.init('cb52438d-c790-46e4-83de-effe08725aff', {
  //     kOSSettingsKeyAutoPrompt: true,
  //     kOSSettingsKeyInAppLaunchURL: false,
  //     kOSSettingsKeyInFocusDisplayOption: 2,
  //   });
  //   OneSignal.configure({});
  //   OneSignal.addEventListener('ids', this.onIds);
  //   OneSignal.addEventListener('received', this.onReceived);
  //   OneSignal.addEventListener('opened', this.onOpened);
  //   setTimeout(() => {
  //     this.setState({loader: false});
  //   }, 1200);
  // };
  // onIds(device) {
  //   try {
  //     AsyncStorage.setItem('device_token', device.userId);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  // onReceived(notification) {
  //   console.warn('Notification received: ', notification);
  // }
  // onOpened(openResult) {
  //   console.log('opened', openResult);
  //   RootNavigation.navigate('CircularList', {data: 'push'});
  // }
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    if (this.state.bearer_token) {
      return <AppStack />;
    } else {
      return <AuthStack />;
    }
  }
}
