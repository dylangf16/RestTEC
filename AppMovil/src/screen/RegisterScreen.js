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

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [province, setProvince] = useState('');
  const [canton, setCanton] = useState('');
  const [district, setDistrict] = useState('');
  const navigation = useNavigation();

  const handleRegister = () => {
    // Check if all required fields are filled
    if (
      !firstName ||
      !firstLastName ||
      !secondLastName ||
      !email ||
      !password ||
      !idNumber ||
      !birthDate ||
      !province ||
      !canton ||
      !district ||
      phoneNumbers.some(number => !number.trim())
    ) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    // Create user data object
    const userData = {
      nombre: firstName,
      apellido1: firstLastName,
      apellido2: secondLastName,
      correo: email,
      contrasena: password,
      cedula: idNumber,
      fecha_nacimiento: birthDate,
      telefonos: phoneNumbers.filter(number => number.trim()), // Remove empty phone numbers
      direccion: {
        provincia: province,
        canton: canton,
        distrito: district,
      },
    };

    // Send POST request to Flask server
    fetch('http://10.0.2.2:5274/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => {
        if (response.ok) {
          Alert.alert(
            'Registro exitoso',
            '¡Tu cuenta ha sido creada exitosamente!',
          );
          navigation.navigate('LoginScreen');
        } else {
          Alert.alert('Error', 'El correo electrónico ya está registrado.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'Hubo un problema al intentar registrar la cuenta.',
        );
      });
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const handlePhoneNumberChange = (text, index) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = text;
    setPhoneNumbers(newPhoneNumbers);
  };

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Registro</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            onChangeText={text => setFirstName(text)}
            value={firstName}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Primer apellido"
            onChangeText={text => setFirstLastName(text)}
            value={firstLastName}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Segundo apellido"
            onChangeText={text => setSecondLastName(text)}
            value={secondLastName}
            placeholderTextColor="#666"
          />
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
          <TextInput
            style={styles.input}
            placeholder="Número de cédula"
            onChangeText={text => setIdNumber(text)}
            value={idNumber}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha de nacimiento (YYYY-MM-DD)"
            onChangeText={text => setBirthDate(text)}
            value={birthDate}
            placeholderTextColor="#666"
          />
          {phoneNumbers.map((phoneNumber, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder="Teléfono"
              onChangeText={text => handlePhoneNumberChange(text, index)}
              value={phoneNumber}
              placeholderTextColor="#666"
            />
          ))}
          <View style={styles.buttonContainer}>
            <Button
              title="Agregar teléfono"
              onPress={addPhoneNumber}
              color="#841584"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Provincia"
            onChangeText={text => setProvince(text)}
            value={province}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Cantón"
            onChangeText={text => setCanton(text)}
            value={canton}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Distrito"
            onChangeText={text => setDistrict(text)}
            value={district}
            placeholderTextColor="#666"
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Registrarse"
              onPress={handleRegister}
              color="#841584"
            />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

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
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
  },
});

export default RegisterScreen;
