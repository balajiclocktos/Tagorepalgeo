import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Avatar} from 'react-native-elements';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {Colors} from '../../utils/configs/Colors';
import {CustomButton} from './CustomButton';
import CustomLabel from './CustomLabel';
import CustomModal from './CustomModal';

const FaceMismatchModal = props => {
  return (
    <CustomModal
      deleteIconPress={props.deleteIconPress}
      isVisible={props.isVisible}
      headerTextStyle={{fontSize: 16}}
      title={props.title}>
      <View
        style={{
          flexDirection: 'row',
          width: wp('80'),
          alignSelf: 'center',
          justifyContent: 'space-around',
        }}>
        <View style={{width: wp('30')}}>
          <Avatar
            containerStyle={{alignSelf: 'center'}}
            source={{uri: props.profilePic}}
            size={'large'}
          />
          <CustomLabel
            labelStyle={{textAlign: 'center', fontSize: 12}}
            title={'Registered Photo'}
          />
        </View>
        <View style={{width: wp('30')}}>
          <Avatar
            containerStyle={{alignSelf: 'center'}}
            source={{uri: props.capturedPhoto}}
            size={'large'}
          />
          <CustomLabel
            labelStyle={{textAlign: 'center', fontSize: 12}}
            title={'Captured Photo'}
          />
        </View>
      </View>
      <CustomButton
        textStyle={{color: Colors.maroon, textDecorationLine: 'underline'}}
        title={'Mismatch'}
        disabled
      />

      <CustomLabel labelStyle={{fontSize: 14}} title={props.errorMsg} />
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <CustomButton
          color={Colors.mainHeader[0]}
          onPress={props.registerScreen}
          title={'Register Face'}
          marginRight={10}
        />
        <CustomButton
          color={Colors.mainHeader[0]}
          title={'OK'}
          //alignSelf={'flex-end'}
          //marginTop={10}
          onPress={props.deleteIconPress}
        />
      </View>
    </CustomModal>
  );
};

export default FaceMismatchModal;

const styles = StyleSheet.create({});
