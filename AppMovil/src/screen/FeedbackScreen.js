import React, {useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default FeedbackScreen;
