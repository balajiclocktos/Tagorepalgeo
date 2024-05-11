import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../utils/configs/Colors';
import CustomLabel from '../common/CustomLabel';
import moment from 'moment';
const CustomHCard = props => {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        marginVertical: 10,

        borderRadius: 5,

        backgroundColor: '#F5F5DC',
      }}>
      <View
        style={{
          width: 4,
          height: '100%',
          backgroundColor: Colors.button[0],
          marginRight: 10,
        }}
      />
      <View style={{ flexDirection: 'row' }}>
        <View
          style={{
            backgroundColor: Colors.mainHeader[0],
            width: 42,
            height: 50,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderBottomWidth: 8,
            borderBottomColor: 'white',
            marginVertical: 10,

            marginRight: 10,
            elevation: 2,
            shadowColor: 'black',
            shadowRadius: 5,
            shadowOpacity: 0.7,
            shadowOffset: {
              width: 0,
              height: 5,
            },
          }}>
          <CustomLabel
            title={moment(props.date, 'DD-MM-YYYY').format('ddd')}
            color={'white'}
          />
          <CustomLabel
            title={moment(props.date, 'DD-MM-YYYY').format('DD')}
            color={'white'}
          />
        </View>
        <View style={{ marginVertical: 10 }}>
          {props.noShift ? (
            props.noShift
          ) : (
            <>
              <CustomLabel title={props.holidayName} size={14} />
              <CustomLabel
                title={props.description}
                size={12}
                family={'Poppins-Regular'}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default CustomHCard;

const styles = StyleSheet.create({});
