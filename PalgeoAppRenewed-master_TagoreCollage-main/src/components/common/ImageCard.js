import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Colors} from '../../utils/configs/Colors';
import CustomLabel from './CustomLabel';

const ImageCard = props => {
  return (
    <TouchableOpacity disabled={props.disabled} onPress={props.onPress}>
      <View
        style={{
          //padding: 8,
          flexDirection: 'row',
          borderRadius: 10,
          marginBottom: 10,
          backgroundColor: props.backgroundColor || 'transparent',
          width: wp('90'),
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 60,
          paddingRight: 10,
          //paddingLeft: 1,
          // borderRightWidth: 1,
          // borderRightColor: Colors.mainHeader[1],
          // width: props.width || wp('40'),
          // height: props.height || 150,
        }}>
        <Image source={props.source} style={props.style} />
        {props.title && (
          <CustomLabel
            labelStyle={{
              textAlign: 'center',
              textTransform: 'uppercase',
              marginLeft: props.marginLeft || '23%',
            }}
            color={Colors.white}
            size={18}
            title={props.title}
          />
        )}
        {props.secondIcon ? (
          props.secondIcon
        ) : (
          <Icon name={'arrowright'} type={'ant-design'} color={'white'} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ImageCard;

const styles = StyleSheet.create({});
