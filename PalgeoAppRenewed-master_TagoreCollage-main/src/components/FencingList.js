import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  BackHandler,
  Text,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from './common/Loader';
import Const from './common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import {tokenApi} from '../utils/apis';
import Layout from './common/Layout';
import {FlatList} from 'react-native';
import {Colors} from '../utils/configs/Colors';
import PrimaryCard from './common/PrimaryCard';
import CustomLabel from './common/CustomLabel';
import {FAB} from 'react-native-elements';
import SuccessError from './common/SuccessError';
export default class FencingList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      data: [],
      bearer_token: '',
      showAlert1: false,
      error_message: '',
      institute_id: '',
    };
  }
  componentDidMount() {
    this.getUserData();
    // AsyncStorage.getItem('bearer_token').then(bearer_token => {
    //   this.setState({bearer_token: bearer_token});
    //   this.getList(this.props.route.params.institute_id, bearer_token);
    // });
    this.focus = this.props.navigation.addListener('focus', () =>
      this.getUserData(),
    );
  }

  componentWillUnmount() {
    this.focus();
  }

  getUserData = async () => {
    try {
      const institute_id = await AsyncStorage.getItem('institute_id');
      this.setState({institute_id}, () => this.getList(institute_id));
    } catch (e) {
      alert('Error fetching user data. Please logout and login again.');
    }
  };

  getList = async institute => {
    if (institute) {
      this.setState({loader: true});
      try {
        const res = await tokenApi();
        const response = await res.get('api/GeoFencing/' + institute);
        const {data} = response;
        this.setState({loader: false});
        if (data.rows?.length > 0) {
          console.log('data', data.rows);
          this.setState({data: data.rows});
        } else {
          this.setState({
            data: [],
            showAlert1: true,
            error_message: 'No data found',
            showAlert: false,
            error: true,
          });
        }
      } catch (e) {
        this.setState({
          loader: false,
          error: true,
          showAlert1: true,
          error_message: 'Error getting fencing list. ' + e.message,
        });
        //alert('Error getting fencing list. Please try again.');
      }
    }
  };
  removeFence = (id, index1) => {
    var tempArr = this.state.data;
    tempArr[index1].isDeleted = true;
    this.setState({data: tempArr}, () => {
      this.saveFence();
    });
  };
  saveFence = () => {
    this.setState({loader: true});
    fetch(
      Const +
        'api/GeoFencing/addOrUpdate/geoFencing/' +
        this.props.route.params.institute_id,
      {
        method: 'POST',
        withCredentials: true,
        credentials: 'include',
        headers: {
          Authorization: 'Bearer ' + this.state.bearer_token,
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(this.state.data),
      },
    )
      .then(response => response.json())
      .then(json => {
        this.setState({loader: false});
        if (json.status) {
          if (Platform.OS == 'ios') {
            alert('Fencing removed successfully');
            this.getList(
              this.props.route.params.institute_id,
              this.state.bearer_token,
            );
            setTimeout(() => {
              this.setState({showAlert: false});
            }, 1200);
          } else {
            this.setState(
              {
                showAlert1: true,
                error_message: 'Fencing removed successfully',
                showAlert: false,
              },
              () => {
                this.getList(
                  this.props.route.params.institute_id,
                  this.state.bearer_token,
                );
              },
            );
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
  };
  EditFence = item => {
    this.props.navigation.navigate('EditMapFencing', {
      data: item,
      institute_id: this.props.route.params.institute_id,
    });
  };

  renderItem = ({item, index}) => {
    return (
      <PrimaryCard
        width={'85'}
        backgroundColor={index % 2 === 0 ? Colors.secondary : '#E8E7FD'}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'transparent',
            padding: 10,
            //sjustifyContent: 'space-around',
          }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#FFA726',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}>
            <Image
              source={require('../assets/geofence.png')}
              style={{width: 33, height: 33, resizeMode: 'contain'}}
            />
          </View>
          <View>
            <CustomLabel title={item.accessLocation} />
            <CustomLabel
              title={`Radius: ${item.radius.toString()}`}
              family={'Poppins-Regular'}
              size={12}
              color={'#00000099'}
            />
          </View>
        </View>
      </PrimaryCard>
    );
  };

  goToMapFencing = () =>
    this.props.navigation.navigate('MapFencing', {
      institute_id: this.state.institute_id,
    });

  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <Layout
        normal
        headerTitle={'Geofence'}
        goBack={true}
        navigation={this.props.navigation}>
        {/* <View>
          <CustomLabel title={this.state.institute_id} />
        </View> */}
        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({showAlert1: false})}
          subTitle={this.state.error_message}
        />
        {this.state.data.length > 0 && (
          <FlatList
            keyExtractor={(item, index) => index + ''}
            data={this.state.data}
            renderItem={this.renderItem}
            contentContainerStyle={{alignSelf: 'center', marginVertical: 10}}
          />
        )}
        <FAB
          icon={{
            name: 'add-location',
            type: 'material',
            color: Colors.white,
          }}
          color={Colors.button[0]}
          visible
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
          }}
          onPress={this.goToMapFencing}
        />
      </Layout>
    );
  }
}
const styles = StyleSheet.create({
  name: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    margin: '1%',
    color: '#909090',
  },
});
