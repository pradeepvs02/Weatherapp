import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const ForecastItem = ({item}) => {
  // Helper function to get the relative day (Today, Tomorrow, etc.)
  const getRelativeDay = dateString => {
    const inputDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (inputDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(
        inputDate,
      );
    }
  };

  const dayLabel = getRelativeDay(item.date);

  return (
    <View style={styles.forecastItem}>
      <Text style={[styles.forecastText, {marginBottom: 3, color: '#f5af19'}]}>
        {dayLabel}
      </Text>
      <View style={styles.forecastTextRow}>
        <Text style={styles.forecastRow}>Date</Text>
        <Text style={styles.forecastRow}>{item.date}</Text>
      </View>
      <View style={styles.forecastTextRow}>
        <Text style={styles.forecastRow}>maxtemp</Text>
        <Text style={styles.forecastRow}>{item.day.maxtemp_f}°C</Text>
      </View>
      <View style={styles.forecastTextRow}>
        <Text style={styles.forecastRow}>mintemp</Text>
        <Text style={styles.forecastRow}>{item.day.mintemp_f}°C</Text>
      </View>
      <View style={styles.forecastTextRow}>
        <Text style={[styles.forecastRow, {marginTop: 20}]}>
          {item.day.condition.text}
        </Text>
        <Image
          source={{uri: `https:${item.day.condition.icon}`}}
          style={{width: 50, height: 50}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  forecastItem: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  forecastText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  forecastRow: {
    fontSize: 16,
    color: '#fff',
  },
});

export default React.memo(ForecastItem);
