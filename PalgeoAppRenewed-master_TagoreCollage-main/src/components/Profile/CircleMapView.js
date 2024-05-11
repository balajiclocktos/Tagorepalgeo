import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import MapView, {Marker} from 'react-native-maps';
import Loader from '../common/Loader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Colors} from '../../utils/configs/Colors';
import SubHeader from '../common/DrawerHeader';
export default class MapFencing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      showAlert: false,
      radius: this.props.route?.params?.radius,
      coordinates: this.props.route?.params?.coordinates || {
        latitude: 78.333,
        longitude: 122.222,
      },
    };
  }
  goToMyProfile = () => {
    if (this.props.route?.params?.route === 'Home') {
      return this.props.navigation.navigate('Home');
    }
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
        <View style={{position: 'absolute', width: '100%', zIndex: 100}}>
          <SubHeader
            title={'Assigned Location'}
            showBack
            navigation={this.props.navigation}
          />
        </View>
        <MapView
          region={{
            latitude: parseFloat(
              this.props.route.params.coordinates[0].latitude,
            ),
            longitude: parseFloat(
              this.props.route.params.coordinates[0].longitude,
            ),
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }}
          style={styles.map}
          followUserLocation={true}
          mapType="standard"
          zoomEnabled={true}>
          <Marker
            coordinate={{
              latitude: parseFloat(
                this.props.route.params.coordinates[0].latitude,
              ),
              longitude: parseFloat(
                this.props.route.params.coordinates[0].longitude,
              ),
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
          />
          <MapView.Circle
            center={{
              latitude: parseFloat(
                this.props.route.params.coordinates[0].latitude,
              ),
              longitude: parseFloat(
                this.props.route.params.coordinates[0].longitude,
              ),
            }}
            radius={parseFloat(this.state.radius)}
            strokeWidth={2.5}
            strokeColor={'red'}
            fillColor={Colors.overlay}
          />
        </MapView>
        {/* <View style={{alignItems: 'center'}}>
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
        </View> */}
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
