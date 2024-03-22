import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  ImageBackground,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import StarRating from 'react-native-star-rating';

const FeedbackScreen = ({route}) => {
  const {order} = route.params;
  const [ratings, setRatings] = useState(
    order.platos.map(() => 0), // Initialize ratings with 0 for each plate
  );

  const handleSendFeedback = () => {
    Promise.all(
      order.platos.map((plato, index) => {
        const feedback = {
          id_plato: plato.id_plato,
          rating: ratings[index],
        };

        return fetch('http://10.0.2.2:5274/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedback),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log('Feedback sent:', data);
          });
      }),
    )
      .then(() => {
        // After all feedbacks have been sent, navigate to ActiveOrdersScreen
        navigation.navigate('ActiveOrdersScreen');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleStarRatingPress = (rating, index) => {
    const newRatings = [...ratings];
    newRatings[index] = rating;
    setRatings(newRatings);
  };

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.container}>
        {order.platos.map((plato, index) => (
            <View key={plato.id_plato} style={styles.ratingContainer}>
                <Text>{plato.nombre_plato}</Text>
                <StarRating
                    disabled={false}
                    maxStars={5}
                    rating={ratings[index]}
                    selectedStar={rating => handleStarRatingPress(rating, index)}
                    fullStarColor={'gold'}
                />
            </View>
        ))}
        <Button title="Enviar comentarios" onPress={handleSendFeedback} />
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  platoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#800080', // Purple
  },
  platoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#800080', // Purple
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
});

export default FeedbackScreen;
