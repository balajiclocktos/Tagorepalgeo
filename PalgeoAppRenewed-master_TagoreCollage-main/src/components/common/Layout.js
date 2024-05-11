import {Container, VStack} from 'native-base';
import React from 'react';
import {ScrollView} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import SubHeader from './SubHeader';
import DrawerHeader from '../common/DrawerHeader';
import {StatusBar} from 'react-native';
import {Platform} from 'react-native';
import {Colors} from '../../utils/configs/Colors';

const Layout = props => {
  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        alignItems: 'center',

        //paddingTop: Platform.OS === 'ios' ? 50 : 0,
      }}>
      {props.normal ? (
        <DrawerHeader
          title={props.headerTitle}
          showBack={props.goBack || true}
          backScreen={props.backScreen || 'HomeScreen'}
          showBell={false}
          navigation={props.navigation}
        />
      ) : (
        <SubHeader
          long={props.long}
          medium={props.medium}
          title={props.headerTitle}
          showBack={props.goBack || true}
          backScreen={props.backScreen || 'Home'}
          showBell={false}
          navigation={props.navigation}
        />
      )}
      {props.scroll ? (
        <ScrollView
          {...props}
          nestedScrollEnabled
          style={{flex: 1, width: props.width || '95%', alignSelf: 'center'}}
          contentContainerStyle={
            {
              // width: props.width || '95%',
              // alignSelf: 'center',
              // alignItems: 'center',
              //backgroundColor: 'yellow',
            }
          }>
          {props.children}
        </ScrollView>
      ) : (
        <View
          {...props}
          style={{
            width: props.width || '95%',
            alignSelf: 'center',
            flex: 1,
            //backgroundColor: 'yellow',
          }}>
          {props.children}
        </View>
      )}
    </View>
  );
};

export default Layout;

const styles = StyleSheet.create({});
