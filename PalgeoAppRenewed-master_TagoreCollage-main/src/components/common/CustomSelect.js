import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MultiSelect from 'react-native-multiple-select/lib/react-native-multi-select';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {Colors} from '../../utils/configs/Colors';

const CustomSelect = props => {
  return (
    // <View
    //   style={{
    //     borderColor: props.borderColor || Colors.button[0],
    //     borderRadius: 8,
    //     borderWidth: 1,
    //     marginVertical: 10,

    //     maxHeight: 300,
    //     width: '90%',
    //     alignSelf: 'center',

    //     //alignItems: 'center',
    //   }}>
    <MultiSelect
      styleMainWrapper={{
        borderColor: props.borderColor || Colors.button[0],
        borderRadius: 8,
        borderWidth: 1,
        marginVertical: 10,
        minHeight: 40,
        // maxHeight: 300,
        width: props.width || '90%',
        alignSelf: 'center',
      }}
      // flatListProps={{
      //   nestedScrollEnabled: true,
      // }}
      items={props.items}
      uniqueKey="id"
      //ref={props.ref}
      //styleSelectorContainer={{height: 200, margin: 0}}
      onSelectedItemsChange={props.onSelectedItemsChange}
      selectedItems={props.selectedItems}
      selectText={props.selectText}
      searchInputPlaceholderText={props.searchInputPlaceholderText}
      //onChangeInput={text => console.log(text)}
      altFontFamily="Poppins-Regular"
      tagRemoveIconColor={Colors.calendarBg}
      tagBorderColor={Colors.button[0]}
      tagTextColor="#000000"
      selectedItemTextColor={Colors.button[0]}
      selectedItemIconColor={Colors.red}
      itemTextColor={Colors.button[0]}
      hideSubmitButton
      //hideTags
      single={props.single}
      itemFontSize={14}
      //fixedHeight
      // styleDropdownMenu={{
      //   zIndex: 100,
      // }}
      // styleInputGroup={{paddingRight: 10, height: 40, borderColor:"red",borderBottomWidth:2}}
      styleDropdownMenu={{
        // paddingTop: wp('2'),
        height: 40,
        borderRadius: 8,
      }}
      styleDropdownMenuSubsection={{
        height: '100%' ,borderBottomWidth:0, borderRadius: 8,
      }}
      styleTextDropdown={{
        paddingLeft: wp('2'),

        fontFamily: 'Poppins-Regular',
      }}
      styleTextDropdownSelected={{paddingLeft: wp('2'), marginTop: wp('1')}}
      styleRowList={{
        margin: wp('1'),
      }}
    />
    // </View>
  );
};

export default CustomSelect;

const styles = StyleSheet.create({});
