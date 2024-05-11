// import React, {Component} from 'react';
// import {
//   View,
//   StyleSheet,
//   Text,
//   Modal,
//   Image,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import {Item, Input, Icon} from 'native-base';
// import MapView, {Marker} from 'react-native-maps';
// import Geolocation from 'react-native-geolocation-service';
// import Loader from './common/Loader';
// //import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
// import AwesomeAlert from 'react-native-awesome-alerts';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {
//   TouchableHighlight,
//   TouchableOpacity,
// } from 'react-native-gesture-handler';
// import ModalForAccuracy from './common/Modal';
// import {
//   GOOGLE_MAPS_APIKEY,
//   GOOGLE_MAPS_APIKEY_IOS,
// } from '../utils/configs/Constants';
// import {CustomButton} from './common/CustomButton';
// import {Colors} from '../utils/configs/Colors';

// import axios from 'axios';
// import CustomModal from './common/CustomModal';
// import CustomLabel from './common/CustomLabel';

// //import AwesomeAlert from 'react-native-awesome-alerts';
// const LAT_DELTA = 0.001;
// const LONG_DELTA = 0.001;
// export default class MapFencing extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       loader: true,
//       coordinates: {
//         latitude: this.props.route.params.coordinates.latitude,
//         longitude: this.props.route.params.coordinates.longitude,
//         latitudeDelta: 0.000922,
//         longitudeDelta: 0.000421,
//       },
//       region: {},
//       latitude: this.props.route.params.coordinates.latitude,
//       longitude: this.props.route.params.coordinates.longitude,
//       showAlert: false,
//       radius: '10',
//       accuracy: '',
//       showAlert1: true,
//       error_message: 'Please wait.. Fetching location',
//       modal: false,
//       position: {},
//       satellite: false,
//       height: '0%',
//     };
//   }
//   componentDidMount() {
//     //this.getCurrentLocation();
//     this.timer = setTimeout(() => this.setState({height: '100%'}), 0);
//     setTimeout(() => this.setState({loader: false}), 1200);
//     //setTimeout(() => {
//     //Geolocation.clearWatch(this.watchID);
//     setTimeout(() => this.setState({showAlert1: false}), 1300);

//     //   if (this.state.accuracy > 20) {
//     //     setTimeout(() => this.setState({modal: true}),1400)
//     //     console.log('Modal true');
//     //     return;
//     //   }
//     // }, 20000);
//     // this.watchID = Geolocation.watchPosition(
//     //   (position) => {
//     //     console.log('PROGESS...', position.coords.accuracy);
//     //     this.setState({accuracy: position.coords.accuracy});
//     //     if (position.coords.accuracy <= 10) {
//     //       Geolocation.clearWatch(this.watchID);
//     //       console.log('MATCHED...', position.coords.accuracy);
//     //       const currentLongitude = JSON.stringify(position.coords.longitude);
//     //       const currentLatitude = JSON.stringify(position.coords.latitude);
//     //       var coordinates = {
//     //         latitude: parseFloat(currentLatitude),
//     //         longitude: parseFloat(currentLongitude),
//     //         latitudeDelta: 0.000922,
//     //         longitudeDelta: 0.000421,
//     //       };
//     //       // console.log(coordinates);
//     //       this.setState({coordinates: coordinates, loader: false});
//     //       this.setState({
//     //         accuracy: position.coords.accuracy,
//     //         showAlert1: false,
//     //       });
//     //       return;
//     //     }
//     //   },
//     //   (e) => {
//     //     console.log(e);
//     //     //alert('no current location found');
//     //   },
//     //   {
//     //     enableHighAccuracy: true,
//     //     distanceFilter: 0,
//     //     fastestInterval: 1000,
//     //     interval: 2000,
//     //   },
//     // );
//     //console.log('object===', this.watchId);
//   }

//   componentWillUnmount() {
//     clearInterval(this.timer);
//   }

//   goToSaveFencing = manualFence => {
//     let {coordinates} = this.state;
//     // if (manualFence) {
//     coordinates = {
//       ...coordinates,
//       latitude: this.state.latitude,
//       longitude: this.state.longitude,
//     };
//     //}

//     if (parseFloat(this.state.radius) < 10) {
//       return alert('Radius cannot be less than 10 m');
//     }
//     this.setState({showManualFenceModal: false}, () =>
//       this.props.navigation.navigate('SaveFencing', {
//         id: null,
//         accessLocation: null,
//         institute_id: this.props.route.params.institute_id,
//         radius: this.state.radius,
//         coordinates,
//       }),
//     );
//   };
//   goToFencingList = () => {
//     this.props.navigation.navigate('FencingList', {
//       institute_id: this.props.route.params.institute_id,
//     });
//   };
//   goToInstitueList = () => {
//     this.props.navigation.navigate('SelectInstitute', {
//       institute_id: this.props.route.params.institute_id,
//     });
//   };
//   getCurrentLocation = async () => {
//     this.callLocation();
//     // this.interval = setInterval(() => {
//     //   this.callLocation();
//     // }, 4000);
//   };
//   callLocation = () => {
//     Geolocation.getCurrentPosition(
//       position => {
//         console.log('accuracy===2', position.coords.accuracy);
//         const currentLongitude = JSON.stringify(position.coords.longitude);
//         const currentLatitude = JSON.stringify(position.coords.latitude);
//         var coordinates = {
//           latitude: parseFloat(currentLatitude),
//           longitude: parseFloat(currentLongitude),
//           latitudeDelta: 0.000922,
//           longitudeDelta: 0.000421,
//         };
//         if (position.coords.accuracy > 20) {
//           alert(
//             'Your GPS accuracy is more than 20 m. Geofence created will not be accurate. Search your place and mark your geofence correctly.',
//           );
//         }
//         // console.log(coordinates);
//         this.setState({coordinates: coordinates, loader: false});
//       },
//       error => {
//         console.log(error);
//         alert(
//           'Unable to retrieve current location. ' +
//             JSON.stringify(error.message),
//         );
//       },
//       {
//         enableHighAccuracy: true,
//         accuracy: 'high',
//         timeout: 5000,
//         maximumAge: 0,
//       },
//     );
//   };
//   onRegionChange = region => {
//     console.log('region_change', region);
//     this.setState({region: region});
//   };

//   showStreetView = async event => {
//     console.log('event', event.nativeEvent.coordinate);
//     const {latitude, longitude} = event.nativeEvent.coordinate;
//     const url = `https://maps.googleapis.com/maps/api/streetview/metadata?key=${GOOGLE_MAPS_APIKEY}&location=${latitude},${longitude}`;
//     const response = await axios.get(url);
//     console.log('response', response.data);
//   };

//   goToManualFenceCreation = () => {
//     this.setState({showManualFenceModal: true});
//   };

//   showOnmap = radius => {
//     const latitude = parseFloat(this.state.latitude);
//     const longitude = parseFloat(this.state.longitude);
//     this.setState({
//       showManualFenceModal: false,
//       coordinates: {
//         ...this.state.coordinates,
//         latitude,
//         radius,
//         longitude,
//       },
//     });
//   };

//   render() {
//     if (this.state.loader) {
//       return <Loader />;
//     }
//     console.log('FINAL_ACCURACY', this.state.accuracy);
//     // console.log('FINAL', this.state.coordinates);
//     return (
//       <>
//         {this.state.showManualFenceModal ? (
//           <View style={{flex: 1}}>
//             <CustomModal
//               title={'Manual Geofence'}
//               subTitle={'Enter Latitude, Longitude and Geofence Radius'}
//               isVisible={this.state.showManualFenceModal}
//               deleteIconPress={() =>
//                 this.setState({showManualFenceModal: false})
//               }>
//               <View>
//                 <CustomLabel title="Latitute" />
//                 <Item regular style={styles.item}>
//                   <Input
//                     style={styles.input}
//                     value={this.state.latitude}
//                     onChangeText={latitude => {
//                       this.setState({
//                         latitude,
//                       });
//                     }}
//                     keyboardType="numeric"
//                   />
//                 </Item>
//               </View>
//               <View>
//                 <CustomLabel title={'Longitude'} />
//                 <Item regular style={styles.item}>
//                   <Input
//                     style={styles.input}
//                     value={this.state.longitude}
//                     onChangeText={longitude => {
//                       this.setState({
//                         longitude,
//                       });
//                     }}
//                     keyboardType="numeric"
//                   />
//                 </Item>
//               </View>
//               <View>
//                 <CustomLabel title={'Radius'} />
//                 <Item regular style={styles.item}>
//                   <Input
//                     style={styles.input}
//                     value={this.state.radius}
//                     onChangeText={radius => {
//                       this.setState({
//                         radius: radius,
//                       });
//                     }}
//                     keyboardType="numeric"
//                   />
//                 </Item>
//               </View>
//               <CustomButton
//                 color={Colors.header}
//                 title={'Submit'}
//                 //onPress={() => this.goToSaveFencing(true)}
//                 onPress={() => this.showOnmap(this.state.radius.toString())}
//               />
//             </CustomModal>
//           </View>
//         ) : (
//           // <ModalForAccuracy
//           //   visible={this.state.modal}
//           //   onClose={() => this.props.navigation.goBack()}
//           //   //onClose={() => this.setState({modal: false})}
//           //   onPress={() => this.props.navigation.goBack()}
//           //   accuracy={Math.round(Number(this.state.accuracy)).toString()}
//           //   mapfencing
//           // />
//           <View style={styles.container}>
// <AwesomeAlert
//   show={this.state.showAlert1}
//   showProgress={true}
//   title="Attention"
//   message={this.state.error_message}
//   closeOnTouchOutside={false}
//   closeOnHardwareBackPress={false}
//   //showCancelButton={true}
//   cancelText="Okay"
//   onCancelPressed={() => {
//     this.setState({showAlert1: false});
//   }}
//   cancelButtonColor={Colors.button[0]}
//   cancelButtonTextStyle={{
//     fontFamily: 'Poppins-Regular',
//     fontSize: 13,
//   }}
//   messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
//   titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
// />

//             <MapView
//               region={{
//                 latitude: parseFloat(this.state.coordinates.latitude),
//                 longitude: parseFloat(this.state.coordinates.longitude),
//                 latitudeDelta: LAT_DELTA,
//                 longitudeDelta: LONG_DELTA,
//               }}
//               //onRegionChange={this.onRegionChange}
//               style={styles.map}
//               //provider=
//               mapType={this.state.satellite ? 'hybrid' : 'standard'}
//               followUserLocation={true}
//               cacheEnabled={true}
//               initialRegion={{
//                 latitude: parseFloat(this.state.coordinates.latitude),
//                 longitude: parseFloat(this.state.coordinates.longitude),
//                 latitudeDelta: LAT_DELTA,
//                 longitudeDelta: LONG_DELTA,
//               }}
//               onLongPress={event => this.showStreetView(event)}
//               showsCompass={true}
//               showsMyLocationButton
//               scrollEnabled
//               zoomEnabled={true}>
//               <Marker
//                 draggable
//                 anchor={{x: 0.5, y: 0.6}}
//                 onDragEnd={e =>
//                   this.setState({coordinates: e.nativeEvent.coordinate}, () =>
//                     //this.setState({modal: true}),
//                     {},
//                   )
//                 }
//                 coordinate={this.state.coordinates}
//                 onRegionChange={this.onRegionChange}
//                 title={'Your are here!'}>
//                 <View style={{alignItems: 'center', justifyContent: 'center'}}>
//                   <View style={styles.textContainer}>
//                     <Text style={styles.subtext}>Long press to drag</Text>
//                   </View>
//                   <Icon
//                     name="map-marker"
//                     type="FontAwesome"
//                     style={{color: 'red', fontSize: 30}}
//                   />
//                 </View>
//               </Marker>
//               <MapView.Circle
//                 key={(
//                   this.state.coordinates.latitude +
//                   this.state.coordinates.longitude
//                 ).toString()}
//                 center={this.state.coordinates}
//                 radius={
//                   this.state.radius === '' ? 0 : parseFloat(this.state.radius)
//                 }
//                 strokeWidth={2}
//                 strokeColor={'red'}
//                 fillColor={'lightpink'}
//               />
//             </MapView>
//             <View style={{alignItems: 'center'}}>
//               <AwesomeAlert
//                 show={this.state.showAlert}
//                 showProgress={true}
//                 title="Loading"
//                 closeOnTouchOutside={false}
//                 closeOnHardwareBackPress={false}
//               />
//               <View style={styles.searchContainer}>
//                 <View style={styles.sliderContainer}>
//                   <View>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         margin: '3%',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                       }}>
//                       <View style={styles.labelContainer}>
//                         <Text style={styles.label}>Circle Radius</Text>
//                       </View>
//                       <View style={{flexDirection: 'row'}}>
//                         <TouchableWithoutFeedback
//                           onPress={this.goToInstitueList}>
//                           <View style={styles.buttonContainer}>
//                             <Icon
//                               name="angle-left"
//                               type="FontAwesome"
//                               style={{color: '#f05760', fontSize: 22}}
//                             />
//                           </View>
//                         </TouchableWithoutFeedback>
//                         <TouchableWithoutFeedback
//                           onPress={this.goToFencingList}>
//                           <View style={styles.buttonContainer1}>
//                             <Icon
//                               name="list"
//                               type="FontAwesome"
//                               style={{color: '#f05760', fontSize: 14}}
//                             />
//                           </View>
//                         </TouchableWithoutFeedback>
//                         <TouchableWithoutFeedback
//                           onPress={this.goToManualFenceCreation}>
//                           <View style={styles.buttonContainer1}>
//                             <Icon
//                               name="location-arrow"
//                               type="FontAwesome"
//                               style={{color: '#f05760', fontSize: 14}}
//                             />
//                           </View>
//                         </TouchableWithoutFeedback>

//                         <TouchableWithoutFeedback
//                           onPress={this.goToSaveFencing}>
//                           <View style={styles.buttonContainer1}>
//                             <Icon
//                               name="floppy-o"
//                               type="FontAwesome"
//                               style={{color: '#f05760', fontSize: 15}}
//                             />
//                           </View>
//                         </TouchableWithoutFeedback>
//                       </View>
//                     </View>
//                     <View>
//                       <Item regular style={styles.item}>
//                         <Input
//                           style={styles.input}
//                           value={Number(this.state.radius).toString()}
//                           onChangeText={radius => {
//                             this.setState({
//                               radius: radius ? parseFloat(radius) : 10,
//                             });
//                           }}
//                           keyboardType="numeric"
//                         />
//                       </Item>
//                     </View>
//                   </View>
//                   <View></View>

//                   {/* <GooglePlacesAutocomplete
//                     styles={{
//                       textInputContainer: {
//                         backgroundColor: 'rgba(0,0,0,0)',
//                         borderTopWidth: 0,
//                         borderBottomWidth: 0,
//                         borderRadius: 10,
//                         marginTop: 10,
//                       },
//                       textInput: {
//                         marginLeft: 0,
//                         marginRight: 0,
//                         height: 35,
//                         fontSize: 16,
//                         height: 42,
//                         borderWidth: 0,
//                         borderColor: 'grey',
//                         borderRadius: 10,
//                         padding: 10,
//                       },
//                       listView: {
//                         backgroundColor: '#ffffff',
//                         width: '100%',
//                       },
//                       poweredContainer: {
//                         backgroundColor: '#ffffff',
//                       },
//                       predefinedPlacesDescription: {
//                         color: '#1faadb',
//                       },
//                     }}
//                     placeholder="Search Locations..."
//                     onPress={(data, details = null) => {
//                       this.setState({showAlert: true});
//                       console.log('data=', data);
//                       fetch(
//                         'https://maps.googleapis.com/maps/api/geocode/json?place_id=' +
//                           data.place_id +
//                           '&key=' +
//                           GOOGLE_MAPS_APIKEY,
//                         {
//                           method: 'GET',
//                         },
//                       )
//                         .then((response) => response.json())
//                         .then((json) => {
//                           try {
//                             var coordinates = {
//                               latitude: parseFloat(
//                                 json['results'][0].geometry.location.lat,
//                               ),
//                               longitude: parseFloat(
//                                 json['results'][0].geometry.location.lng,
//                               ),
//                             };
//                             this.setState({
//                               coordinates: {
//                                 ...this.state.coordinates,
//                                 latitude: coordinates.latitude,
//                                 longitude: coordinates.longitude,
//                               },
//                               showAlert: false,
//                             });
//                           } catch (e) {
//                             console.log(e);
//                           }
//                         })
//                         .catch((error) => {
//                           console.log(error);
//                         });
//                     }}
//                     query={{
//                       key: GOOGLE_MAPS_APIKEY,
//                       language: 'en',
//                     }}
//                   /> */}
//                   {/* <View
//                     style={{
//                       //flexDirection: 'row',
//                       margin: '3%',
//                       //justifyContent: 'center',
//                       //alignItems: 'center',
//                     }}>
//                     <View style={styles.labelContainer}>
//                       <Text style={styles.label}>Map View</Text>
//                     </View>
//                   </View> */}
//                   <View
//                     style={{
//                       flexDirection: 'row',
//                       justifyContent: 'space-between',
//                       marginTop: 10,
//                     }}>
//                     <TouchableOpacity
//                       onPress={() =>
//                         this.setState({satellite: !this.state.satellite})
//                       }>
//                       <Item
//                         regular
//                         style={{
//                           ...styles.item,
//                           width: wp('30%'),
//                           padding: 10,
//                           marginBottom: 10,
//                         }}>
//                         <Text
//                           style={{
//                             color: 'black',
//                             fontSize: 15,
//                             textAlign: 'center',
//                             fontWeight: '600',
//                             fontFamily: 'Poppins-Regular',
//                           }}>
//                           {this.state.satellite ? 'Satellite' : 'Standard'}
//                         </Text>
//                       </Item>
//                     </TouchableOpacity>
//                     <CustomButton
//                       buttonStyle={{alignSelf: 'flex-end'}}
//                       title={'Locate Me'}
//                       onPress={this.callLocation}
//                     />
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>
//         )}
//       </>
//     );
//   }
// }
// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     height: '100%',
//     width: '100%',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   textContainer: {
//     backgroundColor: '#f05760',
//     padding: '4%',
//     borderRadius: 5,
//   },
//   text: {
//     fontFamily: 'Poppins-Regular',
//     fontSize: 12,
//     color: '#ffffff',
//   },
//   subtext: {
//     fontFamily: 'Poppins-Regular',
//     fontSize: 9,
//     color: '#ffffff',
//   },
//   searchContainer: {
//     position: 'absolute',
//     zIndex: 99999,
//     padding: '4%',
//     borderRadius: 5,
//     width: '100%',
//   },
//   sliderContainer: {
//     backgroundColor: '#f05760',
//     paddingTop: '2%',
//     paddingBottom: '5%',
//     paddingLeft: '4%',
//     paddingRight: '4%',
//     borderRadius: 15,
//   },
//   label: {
//     fontFamily: 'Poppins-Regular',
//     fontSize: 13,
//     color: '#ffffff',
//   },
//   label1: {
//     fontFamily: 'Poppins-Regular',
//     fontSize: 12,
//     color: '#c9c3c5',
//     paddingLeft: wp('3'),
//   },
//   labelContainer: {
//     marginLeft: '1.5%',
//     width: wp('50'),
//   },
//   input: {
//     fontFamily: 'Poppins-Regular',
//     fontSize: 13,
//     paddingLeft: '5%',
//     borderRadius: 10,
//     //height: hp('6'),
//     backgroundColor: '#ffffff',
//   },
//   item: {
//     borderRadius: 10,
//     borderLeftWidth: 0,
//     borderRightWidth: 0,
//     borderTopWidth: 0,
//     borderBottomWidth: 0,
//     height: hp('6'),
//     backgroundColor: '#ffffff',
//   },
//   footerContainer: {
//     position: 'absolute',
//     zIndex: 99999,
//     top: 600,
//     right: 25,
//   },
//   buttonContainer: {
//     backgroundColor: '#ffffff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 30,
//     width: 30,
//     borderRadius: 30 / 2,
//   },
//   buttonContainer1: {
//     backgroundColor: '#ffffff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 30,
//     width: 30,
//     borderRadius: 30 / 2,
//     marginLeft: 10,
//   },
//   buttonText: {
//     fontFamily: 'Poppins-Regular',
//     fontSize: 14,
//     color: '#ffffff',
//   },
//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 22,
//   },
//   modalView: {
//     flex: 1,
//     margin: 20,
//     backgroundColor: 'white',
//     width: wp('100%'),
//     height: hp('100%'),
//     borderRadius: 20,
//     padding: 35,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
// });
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import Loader from './common/Loader';
//import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import AwesomeAlert from 'react-native-awesome-alerts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  TouchableHighlight,
  //TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';

import {
  GOOGLE_MAPS_APIKEY,
  GOOGLE_MAPS_APIKEY_IOS,
} from '../utils/configs/Constants';
import {CustomButton} from './common/CustomButton';
import {Colors} from '../utils/configs/Colors';

import axios from 'axios';
import CustomModal from './common/CustomModal';
import CustomLabel from './common/CustomLabel';
import CustomMap from './common/CustomMap';
import {SafeAreaView} from 'react-native';
import Layout from './common/Layout';
import {Input} from 'react-native-elements/dist/input/Input';
import {Picker} from '@react-native-picker/picker';
import {tokenApi} from '../utils/apis';
import {FAB} from 'react-native-elements';
import CustomCard from './common/CustomCard';
import {Select} from 'native-base';
import MapView, {Animated, MarkerAnimated} from 'react-native-maps';
import SubHeader from './common/DrawerHeader';
import SuccessError from './common/SuccessError';

//import AwesomeAlert from 'react-native-awesome-alerts';

export default class MapFencing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      coordinates: {
        latitude: '',
        longitude: '',
        latitudeDelta: 0.000922,
        longitudeDelta: 0.000421,
      },
      region: {},
      latitude: null,
      longitude: null,
      showAlert: false,
      radius: '10',
      accuracy: '',
      showAlert1: true,
      error_message: 'Please wait.. Fetching location',
      modal: false,
      position: {},
      mapView: 'standard',
      height: '0%',
      accessLocation: '',
    };
  }
  componentDidMount() {
    //this.getCurrentLocation();
    this.timer = setTimeout(() => this.setState({height: '100%'}), 0);
    this.callLocation();
    //setTimeout(() => this.setState({loader: false}), 1200);
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
  }

  goToSaveFencing = manualFence => {
    let {coordinates} = this.state;
    // if (manualFence) {
    coordinates = {
      ...coordinates,
      latitude: Number(this.state.latitude),
      longitude: Number(this.state.longitude),
    };
    //}

    if (parseFloat(this.state.radius) < 10) {
      return this.setState({
        showAlert1: true,
        error_message:
          'Sorry, radius cannot be less than 10 m. Please choose a value larger than 10 m.',
        error: true,
      });
    }
    if (this.state.accessLocation === '') {
      return this.setState({
        showAlert1: true,
        error_message: 'Enter a name for the geofence',
        error: true,
      });
    }
    this.setState({showManualFenceModal: false}, async () => {
      const {institute_id} = this.props.route.params;
      try {
        const body = [
          {
            id: 0,
            isDeleted: false,
            accessLocation: this.state.accessLocation,
            coordinates: [
              {
                latitude: Number(this.state.latitude),
                longitude: Number(this.state.longitude),
              },
            ],
            checkInTime: null,
            checkOutTime: null,
            isFaceRecognitionMandatory: false,
            isTimeMandatory: false,
            instituteId: institute_id,
            type: 'Circle',
            radius: Number(this.state.radius),
          },
        ];
        console.log(body);
        const res = await tokenApi();
        const response = await res.post(
          'api/GeoFencing/addOrUpdate/geoFencing/' + institute_id,
          body,
        );
        const {data} = response;
        if (!data.status) {
          return this.setState({
            showAlert1: true,
            error_message: data.message,
            error: true,
          });
        }
        this.setState({
          showAlert1: true,
          error_message: 'Geofence created successfully!',
          error: false,
        });
      } catch (e) {
        console.log(e);
        this.setState({
          showAlert1: true,
          error_message: 'Error saving geofence. Please try again.',
          error: true,
        });
      }
    });
    // this.props.navigation.navigate('SaveFencing', {
    //   id: null,
    //   accessLocation: null,
    //   institute_id: this.props.route.params.institute_id,
    //   radius: this.state.radius,
    //   coordinates,
    // }),
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
  getCurrentLocation = async () => {
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
        // if (position.coords.accuracy > 20) {
        //   alert(
        //     'Your GPS accuracy is more than 20 m. Geofence created will not be accurate. Search your place and mark your geofence correctly.',
        //   );
        // }
        // console.log(coordinates);
        this.setState({
          coordinates: coordinates,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          loader: false,
        });
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
        timeout: 5000,
        maximumAge: 0,
      },
    );
  };
  onRegionChange = region => {
    // console.log('region_change', region);
    this.setState({region: region, coordinates: region});
  };

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

    // console.log('FINAL_ACCURACY', this.state.accuracy);
    return (
      <>
        <View
          style={{
            ...StyleSheet.absoluteFillObject,

            height: '100%',
            width: '100%',
          }}>
          <View style={{position: 'absolute', width: '100%', zIndex: 100}}>
            <SubHeader
              navigation={this.props.navigation}
              title={'Geofence'}
              showBack
            />
          </View>
          <SuccessError
            isVisible={this.state.showAlert1}
            error={this.state.error}
            deleteIconPress={() => this.setState({showAlert1: false})}
            subTitle={this.state.error_message}
          />
          {this.state.latitude !== null && (
            // <SafeAreaView style={styles.container}>

            <View
              style={{
                position: 'absolute',
                alignSelf: 'center',
                bottom: 0,
                zIndex: 100,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: 8,
                }}>
                <FAB
                  onPress={() =>
                    this.setState({
                      showManualFenceModal: !this.state.showManualFenceModal,
                    })
                  }
                  icon={{
                    name: 'edit-location',
                    type: 'material',
                    color: Colors.button[0],
                  }}
                  color={Colors.white}
                  //style={{position: 'absolute', top: '50%', right: 80}}
                  style={{zIndex: 100, marginHorizontal: 10}}
                />
                <FAB
                  onPress={this.callLocation}
                  icon={{
                    name: 'my-location',
                    type: 'material',
                    color: Colors.button[0],
                  }}
                  color={Colors.white}
                  style={{zIndex: 100}}
                  //style={{position: 'absolute', top: '50%', right: 10}}
                />
              </View>
              <CustomCard alignSelf={'center'} justifyContent={'flex-end'}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}>
                  <Input
                    value={this.state.radius}
                    //onEndEditing={text => this.setState({radius: text})}
                    onChangeText={text => this.setState({radius: text})}
                    placeholder={'Circle Radius'}
                    placeholderTextColor={Colors.button[0]}
                    containerStyle={{
                      width: '50%',
                      alignSelf: 'center',
                      margin: 0,
                      padding: 0,
                    }}
                    inputContainerStyle={{
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: Colors.button[0],
                      width: '100%',
                      alignSelf: 'center',
                      paddingLeft: 10,
                      marginTop: 23,
                    }}
                    inputStyle={{padding: 0}}
                  />
                  <View
                    style={{
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: Colors.button[0],
                      width: '45%',
                      alignItems: 'center',
                      padding: 3,
                      //backgroundColor: 'red',
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}>
                    <Select
                      width={'100%'}
                      //backgroundColor: 'red',
                      style={{
                        borderWidth: 0,
                        elevation: 0,
                        shadowOffset: {width: 0, height: 0},
                        shadowOpacity: 0,
                        shadowColor: 'white',

                        borderColor: 'transparent',
                      }}
                      onValueChange={value => this.setState({mapView: value})}
                      selectedValue={this.state.mapView}>
                      <Select.Item
                        label={'Standard'}
                        value={'standard'}
                        key={'1'}
                      />
                      <Select.Item
                        label={'Satellite'}
                        value={'satellite'}
                        key={'2'}
                      />
                    </Select>
                  </View>
                </View>

                <Input
                  value={this.state.accessLocation}
                  onChangeText={text => this.setState({accessLocation: text})}
                  placeholder={'Geofence Name'}
                  placeholderTextColor={Colors.button[0]}
                  inputContainerStyle={{
                    borderRadius: 6,
                    borderWidth: 1,
                    paddingLeft: 10,
                    borderColor: Colors.button[0],
                  }}
                />
                {this.state.showManualFenceModal && (
                  <View>
                    <Input
                      value={this.state.latitude}
                      onChangeText={text => this.setState({latitude: text})}
                      placeholder={'Geofence Latitute'}
                      placeholderTextColor={Colors.button[0]}
                      inputContainerStyle={{
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: Colors.button[0],
                        paddingLeft: 10,
                      }}
                    />
                    <Input
                      value={this.state.longitude}
                      onChangeText={text => this.setState({longitude: text})}
                      placeholder={'Geofence Longitude'}
                      placeholderTextColor={Colors.button[0]}
                      inputContainerStyle={{
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: Colors.button[0],
                        paddingLeft: 10,
                      }}
                    />
                  </View>
                )}
                <CustomButton
                  onPress={this.goToSaveFencing}
                  color={Colors.button[0]}
                  title={'Save'}
                  width={'60%'}
                  radius={150}
                />
              </CustomCard>
            </View>
          )}
          <Animated
            style={{...StyleSheet.absoluteFillObject}}
            scrollEnabled
            showsUserLocation
            mapType={this.state.mapView}
            zoomEnabled
            onRegionChange={this.onRegionChange}
            initialRegion={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.000922,
              longitudeDelta: 0.000421,
            }}>
            <MarkerAnimated
              onDragEnd={e =>
                this.setState({coordinates: e.nativeEvent.coordinate})
              }
              onRegionChange={this.onRegionChange}
              coordinate={this.state.coordinates}
              draggable
            />
            <MapView.Circle
              key={(this.state.latitude + this.state.longitude).toString()}
              center={{
                latitude: parseFloat(`${this.state.coordinates.latitude}`),
                longitude: parseFloat(`${this.state.coordinates.longitude}`),
                latitudeDelta: 0.000922,
                longitudeDelta: 0.000421,
              }}
              radius={parseFloat(`${this.state.radius}`) || 25}
              strokeWidth={2}
              strokeColor={'red'}
              fillColor={'lightpink'}
            />
          </Animated>
        </View>
      </>
    );
    // console.log('FINAL', this.state.coordinates);
    // return (
    //   <Layout
    //     headerTitle={'Geofence'}
    //     normal
    //     goBack
    //     backScreen="HomeScreen"
    //     navigation={this.props.navigation}>
    // <AwesomeAlert
    //   show={this.state.showAlert1}
    //   showProgress={false}
    //   title="Attention"
    //   message={this.state.error_message}
    //   closeOnTouchOutside={false}
    //   closeOnHardwareBackPress={false}
    //   //showCancelButton={true}
    //   cancelText="Okay"
    //   onCancelPressed={() => {
    //     this.setState({showAlert1: false}, () =>
    //       this.props.navigation.goBack(),
    //     );
    //   }}
    //   cancelButtonColor={Colors.button[0]}
    //   cancelButtonTextStyle={{
    //     fontFamily: 'Poppins-Regular',
    //     fontSize: 13,
    //   }}
    //   messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
    //   titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
    // />

    // {this.state.latitude && (
    //   // <SafeAreaView style={styles.container}>
    //   <CustomMap
    //     draggable
    //     height={'100%'}
    //     latitude={this.state.latitude}
    //     longitude={this.state.longitude}
    //     scrollEnabled
    //     markerTitle={'You are here'}
    //     appointment
    //     radius={this.state.radius}
    //     mapType={this.state.mapView}>
    //     <View style={{position: 'absolute', bottom: 0, zIndex: 100}}>
    //       <View
    //         style={{
    //           flexDirection: 'row',
    //           alignItems: 'center',
    //           justifyContent: 'flex-end',
    //           padding: 8,
    //         }}>
    //         <FAB
    //           onPress={() =>
    //             this.setState({
    //               showManualFenceModal: !this.state.showManualFenceModal,
    //             })
    //           }
    //           icon={{
    //             name: 'edit-location',
    //             type: 'material',
    //             color: Colors.button[0],
    //           }}
    //           color={Colors.white}
    //           //style={{position: 'absolute', top: '50%', right: 80}}
    //           style={{zIndex: 100, marginHorizontal: 10}}
    //         />
    //         <FAB
    //           onPress={this.callLocation}
    //           icon={{
    //             name: 'my-location',
    //             type: 'material',
    //             color: Colors.button[0],
    //           }}
    //           color={Colors.white}
    //           style={{zIndex: 100}}
    //           //style={{position: 'absolute', top: '50%', right: 10}}
    //         />
    //       </View>
    //       <CustomCard justifyContent={'flex-end'}>
    //         <View
    //           style={{
    //             flexDirection: 'row',
    //             alignItems: 'center',
    //             width: '100%',
    //             justifyContent: 'space-between',
    //           }}>
    //           <Input
    //             value={this.state.radius}
    //             //onEndEditing={text => this.setState({radius: text})}
    //             onChangeText={text => this.setState({radius: text})}
    //             placeholder={'Circle Radius'}
    //             placeholderTextColor={Colors.button[0]}
    //             containerStyle={{
    //               width: '50%',
    //               alignSelf: 'center',
    //               margin: 0,
    //               padding: 0,
    //             }}
    //             inputContainerStyle={{
    //               borderRadius: 6,
    //               borderWidth: 1,
    //               borderColor: Colors.button[0],
    //               width: '100%',
    //               alignSelf: 'center',
    //               padding: 0,
    //               marginTop: 23,
    //             }}
    //             inputStyle={{padding: 0}}
    //           />
    //           <View
    //             style={{
    //               borderRadius: 6,
    //               borderWidth: 1,
    //               borderColor: Colors.button[0],
    //               width: '45%',
    //               alignItems: 'center',
    //               padding: 3,
    //               //backgroundColor: 'red',
    //               alignSelf: 'center',
    //               justifyContent: 'center',
    //             }}>
    //             <Select
    //               width={'100%'}
    //               //backgroundColor: 'red',
    //               style={{
    //                 borderWidth: 0,
    //                 elevation: 0,
    //                 shadowOffset: {width: 0, height: 0},
    //                 shadowOpacity: 0,
    //                 shadowColor: 'white',

    //                 borderColor: 'transparent',
    //               }}
    //               onValueChange={value => this.setState({mapView: value})}
    //               selectedValue={this.state.mapView}>
    //               <Select.Item
    //                 label={'Standard'}
    //                 value={'standard'}
    //                 key={'1'}
    //               />
    //               <Select.Item
    //                 label={'Satellite'}
    //                 value={'satellite'}
    //                 key={'2'}
    //               />
    //             </Select>
    //           </View>
    //         </View>

    //         <Input
    //           value={this.state.accessLocation}
    //           onChangeText={text => this.setState({accessLocation: text})}
    //           placeholder={'Geofence Name'}
    //           placeholderTextColor={Colors.button[0]}
    //           inputContainerStyle={{
    //             borderRadius: 6,
    //             borderWidth: 1,
    //             borderColor: Colors.button[0],
    //           }}
    //         />
    //         {this.state.showManualFenceModal && (
    //           <View>
    //             <Input
    //               value={this.state.latitude}
    //               onChangeText={text => this.setState({latitude: text})}
    //               placeholder={'Geofence Latitute'}
    //               placeholderTextColor={Colors.button[0]}
    //               inputContainerStyle={{
    //                 borderRadius: 6,
    //                 borderWidth: 1,
    //                 borderColor: Colors.button[0],
    //               }}
    //             />
    //             <Input
    //               value={this.state.longitude}
    //               onChangeText={text => this.setState({longitude: text})}
    //               placeholder={'Geofence Longitude'}
    //               placeholderTextColor={Colors.button[0]}
    //               inputContainerStyle={{
    //                 borderRadius: 6,
    //                 borderWidth: 1,
    //                 borderColor: Colors.button[0],
    //               }}
    //             />
    //           </View>
    //         )}
    //         <CustomButton
    //           onPress={this.goToSaveFencing}
    //           color={Colors.button[0]}
    //           title={'Save'}
    //           width={'60%'}
    //           radius={150}
    //         />
    //       </CustomCard>
    //     </View>
    //   </CustomMap>
    //       // </SafeAreaView>
    //     )}
    //   </Layout>
    // );
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
