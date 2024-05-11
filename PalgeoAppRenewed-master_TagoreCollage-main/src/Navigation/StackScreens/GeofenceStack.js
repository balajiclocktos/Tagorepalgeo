import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FencingList from '../../components/FencingList';
import MapFencing from '../../components/MapFencing';
import React from 'react';
const Stack = createNativeStackNavigator();
export default GeofenceStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none">
      <Stack.Screen name="FencingList" component={FencingList} />
      <Stack.Screen name="MapFencing" component={MapFencing} />
    </Stack.Navigator>
  );
};
