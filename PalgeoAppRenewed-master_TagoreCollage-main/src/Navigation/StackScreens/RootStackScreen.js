import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import DrawerStack from '../AppStack';
import AuthStackScreen from '../AuthStack';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const RootStack = createNativeStackNavigator;
const RootStackScreen = ({userToken}) => (
  <RootStack.Navigator screenOptions={{headerShown: false}} headerMode="none">
    {userToken ? (
      <RootStack.Screen
        name="App"
        component={DrawerStack}
        options={{
          animationEnabled: false,
        }}
      />
    ) : (
      <RootStack.Screen
        name="Auth"
        component={AuthStackScreen}
        options={{
          animationEnabled: false,
        }}
      />
    )}
  </RootStack.Navigator>
);

export default RootStackScreen;

const styles = StyleSheet.create({});
