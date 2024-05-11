import React from 'react';
import MyPersonalInfo from '../../components/E-Profiler/MyPersonalInfo';
import EditDetails from '../../components/E-Profiler/EditDetails';
import ViewDetails from '../../components/E-Profiler/ViewDetails';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack1 = createNativeStackNavigator();
export default DynamicDocsStack = () => {
  return (
    <Stack1.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none"
      //initialRouteName=""
    >
      <Stack1.Screen name="MyPersonalInfo" component={MyPersonalInfo} />
      <Stack1.Screen name="EditDetails" component={EditDetails} />
      <Stack1.Screen name="ViewDetails" component={ViewDetails} />
    </Stack1.Navigator>
  );
};
