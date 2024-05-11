import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import LeaveRequest from '../../components/Requests/LeaveRequest';
import OutsideDuty from '../../components/Requests/OutsideDuty';
import Permission from '../../components/Requests/Permission';
import HolidayWork from '../../components/Requests/HolidayWork';
import Complaints from '../../components/Requests/Complaints';
import Leaves from '../../components/Requests/Leaves';
import Punch from '../../components/Requests/Punch';
import ApprovalScreen from '../../components/Requests/ApprovalScreen';
import DocumentViewr from '../../components/Requests/DocumentViewr';
import RequestDetails from '../../components/Requests/RequestDetails';
import BackDatedLeave from '../../components/Requests/BackDatedLeave';
import BackDatedOnDuty from '../../components/Requests/BackDatedOnDuty';
import OfflineAttendanceEntry from '../../components/Requests/OfflineAttendanceEntry';
const Stack1 = createNativeStackNavigator();
export const RDashboardStack = () => {
  return (
    <Stack1.Navigator
      screenOptions={{
        headerShown: false,
      }}
      headerMode="none"
      //initialRouteName=""
    >
      <Stack1.Screen name="Leaves" component={Leaves} />
      <Stack1.Screen name="LeaveRequest" component={LeaveRequest} />
      <Stack1.Screen name="OutsideDuty" component={OutsideDuty} />
      <Stack1.Screen name="Permission" component={Permission} />
      {/* <Stack1.Screen name="HolidayWork" component={HolidayWork} /> */}
      <Stack1.Screen name="Complaints" component={Complaints} />
      <Stack1.Screen name="Punch" component={Punch} />

      <Stack1.Screen name="ApprovalScreen" component={ApprovalScreen} />
      <Stack1.Screen name="DocumentViewr" component={DocumentViewr} />
      <Stack1.Screen name="RequestDetails" component={RequestDetails} />
      <Stack1.Screen name="BackDatedLeave" component={BackDatedLeave} />
      <Stack1.Screen name="BackDatedOD" component={BackDatedOnDuty} />
      <Stack1.Screen
        name="OfflineAttendance"
        component={OfflineAttendanceEntry}
      />
    </Stack1.Navigator>
  );
};
