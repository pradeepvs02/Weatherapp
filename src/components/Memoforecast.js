// MemoizedForecastItem.js
import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const MemoizedForecastItem = React.memo(({item}) => {
  const formattedTime = item?.time
    ? new Date(item.time).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    : 'N/A';

  return (
    <View style={styles.forecastItem}>
      <Text style={{color: '#fff'}}>{formattedTime}</Text>
      {item?.condition?.icon ? (
        <Image
          source={{uri: `https:${item.condition.icon}`}}
          style={styles.icon}
        />
      ) : (
        <Text>No Icon Available</Text>
      )}
      <Text style={{color: '#fff'}}>{item?.temp_f || 'N/A'}°F</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  icon: {
    width: 50,
    height: 50,
  },
  forecastItem: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default MemoizedForecastItem;
