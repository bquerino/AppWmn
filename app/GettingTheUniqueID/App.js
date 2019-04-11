import React, { Component } from 'react';
import DeviceInfo from 'react-native-device-info'
import { Text, View } from 'react-native';

const uniqueId = DeviceInfo.getUniqueID();

fetch('http://localhost:8181/register/', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    deviceId: uniqueId,
    platform: "Android.OS",
  }),
});

export default class HelloWorldApp extends Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Hello, world!</Text>
        <Text>The uniqueID of this phone is: {uniqueId}</Text>
      </View>
    );
  }
}