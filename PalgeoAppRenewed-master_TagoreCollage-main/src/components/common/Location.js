import React from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';

import MapView, {Marker} from 'react-native-maps';
import {Icon} from 'react-native-elements';
import Modal from 'react-native-modal';

const Location = props => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      //marginTop: 50,
    },
    locationContainer: {
      //height: 200,

      width: Number(props.accuracy) + 100,
      height: Number(props.accuracy) + 100,
      borderRadius: Number(props.accuracy) + 100,
      padding: 20,
      marginBottom: 10,
      backgroundColor: 'lightpink',
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    location: {
      width: 50,
      height: 50,
      tintColor: 'red',
    },
    locText: {
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
    },
    map: {
      height: 300,
      width: 300,
    },
  });

  const LAT_DELTA = 0.0015;
  const LONG_DELTA = 0.0015;

  return (
    // <View style={styles.container}>
    <Modal {...props} isVisible={props.isVisible}>
      {/* <View style={styles.locationContainer}>
        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Pin-location.png',
          }}
          style={styles.location}
        />
      </View> */}
      <View
        style={{
          //justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 10,
          //adding: '5%',
          paddingBottom: 10,
          //height: '80%',
        }}>
        <View style={styles.map}>
          <MapView
            region={{
              latitude: parseFloat(props.latitude),
              longitude: parseFloat(props.longitude),
              latitudeDelta: LAT_DELTA,
              longitudeDelta: LONG_DELTA,
            }}
            //onRegionChange={this.onRegionChange}
            style={{width: '100%', height: '100%'}}
            //mapType={'satellite'}
            followUserLocation={true}
            cacheEnabled={true}
            initialRegion={{
              latitude: parseFloat(props.latitude),
              longitude: parseFloat(props.longitude),
              latitudeDelta: LAT_DELTA,
              longitudeDelta: LONG_DELTA,
            }}
            scrollEnabled={false}
            zoomEnabled={true}>
            <Marker
              //draggable
              coordinate={{
                latitude: parseFloat(props.latitude),
                longitude: parseFloat(props.longitude),
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LONG_DELTA,
              }}
              title={'Your are here!'}>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                {/* <View style={styles.textContainer}>
                                <Text style={styles.subtext}>Long press to drag</Text>
                            </View> */}
                <Icon
                  name="map-marker"
                  type="font-awesome"
                  color={props.markerColor || 'red'}
                  size={30}
                />
              </View>
            </Marker>
            <MapView.Circle
              key={(props.latitude + props.longitude).toString()}
              center={{
                latitude: parseFloat(props.latitude),
                longitude: parseFloat(props.longitude),
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LONG_DELTA,
              }}
              radius={parseFloat(props.accuracy) || 0}
              strokeWidth={2}
              strokeColor={'red'}
              fillColor={'lightpink'}
            />
            {props.assignedLocations && (
              <Marker
                //draggable
                coordinate={{
                  latitude: parseFloat(props.latitude),
                  longitude: parseFloat(props.longitude),
                  latitudeDelta: LAT_DELTA,
                  longitudeDelta: LONG_DELTA,
                }}
                title={'Your are here!'}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  {/* <View style={styles.textContainer}>
                                <Text style={styles.subtext}>Long press to drag</Text>
                            </View> */}
                  <Icon
                    name="map-marker"
                    type="FontAwesome"
                    style={{color: 'red', fontSize: 30}}
                  />
                </View>
              </Marker>
            )}
          </MapView>
        </View>
        <Text style={styles.locText}>Accuracy: {props.accuracy} m</Text>
        <Text style={styles.locText}>{props.text}</Text>
        <ActivityIndicator
          style={{alignSelf: 'center', height: 40, width: 40}}
          size={40}
        />

        {/* <Text style={styles.locText}>{props.count.toString()}</Text> */}
      </View>
    </Modal>
    // </View>
  );
};

export default Location;
