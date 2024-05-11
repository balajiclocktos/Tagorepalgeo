import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Entry from '../../components/M-Dashboard/Entry';
import StaffLocation from '../../components/ManagerReports/StaffLocation';
const Stack1 = createNativeStackNavigator();
export const MDashboardStack = () => {
  return (
    <Stack1.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none"
      //initialRouteName=""
    >
      <Stack1.Screen name="Entry" component={Entry} />
      <Stack1.Screen name="StaffLocation" component={StaffLocation} />
    </Stack1.Navigator>
  );
};
