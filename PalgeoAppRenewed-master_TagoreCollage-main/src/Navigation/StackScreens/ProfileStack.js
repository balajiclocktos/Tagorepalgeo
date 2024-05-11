import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyProfile from '../../components/MyProfile';
import CircleMapView from '../../components/Profile/CircleMapView';
import PolygonMapView from '../../components/Profile/PolygonMapView';
import React from 'react';
const Stack1 = createNativeStackNavigator();
export default ProfileStack = () => {
  return (
    <Stack1.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none"
      //initialRouteName="HomeScreen"
    >
      <Stack1.Screen name="MyProfile" component={MyProfile} />
      <Stack1.Screen name="CircleMapView" component={CircleMapView} />
      <Stack1.Screen name="PolygonMapView" component={PolygonMapView} />
    </Stack1.Navigator>
  );
};
