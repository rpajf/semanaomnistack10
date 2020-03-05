import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native' 

import MapView, { Marker, Callout } from 'react-native-maps'

import { requestPermissionsAsync, getCurrentPositionAsync} from 'expo-location'
import { MaterialIcons } from '@expo/vector-icons';

import api from '../../services/api';
import { connect, disconnect, subscribeToNewDevs } from '../../services/socket';



export default function Main({ navigation }) {
  const [devs, setDevs] = useState([]);
  const [keyboardON, setKeyboardON] = useState(false);
  const [keyboardSize, setKeyboardSize] = useState(0);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [techs, setTechs] = useState('');

  useEffect(() => {
    async function loadInitionPosition() {
      const {granted} = await requestPermissionsAsync();

      if (granted) {
        const {coords} = await getCurrentPositionAsync({
          enableHighAccuracy: true,
        });

        const { latitude, longitude } = coords;

        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        })
      }

    }
    loadInitionPosition()

  },[])

  useEffect(() => {
    //take all the info that is already on the data
    //and add the one from the new dev
    subscribeToNewDevs(dev => setDevs([...devs, dev]));

  }, [devs])

  function setupWebsocket() {
    disconnect();
    const { latitude, longitude } = currentRegion;

    connect(
      latitude,
      longitude,
      techs,
    );
    socket.on('message', text => {
      
    })

  }

  async function loadDevs() {
    const { latitude, longitude } = currentRegion;

    const response = await api.get('/search', {
      params: {
        latitude,
        longitude,
        techs
      }
    });
    setDevs(response.data.devs)

    setupWebsocket();
  }
    // Quando o teclado aparecer ele vai setar o estado de 'keyboardON' e a altura no 'setKeyboardSize'.
    Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardON(true);
      setKeyboardSize(event.endCoordinates.height + 10 ); // Hackzinho pro teclado não ficar tão longe do input.
    });
  
    // Configurações quando o teclado sumir da tela.
    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardON(false);
      setKeyboardSize(0);
    });

  function handleRegionChange(region) {
    setCurrentRegion(region)

  }

  if(!currentRegion) {
    return null
  }

  return (
    <>
    
    <MapView 
    onRegionChangeComplete={handleRegionChange} 
    initialRegion={currentRegion} 
    style={styles.map}>
      
      {devs.map(dev => (
        <Marker 
        key={dev._id}
        coordinate={{
          longitude: dev.location.coordinates[0],
          latitude: dev.location.coordinates[1], 
          }}>
          <Image style={styles.avatar} 
          source={{
            uri: dev.avatar_url
            }}/>
           
          <Callout 
          onPress={() => {
            navigation.navigate('Profile', {github_username: dev.github_username})
          }}>
  
            <View style={styles.Callout}>
              <Text style={styles.devName}>{dev.name}</Text>
              <Text style={styles.devBio}>{dev.bio}</Text>
              <Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
            </View>
          </Callout>
         
  
        </Marker>
      ))}
    </MapView>
    <View style={keyboardON ? { bottom: keyboardSize } : styles.removeBottom}> 
    <View style={styles.searchForm}>
      <TextInput 
      style={styles.searchInput}
      placeholder={"Buscar devs por techs..."}
      placeholderTextColor="#999"
      autoCapitalize="words"
      autoCorrect={false}
      value={techs}
      onChangeText={setTechs}
      onPress={keyboardON}
      
      
        />
       
        
     
      

      <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
        <MaterialIcons name="my-location" size={20} color="#FFF"/>

      </TouchableOpacity>

      
    </View> 
    </View>
  
    
    </> 
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: "#fff",

  },
  Callout: {
    width: 260,
  },
  devName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  devBio: {
    color: '#666',
    marginTop: 5
  },
  devTechs: {
    marginTop: 5
  },
  searchForm: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFF',
    color: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    elevation: 5, //just android
    
  },
  loadButton: {
    width:50,
    height: 50,
    backgroundColor: '#8E4DFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15
  },
  
})

