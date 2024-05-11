import {Thumbnail} from 'native-base';
import React, {Component} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
export class CustomList extends Component {
  constructor(props) {
    super(props);
    this.state = {Active: null};
  }
  render() {
    let {onPress, title1, title2, title3, color, width, headerColor, Arr} =
      this.props;
    return (
      <View
        style={{
          width: width,
          alignSelf: 'center',
          backgroundColor: color,
          borderRadius: 10,
          marginVertical: 10,
        }}>
        <View style={[styles.headerContainer, {backgroundColor: headerColor}]}>
          <View style={[styles.headerTitleContainer, {flex: 0.5}]}>
            <Text style={styles.text}>{title1}</Text>
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.text}>{title2}</Text>
          </View>
          <View
            style={[
              styles.headerTitleContainer,
              {alignItems: 'flex-end', flex: 0.7},
            ]}>
            <Text style={styles.text}>{title3}</Text>
          </View>
        </View>
        <ScrollView
          nestedScrollEnabled={true}
          style={{
            width: '100%',
            maxHeight: 200,
            minHeight: 100,
          }}>
          {Arr.length ? (
            Arr.map((item, index) => {
              return (
                <View key={index} style={[styles.headerContainer]}>
                  <View style={[styles.headerTitleContainer, {flex: 0.5}]}>
                    <Text style={[styles.text, {color: 'black'}]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.headerTitleContainer,
                      {alignItems: 'flex-start'},
                    ]}>
                    <Text style={[styles.text, {color: 'black'}]}>
                      {item.leaveName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.headerTitleContainer,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flex: 0.7,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.text,
                        {color: headerColor, marginHorizontal: 10},
                      ]}>
                      {/*{item.availableLeave + '/' + item.totalYearlyLeaves}*/}
                      {item.id}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (this.state.Active == index) {
                          this.setState({Active: -1}, function () {
                            onPress(item.id);
                          });
                        } else {
                          this.setState({Active: index}, function () {
                            onPress(item.id);
                          });
                        }
                      }}>
                      {this.state.Active == index ? (
                        <View
                          style={{
                            width: 25,
                            height: 25,
                            marginHorizontal: 10,
                            borderRadius: 25,
                            backgroundColor: headerColor,
                          }}
                        />
                      ) : (
                        <Thumbnail
                          style={{
                            width: 25,
                            height: 25,
                            marginHorizontal: 10,
                          }}
                          source={require('../../assets/check.png')}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{marginTop: 10, alignItems: 'center'}}>
              {/* <ActivityIndicator /> */}
              <Text>No data found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}
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
  },
  headerTitleContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
