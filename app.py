from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from database import init_db, get_db_connection
from auth import hash_password, verify_password, generate_token, verify_token
from config import Config
import sqlite3

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize database
init_db()

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/calculator')
def calculator_page():
    return render_template('calculator.html')

@app.route('/result')
def result_page():
    return render_template('result.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'success': False, 'message': 'All fields required'}), 400
    
    conn = get_db_connection()
    try:
        hashed_pw = hash_password(password)
        conn.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, hashed_pw)
        )
        conn.commit()
        return jsonify({'success': True, 'message': 'Registration successful'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Username or email already exists'}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ?', (username,)
    ).fetchone()
    conn.close()
    
    if user and verify_password(password, user['password_hash']):
        token = generate_token(user['id'])
        return jsonify({
            'success': True,
            'token': token,
            'username': user['username']
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    token = data.get('token')
    num1 = float(data.get('num1', 0))
    num2 = float(data.get('num2', 0))
    operation = data.get('operation')
    
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
    
    try:
        if operation == 'add':
            result = num1 + num2
        elif operation == 'subtract':
            result = num1 - num2
        elif operation == 'multiply':
            result = num1 * num2
        elif operation == 'divide':
            if num2 == 0:
                return jsonify({'success': False, 'message': 'Division by zero'}), 400
            result = num1 / num2
        else:
            return jsonify({'success': False, 'message': 'Invalid operation'}), 400
        
        # Save calculation
        conn = get_db_connection()
        conn.execute(
            'INSERT INTO calculations (user_id, num1, num2, operation, result) VALUES (?, ?, ?, ?, ?)',
            (user_id, num1, num2, operation, result)
        )
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)