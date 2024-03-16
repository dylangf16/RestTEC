import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView } from 'react-native';
import config from '../../src/config/config'; // Import the configuration file
import { useNavigation } from '@react-navigation/native';


const ip = config.ip;

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
    if (!firstName || !firstLastName || !secondLastName || !email || !password || !idNumber || !birthDate || !province || !canton || !district || phoneNumbers.some(number => !number.trim())) {
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
      }
    };

    // Send POST request to Flask server
    fetch('http://'+ ip +':5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => {
        if (response.ok) {
          Alert.alert('Registro exitoso', '¡Tu cuenta ha sido creada exitosamente!');
          navigation.navigate('LoginScreen');

        } else {
          Alert.alert('Error', 'El correo electrónico ya está registrado.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'Hubo un problema al intentar registrar la cuenta.');
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          onChangeText={(text) => setFirstName(text)}
          value={firstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Primer apellido"
          onChangeText={(text) => setFirstLastName(text)}
          value={firstLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Segundo apellido"
          onChangeText={(text) => setSecondLastName(text)}
          value={secondLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Número de cédula"
          onChangeText={(text) => setIdNumber(text)}
          value={idNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de nacimiento (YYYY-MM-DD)"
          onChangeText={(text) => setBirthDate(text)}
          value={birthDate}
        />
        {phoneNumbers.map((phoneNumber, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder="Teléfono"
            onChangeText={(text) => handlePhoneNumberChange(text, index)}
            value={phoneNumber}
          />
        ))}
        <View style={styles.buttonContainer}>
          <Button title="Agregar teléfono" onPress={addPhoneNumber} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Provincia"
          onChangeText={(text) => setProvince(text)}
          value={province}
        />
        <TextInput
          style={styles.input}
          placeholder="Cantón"
          onChangeText={(text) => setCanton(text)}
          value={canton}
        />
        <TextInput
          style={styles.input}
          placeholder="Distrito"
          onChangeText={(text) => setDistrict(text)}
          value={district}
        />
        <View style={styles.buttonContainer}>
          <Button title="Registrarse" onPress={handleRegister} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  formContainer: {
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default RegisterScreen;
