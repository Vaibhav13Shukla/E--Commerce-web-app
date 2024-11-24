from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app = Flask(__name__)
DATABASE = 'AbhiRang.db'  # Ensure this is the correct database name

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Access columns by name
    return conn

# API endpoint to get all products
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM product').fetchall()  # Change 'products' to 'product'
    conn.close()
    
    # Convert the products to a list of dictionaries
    products_list = [dict(product) for product in products]
    return jsonify(products_list)

# Homepage route
@app.route('/')
def homepage():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AbhiRang API Homepage</title>
        <style>
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                flex-direction: column;
                background-color: #f0f0f0;
                font-family: Arial, sans-serif;
            }
            img {
                max-width: 100%;
                height: auto;
                border: 2px solid #000;
            }
            h1 {
                margin: 20px 0;
                color: #333;
            }
        </style>
    </head>
    <body>
        <h1>Welcome to the AbhiRang API</h1>
        <img src="/static/homepage_image.jpg" alt="AbhiRang Homepage Image">
    </body>
    </html>
    '''

# API to get all users
@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM user').fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

# API to create a new user
@app.route('/users', methods=['POST'])
def create_user():
    new_user = request.get_json()
    username = new_user['username']
    password_hash = new_user['password_hash']
    email = new_user['email']
    phone_number = new_user['phone_number']
    user_type = new_user['user_type']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO user (username, password_hash, email, phone_number, user_type) VALUES (?, ?, ?, ?, ?)',
                 (username, password_hash, email, phone_number, user_type))
    conn.commit()
    conn.close()
    return jsonify(new_user), 201

# API to get all categories
@app.route('/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    categories = conn.execute('SELECT * FROM category').fetchall()
    conn.close()
    return jsonify([dict(category) for category in categories])

# API to create a new category
@app.route('/categories', methods=['POST'])
def create_category():
    new_category = request.get_json()
    name = new_category['name']
    description = new_category['description']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO category (name, description) VALUES (?, ?)', (name, description))
    conn.commit()
    conn.close()
    return jsonify(new_category), 201

# API to get products by category
@app.route('/categories/<int:category_id>/products', methods=['GET'])
def get_products_by_category(category_id):
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM product WHERE category_id = ?', (category_id,)).fetchall()
    conn.close()
    return jsonify([dict(product) for product in products])

# API to search products by name
@app.route('/products/search', methods=['GET'])
def search_products():
    query = request.args.get('q')
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM product WHERE name LIKE ?', ('%' + query + '%',)).fetchall()
    conn.close()
    return jsonify([dict(product) for product in products])

# API to get artist portfolio
@app.route('/artists/<int:artist_id>/portfolio', methods=['GET'])
def get_artist_portfolio(artist_id):
    conn = get_db_connection()
    portfolio = conn.execute('SELECT * FROM Artist_Portfolio WHERE artist_id = ?', (artist_id,)).fetchall()
    conn.close()
    return jsonify([dict(item) for item in portfolio])

# API to create a new order
@app.route('/orders', methods=['POST'])
def create_order():
    new_order = request.get_json()
    user_id = new_order['user_id']
    order_date = new_order['order_date']
    total_amount = new_order['total_amount']
    order_status = new_order['order_status']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO "Order" (user_id, order_date, total_amount, order_status) VALUES (?, ?, ?, ?)',
                 (user_id, order_date, total_amount, order_status))
    conn.commit()
    conn.close()
    return jsonify(new_order), 201

# API to get all orders for a user
@app.route('/users/<int:user_id>/orders', methods=['GET'])
def get_user_orders(user_id):
    conn = get_db_connection()
    orders = conn.execute('SELECT * FROM "Order" WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(order) for order in orders])

# API to add a review
@app.route('/reviews', methods=['POST'])
def add_review():
    new_review = request.get_json()
    product_id = new_review['product_id']
    user_id = new_review['user_id']
    rating = new_review['rating']
    comment = new_review['comment']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO Review (product_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                 (product_id, user_id, rating, comment))
    conn.commit()
    conn.close()
    return jsonify(new_review), 201

# API to get reviews for a product
@app.route('/products/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    conn = get_db_connection()
    reviews = conn.execute('SELECT * FROM Review WHERE product_id = ?', (product_id,)).fetchall()
    conn.close()
    return jsonify([dict(review) for review in reviews])

# API to view cart items
@app.route('/users/<int:user_id>/cart', methods=['GET'])
def get_cart(user_id):
    conn = get_db_connection()
    cart = conn.execute('SELECT * FROM Cart WHERE user_id = ?', (user_id,)).fetchone()
    if cart:
        cart_items = conn.execute('SELECT * FROM Cart_Item WHERE cart_id = ?', (cart['cart_id'],)).fetchall()
        conn.close()
        return jsonify([dict(item) for item in cart_items])
    conn.close()
    return jsonify([])

# API to create a cart
@app.route('/cart', methods=['POST'])
def create_cart():
    new_cart = request.get_json()
    user_id = new_cart['user_id']
    created_at = new_cart['created_at']
    updated_at = new_cart['updated_at']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO Cart (user_id, created_at, updated_at) VALUES (?, ?, ?)', 
                 (user_id, created_at, updated_at))
    conn.commit()
    conn.close()
    return jsonify(new_cart), 201

# API to create a cart item
@app.route('/cart_items', methods=['POST'])
def add_cart_item():
    new_cart_item = request.get_json()
    cart_id = new_cart_item['cart_id']
    product_id = new_cart_item['product_id']
    quantity = new_cart_item['quantity']
    price_per_unit = new_cart_item['price_per_unit']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO Cart_Item (cart_id, product_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)', 
                 (cart_id, product_id, quantity, price_per_unit))
    conn.commit()
    conn.close()
    return jsonify(new_cart_item), 201

# API to get commissions
@app.route('/commissions', methods=['GET'])
def get_commissions():
    conn = get_db_connection()
    commissions = conn.execute('SELECT * FROM Commission').fetchall()
    conn.close()
    return jsonify([dict(commission) for commission in commissions])

# API to create a commission
@app.route('/commissions', methods=['POST'])
def create_commission():
    new_commission = request.get_json()
    user_id = new_commission['user_id']
    artist_id = new_commission['artist_id']
    description = new_commission['description']
    agreed_price = new_commission['agreed_price']
    status = new_commission['status']
    deadline = new_commission['deadline']
    created_at = new_commission['created_at']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO Commission (user_id, artist_id, description, agreed_price, status, deadline, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                 (user_id, artist_id, description, agreed_price, status, deadline, created_at))
    conn.commit()
    conn.close()
    return jsonify(new_commission), 201

# API to create insurance
@app.route('/insurance', methods=['POST'])
def create_insurance():
    new_insurance = request.get_json()
    commission_id = new_insurance['commission_id']
    is_insured = new_insurance['is_insured']
    coverage_details = new_insurance['coverage_details']
    price = new_insurance['price']
    terms = new_insurance['terms']
    
    conn = get_db_connection()
    conn.execute('INSERT INTO Insurance (commission_id, is_insured, coverage_details, price, terms, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                 (commission_id, is_insured, coverage_details, price, terms))
    conn.commit()
    conn.close()
    return jsonify(new_insurance), 201

@app.route('/insurances', methods=['GET'])
def get_insurance_records():
    try:
        conn = get_db_connection()
        insurance_records = conn.execute('SELECT * FROM Insurance').fetchall()
        conn.close()
        return jsonify([dict(record) for record in insurance_records])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)