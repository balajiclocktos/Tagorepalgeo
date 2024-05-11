import React, { Component } from 'react';
import { View , StyleSheet , PermissionsAndroid , Text} from 'react-native';
import { Item , Input, Icon , } from 'native-base';
import MapView , { Marker , Polygon} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Loader from './common/Loader';
const baseUrl = "http://demoworks.in/php/nav/";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AwesomeAlert from 'react-native-awesome-alerts';
import qs from 'qs';
import Slider from '@react-native-community/slider';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
export default class EditMapFencing extends Component{
    constructor(props){
        super(props);
        this.state = {
            loader : true,
            coordinates : {
                latitude : 37.78825,
                longitude : -122.4324,
                latitudeDelta: 0.000922,
                longitudeDelta: 0.000421,
            },
            region : {},
            showAlert : false,
            radius : this.props.route.params.data.radius.toString()
        }
    }
    componentDidMount(){
        this.getCurrentLocation();
    }
    goToSaveFencing = () => {
        this.props.navigation.navigate('SaveFencing',{
            id : this.props.route.params.data.id ? this.props.route.params.data.id : null,
            accessLocation : this.props.route.params.data.accessLocation,
            institute_id:this.props.route.params.institute_id,
            radius:this.state.radius,
            coordinates:this.state.coordinates
        })
    }
    getCurrentLocation = async() => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
                'title': 'Location Access Required',
                'message': 'This App needs to Access your location'
                }
            )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            this.callLocation();
        } else {
            alert("Permission Denied");
        }
        }catch (err) {
            alert("err",err);
            this.setState({loader : false});
        }
    }
    callLocation = () => {     
        const editLatitide = this.props.route.params.data.coordinates[0].latitude;
        const editLongitude = this.props.route.params.data.coordinates[0].longitude;                                                
        Geolocation.getCurrentPosition(
            (position) => {
                const currentLongitude = JSON.stringify(position.coords.longitude);
                const currentLatitude = JSON.stringify(position.coords.latitude);
                var coordinates = {
                    latitude : editLatitide?editLatitide:parseFloat(currentLatitude),
                    longitude : editLongitude?editLongitude:parseFloat(currentLongitude),
                    latitudeDelta: 0.000922,
                    longitudeDelta: 0.000421,
                }
                this.setState({coordinates:coordinates,loader:false});
            },
            (error) => {
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }
    onRegionChange = (region) => {
        this.setState({region : region});
      }
    render(){
          
        if(this.state.loader){
            return(
                <Loader />
            )
        }
        return(
                <View style = {styles.container}>
                    <MapView
                        region={{
                            latitude: parseFloat(this.state.coordinates.latitude),
                            longitude: parseFloat(this.state.coordinates.longitude),
                            latitudeDelta: 0.000922,
                            longitudeDelta: 0.000421,
                        }}
                        style={styles.map}
                        followUserLocation={true}
                        zoomEnabled={true}
                    >
                    <Marker
                        anchor={{x: 0.5, y: 0.6}}
                        draggable
                        onDragEnd={(e) => this.setState({ coordinates: e.nativeEvent.coordinate })}
                        coordinate={this.state.coordinates}
                        onRegionChange={this.onRegionChange}
                        title={"Your are here!"}>
                        <View style={{alignItems:'center',justifyContent:'center'}}>
                            <View style={styles.textContainer}>
                                <Text style={styles.subtext}>Long press to drag</Text>
                            </View>
                            <Icon name="map-marker" type="FontAwesome" style={{color:'red',fontSize:30}}/>
                        </View>
                    </Marker>
                     <MapView.Circle
                        key = { (this.state.coordinates.latitude + this.state.coordinates.longitude).toString() }
                        center = { this.state.coordinates }
                        radius = { parseFloat(this.state.radius) }
                        strokeWidth = { 2.5 }
                        strokeColor = { 'red' }
                        fillColor={'#ffe8e8'}
                        // onRegionChangeComplete = { this.onRegionChangeComplete.bind(this) }
                    />
                </MapView>
                 <View style={{alignItems:'center'}}>
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
                            <View style={{flexDirection:'row',margin:'3%',justifyContent:'center',alignItems:'center'}}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.label}>Circle Radius</Text>
                                </View>
                                <View style={{flexDirection:'row'}}>
                                      <TouchableWithoutFeedback onPress={this.goToSaveFencing}>
                                        <View style={styles.buttonContainer1}>
                                            <Icon name="floppy-o" type="FontAwesome"  style={{color:'#089bf9',fontSize:17}}/>
                                        </View>
                                    </TouchableWithoutFeedback>  
                                </View>
                                </View>
                                <View>
                                    <Item regular  style={styles.item}>
                                        <Input 
                                            style={styles.input}
                                            value = {this.state.radius}
                                            onChangeText = {(radius)=>{this.setState({radius : radius?parseFloat(radius):5 })}}
                                            keyboardType='numeric'
                                        />
                                        <Icon active name='text-width' type="FontAwesome" style={{fontSize:17,color:'#089bf9'}} onPress={this.showPassword} />
                                    </Item>
                                </View>
                            </View>
                            <GooglePlacesAutocomplete
                            styles={{
                                textInputContainer: {
                                  backgroundColor: 'rgba(0,0,0,0)',
                                  borderTopWidth: 0,
                                  borderBottomWidth:0,
                                  borderRadius : 10,
                                },
                                textInput: {
                                  marginLeft: 0,
                                  marginRight: 0,
                                  height: 35,
                                  fontSize: 16,
                                  height : 42,
                                  borderWidth : 0,
                                  borderColor : 'grey',
                                  borderRadius : 10,
                                },
                                listView :{
                                    backgroundColor :'#ffffff',
                                    width : '100%'
                                },
                                poweredContainer :{
                                    backgroundColor :'#ffffff'
                                },
                                predefinedPlacesDescription: {
                                  color: '#1faadb'
                                }}
                            }
                            placeholder='Search Locations...'
                            onPress={(data, details = null) => {
                                this.setState({showAlert:true})
                                fetch('https://maps.googleapis.com/maps/api/geocode/json?place_id='+data.place_id+'&key=AIzaSyDFnElO9vGqc0egYJ1JcOdv--fHA4a5mA4', {
                                       method: 'GET',
                                    }).then((response) => response.json())
                                    .then((json) => {
                                        try{
                                            var coordinates = {
                                                latitude : parseFloat(json['results'][0].geometry.location.lat),
                                                longitude : parseFloat(json['results'][0].geometry.location.lng)
                                            }
                                            this.setState({coordinates:coordinates,showAlert:false});
                                        }catch(e){
                                            
                                        }
                                    })
                                    .catch((error) => {
                                    
                                });
                            }}
                            query={{
                                key: 'AIzaSyDFnElO9vGqc0egYJ1JcOdv--fHA4a5mA4',
                                language: 'en',
                            }}
                         />
                        </View>
                      </View>
                      {/* <View style={styles.footerContainer}>
                          <TouchableWithoutFeedback onPress={this.goToSaveFencing}>
                                <View style={styles.buttonContainer}>
                                    <Text style={styles.buttonText}>UPDATE FENCING</Text>
                                </View>
                          </TouchableWithoutFeedback>  
                      </View> */}
               </View>
          </View>
         )
     }
}
const styles = StyleSheet.create({
    container : {
        ...StyleSheet.absoluteFillObject,   
        height: '100%',
        width : '100%'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    textContainer : {
        backgroundColor : '#089bf9',
        padding : '4%',
        borderRadius : 5,
    },
    text : {
        fontFamily : 'Poppins-Regular',
        fontSize : 12, 
        color : '#ffffff'
    },
    subtext : {
        fontFamily : 'Poppins-Regular',
        fontSize : 9, 
        color : '#ffffff'
    },
    searchContainer :{
        position : 'absolute',
        zIndex : 99999,
        padding : '4%',
        borderRadius : 5,
        width : '100%'
    },
    sliderContainer : {
        backgroundColor:'#089bf9',
        paddingTop : '2%',
        paddingBottom : '5%',
        paddingLeft : '4%',
        paddingRight : '4%',
        borderRadius : 15
    },
    label : {
        fontFamily : 'Poppins-Regular',
        fontSize : 13,
        color : '#ffffff'
    },
    label1 : {
        fontFamily : 'Poppins-Regular',
        fontSize : 12,
        color : '#c9c3c5',
        paddingLeft : wp('3')
    },
    labelContainer : {
        marginLeft : '1.5%'
    },
    input:{
        fontFamily : 'Poppins-Regular',
        fontSize : 13,
        paddingLeft : '5%',
        borderRadius : 10,
        height : hp('6'),
        backgroundColor:'#ffffff',
    },
    item : {
        borderRadius : 10,
        borderLeftWidth : 0,
        borderRightWidth : 0,
        borderTopWidth : 0,
        borderBottomWidth : 0,
        height : hp('6'),
        backgroundColor:'#ffffff',
     },
     footerContainer : {
         position : 'absolute',
         zIndex : 99999,
         top : 600,
         right : 25
     },
     buttonContainer : {
        backgroundColor : '#ffffff',
        justifyContent :'center',
        alignItems : 'center',
        padding : '6%',
        borderRadius : 5
     },
     buttonText : {
         fontFamily : 'Poppins-Regular',
         fontSize : 14,
         color : '#ffffff'
     },
     buttonContainer1 : {
        backgroundColor : '#ffffff',
        justifyContent :'center',
        alignItems : 'center',
        height : 30,
        width : 30,
        borderRadius : 30/2,
        marginLeft : 10
     },
})