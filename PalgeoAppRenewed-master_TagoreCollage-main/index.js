/**
 * @format
 */
import 'react-native-gesture-handler';
//import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {AppRegistry, LogBox} from 'react-native';
import {name as appName} from './app.json';
import App from './App';
import React, {useRef, useState} from 'react';

import {Provider} from 'react-redux';

import configureStore from './src/redux/store';
import {NativeBaseProvider} from 'native-base';
//import AnimatedLoader from './src/components/common/AnimatedLoader';
//import SplashScreen from 'react-native-splash-screen';
import {Modal, View} from 'react-native';
import AnimatedLottieView from 'lottie-react-native';
import {useEffect} from 'react';
import {Animated, Easing} from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {
  asyncStorageDataFetch,
  checkinByWifi,
  getWifiLocations,
  inBetween,
  staffCurrentLocation,
  trackWifi,
  travelCheckCurrentLocation,
} from './src/utils/helperFunctions';

const track = async () => {
  try {
    console.log("In run By vrushali:")
    const wifiLocations = await getWifiLocations();
    const isFaceRequired = await asyncStorageDataFetch('isFaceRequired');
    console.log("Wifi location:"+JSON.stringify(wifiLocations))
    if (wifiLocations.length > 0 && isFaceRequired === 'false') {
      const shedcheckInTime = moment
        .utc(wifiLocations[0].checkInTime, 'HH:mm:ss')
        .local()
        .format('HH:mm:ss');
      const shedcheckOutTime = moment
        .utc(wifiLocations[0].checkOutTime, 'HH:mm:ss')
        .local()
        .format('HH:mm:ss');
      // const shedcheckInTime = await asyncStorageDataFetch(
      //   'shedcheckInTime',
      // );
      // const shedcheckOutTime = await asyncStorageDataFetch(
      //   'shedcheckOutTime',
      // );
      console.log('I ran');
      if (!shedcheckInTime && !shedcheckOutTime) {
        return;
      }
      var startTime = shedcheckInTime;
      var endTime = shedcheckOutTime;

      const inBetweenTime = inBetween(startTime, endTime);
      if (inBetweenTime) {
        await trackWifi();
      }
    }
  } catch (error) {
    console.log('error_headless', error.message);
  }
};

const BackgroundGeolocationHeadlessTask = async event => {
  let params = event.params;
  console.log('[BackgroundGeolocation HeadlessTask] -', event.name, params);
  console.log(new Date().toLocaleString());
  switch (event.name) {
    case 'heartbeat':
      await track();
      break;
    case 'location':
      await track();
      break;
    case 'connectivitychange':
      const wifiCheckOutBody = JSON.parse(
        await AsyncStorage.getItem('wifiCheckOutBody'),
      );
      if (wifiCheckOutBody && event.params.isConnected) {
        checkinByWifi(
          null,
          'no',
          user_id_latest,
          institute_id_latest,
          '',
          wifiCheckOutBody,
        );
      }
      break;
  }
};

BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);

const store = configureStore();

const RNRedux = () => {
  const ref = useRef(null);
  const [play, setPlay] = useState(true);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(new Animated.Value(0));
  useEffect(() => {
    setTimeout(() => setCount(5), 5000);
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
    }).start();
  }, []);
  return (
    <NativeBaseProvider>
      <Provider store={store}>
        {count !== 5 ? (
          <Modal
            ref={ref}
            visible={play}
            style={{
              height: '100%',
              width: '100%',
            }}>
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <AnimatedLottieView
                source={require('./src/assets/lottie/splashnew.json')}
                autoPlay
                loop={false}
                progress={progress}
                onAnimationFinish={() => {
                  setPlay(false);
                }}
              />
            </View>
          </Modal>
        ) : (
          <App />
        )}
      </Provider>
    </NativeBaseProvider>
  );
};
// Register the service
//ReactNativeForegroundService.register();
LogBox.ignoreAllLogs(true);
// AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => RNRedux);
