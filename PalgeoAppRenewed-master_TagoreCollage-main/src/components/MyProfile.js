import React, {Component} from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import SubHeader from './common/DrawerHeader';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ProfileDetails from './Profile/ProfileDetails';
import AssignedLocations from './Profile/AssignedLocations';
import CurrentTasks from './Profile/CurrentTasks';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Colors} from '../utils/configs/Colors';
import {SafeAreaView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {useState} from 'react';
import CustomLabel from './common/CustomLabel';
const Tab = createMaterialTopTabNavigator();
const tabActiveColor = Colors.calendarBg;
const tabInActiveColor = Colors.overlay;
const iconStyle = {
  backgroundColor: 'white',
  width: 50,
  height: 50,
  borderRadius: 25,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
};

const IconComp = props => {
  return (
    <TouchableOpacity
      style={{
        width: '20%',
        // borderBottomWidth: 3,
        // borderBottomColor: props.bottom,
        alignItems: 'center',
      }}
      onPress={props.onPress}>
      <View style={[iconStyle]}>
        <Image {...props} />
      </View>
    </TouchableOpacity>
  );
};

function MyTabBar({state, descriptors, navigation, position}) {
  return (
    <View style={{flexDirection: 'row'}}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({name: route.name, merge: true});
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        let tabIcon = require('../assets/ic_profile.png');
        let screenName = 'Profile';
        if (route.name === 'Profile') {
          tabIcon = require('../assets/ic_profile.png');
          screenName = 'Profile';
        } else if (route.name === 'MyLocations') {
          tabIcon = require('../assets/locationOn.png');
          screenName = 'My Locations';
        } else if (route.name === 'MyTasks') {
          tabIcon = require('../assets/task_new.png');
          screenName = 'My Tasks';
        }
        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              backgroundColor: Colors.mainHeader[1],
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                backgroundColor: 'transparent',
                resizeMode: 'contain',
                width: 25,
                height: 25,
                tintColor: 'white',
                opacity: isFocused ? 1 : 0.6,
              }}
              source={tabIcon}
            />
            <CustomLabel
              title={screenName}
              color={'white'}
              labelStyle={{opacity: isFocused ? 1 : 0.6}}
              size={12}
              family={'Poppins-Regular'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      initialRouteName="Profile"
      screenOptions={({route}) => ({
        tabBarItemStyle: {
          backgroundColor: Colors.mainHeader[1],
        },
        // tabBarIconStyle: {
        //   backgroundColor: 'red',
        //   width: 50,
        //   height: 50,
        //   borderRadius: 25,
        //   alignItems: 'center',
        //   justifyContent: 'center',
        // },

        // tabBarShowIcon: true,
        // tabBarShowLabel: false,
        // tabBarStyle: {backgroundColor: Colors.header},
      })}
      // sceneContainerStyle={{backgroundColor: Colors.header}}
      // tabBarOptions={{
      //   activeTintColor: '#ffffff',
      //   labelStyle: {fontSize: 12, fontFamily: 'Poppins-Regular'},
      //   style: {backgroundColor: '#f05760'},
      //   showIcon: true,
      //   showLabel: false,
      //   safeAreaInset: {bottom: 'never'},
      //   indicatorStyle: {backgroundColor: '#ffffff', height: 3},
    >
      <Tab.Screen name="Profile" component={ProfileDetails} />
      <Tab.Screen name="MyLocations" component={AssignedLocations} />
      <Tab.Screen name="MyTasks" component={CurrentTasks} />
    </Tab.Navigator>
  );
}
export default class MyProfile extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{flex: 1, backgroundColor: Colors.header}}>
        <SubHeader
          title="My Profile"
          showBack={true}
          backScreen="Home"
          navigation={this.props.navigation}
        />
        <MyTabs />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    margin: '1%',
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    margin: '1%',
    color: '#909090',
  },
  upperBackground: {
    position: 'absolute',
    width: wp('100'),
    height: 100,
    backgroundColor: '#f05760',
    top: 37,
  },
});
