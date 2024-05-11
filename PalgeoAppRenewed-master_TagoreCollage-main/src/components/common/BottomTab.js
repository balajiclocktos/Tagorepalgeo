import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import * as Animatable from 'react-native-animatable';

import SideBar from './Sidebar';
import { Colors } from '../../utils/configs/Colors';
import { useNavigation } from '@react-navigation/core';
import { DashboardStack } from '../../Navigation/StackScreens/DashboardStack';
import { MDashboardStack } from '../../Navigation/StackScreens/MDashboardStack';
import { RDashboardStack } from '../../Navigation/StackScreens/RDashboardStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const animate1 = {
  0: { scale: 0.5, translateY: 7 },
  0.92: { translateY: -34 },
  1: { scale: 1.2, translateY: -24 },
};
const animate2 = {
  0: { scale: 1.2, translateY: -24 },
  1: { scale: 1, translateY: 7 },
};

const circle1 = {
  0: { scale: 0 },
  0.3: { scale: 0.9 },
  0.5: { scale: 0.2 },
  0.8: { scale: 0.7 },
  1: { scale: 1 },
};
const circle2 = { 0: { scale: 1 }, 1: { scale: 0 } };

const TabButton = props => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (focused) {
      //viewRef.current.animate(animate1);
      circleRef.current.animate(circle1);
      textRef.current.transitionTo({ scale: 1 });
    } else {
      viewRef.current.animate(animate2);
      circleRef.current.animate(circle2);
      textRef.current.transitionTo({ scale: 0 });
    }
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={() => onPress(item.route)}
      activeOpacity={1}
      style={styles.container}>
      <Animatable.View ref={viewRef} duration={1000} style={styles.container}>
        <View style={styles.btn}>
          <Animatable.View ref={circleRef} style={styles.circle} />
          <Icon
            type={item.type}
            name={item.icon}
            color={focused ? Colors.button[0] : Colors.white}
          />
        </View>
        <Animatable.Text ref={textRef} style={styles.text}>
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

export default function AnimTab1() {
  const navigation = useNavigation();
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('menus').then(e => {
      setMenus(e);
    });
  }, []);
  console.log('menus ==>', menus);
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        unmountOnBlur: true,
      }}>
      <Tab.Screen
        name={'HomeScreen'}
        component={DashboardStack}
        options={{
          tabBarShowLabel: true,

          tabBarButton: props => (
            <TabButton
              {...props}
              item={{
                route: 'HomeScreen',
                label: 'Home',
                type: 'feather',
                icon: 'home',
                component: DashboardStack,
              }}
              onPress={() => navigation.navigate('HomeScreen')}
            />
          ),
        }}
      />
      {menus.includes('M-DashBoard') && (
        <Tab.Screen
          name={'M-Dashboard'}
          component={MDashboardStack}
          options={{
            tabBarShowLabel: true,
            tabBarStyle: {
              display: 'none',
            },
            tabBarButton: props => (
              <TabButton
                {...props}
                item={{
                  route: 'M-Dashboard',
                  label: 'M-Dashboard',
                  type: 'material-community',
                  icon: 'view-dashboard',
                  component: MDashboardStack,
                }}
                onPress={() => navigation.navigate('M-Dashboard')}
              />
            ),
          }}
        />
      )}
      <Tab.Screen
        name={'R-Dashboard'}
        component={RDashboardStack}
        options={{
          tabBarShowLabel: true,
          tabBarStyle: {
            display: 'none',
          },
          tabBarButton: props => (
            <TabButton
              {...props}
              item={{
                route: 'R-Dashboard',
                label: 'R-Dashboard',
                type: 'material-community',
                icon: 'view-dashboard',
                component: RDashboardStack,
              }}
              onPress={() => navigation.navigate('R-Dashboard')}
            />
          ),
        }}
      />
      <Tab.Screen
        name={'Menu'}
        component={SideBar}
        options={{
          tabBarShowLabel: true,
          tabBarStyle: {
            display: 'none',
          },
          tabBarButton: props => (
            <TabButton
              {...props}
              item={{
                route: 'Menu',
                label: 'Menu',
                type: 'material-community',
                icon: 'menu',
                component: SideBar,
              }}
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    minHeight: 80,
    position: 'absolute',
    bottom: 16,
    right: 16,
    left: 16,
    borderRadius: 60,
    backgroundColor: Colors.button[0],
  },
  btn: {
    width: 45,
    height: 45,
    //borderRadius: 25,
    //borderWidth: 4,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 25,
  },
  text: {
    fontSize: 10,
    textAlign: 'center',
    color: Colors.white,
  },
});
