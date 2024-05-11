import React from 'react';
import {View, Text} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {Colors} from '../../utils/configs/Colors';
import CustomLabel from './CustomLabel';
import Loader from './Loader';
export default Nodata = props => {
  return (
    <View style={{marginTop: hp('37')}}>
      <CustomLabel
        color={Colors.red}
        containerStyle={{alignSelf: 'center'}}
        title={props.title || 'No Data Found'}
      />
    </View>
  );
};
