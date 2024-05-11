import LocateMap from '../../components/LocateStaff/LocateMap';
import LocateMenuStep1 from '../../components/LocateStaff/LocateMenuStep1';
import LocateMenuStep2 from '../../components/LocateStaff/LocateMenuStep2';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
const Stack = createNativeStackNavigator();
export default LocateStaffStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none">
      <Stack.Screen name="LocateMenuStep1" component={LocateMenuStep1} />
      <Stack.Screen name="LocateMenuStep2" component={LocateMenuStep2} />
      <Stack.Screen name="LocateMenu" component={LocateMap} />
    </Stack.Navigator>
  );
};
