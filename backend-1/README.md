# Video Processing Flask API

This project is a Flask API for video processing, which includes functionalities for shot boundary detection and background subtraction.

## Features

- **Shot Boundary Detection**: Detects scene changes in videos using histogram difference.
- **Background Subtraction**: Extracts moving objects from videos using background subtraction techniques.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd backend
   ```
3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Start the Flask server:
   ```
   python src/app.py
   ```
2. Use the following endpoints to interact with the API:
   - **POST /detect_shots**: Upload a video to detect scene changes.
   - **POST /background_subtraction**: Upload a video to extract moving objects.

## Directory Structure

```
backend
├── .git
├── .gitignore
├── src
│   └── app.py
├── uploads
├── outputs
└── README.md
```

## License

This project is licensed under the MIT License.