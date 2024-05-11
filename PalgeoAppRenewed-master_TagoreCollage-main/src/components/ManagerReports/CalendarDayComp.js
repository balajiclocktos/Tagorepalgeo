import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

const weekDaysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

class InventoryCount extends React.PureComponent {
  getFooterTextStyle() {
    const {marking = {}, state} = this.props;
    console.log('markking, state', marking, state);
    const style = {
      color: 'black',
    };

    if (state !== 'disabled') {
      switch (marking.status) {
        case 'P':
          style.color = 'green';
          break;
        case 'A':
          style.color = 'red';
          break;
        case 'H':
          style.color = 'orange';
        default:
          style.color = 'grey';
          break;
      }
    }

    // if (marking.inventory > 0 && state !== 'disabled') {
    //   style.color = '#4caf50';
    // }
    return style;
  }

  getInventoryCount() {
    const {marking = {}, state} = this.props;
    if (typeof marking === 'object' && state !== 'disabled') {
      return marking.status;
    }
    if (state === 'disabled') {
      return '';
    } else {
      return 'NA';
    }
  }

  render() {
    return (
      <View style={styles.footer} {...this.props.copilot}>
        <Text style={this.getFooterTextStyle()}>
          {this.getInventoryCount()}
        </Text>
      </View>
    );
  }
}

class CalendarDayComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onDayPress = this.onDayPress.bind(this);
  }

  getContentStyle() {
    const {state, marking = {}} = this.props;
    const style = {
      content: {},
      text: {
        color: '#181c26',
      },
    };

    if (state === 'disabled') {
      style.text.color = '#c1c2c1';
    }

    if (marking.selected) {
      style.text.color = '#fff';
      style.content.backgroundColor = '#216bc9';
      style.content.borderRadius = 50;
    }

    return style;
  }

  onDayPress() {
    this.props.onPress(this.props.date);
  }

  render() {
    const contentStyle = this.getContentStyle();

    return (
      <View style={styles.container} {...this.props.copilot}>
        <View style={styles.header}>
          {this.props.horizontal ? (
            <Text style={styles.weekName} numberOfLines={1}>
              {weekDaysNames[this.props.date.weekDay].toUpperCase()}
            </Text>
          ) : null}
        </View>
        <InventoryCount {...this.props} />
        <TouchableOpacity
          style={[styles.content, contentStyle.content]}
          onPress={this.onDayPress}>
          <Text style={[styles.contentText, contentStyle.text]}>
            {String(this.props.children)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class CalendarDayWrapper extends React.PureComponent {
  render() {
    return <CalendarDayComponent {...this.props} />;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
    marginRight: 7,
  },
  weekName: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7c7c7c',
  },
  content: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 20,
  },
  footer: {
    flexDirection: 'row',
  },
  smallIcon: {
    width: 12,
    height: 12,
    position: 'absolute',
    top: -1,
    right: -1,
  },
});

export default CalendarDayWrapper;
