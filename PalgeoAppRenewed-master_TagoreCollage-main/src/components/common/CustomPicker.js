import React, {Component} from 'react';
import {StyleSheet, Dimensions, View} from 'react-native';
import {Select as Picker} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CustomLabel from './CustomLabel';
const screenWidth = Dimensions.get('window').width;

export default class CustomPicker extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {options, label, selectedValue, onValueChange, height} = this.props;
    const styles = StyleSheet.create({
      item: {
        borderRadius: 8,
        marginBottom: 15,
        alignSelf: 'center',
        width: '95%',
        backgroundColor: 'white',
        //shadowColor: 'silver',
        //elevation: 2,
        //shadowOffset: {width: 0, height: 0},
        //shadowOpacity: 0.3,
        height: height || hp('8'),
      },
    });

    //console.log('options =-=', options);
    return (
      <View style={styles.item}>
        <CustomLabel margin={0} title={label} />
        <Picker
          // note
          // mode="dropdown"
          width={'100%'}
          marginLeft={1}
          style={{alignSelf: 'center'}}
          selectedValue={selectedValue}
          onValueChange={value => onValueChange(value)}>
          {options.length > 0 &&
            options.map((item, ind) => {
              return (
                <Picker.Item label={item.name} value={item.id} key={ind} />
              );
            })}
        </Picker>
      </View>
    );
  }
}
