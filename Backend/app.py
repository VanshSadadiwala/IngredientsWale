from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
import numpy as np
import pandas as pd
import os
from werkzeug.utils import secure_filename
#To run backend actiavte virtual environment then python app.py
# ---------------- Configuration ---------------- #
app = Flask(__name__)
CORS(app, origins="https://ingredients-wale.vercel.app")

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ---------------- Load Model and Data ---------------- #
# ---------------- Load Model and Data ---------------- #
MODEL_PATH = 'model/Resnet50_finetuned_best.h5'
CSV_PATH = 'data/food_ingredients.csv'

model = tf.keras.models.load_model(MODEL_PATH)
ingredients_df = pd.read_csv(CSV_PATH, encoding='utf-8-sig')

# --- START OF FIX 1 ---
# Define your 15 classes EXACTLY as they appear in your training folders
# (and as seen in your script.js / index.html gallery)
CLASS_NAMES = [
    'Biryani',
    'Chole bhature',
    'dabeli',
    'Dal tadka',
    'Dhokla',
    'Dosa',
    'Jalebi',
    'Kathi Roll',
    'Kofta',
    'Naan',
    'Kadhi pakoda',
    'Paneer tikka masala',
    'Pani puri',
    'Pav Bhaji',
    'Vadapav'
]

# Sort the class names alphabetically, just as Keras's ImageDataGenerator does
CLASS_NAMES.sort(key=str.lower)
# This is the CORRECT mapping from the model's output index to the class name
class_indices = {i: name for i, name in enumerate(CLASS_NAMES)}
# --- END OF FIX 1 ---

# ---------------- Helper Function ---------------- #
# ---------------- Helper Function ---------------- #
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    # --- THIS IS THE FIX ---
    # Instead of img_array /= 255.0, use the official ResNet50 function
    img_array = preprocess_input(img_array) 

    return img_array
# ---------------- Routes ---------------- #
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # Preprocess the image
        img_array = preprocess_image(filepath)

        # Predict with model
        predictions = model.predict(img_array)
        predicted_index = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        predicted_dish = class_indices[predicted_index]

        # Retrieve ingredients from CSV
# Retrieve ingredients from CSV
# --- START OF NEW FIX ---
        
        # Clean the predicted dish name for a safe lookup
        clean_predicted_dish = predicted_dish.lower().strip()
        print(f"Looking for: '{clean_predicted_dish}'")
        print(f"ACTUAL CSV Columns: {ingredients_df.columns.to_list()}")
        # Find the row by comparing cleaned, lowercase strings
        ingredients_row = ingredients_df[ingredients_df['Dish'].str.lower().str.strip() == clean_predicted_dish]

        if not ingredients_row.empty:
            # Get the ingredient string from the row
            ingredients_value = ingredients_row['Ingredients'].values[0]
            
            # Check if value is NaN (empty) OR just an empty string ""
            if pd.isna(ingredients_value) or str(ingredients_value).strip() == "":
                ingredients_list = ["Ingredients not available"]
            else:
                # We have ingredients. Split them by comma and clean up any extra spaces.
                ingredients_list = [ingredient.strip() for ingredient in str(ingredients_value).split(',')]
        else:
            # The dish name was not found in the CSV
            ingredients_list = ["Dish not found in ingredient database"]
        
        # --- END OF NEW FIX ---
        result = {
            'predictions': [
                {
                    'ingredient': predicted_dish,
                    'confidence': confidence,
                    'ingredients': ingredients_list
                }
            ]
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up the uploaded file if desired
        if os.path.exists(filepath):
            os.remove(filepath)


