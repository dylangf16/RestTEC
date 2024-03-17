import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ScrollView,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {setClientId} from '../globalVariables/clientID';

// @ts-ignore
export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    // Prepare user data
    const userData = {
      correo: email,
      contrasena: password,
    };

    // Send POST request to Flask server for login
    fetch('http://10.0.2.2:5274/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            const {client_id} = data;
            // Set client ID in the global variable
            setClientId(client_id);
            Alert.alert('Inicio de sesion', 'Se ha iniciado sesion con exito.');
            navigation.navigate('HomeScreen');
          });
        } else {
          Alert.alert('Error', 'Correo electrónico o contraseña incorrectos.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'Hubo un problema al intentar iniciar sesión.');
      });
  };

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Inicio de Sesión</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            onChangeText={text => setEmail(text)}
            value={email}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            onChangeText={text => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholderTextColor="#666"
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              color="#841584"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Text style={styles.text}>¿Aún no tienes cuenta?</Text>
            <Button
              title="Registrarse"
              onPress={() => navigation.navigate('RegisterScreen')}
              color="#841584"
            />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  formContainer: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});
