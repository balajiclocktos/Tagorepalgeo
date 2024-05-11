import * as React from 'react';
import * as RN from 'react-native';

class App extends React.Component {
  state = {
    activeDate: new Date(),
  };
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  generateMatrix() {
    var matrix = [];
    // Create header
    matrix[0] = this.weekDays;
    var year = this.state.activeDate.getFullYear();
    var month = this.state.activeDate.getMonth();

    var firstDay = new Date(year, month, 1).getDay();
    var maxDays = this.nDays[month];
    if (month == 1) {
      // February
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        maxDays += 1;
      }
    }
    var counter = 1;
    for (var row = 1; row < 7; row++) {
      matrix[row] = [];
      for (var col = 0; col < 7; col++) {
        matrix[row][col] = -1;
        if (row == 1 && col >= firstDay) {
          // Fill in rows only after the first day of the month
          matrix[row][col] = {counter: counter++, status: 'P'};
        } else if (row > 1 && counter <= maxDays) {
          // Fill in rows only if the counter's not greater than
          // the number of days in the month
          matrix[row][col] = {counter: counter++, status: 'A'};
        }
      }
    }

    console.log('matrix', matrix);

    return matrix;
    // More code here
  }
  render() {
    var matrix = this.generateMatrix();
    var rows = [];
    rows = matrix.map((row, rowIndex) => {
      console.log(row[rowIndex]);
      var rowItems = row.map((item, colIndex) => {
        return (
          <RN.View
            style={{
              height: 40,
              backgroundColor: item != -1 ? 'lightgrey' : 'transparent',
              width: rowIndex != 0 ? '14%' : 40,
              borderRadius: 5,
            }}>
            {rowIndex !== 0 && item != -1 ? (
              <RN.Text style={{flex: 1, textAlign: 'center'}}>
                {item.status}
              </RN.Text>
            ) : null}
            <RN.Text
              style={{
                flex: 1,
                //height: 18,
                textAlign: 'center',
                // Highlight header
                //backgroundColor: rowIndex == 0 ? '#ddd' : '#fff',
                // Highlight Sundays
                color: 'green',
                // Highlight current date
                fontWeight:
                  item == this.state.activeDate.getDate() ? 'bold' : '',
              }}
              onPress={() => {}}>
              {rowIndex == 0 ? item : item != -1 ? item.counter : ''}
            </RN.Text>
          </RN.View>
        );
      });

      console.log(rows);
      return (
        <RN.View
          style={{
            flex: 1,
            flexDirection: 'row',
            padding: 15,
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          {rowItems}
        </RN.View>
      );
    });
    return (
      <RN.View>
        <RN.Text
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
          }}>
          {this.months[this.state.activeDate.getMonth()]} &nbsp;
          {this.state.activeDate.getFullYear()}
        </RN.Text>
        {rows}
      </RN.View>
    );
  }
}

export default App;
