import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomProgressBar = ({ progress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Progreso: {progress.toFixed(0)}%</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    width: 300,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'blue', // Change color as needed
  },
});

export default CustomProgressBar;
