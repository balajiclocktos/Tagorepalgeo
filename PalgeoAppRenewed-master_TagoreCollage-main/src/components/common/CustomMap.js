import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import MapView, {Marker} from 'react-native-maps';

import {Avatar} from 'react-native-elements';
import CustomLabel from './CustomLabel';
import {Colors} from '../../utils/configs/Colors';
const LAT_DELTA = 0.05;
const LONG_DELTA = 0.05;
const CustomMap = props => {
  const [region, setRegion] = useState({
    latitude: parseFloat(props.latitude),
    longitude: parseFloat(props.longitude),
    latitudeDelta: LAT_DELTA,
    longitudeDelta: LONG_DELTA,
  });
  const styles = StyleSheet.create({
    map: {
      height: props.height || 300,
      width: props.width || '100%',
      // zIndex: props.zIndex,
    },
  });
  console.log('region', region);
  return (
    <View style={styles.map}>
      <MapView
        region={{
          latitude: parseFloat(props.latitude),
          longitude: parseFloat(props.longitude),
          latitudeDelta: props.latitudeDelta || LAT_DELTA,
          longitudeDelta: props.longitudeDelta || LONG_DELTA,
        }}
        onRegionChange={region => setRegion(region)}
        style={{width: '100%', height: '100%'}}
        mapType={props.mapType || 'standard'}
        followUserLocation={true}
        showsUserLocation
        cacheEnabled={true}
        initialRegion={{
          latitude: parseFloat(props.latitude),
          longitude: parseFloat(props.longitude),
          latitudeDelta: LAT_DELTA,
          longitudeDelta: LONG_DELTA,
        }}
        scrollEnabled={props.scrollEnabled || false}
        zoomEnabled={true}>
        <>
          <Marker
            draggable={props.draggable}
            onRegionChange={region => setRegion(region)}
            coordinate={region}
            title={props.markerTitle || 'Customer location'}>
            {!props.appointment && (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <CustomLabel
                  containerStyle={{
                    borderWidth: 2,
                    borderColor: Colors.header,
                    padding: 2,
                  }}
                  title={'You are here'}
                />
                <Avatar
                  rounded
                  source={{uri: props.photo || ''}}
                  size={'small'}
                />
              </View>
            )}
          </Marker>
          {props.radius && (
            <MapView.Circle
              key={(props.latitude + props.longitude).toString()}
              center={{
                latitude: parseFloat(props.latitude),
                longitude: parseFloat(props.longitude),
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LONG_DELTA,
              }}
              radius={parseFloat(props.radius) || 25}
              strokeWidth={2}
              strokeColor={'red'}
              fillColor={'lightpink'}
            />
          )}
        </>
      </MapView>
      {props.children}
    </View>
  );
};

export default CustomMap;
