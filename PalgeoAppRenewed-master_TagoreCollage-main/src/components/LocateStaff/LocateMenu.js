import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import {Text} from 'native-base';
import {Card} from 'react-native-elements';
import SubHeader from '../common/DrawerHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Asyncstorage from '@react-native-async-storage/async-storage';
import Const from '../common/Constants';
import Geolocation, {clearWatch} from 'react-native-geolocation-service';
import AwesomeAlert from 'react-native-awesome-alerts';
import NoData from '../common/NoData';
import {duration} from 'moment';
import {Colors} from '../../utils/configs/Colors';
var moment = require('moment');
export default class LocateMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showAlert: false,
    };
  }
  componentDidMount() {
    Asyncstorage.getItem('institute_id').then(institute_id => {
      Asyncstorage.getItem('bearer_token').then(bearer_token => {
        this.watchId = Geolocation.watchPosition(position => {
          Geolocation.clearWatch(this.watchId);
          var obj = {
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
          };
          this.LocateDetails(institute_id, bearer_token, obj);
        });
      });
    });
  }
  LocateDetails = (institute_id, bearer_token, coord) => {
    fetch(Const + 'api/GeoFencing/stafflocations/' + institute_id, {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: 'Bearer ' + bearer_token,
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify({
        staffCodes: this.props.route.params.data,
        coordinates: coord,
      }),
    })
      .then(response => response.json())
      .then(json => {
        console.log(
          'body',
          JSON.stringify({
            staffCodes: this.props.route.params.data,
            coordinates: coord,
          }),
        );
        if (json.length > 0) {
          console.log('json', json);
          this.setState({data: json});
        } else {
          this.setState({data: []});
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  goToMapView = (coord, name) => {
    this.watchId = Geolocation.watchPosition(position => {
      Geolocation.clearWatch(this.watchId);
      var obj = {
        latitude: parseFloat(position.coords.latitude),
        longitude: parseFloat(position.coords.longitude),
      };
      this.props.navigation.navigate('DistanceMapView', {
        coordinates: coord,
        staffName: name,
        current_coordinates: obj,
      });
    });
  };
  render() {
    console.log('data ==>', this.state.data);
    return (
      <View style={styles.container}>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title="Loading"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        />
        <SubHeader
          title="Locate Staff"
          showBack={true}
          backScreen="LocateMenuStep2"
          navigation={this.props.navigation}
        />
        <FlatList
          data={this.state.data}
          renderItem={({item, index}) => {
            var minutes = '';

            var distance = parseInt(item.distance);

            if (distance > 1000) {
              var updateddistance = distance / 1000 + ' kms';
            } else if (distance) {
              var updateddistance = distance + ' mts';
            } else {
              var updateddistance = 'N/A';
            }

            let now = moment().format('YYYY-MM-DD HH:mm:ss');

            let then = moment
              .utc(item.modifiedDateTime)
              .local()
              .format('YYYY-MM-DD HH:mm:ss');
            console.log('then ==>', then, 'now ==>', now);

            var ms = moment(now, 'YYYY-MM-DD HH:mm:ss').diff(
              moment(then, 'YYYY-MM-DD HH:mm:ss'),
            );

            var minutes = moment.duration(ms).asMinutes();

            return (
              <Card style={styles.walletContainer} key={item.id}>
                <View style={styles.row}>
                  <View style={{width: wp('40'), justifyContent: 'center'}}>
                    <Text style={styles.header}>Staff Name</Text>
                  </View>
                  <View style={{width: wp('50')}}>
                    <Text style={styles.headerVal}>{item.name}</Text>
                  </View>
                </View>
                {parseInt(minutes) >= 0 && (
                  <View>
                    <View style={styles.row}>
                      <View style={{width: wp('40'), justifyContent: 'center'}}>
                        <Text style={styles.header}>Distance</Text>
                      </View>
                      <View style={{width: wp('50')}}>
                        {parseInt(item.distance) > 0 ? (
                          <Text style={styles.headerVal}>
                            {updateddistance}
                          </Text>
                        ) : parseInt(item.distance) == 0 ? (
                          <Text style={styles.headerVal}>0 mts</Text>
                        ) : (
                          <Text style={styles.headerVal}>N/A</Text>
                        )}
                      </View>
                    </View>
                    {item.modifiedDateTime && (
                      <View style={styles.row}>
                        <View
                          style={{width: wp('40'), justifyContent: 'center'}}>
                          <Text style={styles.header}>Time</Text>
                        </View>
                        <View style={{width: wp('50')}}>
                          <Text style={styles.headerVal1}>
                            {moment
                              .utc(
                                item.modifiedDateTime,
                                'YYYY-MM-DDTHH:mm:ss.SSS',
                              )
                              .local()
                              .format('DD.MM.YYYY h:mm a')}
                          </Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.row}>
                      <View style={{width: wp('40'), justifyContent: 'center'}}>
                        <Text style={styles.header}>Action</Text>
                      </View>
                      <View style={{width: wp('50')}}>
                        {parseInt(item.distance) > 0 ? (
                          <TouchableWithoutFeedback
                            onPress={() =>
                              this.goToMapView(item.coordinate, item.name)
                            }>
                            <Text style={styles.headerVal5}>View in Map </Text>
                          </TouchableWithoutFeedback>
                        ) : parseInt(item.distance) == 0 ? (
                          <Text style={styles.headerVal5}>
                            Current location{' '}
                          </Text>
                        ) : (
                          <Text style={styles.headerVal5}>N/A </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingBottom: hp('1'),
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          ListEmptyComponent={
            <View style={{marginTop: hp('37')}}>
              <NoData title="No data Found" />
            </View>
          }
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.header,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    margin: '1%',
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    margin: '1%',
    color: '#909090',
  },
  walletContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    shadowOffset: {width: 2, height: 5},
    width: wp('93'),
    paddingTop: '3%',
    paddingLeft: '4%',
    paddingRight: '4%',
    paddingBottom: '3%',
    alignSelf: 'center',
  },
  header: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#67747d',
    margin: '1%',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
    margin: '1%',
  },
  headerVal1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
    paddingLeft: '3%',
  },
  row: {
    flexDirection: 'row',
    margin: '0.8%',
  },
  headerVal5: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'blue',
  },
  status: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'red',
  },
});
