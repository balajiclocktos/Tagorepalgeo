import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ModalForAccuracy = (props) => {
  const list = [
    {
      name: 'Try to hold the device under clear sky or open space.',
    },
    {
      name:
        'Walk around the corners of the geospace you are in to fetch exact location',
    },
    {
      name: 'Enable Wifi on your device.',
    },
    {
      name:
        'Rotate your device in the shape of "8" three times to improve compass accuracy.',
    },
    {
      name:
        'Change the location settings and set high accuracy mode on your device.',
    },
    {
      name: 'Disable battery saver mode on your device.',
    },
  ];
  return (
    <Modal
      visible={props.visible}
      onDismiss={props.onClose}
      onRequestClose={props.onClose}
      animationType="slide"
      transparent={true}>
      <ScrollView contentContainerStyle={styles.centeredView}>
        <View style={styles.modalView}>
          <Text
            style={{
              fontSize: 17,
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: 'Poppins-Regular',
              color: 'black',
              marginBottom: 15,
            }}>
            Weak GPS signal
          </Text>
          {props.checkin && (
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 'bold',
                fontFamily: 'Poppins-Regular',
                color: 'black',
                marginBottom: 15,
              }}>
              Your current location is deviated from the check-in location by{' '}
              {props.accuracy} meters. The recommended allowed deviation is 10
              meters. Please follow the below steps to minimize the deviation.
            </Text>
          )}
          {props.checkout && (
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 'bold',
                fontFamily: 'Poppins-Regular',
                color: 'black',
                marginBottom: 15,
              }}>
              Your current location is deviated from the check-out location by{' '}
              {props.accuracy} meters. The recommended allowed deviation is 10
              meters. Please follow the below steps to minimize the deviation.
            </Text>
          )}
          {props.mapfencing && (
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 'bold',
                fontFamily: 'Poppins-Regular',
                color: 'black',
                marginBottom: 15,
              }}>
              Your current location is deviated from the actual location by{' '}
              {props.accuracy} meters. The recommended allowed deviation is 10
              meters. Please follow the below steps to minimize the deviation.
            </Text>
          )}
          {/* <Text
            style={{
              fontSize: 14,
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: 'Poppins-Regular',
              color: 'black',
              marginBottom: 15,
            }}>
            Tips for improvisation:
          </Text> */}
          {list.map((item, index) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  alignItems: 'flex-start',
                  //backgroundColor: 'yellow',
                  width: wp('90%'),
                  marginVertical: 10,
                  //justifyContent: 'space-between',
                }}>
                <Image
                  style={{width: 10, height: 10, marginTop: 4}}
                  source={require('../../assets/ic_next.png')}
                />
                {/* <Text
                  style={{
                    ...styles.text,
                    fontSize: 13,
                    marginLeft: 0,
                    alignSelf: 'flex-start',
                  }}>
                  {'\u2022'}
                </Text> */}
                <Text style={styles.text}>{item.name}</Text>
              </View>
            );
          })}

          <TouchableWithoutFeedback onPress={props.onPress}>
            <View style={styles.buttonContainer}>
              <Image
                source={require('../../assets/bt.png')}
                style={styles.btImage}
              />
              <Text style={styles.buttonText}>Ok</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default ModalForAccuracy;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    // height: hp('100%'),
  },
  modalView: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    width: wp('100%'),
    height: hp('100%'),
    borderRadius: 20,
    padding: 35,
    //alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'red',
    alignSelf: 'flex-start',
    //marginV: 10,
    marginLeft: 10,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('30'),
    paddingRight: wp('7'),
    marginVertical: 20,
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
