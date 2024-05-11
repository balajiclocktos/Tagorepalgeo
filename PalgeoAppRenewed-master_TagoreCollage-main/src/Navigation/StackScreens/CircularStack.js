import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Circular from '../../components/Circular/Circular';
import CircularStep2 from '../../components/Circular/CircularStep2';
import CircularStep3 from '../../components/Circular/CircularStep3';
import React from 'react';
const Stack = createNativeStackNavigator();
export default CircularStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none"
      //initialRouteName=""
    >
      <Stack.Screen name="Circular" component={Circular} />
      <Stack.Screen name="CircularStep2" component={CircularStep2} />
      <Stack.Screen name="CircularStep3" component={CircularStep3} />
    </Stack.Navigator>
  );
};
