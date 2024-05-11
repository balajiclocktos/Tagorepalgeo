import React, {Component, useState} from 'react';
import {View, StyleSheet} from 'react-native';

import SubHeader from '../common/DrawerHeader';
import {Colors} from '../../utils/configs/Colors';
import NormalReport from '../Reports/NormalReport';
import TravelReport from '../Reports/NewTravelReport';
import {TabView, SceneMap} from 'react-native-tab-view';
import {Dimensions} from 'react-native';
//var p = current.setDate(current.getDate() - 1);
const Home = props => {
  const [routes, setRoutes] = useState([
    {key: 'first', title: 'Simple Check-in'},
    {key: 'second', title: 'Travel Check-in'},
  ]);
  const [index, setIndex] = useState(0);
  const renderScene = SceneMap({
    first: () => <NormalReport />,
    second: () => <TravelReport navigation={props.navigation} />,
  });
  return (
    <View style={styles.container}>
      <SubHeader
        title="Reports"
        showBack={true}
        backScreen="Tab"
        navigation={props.navigation}
      />
      <TabView
        sceneContainerStyle={
          {
            // flex: 1,
            // backgroundColor: 'white',
            //marginBottom: 100,
          }
        }
        navigationState={{
          index,
          routes,
        }}
        renderScene={renderScene}
        onIndexChange={index => {
          setIndex(index);
        }}
        initialLayout={{width: Dimensions.get('window').width}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
});

export default Home;
