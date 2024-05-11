import React, { Component } from 'react';
import { Text, View, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Layout from '../common/Layout';
import { Avatar } from 'react-native-elements';
import { tokenApi } from '../../utils/apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActionSheet from 'react-native-actions-sheet';
import { FlatList } from 'react-native';
import CustomLabel from '../common/CustomLabel';
import GradientButton from '../common/GradientButton';
import { Colors } from '../../utils/configs/Colors';
import {
  GOOGLE_MAPS_APIKEY,
  LAT_DELTA,
  LONG_DELTA,
} from '../../utils/configs/Constants';
import MapViewDirections from 'react-native-maps-directions';
import { Modalize } from 'react-native-modalize';
import SearchBar from 'react-native-elements/dist/searchbar/SearchBar-ios';
import { TouchableOpacity } from 'react-native';
const { width, height } = Dimensions.get('window');
export class LocateMap extends Component {
  state = {
    staffList: [],
    myCoordinates: null,
    filteredList: [],
    currentStaff: null,
  };
  actionSheet = null;
  componentDidMount() {
    this.getUserData().then(() => this.getMyLcation());
  }

  getUserData = async () => {
    try {
      const institute_id = await AsyncStorage.getItem('institute_id');
      this.setState({ institute_id });
    } catch (e) {
      alert(e.message);
    }
  };

  success = pos =>
    this.setState(
      {
        myCoordinates: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: LAT_DELTA,
          longitudeDelta: LONG_DELTA,
        },
      },
      () => this.getList(pos.coords),
    );
  error = error => this.setState({ error: error.message });

  getList = async coordinates => {
    console.log("this.state.institute_id = ", this.state.institute_id);
    console.log("staffCodes: this.props.route.params.data = ", this.props.route.params.data);
    console.log(", coordinates = ", coordinates);
    try {
      const res = await tokenApi();
      const response = await res.post(
        'api/GeoFencing/stafflocations/' + this.state.institute_id,
        { staffCodes: this.props.route.params.data, coordinates },
      );
      const { data } = response;
      const filtered = data.filter(e => e.coordinate !== null);
      console.log(filtered);
      this.setState({ staffList: filtered, filteredList: filtered });
      this.actionSheet.open();
    } catch (w) {
      alert(w.message);
    }
  };
  getMyLcation = () => {
    Geolocation.getCurrentPosition(this.success, this.error, {
      enableHighAccuracy: true,
      distanceFilter: 0,
      timeout: 5000,
      maximumAge: 0,
    });
  };

  renderItem = ({ item, index }) => {
    let { distance } = item;
    if (distance >= 1000) {
      distance = distance / 1000;
    }

    return (
      <TouchableOpacity
        onPress={() =>
          this.setState({ currentStaff: item }, () => this.actionSheet.open())
        }>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Avatar size="medium" rounded source={{ uri: item.staffImage }} />
          <CustomLabel title={`${item.name}`} />
          <CustomLabel
            family="Poppins-Regular"
            color={Colors.button[0]}
            title={`${distance.toFixed(0)} km away`}
          />
        </View>
      </TouchableOpacity>
    );
  };

  filterStaff = text => {
    this.setState({ searchText: text }, () => {
      let { staffList } = this.state;
      const filtered = staffList.filter((e, i) =>
        e.name.toLowerCase().includes(text.toLowerCase()),
      );
      this.setState({ filteredList: filtered });
    });
  };

  render() {
    const { staffList, myCoordinates, filteredList, currentStaff } = this.state;
    console.log(myCoordinates);
    return (
      <Layout
        normal
        headerTitle={'Locate Staff'}
        backScreen={'LocateMenuStep2'}
        goBack
        navigation={this.props.navigation}>
        {myCoordinates && staffList.length > 0 && (
          <View style={{ width: '100%', height: '100%' }}>
            <MapView
              ref={c => (this.mapView = c)}
              initialRegion={myCoordinates}
              scrollEnabled
              zoomEnabled
              style={{ width: '100%', height: '90%' }}
              loadingEnabled>
              <Marker coordinate={myCoordinates}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar
                    size="large"
                    source={require('../../assets/myLocation.png')}
                  />
                </View>
              </Marker>
              {staffList.length > 0 &&
                staffList.map((e, i) => {
                  return (
                    <Marker
                      coordinate={{
                        ...e.coordinate,
                        latitudeDelta: LAT_DELTA,
                        longitudeDelta: LONG_DELTA,
                      }}
                      key={i}>
                      <Avatar
                        size="small"
                        rounded
                        source={{ uri: e.staffImage }}
                      />
                    </Marker>
                  );
                })}
              {currentStaff && (
                <Polyline
                  key="polyline"
                  coordinates={[myCoordinates, currentStaff.coordinate]}
                  //coordinates={inn}
                  geodesic={true}
                  strokeColor="rgba(0,179,253, 0.6)"
                  strokeWidth={6}
                  zIndex={0}
                />
                // <MapViewDirections
                //   //optimizeWaypoints
                //   onStart={params => {
                //     this.setState({
                //       showAlert: true,
                //       message: `Routing...`,
                //     });
                //   }}
                //   onReady={result => {
                //     this.setState({
                //       showAlert: false,
                //       // distance: result.distance,
                //     });
                //     this.mapView.fitToCoordinates(result.coordinates, {
                //       edgePadding: {
                //         right: width / 20,
                //         bottom: height / 20,
                //         left: width / 20,
                //         top: height / 20,
                //       },
                //     });
                //     // console.log(`Distance: ${result.distance} km`);
                //     // console.log(`Duration: ${result.duration} min.`);
                //   }}
                //   onError={err => alert('Error fetching path: ' + err)}
                //   origin={myCoordinates}
                //   //waypoints={inn}
                //   // splitWaypoints={true}
                //   destination={currentStaff.coordinate}
                //   apikey={GOOGLE_MAPS_APIKEY}
                //   strokeWidth={1}
                //   strokeColor="red"
                // />
              )}
            </MapView>
          </View>
        )}

        {staffList.length > 0 && (
          <Modalize
            handlePosition={'inside'}
            alwaysOpen={200}
            HeaderComponent={
              <View
                style={{
                  width: '80%',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: 10,
                }}>
                <SearchBar
                  placeholder={'Search a staff'}
                  value={this.state.searchText || ''}
                  onChangeText={text => this.filterStaff(text)}
                  inputContainerStyle={{ borderBottomWidth: 1, borderWidth: 1 }}
                />
              </View>
            }
            flatListProps={{
              data: filteredList,
              renderItem: this.renderItem,
              keyExtractor: (item, i) => i + '',
              showsVerticalScrollIndicator: false,
              numColumns: 3,
              contentContainerStyle: { alignItems: 'center' },
              columnWrapperStyle: { margin: 10 },
            }}
            ref={ref => (this.actionSheet = ref)}></Modalize>
        )}
      </Layout>
    );
  }
}

export default LocateMap;
