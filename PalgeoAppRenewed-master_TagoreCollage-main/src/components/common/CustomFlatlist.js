import React from 'react';
import {FlatList} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';

const CustomFlatlist = props => {
  return (
    <FlatList
      horizontal={props.horizontal}
      data={props.data}
      showsHorizontalScrollIndicator={props.showIndicator}
      renderItem={props.renderItem}
      ListFooterComponent={<View style={{width: 55}}></View>}
    />
  );
};

export default CustomFlatlist;

const styles = StyleSheet.create({});
