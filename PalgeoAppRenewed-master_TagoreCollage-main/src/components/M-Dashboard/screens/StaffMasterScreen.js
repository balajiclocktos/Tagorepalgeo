import React from 'react';
import {FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../utils/configs/Colors';
import CustomLabel from '../../common/CustomLabel';
import {TABS1} from '../constants';

const StaffMasterScreen = props => {
  //console.log('staff', props.staffData);
  return (
    <View>
      {!props.loader && (
        <View
          style={{
            borderBottomColor: '#AAAAAA',
            borderBottomWidth: 1,
            paddingBottom: 10,
            marginVertical: 10,
          }}>
          <FlatList
            horizontal
            data={TABS1}
            showsHorizontalScrollIndicator={false}
            renderItem={props.renderItemHorizontal}
            extraData={props.extraData}
            keyExtractor={props.keyExtractorHorizontal}
            contentContainerStyle={{marginLeft: 10}}
            //ListFooterComponent={<View style={{width: 105}}></View>}
          />
        </View>
      )}

      <View
        style={{
          //flexDirection: 'row',
          //flexWrap: 'wrap',
          marginLeft: 10,
          maxHeight: props.height,
          //overflow: 'hidden',
          alignItems: 'center',

          //zIndex: 1,
          //backgroundColor: 'yellow',
        }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            //width: '90%',
            //marginVertical: 10,
            maxHeight: props.height,
            overflow: 'hidden',
            alignItems: 'center',
            //zIndex: 1,
            //backgroundColor: 'yellow',
          }}>
          {props.getFilters}
        </View>

        {props.staffCurrentIndex >= 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              zIndex: 100,
            }}>
            <TouchableOpacity
              style={{alignSelf: 'flex-end', alignItems: 'center'}}
              onPress={props.decrease}>
              <CustomLabel
                labelStyle={{color: Colors.button[0]}}
                margin={0}
                title="... Less"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{alignSelf: 'flex-end', alignItems: 'center'}}
              onPress={props.increase}>
              <CustomLabel
                labelStyle={{color: Colors.button[0]}}
                margin={0}
                title="... More"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {props.staffData?.length > 0 && !props.loader && (
        <FlatList
          data={props.staffData}
          keyExtractor={props.keyExtractor}
          renderItem={props.renderItem}
          nestedScrollEnabled
          contentContainerStyle={{marginTop: 10}}
        />
      )}
    </View>
  );
};

export default StaffMasterScreen;

const styles = StyleSheet.create({});
