import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {Icon} from 'native-base';
import MapView from 'react-native-maps';
import Loader from '../common/Loader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
export default class MapFencing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      coordinates: {
        latitude: this.props.route.params.coordinates[0].latitude,
        longitude: this.props.route.params.coordinates[0].latitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      showAlert: false,
      polygon: this.props.route.params.coordinates,
    };
  }
  goToMyProfile = () => {
    if (this.props.route?.params?.back) {
      return this.props.navigation.goBack();
    }
    this.props.navigation.navigate('MyProfile');
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <MapView
          region={{
            latitude: parseFloat(this.state.polygon[0].latitude),
            longitude: parseFloat(this.state.polygon[0].longitude),
            latitudeDelta: 0.0025,
            longitudeDelta: 0.0025,
          }}
          style={styles.map}
          followUserLocation={true}
          zoomEnabled={true}>
          <MapView.Polygon
            coordinates={this.state.polygon}
            fillColor="grey"
            strokeColor="red"
            strokeWidth={2}
          />
        </MapView>
        <View style={{alignItems: 'center'}}>
          <View style={styles.footerContainer}>
            <View style={{flexDirection: 'row'}}>
              <TouchableWithoutFeedback onPress={this.goToMyProfile}>
                <View style={styles.buttonContainer}>
                  <Icon
                    name="angle-left"
                    type="FontAwesome"
                    style={{color: '#ffffff', fontSize: 22}}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </View>
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
