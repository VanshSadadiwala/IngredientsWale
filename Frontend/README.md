# IngredientWale 🍽️

A beautiful AI-powered web application that predicts ingredients in food images using a trained MobileNetV2 model. Upload a photo of your food and discover what ingredients are in it!

## Features ✨

- 🎨 **Beautiful UI**: Warm, foody aesthetic with vibrant orange, red, and yellow tones
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🤖 **AI-Powered**: Uses a trained MobileNetV2 model for accurate ingredient prediction
- 🖼️ **Drag & Drop**: Easy image upload with drag-and-drop functionality
- 📊 **Confidence Scores**: Shows prediction confidence for each ingredient
- 🍕 **Ingredient Menu**: Browse all possible ingredient classes
- ⚡ **Fast Predictions**: Optimized for quick results
- 🎭 **Smooth Animations**: Elegant fade-in effects and transitions

## Project Structure 📁

```
IngredientWale/
├── static/
│   ├── style.css          # Warm foody theme styles
│   └── script.js          # Frontend JavaScript functionality
├── templates/
│   └── index.html         # Main HTML template
├── model/
│   └── mobilenetv2_model.h5  # Trained model file (placeholder)
├── uploads/               # Temporary upload directory
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Installation & Setup 🚀

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Step 1: Clone or Download
```bash
# If you have git
git clone <repository-url>
cd IngredientWale

# Or download and extract the project files
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Prepare Your Model
1. Place your trained MobileNetV2 model file as `model/mobilenetv2_model.h5`
2. If you don't have a model yet, the app will create a placeholder model automatically

### Step 4: Run the Application
```bash
python app.py
```

### Step 5: Open in Browser
Navigate to `http://localhost:5000` in your web browser.

## How to Use 📖

1. **Upload Image**: 
   - Click the upload area or drag and drop a food image
   - Supported formats: PNG, JPG, JPEG, GIF, BMP
   - Maximum file size: 16MB

2. **Predict Ingredients**: 
   - Click the "Predict Ingredients" button
   - Wait for the AI to analyze your image

3. **View Results**: 
   - See predicted ingredients with confidence scores
   - Ingredients are displayed in beautiful cards

4. **Browse Menu**: 
   - Click "Menu" in the navigation to see all possible ingredients
   - Ingredients are organized alphabetically

## API Endpoints 🔌

### POST /predict
Upload an image and get ingredient predictions.

**Request**: Multipart form data with 'image' field
**Response**: JSON with predictions array
```json
{
  "success": true,
  "predictions": [
    {
      "ingredient": "tomato",
      "confidence": 0.85
    }
  ]
}
```

### GET /menu
Get all available ingredient classes.

**Response**: JSON with ingredients array
```json
{
  "ingredients": ["tomato", "onion", "garlic", ...]
}
```

### GET /health
Health check endpoint.

**Response**: JSON with status information
```json
{
  "status": "healthy",
  "model_loaded": true,
  "tensorflow_available": true
}
```

## Customization 🎨

### Adding Your Own Model
1. Train your MobileNetV2 model using TensorFlow/Keras
2. Save it as `model/mobilenetv2_model.h5`
3. Update the `SAMPLE_INGREDIENT_CLASSES` list in `app.py` with your actual classes

### Styling Changes
- Modify `static/style.css` to change colors, fonts, or layout
- Update CSS variables in `:root` for consistent theming

### Adding New Features
- Extend `app.py` with new endpoints
- Add JavaScript functionality in `static/script.js`
- Update HTML template in `templates/index.html`

## Troubleshooting 🔧

### Common Issues

1. **TensorFlow Import Error**:
   ```bash
   pip install tensorflow==2.13.0
   ```

2. **Model Loading Issues**:
   - Ensure your model file is in the correct format (.h5)
   - Check file permissions
   - Verify the model was trained with the same TensorFlow version

3. **Upload Errors**:
   - Check file size (max 16MB)
   - Verify file format is supported
   - Ensure uploads directory exists

4. **Port Already in Use**:
   ```bash
   # Change port in app.py
   app.run(debug=True, host='0.0.0.0', port=5001)
   ```

## Development 🛠️

### Running in Development Mode
```bash
# Enable debug mode (already set in app.py)
python app.py
```

### Adding New Dependencies
```bash
pip install new-package
pip freeze > requirements.txt
```

### Testing the API
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test menu endpoint
curl http://localhost:5000/menu

# Test prediction (replace with actual image file)
curl -X POST -F "image=@test_image.jpg" http://localhost:5000/predict
```

## Performance Tips ⚡

1. **Model Optimization**:
   - Use TensorFlow Lite for mobile deployment
   - Implement model quantization for smaller file sizes
   - Consider batch processing for multiple images

2. **Frontend Optimization**:
   - Enable image compression before upload
   - Implement lazy loading for large ingredient lists
   - Use CDN for static assets

3. **Backend Optimization**:
   - Implement caching for repeated predictions
   - Use async processing for heavy computations
   - Add rate limiting for API endpoints

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is open source and available under the MIT License.

## Support 💬

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the code comments
3. Create an issue in the repository

---

**Made with ❤️ for food lovers everywhere!**

