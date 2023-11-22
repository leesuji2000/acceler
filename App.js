import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Vibration } from 'react-native'; // Import Vibration
import { Accelerometer } from 'expo-sensors';
import { LineChart } from 'react-native-chart-kit';

const MAX_DATA_POINTS = 50; // Set the maximum number of data points to display
const VIBRATION_THRESHOLD = 1; // Set the threshold for vibration

export default function App() {
  const [data, setData] = useState({
    x: [],
    y: [],
    z: [],
  });
  const [subscription, setSubscription] = useState(null);

  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(50); // Set a shorter interval for faster updates

  const _subscribe = () => {
    setSubscription(Accelerometer.addListener(handleAccelerometerChange));
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const handleAccelerometerChange = ({ x, y, z }) => {
    setData((prevData) => ({
      x: [...prevData.x.slice(-MAX_DATA_POINTS + 1), x], // Keep only the last MAX_DATA_POINTS data points
      y: [...prevData.y.slice(-MAX_DATA_POINTS + 1), y],
      z: [...prevData.z.slice(-MAX_DATA_POINTS + 1), z],
    }));

    // Check if the displacement is greater than the threshold for vibration
    const displacement = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    if (displacement > VIBRATION_THRESHOLD) {
      Vibration.vibrate();
    }
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>
      <Text style={styles.text}>x: {data.x[data.x.length - 1]}</Text>
      <Text style={styles.text}>y: {data.y[data.y.length - 1]}</Text>
      <Text style={styles.text}>z: {data.z[data.z.length - 1]}</Text>
      <ScrollView contentContainerStyle={styles.chartContainer}>
        <LineChart
          data={{
            labels: Array.from({ length: data.x.length }, (_, i) => i.toString()),
            datasets: [
              {
                data: data.x,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
              },
            ],
          }}
          width={300}
          height={200}
          yAxisLabel="X"
          yAxisSuffix=""
          chartConfig={chartConfig}
        />
        <LineChart
          data={{
            labels: Array.from({ length: data.y.length }, (_, i) => i.toString()),
            datasets: [
              {
                data: data.y,
                color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
              },
            ],
          }}
          width={300}
          height={200}
          yAxisLabel="Y"
          yAxisSuffix=""
          chartConfig={chartConfig}
        />
        <LineChart
          data={{
            labels: Array.from({ length: data.z.length }, (_, i) => i.toString()),
            datasets: [
              {
                data: data.z,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              },
            ],
          }}
          width={300}
          height={200}
          yAxisLabel="Z"
          yAxisSuffix=""
          chartConfig={chartConfig}
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});