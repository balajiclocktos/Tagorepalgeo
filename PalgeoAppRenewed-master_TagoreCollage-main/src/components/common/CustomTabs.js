import React, {Component} from 'react';
import {ScrollView} from 'react-native';
import {Text, TouchableOpacity, StyleSheet, View} from 'react-native';

export class CustomTabs extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let {
      onPress,
      title,
      textSize,
      color,
      width,
      tab1,
      tab2,
      tab3,
      tab4,
      tab5,
      tab1Width,
      tab2Width,
      tab3Width,
      tab4Width,
      tab5Width,
      ActiveTab,
      backgroundColor,
      borderRadius,
      height,
      textColor,
      scroll,
    } = this.props;
    //console.log(ActiveTab);

    const renderChild = () => {
      return (
        <View
          style={{
            width: width,
            height: height,
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
            borderRadius: borderRadius,
            padding: 5,
            backgroundColor: backgroundColor,
            marginVertical: 10,
          }}>
          {tab1 ? (
            <TouchableOpacity
              onPress={() => {
                onPress(tab1);
              }}
              style={{
                //flex: 1,
                width: tab1Width,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                borderRadius: borderRadius,
                borderBottomWidth:
                  this.props.type == 'bottom' && ActiveTab == tab1 ? 3 : 0,
                backgroundColor:
                  ActiveTab == tab1
                    ? this.props.type == 'bottom'
                      ? 'transparent'
                      : color
                    : 'transparent',
              }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: textSize,
                    color:
                      ActiveTab == tab1
                        ? this.props.type == 'bottom'
                          ? color
                          : 'white'
                        : textColor
                        ? textColor
                        : color,
                  },
                ]}>
                {tab1}
              </Text>
            </TouchableOpacity>
          ) : null}
          {tab2 ? (
            <TouchableOpacity
              onPress={() => {
                onPress(tab2);
              }}
              style={{
                width: tab2Width,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                borderRadius: borderRadius,
                borderBottomWidth:
                  this.props.type == 'bottom' && ActiveTab == tab2 ? 3 : 0,

                backgroundColor:
                  ActiveTab == tab2
                    ? this.props.type == 'bottom'
                      ? 'transparent'
                      : color
                    : 'transparent',
              }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: textSize,
                    color:
                      ActiveTab == tab2
                        ? this.props.type == 'bottom'
                          ? color
                          : 'white'
                        : textColor
                        ? textColor
                        : color,
                  },
                ]}>
                {tab2}
              </Text>
            </TouchableOpacity>
          ) : null}
          {tab3 ? (
            <TouchableOpacity
              onPress={() => {
                onPress(tab3);
              }}
              style={{
                width: tab3Width,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                borderRadius: borderRadius,
                borderBottomWidth:
                  this.props.type == 'bottom' && ActiveTab == tab3 ? 3 : 0,

                backgroundColor:
                  ActiveTab == tab3
                    ? this.props.type == 'bottom'
                      ? 'transparent'
                      : color
                    : 'transparent',
              }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: textSize,
                    color:
                      ActiveTab == tab3
                        ? this.props.type == 'bottom'
                          ? color
                          : 'white'
                        : textColor
                        ? textColor
                        : color,
                  },
                ]}>
                {tab3}
              </Text>
            </TouchableOpacity>
          ) : null}
          {tab4 ? (
            <TouchableOpacity
              onPress={() => {
                onPress(tab4);
              }}
              style={{
                width: tab4Width,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                borderRadius: borderRadius,
                borderBottomWidth:
                  this.props.type == 'bottom' && ActiveTab == tab4 ? 3 : 0,

                backgroundColor:
                  ActiveTab == tab4
                    ? this.props.type == 'bottom'
                      ? 'transparent'
                      : color
                    : 'transparent',
              }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: textSize,
                    color:
                      ActiveTab == tab4
                        ? this.props.type == 'bottom'
                          ? color
                          : 'white'
                        : textColor
                        ? textColor
                        : color,
                  },
                ]}>
                {tab4}
              </Text>
            </TouchableOpacity>
          ) : null}
          {tab5 ? (
            <TouchableOpacity
              onPress={() => {
                onPress(tab5);
              }}
              style={{
                width: tab5Width,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                borderRadius: borderRadius,
                borderBottomWidth:
                  this.props.type == 'bottom' && ActiveTab == tab5 ? 3 : 0,

                backgroundColor:
                  ActiveTab == tab5
                    ? this.props.type == 'bottom'
                      ? 'transparent'
                      : color
                    : 'transparent',
              }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: textSize,
                    color:
                      ActiveTab == tab5
                        ? this.props.type == 'bottom'
                          ? color
                          : 'white'
                        : textColor
                        ? textColor
                        : color,
                  },
                ]}>
                {tab5}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    };

    if (scroll) {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderChild()}
        </ScrollView>
      );
    }
    return renderChild();
  }
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'white',
    paddingHorizontal: 5,
  },
});
