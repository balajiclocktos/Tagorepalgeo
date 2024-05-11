import AsyncStorage from '@react-native-async-storage/async-storage';
import {TextArea} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {noTokenAPi} from '../../utils/apis';
import {Colors} from '../../utils/configs/Colors';
import CustomLabel from '../common/CustomLabel';
import CustomSelect from '../common/CustomSelect';

const AlternateStaffComp = props => {
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [allStaffs, setAllStaffs] = useState([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    fetchAllStaffs();
  }, []);

  useEffect(() => {
    props.textValue(value);
  }, [value]);

  const fetchAllStaffs = async () => {
    try {
      const org_id = await AsyncStorage.getItem('org_id');
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const url = `api/Staff/staffwithId/all/${org_id}/${institute_id}`;
      const res = await noTokenAPi.get(url);
      const user = res.data.find(e => e.staffCode === user_id);
      let response = res.data.filter(e => e.staffCode !== user_id);
      if (props.isAlternateStaffSameDepartment) {
        response = res.data.filter(e => e.department === user.department);
      }
      const finalList = response.map(e => {
        return {
          id: e.staffCode,
          name: `${e.name} - ${e.staffCode}`,
          department:e.department
        };
      });
      setAllStaffs(finalList);
      props.allStaffs(finalList);
    } catch (error) {
      alert(error.message);
    }
  };

  const onChangeText = text => {
    setValue(text);
    //props.textValue(value);
  };

  return (
    <>
      <CustomLabel
        title={'Alternate Staff'}
        containerStyle={{marginLeft: 20}}
        size={14}
      />
      {allStaffs.length > 0 && (
        <CustomSelect
          items={allStaffs}
          onSelectedItemsChange={value => {
            console.log('vvv', value);
            setSelectedStaff(value);
            props.selectedStaff(value);
          }}
          borderColor={'#ccc'}
          width={'95%'}
          selectedItems={selectedStaff}
          selectText="Search a Staff . . ."
          searchInputPlaceholderText="Search a Staff . . ."
          single
        />
      )}
      <TextArea
        value={value}
        onChangeText={onChangeText}
        h={20}
        placeholder={props.placeholder}
        fontSize={14}
        placeholderTextColor={Colors.button[0]}
        w="95%"
        alignSelf="center"
        marginBottom={10}
        borderColor={'coolGray.400'}
        //maxW="300"
      />
    </>
  );
};

export default AlternateStaffComp;
