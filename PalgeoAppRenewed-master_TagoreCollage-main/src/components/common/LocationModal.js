import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Icon} from 'native-base';
import MapView, {Marker} from 'react-native-maps';
import {Colors} from '../../utils/configs/Colors';
import CustomMap from './CustomMap';
import CustomModal from './CustomModal';
import CustomLabel from './CustomLabel';
import {CustomButton} from './CustomButton';
const LAT_DELTA = 0.05;
const LONG_DELTA = 0.05;
const LocationModal = (props) => {
  return (
    <CustomModal
      title={props.title}
      subTitle={props.subTitle}
      isVisible={props.isVisible}
      headerTextStyle={{textAlign: 'center'}}
      deleteIconPress={props.deleteIconPress}>
      <CustomMap
        scrollEnabled
        //markerColor={'green'}
        //markerTitle={'You are here'}
        latitude={props.latitude}
        longitude={props.longitude}
        photo={props.photo}
        //radius={props.radius}
      >
        {props.assignedLocations?.length > 0 &&
          props.assignedLocations.map((each) => {
            return (
              <>
                <Marker
                  //draggable
                  coordinate={{
                    latitude: parseFloat(each.coordinates[0].latitude),
                    longitude: parseFloat(each.coordinates[0].longitude),
                    latitudeDelta: LAT_DELTA,
                    longitudeDelta: LONG_DELTA,
                  }}>
                  <View
                    style={{alignItems: 'center', justifyContent: 'center'}}>
                    <CustomLabel
                      labelStyle={{color: Colors.header}}
                      title={each.accessLocation}
                    />
                    <Icon
                      name="map-marker"
                      type="FontAwesome"
                      style={{color: Colors.header, fontSize: 30}}
                    />
                  </View>
                </Marker>
                <MapView.Circle
                  key={(
                    each.coordinates[0].latitude + each.coordinates[0].longitude
                  ).toString()}
                  center={{
                    latitude: parseFloat(each.coordinates[0].latitude),
                    longitude: parseFloat(each.coordinates[0].longitude),
                    latitudeDelta: LAT_DELTA,
                    longitudeDelta: LONG_DELTA,
                  }}
                  radius={parseFloat(each.radius) || 25}
                  strokeWidth={2}
                  strokeColor={'black'}
                  fillColor={Colors.maroon}
                />
              </>
            );
          })}
      </CustomMap>
      <CustomLabel
        labelStyle={{textAlign: 'center'}}
        title={'You are not in any of your assigned locations.'}
      />
      {/* <CustomButton
        color={Colors.header}
        title={'Retry'}
        onPress={props.onPressRetry}
      /> */}
    </CustomModal>
  );
};

export default LocationModal;

const styles = StyleSheet.create({});
