import React, {useState} from 'react';
import Geocoder from 'react-native-geocoding';
import Geolocation from 'react-native-geolocation-service';
Geocoder.init('AIzaSyDrH5O4x0LVfDOHIOcuXFj7_cS4Rz4eUxM');
export const coordinatestoaddress = () => {
  Geolocation.getCurrentPosition(
    position => {
      var coordinates = {
        latitude: parseFloat(position.coords.latitude),
        longitude: parseFloat(position.coords.longitude),
      };
      Geocoder.from(coordinates.latitude, coordinates.longitude)
        .then(json => {
          return json.results[0].formatted_address;
        })
        .catch(error => console.log(error));
    },
    error => {},
    {enableHighAccuracy: true, timeout: 2000, maximumAge: 0},
  );
};

//React Native FlatList Pagination to Load More Data dynamically – Infinite List
//https://aboutreact.com/react-native-flatlist-pagination-to-load-more-data-dynamically-infinite-list/

//import React in our code
import React, {useState, useEffect} from 'react';

//import all the components we are going to use
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [offset, setOffset] = useState(1);

  useEffect(() => getData(), []);

  const getData = () => {
    console.log('getData');
    setLoading(true);
    //Service to get the data from the server to render
    fetch('https://aboutreact.herokuapp.com/getpost.php?offset=' + offset)
      //Sending the currect offset with get request
      .then(response => response.json())
      .then(responseJson => {
        //Successful response from the API Call
        setOffset(offset + 1);
        //After the response increasing the offset for the next API call.
        setDataSource([...dataSource, ...responseJson.results]);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <View style={styles.footer}>
        {loading ? (
          <TouchableOpacity
            activeOpacity={0.9}
            //onPress={getData}
            //On Click of button calling getData function to load more data
            style={styles.loadMoreBtn}>
            <Text style={styles.btnText}>Loading...</Text>

            <ActivityIndicator color="red" style={{marginLeft: 8}} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const ItemView = ({item}) => {
    return (
      // Flat List Item
      <Text style={styles.itemStyle} onPress={() => getItem(item)}>
        {item.id}
        {'.'}
        {item.title.toUpperCase()}
      </Text>
    );
  };

  const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#C8C8C8',
        }}
      />
    );
  };

  const getItem = item => {
    //Function for click on an item
    alert('Id : ' + item.id + ' Title : ' + item.title);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <FlatList
          data={dataSource}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={ItemSeparatorView}
          enableEmptySections={true}
          renderItem={ItemView}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.1}
          onEndReached={getData}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
  },
  footer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 10,
    backgroundColor: '#800000',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default App;
