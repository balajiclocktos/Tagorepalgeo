import React, {Component} from 'react';
import {View, StyleSheet, Text, Modal, Image} from 'react-native';
import {Input, Icon} from 'react-native-elements';
import MapView, {Marker, Animated, AnimatedRegion} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Loader from './common/Loader';

import AwesomeAlert from 'react-native-awesome-alerts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import ModalForAccuracy from './common/Modal';
import {
  GOOGLE_MAPS_APIKEY,
  GOOGLE_MAPS_APIKEY_IOS,
} from '../utils/configs/Constants';
import {CustomButton} from './common/CustomButton';
import {Colors} from '../utils/configs/Colors';

import axios from 'axios';
import CustomModal from './common/CustomModal';
import CustomLabel from './common/CustomLabel';

//import AwesomeAlert from 'react-native-awesome-alerts';
const LAT_DELTA = 0.001;
const LONG_DELTA = 0.001;
export default class MapFencing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      coordinates: {
        latitude: 22.5677,
        longitude: 78.4555,
        latitudeDelta: 0.000922,
        longitudeDelta: 0.000421,
      },
      region: new AnimatedRegion({
        latitude: 22.5677,
        longitude: 78.4555,
        latitudeDelta: LAT_DELTA,
        longitudeDelta: LONG_DELTA,
      }),
      latitude: this.props.route?.params?.coordinates?.latitude,
      longitude: this.props.route?.params?.coordinates?.longitude,
      showAlert: false,
      radius: '10',
      accuracy: '',
      showAlert1: true,
      error_message: 'Please wait.. Fetching location',
      modal: false,
      position: {},
      satellite: false,
      height: '0%',
    };
    this.watchId = null;
  }

  componentDidMount() {
    this.getCurrentLocation();
    this.timer = setTimeout(() => this.setState({height: '100%'}), 0);
    setTimeout(
      () => {
        this.setState({loader: false});
      },

      1000,
    );
    //setTimeout(() => {
    //Geolocation.clearWatch(this.watchID);
    setTimeout(() => this.setState({showAlert1: false}), 1300);

    //   if (this.state.accuracy > 20) {
    //     setTimeout(() => this.setState({modal: true}),1400)
    //     console.log('Modal true');
    //     return;
    //   }
    // }, 20000);
    // this.watchID = Geolocation.watchPosition(
    //   (position) => {
    //     console.log('PROGESS...', position.coords.accuracy);
    //     this.setState({accuracy: position.coords.accuracy});
    //     if (position.coords.accuracy <= 10) {
    //       Geolocation.clearWatch(this.watchID);
    //       console.log('MATCHED...', position.coords.accuracy);
    //       const currentLongitude = JSON.stringify(position.coords.longitude);
    //       const currentLatitude = JSON.stringify(position.coords.latitude);
    //       var coordinates = {
    //         latitude: parseFloat(currentLatitude),
    //         longitude: parseFloat(currentLongitude),
    //         latitudeDelta: 0.000922,
    //         longitudeDelta: 0.000421,
    //       };
    //       // console.log(coordinates);
    //       this.setState({coordinates: coordinates, loader: false});
    //       this.setState({
    //         accuracy: position.coords.accuracy,
    //         showAlert1: false,
    //       });
    //       return;
    //     }
    //   },
    //   (e) => {
    //     console.log(e);
    //     //alert('no current location found');
    //   },
    //   {
    //     enableHighAccuracy: true,
    //     distanceFilter: 0,
    //     fastestInterval: 1000,
    //     interval: 2000,
    //   },
    // );
    //console.log('object===', this.watchId);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    // Geolocation.clearWatch(this.watchId);
  }

  goToSaveFencing = manualFence => {
    let {coordinates} = this.state;
    // if (manualFence) {
    coordinates = {
      ...coordinates,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    };
    //}

    if (parseFloat(this.state.radius) < 10) {
      return alert('Radius cannot be less than 10 m');
    }
    this.setState({showManualFenceModal: false}, () =>
      this.props.navigation.navigate('SaveFencing', {
        id: null,
        accessLocation: null,
        institute_id: this.props.route.params.institute_id,
        radius: this.state.radius,
        coordinates,
      }),
    );
  };
  goToFencingList = () => {
    this.props.navigation.navigate('FencingList', {
      institute_id: this.props.route.params.institute_id,
    });
  };
  goToInstitueList = () => {
    this.props.navigation.navigate('SelectInstitute', {
      institute_id: this.props.route.params.institute_id,
    });
  };
  getCurrentLocation = () => {
    this.callLocation();

    // this.interval = setInterval(() => {
    //   this.callLocation();
    // }, 4000);
  };
  callLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log('accuracy===2', position.coords.accuracy);
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        var coordinates = {
          latitude: parseFloat(currentLatitude),
          longitude: parseFloat(currentLongitude),
          latitudeDelta: 0.000922,
          longitudeDelta: 0.000421,
        };
        if (position.coords.accuracy > 20) {
          alert(
            'Your GPS accuracy is more than 20 m. Geofence created will not be accurate. Search your place and mark your geofence correctly.',
          );
        }
        // console.log(coordinates);
        this.setState({coordinates: coordinates, loader: false});
      },
      error => {
        console.log(error);
        alert(
          'Unable to retrieve current location. Refresh your location services and try again.',
        );
      },
      {
        enableHighAccuracy: true,
        accuracy: 'high',
        // interval: 1000,
        // fastestInterval: 1000,
        distanceFilter: 0,

        timeout: 5000,
        maximumAge: 0,
      },
    );
  };
  onRegionChange(region) {
    this.state.region.setValue(region);
  }

  showStreetView = async event => {
    console.log('event', event.nativeEvent.coordinate);
    const {latitude, longitude} = event.nativeEvent.coordinate;
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?key=${GOOGLE_MAPS_APIKEY}&location=${latitude},${longitude}`;
    const response = await axios.get(url);
    console.log('response', response.data);
  };

  goToManualFenceCreation = () => {
    this.setState({showManualFenceModal: true});
  };

  showOnmap = radius => {
    console.log('rr', radius);
    const latitude = parseFloat(this.state.latitude);
    const longitude = parseFloat(this.state.longitude);
    this.setState({
      showManualFenceModal: false,
      radius,
      coordinates: {
        ...this.state.coordinates,
        latitude,
        longitude,
      },
    });
  };

  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    console.log('FINAL_ACCURACY', this.state.accuracy);
    // console.log('FINAL', this.state.coordinates);
    return (
      <>
        {this.state.showManualFenceModal ? (
          <View style={{flex: 1}}>
            <CustomModal
              title={'Manual Geofence'}
              subTitle={'Enter Latitude, Longitude and Geofence Radius'}
              isVisible={this.state.showManualFenceModal}
              deleteIconPress={() =>
                this.setState({showManualFenceModal: false})
              }>
              <View>
                <CustomLabel title="Latitute" />
                <View regular style={styles.item}>
                  <Input
                    inputContainerStyle={styles.input}
                    value={this.state.latitude.toString()}
                    onChangeText={latitude => {
                      this.setState({
                        latitude,
                      });
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View>
                <CustomLabel title={'Longitude'} />
                <View regular style={styles.item}>
                  <Input
                    inputContainerStyle={styles.input}
                    value={this.state.longitude.toString()}
                    onChangeText={longitude => {
                      this.setState({
                        longitude,
                      });
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View>
                <CustomLabel title={'Radius'} />
                <View regular style={styles.item}>
                  <Input
                    inputContainerStyle={styles.input}
                    value={this.state.radius}
                    onChangeText={radius => {
                      this.setState({
                        radius: radius,
                      });
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <CustomButton
                color={Colors.header}
                title={'Save'}
                //onPress={() => this.goToSaveFencing(true)}
                onPress={() => this.showOnmap(this.state.radius.toString())}
              />
            </CustomModal>
          </View>
        ) : (
          // <ModalForAccuracy
          //   visible={this.state.modal}
          //   onClose={() => this.props.navigation.goBack()}
          //   //onClose={() => this.setState({modal: false})}
          //   onPress={() => this.props.navigation.goBack()}
          //   accuracy={Math.round(Number(this.state.accuracy)).toString()}
          //   mapfencing
          // />
          <View style={styles.container}>
            <AwesomeAlert
              show={this.state.showAlert1}
              showProgress={true}
              title="Attention"
              message={this.state.error_message}
              closeOnTouchOutside={false}
              closeOnHardwareBackPress={false}
              //showCancelButton={true}
              cancelText="Okay"
              onCancelPressed={() => {
                this.setState({showAlert1: false});
              }}
              cancelButtonColor="#f05760"
              cancelButtonTextStyle={{
                fontFamily: 'Poppins-Regular',
                fontSize: 13,
              }}
              messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
              titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
            />

            {/* <MapView
              //region={this.state.region}
              //onRegionChange={this.onRegionChange}
              style={styles.map}
              provider={'google'}
              mapType={this.state.satellite ? 'hybrid' : 'standard'}
              followUserLocation={true}
              cacheEnabled={true}
              //initialRegion={this.state.region}
              showsUserLocation
              //onLongPress={(event) => this.showStreetView(event)}
              showsCompass={true}
              showsMyLocationButton
              scrollEnabled
              zoomEnabled={true}> */}
            <Animated
              style={styles.map}
              region={this.state.region}
              onRegionChange={this.onRegionChange}></Animated>
            <View style={{alignItems: 'center'}}>
              <AwesomeAlert
                show={this.state.showAlert}
                showProgress={true}
                title="Loading"
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
              />
              <View style={styles.searchContainer}>
                <View style={styles.sliderContainer}>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        margin: '3%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>Circle Radius</Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <TouchableWithoutFeedback
                          onPress={this.goToInstitueList}>
                          <View style={styles.buttonContainer}>
                            <Icon
                              name="angle-left"
                              type="font-awesome"
                              color="#f05760"
                              fontSize={22}
                            />
                          </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          onPress={this.goToFencingList}>
                          <View style={styles.buttonContainer1}>
                            <Icon name="list" color="#f05760" fontSize={14} />
                          </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          onPress={this.goToManualFenceCreation}>
                          <View style={styles.buttonContainer1}>
                            <Icon
                              name="location-arrow"
                              type="font-awesome"
                              color="#f05760"
                              fontSize={14}
                            />
                          </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback
                          onPress={this.goToSaveFencing}>
                          <View style={styles.buttonContainer1}>
                            <Icon
                              name="floppy-o"
                              type="font-awesome"
                              color="#f05760"
                              fontSize={15}
                            />
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </View>
                    <View>
                      <View regular style={styles.item}>
                        <Input
                          inputContainerStyle={styles.input}
                          value={this.state.radius}
                          onChangeText={radius => {
                            this.setState({
                              radius: radius,
                            });
                          }}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                  <View></View>

                  {/* <GooglePlacesAutocomplete
                    styles={{
                      textInputContainer: {
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderTopWidth: 0,
                        borderBottomWidth: 0,
                        borderRadius: 10,
                        marginTop: 10,
                      },
                      textInput: {
                        marginLeft: 0,
                        marginRight: 0,
                        height: 35,
                        fontSize: 16,
                        height: 42,
                        borderWidth: 0,
                        borderColor: 'grey',
                        borderRadius: 10,
                        padding: 10,
                      },
                      listView: {
                        backgroundColor: '#ffffff',
                        width: '100%',
                      },
                      poweredContainer: {
                        backgroundColor: '#ffffff',
                      },
                      predefinedPlacesDescription: {
                        color: '#1faadb',
                      },
                    }}
                    placeholder="Search Locations..."
                    onPress={(data, details = null) => {
                      this.setState({showAlert: true});
                      console.log('data=', data);
                      fetch(
                        'https://maps.googleapis.com/maps/api/geocode/json?place_id=' +
                          data.place_id +
                          '&key=' +
                          GOOGLE_MAPS_APIKEY,
                        {
                          method: 'GET',
                        },
                      )
                        .then((response) => response.json())
                        .then((json) => {
                          try {
                            var coordinates = {
                              latitude: parseFloat(
                                json['results'][0].geometry.location.lat,
                              ),
                              longitude: parseFloat(
                                json['results'][0].geometry.location.lng,
                              ),
                            };
                            this.setState({
                              coordinates: {
                                ...this.state.coordinates,
                                latitude: coordinates.latitude,
                                longitude: coordinates.longitude,
                              },
                              showAlert: false,
                            });
                          } catch (e) {
                            console.log(e);
                          }
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    }}
                    query={{
                      key: GOOGLE_MAPS_APIKEY,
                      language: 'en',
                    }}
                  /> */}
                  {/* <View
                    style={{
                      //flexDirection: 'row',
                      margin: '3%',
                      //justifyContent: 'center',
                      //alignItems: 'center',
                    }}>
                    <View style={styles.labelContainer}>
                      <Text style={styles.label}>Map View</Text>
                    </View>
                  </View> */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({satellite: !this.state.satellite})
                      }>
                      <View
                        regular
                        style={{
                          ...styles.item,
                          width: wp('30%'),
                          padding: 10,
                          marginBottom: 10,
                        }}>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 15,
                            textAlign: 'center',
                            fontWeight: '600',
                            fontFamily: 'Poppins-Regular',
                          }}>
                          {this.state.satellite ? 'Satellite' : 'Standard'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <CustomButton
                      buttonStyle={{alignSelf: 'flex-end'}}
                      title={'Locate Me'}
                      onPress={this.callLocation}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </>
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
    backgroundColor: '#f05760',
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
    backgroundColor: '#f05760',
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
    width: wp('50'),
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    paddingLeft: '5%',
    borderRadius: 10,
    //height: hp('6'),
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
    top: 600,
    right: 25,
  },
  buttonContainer: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30,
    borderRadius: 30 / 2,
  },
  buttonContainer1: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30,
    borderRadius: 30 / 2,
    marginLeft: 10,
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    width: wp('100%'),
    height: hp('100%'),
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
