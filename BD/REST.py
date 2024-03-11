from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Load JSON data from file
try:
    with open('usuarios.json') as f:
        usuarios_data = json.load(f)
except FileNotFoundError:
    usuarios_data = {'usuarios': []}

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('nombre')
    email = data.get('correo')
    password = data.get('contrasena')

    if not name or not email or not password:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    # Check if email already exists
    if any(user['correo'] == email for user in usuarios_data['usuarios']):
        return jsonify({'error': 'El correo electrónico ya está registrado'}), 400

    # Generate a unique ID for the new user
    new_id = max((user.get('id', 0) for user in usuarios_data['usuarios']), default=0) + 1

    # Create new user object
    new_user = {
        'id': new_id,
        'nombre': name,
        'correo': email,
        'contrasena': password,
        'rol': 'cliente'  # You can set the default role here
    }

    # Add new user to usuarios_data
    usuarios_data['usuarios'].append(new_user)

    # Write updated data back to JSON file
    with open('usuarios.json', 'w') as f:
        json.dump(usuarios_data, f, indent=4)

    return jsonify({'message': 'Registro exitoso'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('correo')
    password = data.get('contrasena')

    if not email or not password:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    # Check if email exists in the database
    user = next((user for user in usuarios_data['usuarios'] if user['correo'] == email), None)
    if user:
        # Check if password matches
        if user['contrasena'] == password:
            return jsonify({'message': 'Inicio de sesión exitoso'}), 200
        else:
            return jsonify({'error': 'Contraseña incorrecta'}), 401
    else:
        return jsonify({'error': 'El correo electrónico no está registrado'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
