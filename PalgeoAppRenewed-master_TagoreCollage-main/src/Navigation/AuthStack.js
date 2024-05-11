import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../components/Auth/Login';
import MpinLogin from '../components/Auth/MpinLogin';
import RegisterPin from '../components/Auth/RegisterPin';
import MainNavigator from './MainNavigator';
import SetMpin from '../components/Auth/SetMpin';
import Privacy from '../components/Privacy';

const Stack = createNativeStackNavigator();
export default class AuthStack extends React.Component {
  render() {
    return (
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        headerMode="none"
        initialRouteName="MpinLogin">
        <Stack.Screen name="MpinLogin" component={MpinLogin} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainNavigator" component={MainNavigator} />
        <Stack.Screen name="RegisterPin" component={RegisterPin} />

        <Stack.Screen name="SetMpin" component={SetMpin} />
        <Stack.Screen name="Privacy" component={Privacy} />
      </Stack.Navigator>
    );
  }
}
