import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, Card, VStack} from 'native-base';
import SubHeader from '../common/DrawerHeader';
import Loader from '../common/Loader';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import moment from 'moment';
import {Colors} from '../../utils/configs/Colors';
const geolib = require('geolib');

export class QRCodeGenerator extends Component {
  state = {
    locationId: null,
    StaffNo: null,
    timeStamp: null,
    loader: true,
    show: false,
    value: '',
    count: 10,
    position: {},
    locations: [],
  };
  async componentDidMount() {
    const StaffNo = await AsyncStorage.getItem('user_id');
    const locations = JSON.parse(await AsyncStorage.getItem('locations'));
    this.setState({StaffNo, locations});
    //console.log('ddd===', locations, StaffNo)
    setTimeout(() => this.setState({loader: false}), 1200);
    this.getCurrentPosition();
    //this.getValue(locations, StaffNo)
  }

  componentWillUnmount() {
    //Geolocation.clearWatch(this.watchId)
    clearInterval(this.interval);
  }

  getCurrentPosition = () => {
    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
    };
    Geolocation.getCurrentPosition(this.success, this.error, options);
  };

  success = position => this.setState({position});

  error = error => console.log('geo_error', error);

  getValue = async (locations, StaffNo) => {
    let value = '';
    let position = this.state.position;
    if (locations?.length > 0) {
      locations.forEach(async location => {
        const point = geolib.isPointWithinRadius(
          {
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
          },
          {
            latitude: parseFloat(location.coordinates[0].latitude),
            longitude: parseFloat(location.coordinates[0].longitude),
          },
          Number(location.radius),
        );
        console.log('current location inside?', point);
        if (point) {
          value = {
            locationId: location.id,
            StaffNo: this.state.StaffNo,
            timeStamp: moment(),
          };
          this.setState({
            value,
          });
          return value;
        }
      });
    }
    console.log('value_state', this.state.value);
    console.log('value_returned', value);
    return value;
  };

  generateQRCode = async () => {
    const value = await this.getValue(this.state.locations, this.state.StaffNo);
    if (value === '') {
      return alert('You are not in your assigned location');
    }
    this.setState({value});
    this.interval = setInterval(
      () => this.setState(prev => ({count: prev.count - 1})),
      1000,
    );
    console.log('value ==> ', value);
    this.setState({show: true});
    setTimeout(() => {
      clearInterval(this.interval);
      this.setState({show: false, value: '', count: 10});
    }, 10000);
  };

  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <View style={{flex: 1}}>
        <SubHeader
          title="QR Code Generator"
          showBack={true}
          backScreen="Home"
          showBell={false}
          navigation={this.props.navigation}
        />
        <VStack>
          <View style={{marginTop: 20, marginLeft: 15, marginRight: 15}}>
            <TouchableWithoutFeedback onPress={this.generateQRCode}>
              <View style={styles.buttonContainer}>
                <Text style={styles.footerText}>Generate QR Code</Text>
              </View>
            </TouchableWithoutFeedback>
            {this.state.show && (
              <View style={styles.center}>
                <Card style={styles.mainCardStyle}>
                  <QRCode size={300} value={JSON.stringify(this.state.value)} />
                </Card>
                <Text>
                  The QR Code will expire in {this.state.count.toString()}{' '}
                  seconds
                </Text>
              </View>
            )}
          </View>

          {/* <Button title="Get ccurrent location" onPress={this.CheckIn} /> */}
        </VStack>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  header: {
    backgroundColor: '#089bf9',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: '#ffffff',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  cardContainer: {
    marginTop: '10%',
    marginLeft: '6%',
    marginRight: '6%',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#c9c3c5',
  },
  label1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#c9c3c5',
    paddingLeft: wp('3'),
  },
  labelContainer: {
    margin: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#f1f1f1',
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('7'),
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    height: hp('7'),
  },
  card: {
    borderRadius: 10,
    elevation: 4,
    paddingTop: '3%',
    paddingBottom: '3%',
    height: hp('65'),
  },
  preview: {
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.button[0],
    borderRadius: 20,
    width: wp('60'),
    padding: 20,
  },
  buttonContainer1: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('40'),
    marginTop: '4%',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
    paddingRight: '3%',
  },
  btImage: {
    width: 50,
    height: 39,
    borderRadius: 20,
  },
  userImage: {
    width: 120,
    height: 120,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    marginBottom: 10,
  },
  mainCardStyle: {
    borderRadius: 10,
    elevation: 4,
    padding: 20,
    width: wp('85'),
    alignItems: 'center',
    //height: hp('40')
  },
  checkinText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  heading: {
    fontFamily: 'Poppins-SemiBold',
    margin: 12,
  },
});

export default QRCodeGenerator;
