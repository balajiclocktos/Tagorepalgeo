import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  Platform,
} from 'react-native';
import {Container, VStack, Item, Input, Icon} from 'native-base';
import SubHeader from './common/SubHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from './common/Loader';
const baseUrl = 'http://demoworks.in/php/nav/';
import Const from './common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
export default class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accessLocation: this.props.route.params.accessLocation
        ? this.props.route.params.accessLocation
        : '',
      bearer_token: '',
      loader: false,
      showAlert1: false,
      error_message: '',
      list: [],
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      this.setState({bearer_token: bearer_token});
      fetch(Const + 'api/GeoFencing/' + this.props.route.params.institute_id, {
        method: 'GET',
        withCredentials: true,
        credentials: 'include',
        headers: {
          Authorization: 'Bearer ' + bearer_token,
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json-patch+json',
        },
      })
        .then(response => response.json())
        .then(json => this.setState({list: json.rows}));
    });
  }
  saveFence = () => {
    let duplicates = false;
    console.log(this.props.route.params.institute_id);
    this.state.list.forEach(item => {
      if (item.accessLocation === this.state.accessLocation) {
        return (duplicates = true);
      }
    });
    if (duplicates) {
      return alert(
        'Location name already exists. Please enter a different name.',
      );
    }
    if (this.state.accessLocation) {
      var coordinatesArr = [];
      var coordinates = {
        latitude: this.props.route.params.coordinates.latitude,
        longitude: this.props.route.params.coordinates.longitude,
      };
      coordinatesArr.push(coordinates);
      var institute = this.props.route.params.institute_id;
      var radius = this.props.route.params.radius;
      this.setState({loader: true});
      fetch(Const + 'api/GeoFencing/addOrUpdate/geoFencing/' + institute, {
        method: 'POST',
        withCredentials: true,
        credentials: 'include',
        headers: {
          Authorization: 'Bearer ' + this.state.bearer_token,
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify([
          {
            id: this.props.route.params.id ? this.props.route.params.id : 0,
            isDeleted: false,
            accessLocation: this.state.accessLocation,
            coordinates: coordinatesArr,
            checkInTime: null,
            checkOutTime: null,
            isFaceRecognitionMandatory: false,
            isTimeMandatory: false,
            instituteId: institute,
            type: 'Circle',
            radius: radius,
          },
        ]),
      })
        .then(response => response.json())
        .then(json => {
          if (json.status) {
            if (Platform.OS == 'ios') {
              alert('Geo location saved successfully');
              setTimeout(() => {
                this.setState({showAlert: false});
              }, 1300);
              setTimeout(() => {
                this.props.navigation.navigate('FencingList', {
                  institute_id: this.props.route.params.institute_id,
                });
              }, 1200);
            } else {
              this.setState({
                showAlert1: true,
                error_message: 'Geo location saved successfully',
                showAlert: false,
              });
              setTimeout(() => {
                this.props.navigation.navigate('FencingList', {
                  institute_id: this.props.route.params.institute_id,
                });
              }, 1200);
            }
          } else {
            if (Platform.OS == 'ios') {
              alert(json.message);
              setTimeout(() => {
                this.setState({showAlert: false});
              }, 1200);
            } else {
              this.setState({
                showAlert1: true,
                error_message: json.message,
                showAlert: false,
              });
            }
          }
        })
        .catch(error => {
          if (Platform.OS == 'ios') {
            alert('Unknown error occured');
            setTimeout(() => {
              this.setState({showAlert: false});
            }, 1200);
          } else {
            this.setState({
              showAlert1: true,
              error_message: 'Unknown error occured',
              showAlert: false,
            });
          }
        });
    } else {
      if (Platform.OS == 'ios') {
        alert('Enter fencing name');
        setTimeout(() => {
          this.setState({showAlert: false});
        }, 1200);
      } else {
        this.setState({
          showAlert1: true,
          error_message: 'Enter fencing name',
          showAlert: false,
        });
      }
    }
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <>
        <AwesomeAlert
          show={this.state.showAlert1}
          showProgress={false}
          title="Attention"
          message={this.state.error_message}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          cancelText="Okay"
          onCancelPressed={() => {
            this.setState({showAlert1: false});
          }}
          cancelButtonColor={Colors.button[0]}
          cancelButtonTextStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
        />
        <SubHeader
          title="Save Fencing"
          showBack={true}
          backScreen="MapFencing"
          navigation={this.props.navigation}
        />
        <VStack>
          <View style={{marginTop: '4%', marginLeft: '4%', marginRight: '4%'}}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Geo Fencing Name</Text>
            </View>
            <View>
              <Item regular style={styles.item}>
                <Input
                  placeholder=""
                  style={styles.input}
                  value={this.state.accessLocation}
                  onChangeText={accessLocation => {
                    this.setState({accessLocation: accessLocation});
                  }}
                />
                <Icon
                  active
                  name="map-marker"
                  type="FontAwesome"
                  style={{fontSize: 19, color: '#f05760'}}
                  onPress={this.showPassword}
                />
              </Item>
            </View>
          </View>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('3'),
            }}>
            <TouchableWithoutFeedback onPress={this.saveFence}>
              <View style={styles.buttonContainer}>
                <Image
                  source={require('../assets/ic_send.png')}
                  style={styles.btImage}
                />
                <Text style={styles.buttonText}>Save</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </VStack>
      </>
    );
  }
}
const styles = StyleSheet.create({
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
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
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
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('30'),
    paddingRight: wp('7'),
    marginTop: '4%',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#ffffff',
  },
  btImage: {
    width: 54,
    height: 39,
  },
});
