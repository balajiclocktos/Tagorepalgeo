import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import FaceRegister from '../components/Face/FaceRegister';
import FaceRegister1 from '../components/Face/FaceBackup';
import Checkin from '../components/Face/Checkin';
import LiveCheckin from '../components/Face/LiveCheckin';
import LiveCheckout from '../components/Face/LiveCheckOut';
import OtherCheckin from '../components/Face/OtherCheckIn';
import Checkout from '../components/Face/Checkout';
import OtherCheckout from '../components/Face/OtherCheckOut';
import StaffTasks from '../components/Face/StaffTasks';
import OtherStaffTasks from '../components/Face/OtherStaffTasks';
import MainNavigator from './MainNavigator';
import OfflineAttendanceEntry from '../components/Requests/OfflineAttendanceEntry';
import Reports from '../components/Face/Reports';
import ImageViewer from '../components/ImageViewer';
import QRCodeGenerator from '../components/Face/QRCodeGenerator';
import NewTravelReport from '../components/Reports/NewTravelReport';
import TaskPreferences from '../components/Task Allocation/TaskPreferences';
import TaskAssignedLocation from '../components/Task Allocation/TaskAssignedLocation';
import Holidays from '../components/MyCalender/Holidays';
import SideBar from '../components/common/Sidebar';
import BottomTab from '../components/common/BottomTab';
import ProfileStack from './StackScreens/ProfileStack';
import DynamicDocsStack from './StackScreens/DynamicDocsStack';
import GeofenceStack from './StackScreens/GeofenceStack';
import CircularStack from './StackScreens/CircularStack';
import LocateStaffStack from './StackScreens/LocateStaffStack';
import MapFencing from '../components/Profile/CircleMapView';
import StaffLocation from '../components/ManagerReports/StaffLocation';
import CircularList from '../components/Circular/CircularList';
import Appointment from '../components/TravelCheckIn/Appointment';
const Stack = createDrawerNavigator();

// export const DashboardStack = () => {
//   return (
//     <Stack1.Navigator
//       screenOptions={{
//         headerShown: false,
//       }}
//       headerMode="none"
//       initialRouteName="HomeScreen">
//       <Stack1.Screen name="HomeScreen" component={Home} />
//       <Stack1.Screen name="Checkin" component={Checkin} />
//       <Stack1.Screen name="Checkout" component={Checkout} />
//       <Stack1.Screen name="CircularList" component={CircularList} />
//       <Stack1.Screen name="AppointmentDetails" component={Appointment} />
//     </Stack1.Navigator>
//   );
// };

// export const MDashboardStack = () => {
//   return (
//     <Stack1.Navigator
//       screenOptions={{
//         headerShown: false,
//       }}
//       headerMode="none"
//       //initialRouteName=""
//     >
//       <Stack1.Screen name="Entry" component={Entry} />
//       <Stack1.Screen name="StaffLocation" component={StaffLocation} />
//     </Stack1.Navigator>
//   );
// };
// export const RDashboardStack = () => {
//   return (
//     <Stack1.Navigator
//       screenOptions={{
//         headerShown: false,
//       }}
//       headerMode="none"
//       //initialRouteName=""
//     >
//       <Stack1.Screen name="Leaves" component={Leaves} />
//       <Stack1.Screen name="LeaveRequest" component={LeaveRequest} />
//       <Stack1.Screen name="OutsideDuty" component={OutsideDuty} />
//       <Stack1.Screen name="Permission" component={Permission} />
//       <Stack1.Screen name="Complaints" component={Complaints} />
//       <Stack1.Screen name="Punch" component={Punch} />

//       <Stack1.Screen name="ApprovalScreen" component={ApprovalScreen} />
//       <Stack1.Screen name="RequestDetails" component={RequestDetails} />
//     </Stack1.Navigator>
//   );
// };

const DrawerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        drawerHideStatusBarOnOpen: false,
        unmountOnBlur: true,
        //swipeEdgeWidth: 0,
        swipeEnabled: false,
        // drawerType: 'slide',
        // drawerStyle: {
        //   width: Dimensions.get('screen').width,
        // },
      }}
      headerMode="none"
      //initialRouteName="Profile"
      drawerContent={props => <SideBar {...props} />}>
      <Stack.Screen name="Tab" component={BottomTab} />
      <Stack.Screen name="FaceRegister" component={FaceRegister} />
      <Stack.Screen name="FaceRegister1" component={FaceRegister1} />
      <Stack.Screen name="LiveCheckin" component={LiveCheckin} />
      <Stack.Screen name="OtherCheckin" component={OtherCheckin} />
      <Stack.Screen name="LiveCheckOut" component={LiveCheckout} />
      <Stack.Screen name="OtherCheckout" component={OtherCheckout} />
      <Stack.Screen name="MainNavigator" component={MainNavigator} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="TravelReports" component={NewTravelReport} />
      <Stack.Screen name="QRCodeGenerator" component={QRCodeGenerator} />
      <Stack.Screen name="ImageViewer" component={ImageViewer} />
      <Stack.Screen name="Profile" component={ProfileStack} />
      <Stack.Screen name="Geofence" component={GeofenceStack} />
      <Stack.Screen name="e-Circular" component={CircularStack} />
      <Stack.Screen name="CircularList" component={CircularList} />
      <Stack.Screen name="LocateMenu" component={LocateStaffStack} />
      <Stack.Screen name="CircleMapView" component={MapFencing} />
      <Stack.Screen name="StaffLocation" component={StaffLocation} />
      <Stack.Screen name="TaskPreferences" component={TaskPreferences} />
      <Stack.Screen name="Checkin" component={Checkin} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="AppointmentDetails" component={Appointment} />
      <Stack.Screen name="StaffTasks" component={StaffTasks} />
      <Stack.Screen name="OtherStaffTasks" component={OtherStaffTasks} />
      <Stack.Screen
        name="OfflineAttendance"
        component={OfflineAttendanceEntry}
      />
      {/* <Stack.Screen name="TestScreen" component={TestScreen} /> */}
      <Stack.Screen
        name="TaskAssignedLocation"
        component={TaskAssignedLocation}
      />

      <Stack.Screen name="DynamicDocs" component={DynamicDocsStack} />
      <Stack.Screen name="Holidays" component={Holidays} />
    </Stack.Navigator>
  );
};

export default DrawerStack;
