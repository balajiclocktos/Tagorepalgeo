import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Icon} from 'react-native-elements';
import MapView, {Marker} from 'react-native-maps';
import Loader from '../common/Loader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import MapViewDirections from 'react-native-maps-directions';
import {GOOGLE_MAPS_APIKEY} from '../../utils/configs/Constants';
import {Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native';
const {width, height} = Dimensions.get('window');
export default class DistanceMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      showAlert: false,
    };
  }
  goToMyProfile = () => {
    this.props.navigation.navigate('LocateMenu');
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <SafeAreaView style={styles.container}>
        <MapView
          ref={c => (this.mapView = c)}
          //   region={{
          //     latitude: parseFloat(
          //       this.props.route.params.current_coordinates.latitude,
          //     ),
          //     longitude: parseFloat(
          //       this.props.route.params.current_coordinates.longitude,
          //     ),
          //     latitudeDelta: 0.001,
          //     longitudeDelta: 0.001,
          //   }}
          style={styles.map}
          followUserLocation={true}
          zoomEnabled={true}>
          <Marker coordinate={this.props.route.params.current_coordinates}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <View style={styles.textContainer}>
                <Text style={styles.subtext}>Your are here!</Text>
              </View>
              <Icon
                name="map-marker"
                type="font-awesome"
                color={'red'}
                size={30}
              />
            </View>
          </Marker>

          <Marker coordinate={this.props.route.params.coordinates}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <View style={styles.textContainer}>
                <Text style={styles.subtext}>
                  {this.props.route.params.staffName}
                </Text>
              </View>
              <Icon
                name="map-marker"
                type="font-awesome"
                color={'blue'}
                size={30}
              />
            </View>
          </Marker>
          <MapViewDirections
            //optimizeWaypoints
            onStart={params => {
              this.setState({
                showAlert: true,
                message: `Routing...`,
              });
            }}
            onReady={result => {
              this.setState({
                showAlert: false,
                // distance: result.distance,
              });
              this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: width / 20,
                  bottom: height / 20,
                  left: width / 20,
                  top: height / 20,
                },
              });
              // console.log(`Distance: ${result.distance} km`);
              // console.log(`Duration: ${result.duration} min.`);
            }}
            onError={err => alert('Error fetching path: ' + err)}
            origin={this.props.route.params.current_coordinates}
            //waypoints={inn}
            // splitWaypoints={true}
            destination={this.props.route.params.coordinates}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={1}
            strokeColor="red"
          />
        </MapView>
        <View style={{alignItems: 'center'}}>
          <View style={styles.footerContainer}>
            <View style={{flexDirection: 'row'}}>
              <TouchableWithoutFeedback onPress={this.goToMyProfile}>
                <View style={styles.buttonContainer}>
                  <Icon
                    name="angle-left"
                    type="font-awesome"
                    color="#ffffff"
                    size={23}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    backgroundColor: '#089bf9',
    padding: '4%',
    borderRadius: 5,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
  },
  subtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    color: '#ffffff',
  },
  searchContainer: {
    position: 'absolute',
    zIndex: 99999,
    padding: '4%',
    borderRadius: 5,
    width: '100%',
  },
  sliderContainer: {
    backgroundColor: '#089bf9',
    paddingTop: '2%',
    paddingBottom: '5%',
    paddingLeft: '4%',
    paddingRight: '4%',
    borderRadius: 15,
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#ffffff',
  },
  label1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#c9c3c5',
    paddingLeft: wp('3'),
  },
  labelContainer: {
    marginLeft: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('6'),
    backgroundColor: '#ffffff',
  },
  item: {
    borderRadius: 10,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    height: hp('6'),
    backgroundColor: '#ffffff',
  },
  footerContainer: {
    position: 'absolute',
    zIndex: 99999,
    top: 10,
    left: 15,
  },
  buttonContainer: {
    backgroundColor: '#f05760',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 50 / 2,
  },
  buttonContainer1: {
    backgroundColor: '#089bf9',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    borderRadius: 50 / 2,
    marginLeft: 10,
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
});
