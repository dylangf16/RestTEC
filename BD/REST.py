from datetime import datetime

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
    email = data.get('correo')
    password = data.get('contrasena')

    if not name or not email or not password:
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
        'correo': email,
        'contrasena': password,
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
            return jsonify({'message': 'Inicio de sesión exitoso'}), 200
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

    # Retrieve dishes information from the menu
    menu = dataBase.get('menu', [])
    ordered_dishes = []
    total_amount = 0
    for dish_id in selected_dishes:
        for menu_item in menu:
            if menu_item['id_plato'] == id_name:
                ordered_dishes.append({
                    'nombre_plato': menu_item['nombre_plato'],
                    'precio': menu_item['precio']
                })
                total_amount += menu_item['precio']

    # Generate a unique ID for the order
    order_id = len(dataBase['pedidos']) + 1

    # Current date and time
    current_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    # Create the order object
    new_order = {
        'id': order_id,
        'platos': ordered_dishes,
        'monto_total': total_amount,
        'fecha_hora': current_time
    }

    # Add the order to the orders list
    dataBase['pedidos'].append(new_order)

    # Write updated data back to JSON file
    with open('usuarios.json', 'w') as f:
        json.dump(dataBase, f, indent=4)

    return jsonify({'message': 'Pedido realizado exitosamente', 'order_id': order_id}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
