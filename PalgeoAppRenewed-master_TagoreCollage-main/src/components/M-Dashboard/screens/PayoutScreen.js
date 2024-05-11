import {Select} from 'native-base';
import React from 'react';
import {ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {FlatList} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../utils/configs/Colors';
import CustomLabel from '../../common/CustomLabel';
import {MONTHS, TABS1, YEARS} from '../constants';

const PayoutScreen = props => {
  console.log('current', props.data);
  return (
    <View>
      <Select
        width={'90'}
        alignSelf={'center'}
        dropdownIconColor={Colors.red}
        mode={'dropdown'}
        color={Colors.button[0]}
        textAlign={'center'}
        selectedValue={props.selectedValue}
        onValueChange={props.onValueChange}>
        {YEARS.map((e, i) => (
          <Select.Item key={i} label={e} value={e} />
        ))}
      </Select>
      <View
        style={{
          alignItems: 'center',
          width: '100%',
          maxHeight: 60,
          backgroundColor: 'transparent',
          marginBottom: 10,
        }}>
        <ScrollView
          contentContainerStyle={{
            borderBottomColor: Colors.overlay,
            borderBottomWidth: 1,
            paddingBottom: 10,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal>
          {MONTHS.map((m, i) => {
            return (
              <TouchableOpacity
                style={{
                  borderRadius: 10,
                  alignItems: 'center',
                  marginRight: 10,
                  backgroundColor:
                    i + 1 == props.current ? Colors.button[0] : 'transparent',
                }}
                onPress={() => props.onPress(m, i)}>
                <Text
                  style={{
                    padding: 5,
                    color: i + 1 == props.current ? Colors.white : 'black',
                    //,
                    textAlign: 'center',

                    //borderColor: 'transparent',
                    //borderBottomWidth: i + 1 == props.current ? 4 : 0,
                  }}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        horizontal
        data={TABS1}
        showsHorizontalScrollIndicator={false}
        renderItem={props.renderItemHorizontal}
        extraData={props.extraData}
        keyExtractor={props.keyExtractorHorizontal}
        contentContainerStyle={{
          borderBottomColor: Colors.overlay,
          borderBottomWidth: 1,
          paddingBottom: 10,
          marginLeft: 10,
          marginBottom: 10,
        }}
        //ListFooterComponent={<View style={{width: 105}}></View>}
      />

      <View
        style={{
          //flexDirection: 'row',
          //flexWrap: 'wrap',
          // marginVertical: 10,
          maxHeight: props.height,
          //overflow: 'hidden',
          alignItems: 'center',
          //paddingBottom: 20,
          //zIndex: 1,
          //backgroundColor: 'yellow',
        }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            //width: '90%',
            marginLeft: 10,
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
              //marginBottom: 10,
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

      {props.payoutData?.length > 0 && (
        <FlatList
          data={props.payoutData}
          keyExtractor={props.keyExtractor}
          renderItem={props.renderItem}
          nestedScrollEnabled
          ListFooterComponent={props.ListFooterComponent}
          onEndReachedThreshold={0.1}
          enableEmptySections={true}
          contentContainerStyle={{
            marginTop: 25,
          }}
          onEndReached={props.onEndReached}
        />
      )}
    </View>
  );
};

export default PayoutScreen;

const styles = StyleSheet.create({});
