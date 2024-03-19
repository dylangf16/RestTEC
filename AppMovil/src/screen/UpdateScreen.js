import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ImageBackground,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getClientId} from '../globalVariables/clientID';

const UpdateScreen = () => {
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

  const userId = getClientId();

  const handleUpdate = () => {
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
      userId: userId,
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

    // Send PUT request to update user information
    fetch(`http://10.0.2.2:5274/update/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => {
        if (response.ok) {
          Alert.alert(
            'Actualización exitosa',
            '¡Tu información ha sido actualizada exitosamente!',
          );
          navigation.navigate('HomeScreen'); // Navigate to the profile screen
        } else {
          Alert.alert(
            'Error',
            'Hubo un problema al intentar actualizar la información.',
          );
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'Hubo un problema al intentar actualizar la información.',
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

  const handleDeleteAccount = () => {
    // Confirm with the user before deleting the account
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro que deseas eliminar tu cuenta?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancelado'),
          style: 'cancel',
        },
        {text: 'Eliminar', onPress: deleteAccount},
      ],
      {cancelable: false},
    );
  };

  const deleteAccount = () => {
    // Send DELETE request to delete the account
    fetch(`http://10.0.2.2:5274/delete/${userId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          Alert.alert(
            'Cuenta eliminada',
            'Tu cuenta ha sido eliminada exitosamente.',
          );
          navigation.navigate('LoginScreen'); // Navigate to the home screen
        } else {
          Alert.alert(
            'Error',
            'Hubo un problema al intentar eliminar la cuenta.',
          );
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert(
          'Error',
          'Hubo un problema al intentar eliminar la cuenta.',
        );
      });
  };

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Actualizar Información</Text>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            onChangeText={text => setFirstName(text)}
            value={firstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Primer apellido"
            onChangeText={text => setFirstLastName(text)}
            value={firstLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Segundo apellido"
            onChangeText={text => setSecondLastName(text)}
            value={secondLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            onChangeText={text => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            onChangeText={text => setPassword(text)}
            value={password}
            secureTextEntry={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Número de cédula"
            onChangeText={text => setIdNumber(text)}
            value={idNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha de nacimiento (YYYY-MM-DD)"
            onChangeText={text => setBirthDate(text)}
            value={birthDate}
          />
          {phoneNumbers.map((phoneNumber, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder="Teléfono"
              onChangeText={text => handlePhoneNumberChange(text, index)}
              value={phoneNumber}
            />
          ))}
          <View style={styles.buttonContainer}>
            <Button
              title="Agregar teléfono"
              onPress={addPhoneNumber}
              color="#800080"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Provincia"
            onChangeText={text => setProvince(text)}
            value={province}
          />
          <TextInput
            style={styles.input}
            placeholder="Cantón"
            onChangeText={text => setCanton(text)}
            value={canton}
          />
          <TextInput
            style={styles.input}
            placeholder="Distrito"
            onChangeText={text => setDistrict(text)}
            value={district}
          />
          <View style={styles.buttonContainer}>
            <Button title="Actualizar" onPress={handleUpdate} color="#800080" />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Eliminar cuenta"
            onPress={handleDeleteAccount}
            color="#800080" // Purple
          />
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  formContainer: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent
    padding: 20,
    borderRadius: 10,
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
    marginBottom: 20,
    width: '100%',
  },
});

export default UpdateScreen;
