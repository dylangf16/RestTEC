from datetime import datetime, timedelta

from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Load JSON data from file
try:
    with open('usuarios.json') as f:
        dataBase = json.load(f)
except FileNotFoundError:
    dataBase = {'usuarios': [], 'menu': [], 'pedidos': []}

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('nombre')
    first_lastname = data.get('apellido1')
    second_lastname = data.get('apellido2')
    email = data.get('correo')
    password = data.get('contrasena')
    id_number = data.get('cedula')
    birth_date = data.get('fecha_nacimiento')
    phone_numbers = data.get('telefonos', [])
    province = data.get('direccion', {}).get('provincia')
    canton = data.get('direccion', {}).get('canton')
    district = data.get('direccion', {}).get('distrito')

    if not all([name, first_lastname, second_lastname, email, password, id_number, birth_date, phone_numbers, province, canton, district]):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    # Check if email already exists
    if any(user['correo'] == email for user in dataBase['usuarios']):
        return jsonify({'error': 'El correo electrónico ya está registrado'}), 400

    # Generate a unique ID for the new user
    new_id = max((user.get('id', 0) for user in dataBase['usuarios']), default=0) + 1

    # Create new user object
    new_user = {
        'id': new_id,
        'nombre': name,
        'apellido1': first_lastname,
        'apellido2': second_lastname,
        'correo': email,
        'contrasena': password,
        'cedula': id_number,
        'fecha_nacimiento': birth_date,
        'telefonos': phone_numbers,
        'direccion': {
            'provincia': province,
            'canton': canton,
            'distrito': district
        },
        'rol': 'cliente'  # You can set the default role here
    }

    # Add new user to usuarios_data
    dataBase['usuarios'].append(new_user)

    # Write updated data back to JSON file
    with open('usuarios.json', 'w') as f:
        json.dump(dataBase, f, indent=4)

    return jsonify({'message': 'Registro exitoso'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('correo')
    password = data.get('contrasena')

    if not email or not password:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    # Check if email exists in the database
    user = next((user for user in dataBase['usuarios'] if user['correo'] == email), None)
    if user:
        # Check if password matches
        if user['contrasena'] == password:
            client_id = user['id']  # Get the client ID
            return jsonify({'message': 'Inicio de sesión exitoso', 'client_id': client_id}), 200
        else:
            return jsonify({'error': 'Contraseña incorrecta'}), 401
    else:
        return jsonify({'error': 'El correo electrónico no está registrado'}), 404

@app.route('/dishes', methods=['GET'])
def get_dishes():
    dishes = dataBase.get('menu', [])
    return jsonify({'dishes': dishes})

@app.route('/order', methods=['POST'])
def place_order():
    order_data = request.json
    selected_dishes = order_data.get('platos', [])
    client_id = order_data.get('client_id')

    # Retrieve dishes information from the menu
    menu = dataBase.get('menu', [])
    ordered_dishes = {}
    total_amount = 0
    total_duration = 0

    for dish_id in selected_dishes:
        for menu_item in menu:
            if menu_item['id_plato'] == dish_id:
                # Increment vendidos count for the dish
                menu_item['vendidos'] += 1

                # Check if the dish is already in the order
                if dish_id in ordered_dishes:
                    # If the dish exists, increment its quantity
                    ordered_dishes[dish_id]['cantidad'] += 1
                else:
                    # If the dish is not in the order, add it with quantity 1
                    ordered_dishes[dish_id] = {
                        'id_plato': menu_item['id_plato'],
                        'nombre_plato': menu_item['nombre_plato'],
                        'precio': menu_item['precio'],
                        'duracionEstMin': menu_item['duracionEstMin'],
                        'cantidad': 1
                    }
                # Update total amount and duration
                total_amount += menu_item['precio']
                total_duration += menu_item['duracionEstMin']

    # Generate a unique ID for the order
    order_id = len(dataBase['pedidos']) + 1

    # Current date and time
    current_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    # With only 2 decimal places
    total_amount = "{:.2f}".format(total_amount)

    # Calculate completion time based on total duration
    completion_time = (datetime.utcnow() + timedelta(minutes=total_duration)).strftime('%Y-%m-%dT%H:%M:%SZ')

    # Create the order object
    new_order = {
        'id_pedido': order_id,
        'id_cliente': client_id,
        'platos': list(ordered_dishes.values()),
        'monto_total': total_amount,
        'fecha_hora': current_time,
        'hora_finalizacion': completion_time,
        'estado': "Recibido por el restaurante"
    }

    # Add the order to the orders list
    dataBase['pedidos'].append(new_order)

    # Write updated data back to JSON file
    with open('usuarios.json', 'w') as f:
        json.dump(dataBase, f, indent=4)

    return jsonify({'message': 'Pedido registrado con éxito', 'order_id': order_id}), 200



@app.route('/order/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = next((order for order in dataBase['pedidos'] if order.get('id_pedido') == order_id), None)
    if order:
        return jsonify(order), 200
    else:
        return jsonify({'error': 'No se encontró el pedido'}), 404

# Define possible states for an order (solo los que no estan finalizadas)
possible_active_states = ["Recibido por el restaurante", "Esperando que lo acepte un cocinero", "En proceso"]

@app.route('/orders/<int:client_id>', methods=['GET'])
def get_active_orders(client_id):
    client_orders = [order for order in dataBase['pedidos'] if order.get('id_cliente') == client_id and order.get('estado') in possible_active_states]
    return jsonify({'orders': client_orders}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
