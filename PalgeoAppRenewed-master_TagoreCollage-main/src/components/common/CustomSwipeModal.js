import React from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SwipeUpDownModal from 'react-native-swipe-modal-up-down';

const CustomSwipeModal = props => {
  return (
    <SwipeUpDownModal
      modalVisible={props.visible}
      PressToanimate={true}
      //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
      ContentModal={
        <View style={styles.containerContent}>
          <FlatList
            data={props.data}
            renderItem={({item, index}) => console.log(item)}
            keyExtractor={item => Math.random()}
          />
        </View>
      }
      HeaderStyle={styles.headerContent}
      ContentModalStyle={styles.Modal}
      //  HeaderContent={
      //    <View style={styles.containerHeader}>
      //     <Text onPress={()=>{

      //     }}>Press me</Text>
      //    </View>
      //  }
      onClose={() => {
        props.visibleFunction();
      }}
    />
  );
};
export default CustomSwipeModal;
const styles = StyleSheet.create({
  containerContent: {flex: 1, marginTop: 40},
  containerHeader: {
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#F1F1F1',
  },
  headerContent: {
    marginTop: 0,
  },
  Modal: {
    backgroundColor: '#005252',
    marginTop: Dimensions.get('window').height / 2,
  },
});
