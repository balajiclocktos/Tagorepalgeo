import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../../components/Home';

import React from 'react';
const Stack1 = createNativeStackNavigator();
export const DashboardStack = () => {
  return (
    <Stack1.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none"
      //initialRouteName="HomeScreen"
    >
      <Stack1.Screen name="HomeScreen" component={Home} />
    </Stack1.Navigator>
  );
};
