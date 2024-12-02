import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Icon,
  TextInput,
  Image,
  StatusBar,
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {fetchLocations} from '../api/weather';
import {fetchWeatherForecast} from '../api/weather';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import MemoizedForecastItem from '../components/Memoforecast';
import ForecastItem from '../components/ForecastItem';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hourreport, sethourreport] = useState('');
  const [imagevalue, setimagevalue] = useState(1);
  const [filteredItems, setFilteredItems] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [location, setlocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [city, setCity] = useState('Fetching...');
  const [status, setStatus] = useState('Initializing...');
  const [cityFetched, setCityFetched] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (cityFetched) {
      handleLocation2();
    }
  }, [cityFetched]);

  // Function to request location permissions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      getCurrentLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'We need access to your location to fetch your current city.',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getCurrentLocation();
        } else {
          setStatus('Permission denied');
        }
      } catch (error) {
        console.warn('Error requesting location permission:', error);
      }
    }
  };

  // Function to fetch the current location
  const getCurrentLocation = () => {
    setStatus('Fetching location...');

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        fetchCityName(latitude, longitude);
      },
      error => {
        setStatus(`Error: ${error.message}`);
        console.error('Location Error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        forceRequestLocation: true,
      },
    );
  };

  // Function to fetch city name using Google Maps API
  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB1AZwpkdOOuw0e__XUq0CuQz62peYCFKI`,
      );
      const addressComponents = response.data.results[0].address_components;
      const cityComponent = addressComponents.find(component =>
        component.types.includes('locality'),
      );
      if (cityComponent) {
        setCity(cityComponent.long_name);
        setStatus('City fetched successfully!');
        setCityFetched(true);
      } else {
        setCity('City not found');
        setCityFetched(false);
      }
    } catch (error) {
      console.error('Error fetching city name:', error);
      setStatus('Error fetching city name');
      setCityFetched(false);
    }
  };

  // Handle location selection and fetching forecast
  const handleLocation2 = () => {
    if (cityFetched) {
      setFilteredItems([]);
      setQuery('');
      setlocation(city);

      // Fetch forecast for the selected location
      fetchWeatherForecast({
        cityName: city,
        days: 7,
      })
        .then(data => {
          if (data) {
            setForecast(data.forecast.forecastday);
          } else {
            console.error('Failed to fetch forecast.');
          }
        })
        .catch(err => console.error('Error fetching forecast:', err));
    } else {
      setStatus('City not available. Please try again.');
    }
  };

  const handleLocation = loc => {
    setFilteredItems([]);
    setQuery('');
    setlocation(loc.name);
    // Fetch forecast for the selected location
    fetchWeatherForecast({
      cityName: loc.name,
      days: 7,
    })
      .then(data => {
        if (data) {
          setForecast(data.forecast.forecastday);
        } else {
          console.error('Failed to fetch forecast.');
        }
      })
      .catch(err => console.error('Error fetching forecast:', err));
  };

  const handleSearch = async text => {
    setQuery(text);
    setShowDropdown(text.length > 0);
    if (text.length > 0) {
      const data = await fetchLocations({cityName: text});
      if (data) {
        const filtered = data.filter(location =>
          location.name.toLowerCase().includes(text.toLowerCase()),
        );
        setFilteredItems(filtered);
      }
    } else {
      setFilteredItems([]);
    }
  };

  const renderDropdownItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        setShowDropdown(false), handleLocation(item);
      }}>
      <Text style={styles.dropdownItem}>
        {item.name}, {item.region}, {item.country}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#302b63',
      }}>
      <StatusBar backgroundColor="#302b63" />
      <View>
        <View style={styles.searchInput}>
          <TextInput
            value={query}
            onChangeText={text => handleSearch(text)}
            placeholder="Search city..."
            style={styles.textInput}
            keyboardShouldPersistTaps="handled"
          />
          <TouchableOpacity
            style={{marginRight: 20}}
            onPress={() => {
              console.log(filteredItems, 'filteredItems');
            }}>
            <Ionicons name="search" size={25} color={'red'} />
          </TouchableOpacity>
        </View>

        {showDropdown && (
          <FlatList
            style={[styles.dropdown]}
            data={filteredItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderDropdownItem}
          />
        )}
      </View>
      <View>
        <FlatList
          data={forecast}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => <ForecastItem item={item} />}
          nestedScrollEnabled={true}
          ListHeaderComponent={
            <>
              {/* Add other components here */}
              <View
                style={{marginLeft: 10, marginTop: 30, flexDirection: 'row'}}>
                <Ionicons name="location-outline" size={25} color={'#fff'} />
                <Text style={{color: '#fff', marginTop: 5, fontSize: 15}}>
                  {location}
                </Text>
              </View>
              {forecast[0]?.day?.condition.text === 'Moderate rain' ||
              forecast[0]?.day?.condition.text === 'Patchy rain nearby' ||
              forecast[0]?.day?.condition.text === 'Light rain shower' ||
              forecast[0]?.day?.condition.text === 'Heavy rain' ? (
                <Image
                  source={require('../assets/pngwing.com.png')}
                  style={[styles.image, , {width: 400, height: 400}]}
                />
              ) : forecast[0]?.day?.condition.text === 'Partly Cloudy ' ||
                forecast[0]?.day?.condition.text === 'Cloudy' ? (
                <Image
                  source={require('../assets/pngwing2.com.png')}
                  style={styles.image}
                />
              ) : (
                <Image
                  source={require('../assets/pngwing1.com.png')}
                  style={[styles.image, {width: 300, height: 300}]}
                />
              )}
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 15,
                    marginTop: 150,
                  }}>
                  <View style={{flexDirection: 'row', marginTop: 100}}>
                    <Feather name="wind" size={25} color={'#fff'} />
                    <Text style={styles.windtext}>
                      {forecast[0]?.day.maxwind_kph}kph
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', marginTop: 100}}>
                    <Ionicons name="water-outline" size={25} color={'#fff'} />
                    <Text style={styles.windtext}>
                      {forecast[0]?.day.avghumidity}%
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', marginTop: 100}}>
                    <Ionicons name="eye-outline" size={25} color={'#fff'} />
                    <Text style={styles.windtext}>
                      {forecast[0]?.day.avgvis_km}km
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: '#fff',
                    marginLeft: 10,
                    marginTop: 10,
                    margin: 5,
                  }}>
                  Today Report
                </Text>

                <FlatList
                  data={forecast[0]?.hour}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  renderItem={({item}) => <MemoizedForecastItem item={item} />}
                />

                <Text style={{color: '#fff', marginLeft: 10, marginTop: 10}}>
                  Daily Forecast
                </Text>
              </>
            </>
          }
          contentContainerStyle={{paddingBottom: 60}}
          style={{marginBottom: 60}}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    flexDirection: 'row',
    marginTop: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 40,
    width: '80%',
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 20,
    marginTop: 10,
  },
  windtext: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
