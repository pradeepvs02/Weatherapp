import axios from 'axios';
import {apiKey} from '../constants';

// Function to build the forecast endpoint
const forecastEndpoint = params =>
  `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=yes&alerts=yes`;

// Function to build the location endpoint
const locationEndpoint = params =>
  `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}&aqi=yes`;

// General API call function
const apiCall = async endpoint => {
  const options = {
    method: 'GET',
    url: endpoint,
  };
  try {
    const response = await axios.request(options); // Corrected spelling
    return response.data; // Return the data
  } catch (err) {
    console.error('Error:', err.message); // Log only the error message for clarity
    return null; // Return null on failure
  }
};

// Fetch weather forecast
export const fetchWeatherForecast = params => {
  return apiCall(forecastEndpoint(params));
};

// Fetch location suggestions
export const fetchLocations = params => {
  return apiCall(locationEndpoint(params));
};
