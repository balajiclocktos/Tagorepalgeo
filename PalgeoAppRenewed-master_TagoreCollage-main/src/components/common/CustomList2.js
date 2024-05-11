import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
export const CustomList2 = props => {
  const {
    title1,
    title2,
    title3,
    title4,
    title5,
    title6,
    children,
    color,
    width,
    headerColor,
    maxHeight,
  } = props;

  return (
    <View
      style={{
        width: width,
        alignSelf: 'center',
        backgroundColor: color,
        borderRadius: 5,
      }}>
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: headerColor, borderRadius: 5, marginTop: 0 },
        ]}>
        {title1 && (
          <View style={[styles.headerTitleContainer]}>
            <Text style={styles.text}>{title1}</Text>
          </View>
        )}
        {title2 && (
          <View style={styles.headerTitleContainer}>
            <Text style={styles.text}>{title2}</Text>
          </View>
        )}
        {title3 && (
          <View style={[styles.headerTitleContainer]}>
            <Text style={styles.text}>{title3}</Text>
          </View>
        )}
        {title4 && (
          <View style={[styles.headerTitleContainer]}>
            <Text style={styles.text}>{title4}</Text>
          </View>
        )}
        {title5 && (
          <View style={[styles.headerTitleContainer]}>
            <Text style={styles.text}>{title5}</Text>
          </View>
        )}
        {title6 && (
          <View style={[styles.headerTitleContainer]}>
            <Text style={styles.text}>{title6}</Text>
          </View>
        )}
      </View>
      <View
        style={{
          width: '100%',
          maxHeight: maxHeight || 200,
          minHeight: 100,
        }}>
        {children}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'white',
  },
  headerContainer: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  headerTitleContainer: {
    //width: '24%',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
