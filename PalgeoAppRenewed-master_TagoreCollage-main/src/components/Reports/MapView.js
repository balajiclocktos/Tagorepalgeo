/////
/// TSMapView Component
/// Renders a MapView from react-native-maps.
/// - renders a marker for each recorded location
/// - renders currently monitored geofences
/// - renders markers showing geofence events (enter, exit, dwell)
/// - renders a PolyLine where the plugin has tracked the device.
///
import React from 'react';
import {StyleSheet, View} from 'react-native';

import MapView, {Marker, Polyline, Circle} from 'react-native-maps';

import BackgroundGeolocation from 'react-native-background-geolocation';
import {Colors} from '../../utils/configs/Colors';

/// A default empty location object for the MapView.
const UNDEFINED_LOCATION = {
  timestamp: '',
  latitude: 0,
  longitude: 0,
};

/// Zoom values for the MapView
const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.00421;

/// Color consts for MapView markers.
const STATIONARY_REGION_FILL_COLOR = 'rgba(200,0,0,0.2)';
const STATIONARY_REGION_STROKE_COLOR = 'rgba(200,0,0,0.2)';

const POLYLINE_STROKE_COLOR = 'rgba(32,64,255,0.6)';

const TSMapView = props => {
  const navigation = props.navigation;

  /// MapView State.
  const [markers, setMarkers] = React.useState([]);
  const [showsUserLocation, setShowsUserLocation] = React.useState(false);
  const [tracksViewChanges, setTracksViewChanges] = React.useState(false);
  const [followsUserLocation, setFollowUserLocation] = React.useState(false);
  const [mapScrollEnabled, setMapScrollEnabled] = React.useState(false);
  const [stationaryLocation, setStationaryLocation] =
    React.useState(UNDEFINED_LOCATION);
  const [mapCenter, setMapCenter] = React.useState({
    latitude: 45.518853,
    longitude: -73.60055,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [stationaryRadius, setStationaryRadius] = React.useState(200);
  const [coordinates, setCoordinates] = React.useState([]);
  const [stopZones, setStopZones] = React.useState([]);

  /// BackgroundGeolocation Events.
  const [location, setLocation] = React.useState(null);
  const [motionChangeEvent, setMotionChangeEvent] = React.useState(null);
  const [lastMotionChangeEvent, setLastMotionChangeEvent] =
    React.useState(null);
  const [enabled, setEnabled] = React.useState(false);

  /// Collection of BackgroundGeolocation event-subscriptions.
  const subscriptions = [];

  /// [Helper] Add a BackgroundGeolocation event subscription to collection
  const subscribe = subscription => {
    subscriptions.push(subscription);
  };
  /// [Helper] Iterate BackgroundGeolocation subscriptions and .remove() each.
  const unsubscribe = () => {
    subscriptions.forEach(subscription => subscription.remove());
    subscriptions.splice(0, subscriptions.length);
  };

  /// Register BackgroundGeolocation event-listeners.
  React.useEffect(() => {
    BackgroundGeolocation.getState().then(state => {
      setEnabled(state.enabled);
    });

    // All BackgroundGeolocation event-listeners use React.useState setters.
    subscribe(
      BackgroundGeolocation.onLocation(setLocation, error => {
        console.warn('[onLocation] ERROR: ', error);
      }),
    );
    subscribe(BackgroundGeolocation.onMotionChange(setMotionChangeEvent));
    subscribe(BackgroundGeolocation.onEnabledChange(setEnabled));

    return () => {
      // Important for with live-reload to remove BackgroundGeolocation event subscriptions.
      unsubscribe();
      clearMarkers();
    };
  }, []);

  /// onEnabledChange effect.
  ///
  React.useEffect(() => {
    onEnabledChange();
  }, [enabled]);

  /// onLocation effect.
  ///
  React.useEffect(() => {
    if (!location) return;
    onLocation();
  }, [location]);

  /// onMotionChange effect
  ///
  React.useEffect(() => {
    if (!motionChangeEvent) return;
    onMotionChange();
  }, [motionChangeEvent]);

  /// onLocation effect-handler
  /// Adds a location Marker to MapView
  ///
  const onLocation = () => {
    console.log('[location] - ', location);
    if (!location.sample) {
      addMarker(location);
    }
    setCenter(location);
  };

  /// GeofenceEvent effect-handler
  /// Renders geofence event markers to MapView.
  ///

  /// GeofencesChangeEvent effect-handler
  /// Renders/removes geofence markers to/from MapView
  ///

  /// EnabledChange effect-handler.
  /// Removes all MapView Markers when plugin is disabled.
  ///
  const onEnabledChange = () => {
    console.log('[onEnabledChange]', enabled);
    setShowsUserLocation(enabled);
    if (!enabled) {
      clearMarkers();
    }
  };

  /// onMotionChangeEvent effect-handler.
  /// show/hide the red stationary-geofence according isMoving
  ///
  const onMotionChange = async () => {
    console.log(
      '[onMotionChange] - ',
      motionChangeEvent.isMoving,
      motionChangeEvent.location,
    );
    let location = motionChangeEvent.location;

    let state = {
      isMoving: motionChangeEvent.isMoving,
    };
    if (motionChangeEvent.isMoving) {
      if (lastMotionChangeEvent) {
        setStopZones(previous => [
          ...previous,
          {
            coordinate: {
              latitude: lastMotionChangeEvent.location.coords.latitude,
              longitude: lastMotionChangeEvent.location.coords.longitude,
            },
            key: lastMotionChangeEvent.location.timestamp,
          },
        ]);
      }
      setStationaryRadius(0);
      setStationaryLocation(UNDEFINED_LOCATION);
    } else {
      let state = await BackgroundGeolocation.getState();
      let geofenceProximityRadius = state.geofenceProximityRadius || 1000;
      setStationaryRadius(
        state.trackingMode == 1 ? 200 : geofenceProximityRadius / 2,
      );
      setStationaryLocation({
        timestamp: location.timestamp,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
    setLastMotionChangeEvent(motionChangeEvent);
  };

  /// MapView Location marker-renderer.
  const renderMarkers = () => {
    let rs = [];
    markers.map(marker => {
      rs.push(
        <Marker
          key={marker.key}
          tracksViewChanges={tracksViewChanges}
          coordinate={marker.coordinate}
          anchor={{x: 0, y: 0.1}}
          title={marker.title}>
          <View style={[styles.markerIcon]} />
        </Marker>,
      );
    });
    return rs;
  };

  /// Render stop-zone markers -- small red circles where the plugin previously entered
  /// the stationary state.
  const renderStopZoneMarkers = () => {
    return stopZones.map(stopZone => (
      <Marker
        key={stopZone.key}
        tracksViewChanges={tracksViewChanges}
        coordinate={stopZone.coordinate}
        anchor={{x: 0, y: 0}}>
        <View style={[styles.stopZoneMarker]}></View>
      </Marker>
    ));
  };

  /// Render the list of current active geofences that BackgroundGeolocation is monitoring.

  /// Center the map.
  const setCenter = location => {
    setMapCenter({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  /// Add a location Marker to map.
  const addMarker = location => {
    const timestamp = new Date();
    const marker = {
      key: `${location.uuid}:${timestamp.getTime()}`,
      title: location.timestamp,
      heading: location.coords.heading,
      coordinate: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };

    setMarkers(previous => [...previous, marker]);
    setCoordinates(previous => [
      ...previous,
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    ]);
  };

  /// Returns a geofence marker for MapView

  /// Map pan/drag handler.
  const onMapPanDrag = () => {
    setFollowUserLocation(false);
    setMapScrollEnabled(true);
  };

  /// Map long-press handler for adding a geofence.

  /// Geofence press-handler.

  /// Clear all markers from the map when plugin is toggled off.
  const clearMarkers = () => {
    setCoordinates([]);
    setMarkers([]);
    setStopZones([]);
    setStationaryRadius(0);
  };

  return (
    <MapView
      showsUserLocation={showsUserLocation}
      region={mapCenter}
      followsUserLocation={false}
      //onLongPress={onLongPress}
      onPanDrag={onMapPanDrag}
      scrollEnabled={mapScrollEnabled}
      showsMyLocationButton={false}
      showsPointsOfInterest={false}
      showsScale={false}
      showsTraffic={false}
      style={styles.map}
      toolbarEnabled={false}>
      <Circle
        key={'stationary-location:' + stationaryLocation.timestamp}
        radius={stationaryRadius}
        fillColor={STATIONARY_REGION_FILL_COLOR}
        strokeColor={STATIONARY_REGION_STROKE_COLOR}
        strokeWidth={1}
        center={{
          latitude: stationaryLocation.latitude,
          longitude: stationaryLocation.longitude,
        }}
      />
      <Polyline
        key="polyline"
        coordinates={coordinates}
        geodesic={true}
        strokeColor="rgba(0,179,253, 0.6)"
        strokeWidth={6}
        zIndex={0}
      />
      {renderMarkers()}
      {renderStopZoneMarkers()}
    </MapView>
  );
};

export default TSMapView;

var styles = StyleSheet.create({
  container: {
    backgroundColor: '#272727',
  },
  map: {
    flex: 1,
  },
  stopZoneMarker: {
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: Colors.red,
    opacity: 0.2,
    borderRadius: 15,
    zIndex: 0,
    width: 30,
    height: 30,
  },
  geofenceHitMarker: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 6,
    zIndex: 10,
    width: 12,
    height: 12,
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: 'red',
    //backgroundColor: 'rgba(0,179,253, 0.6)',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
