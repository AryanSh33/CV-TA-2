import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# ======================================================
# 1️⃣ Shot Boundary Detection (Histogram Difference)
# ======================================================
def detect_shot_boundaries(video_path, threshold=0.6):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video")

    prev_hist = None
    frame_idx = 0
    shot_changes = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()

        if prev_hist is not None:
            diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)
            if diff < threshold:  # lower correlation → scene change
                shot_changes.append(frame_idx)
        prev_hist = hist
        frame_idx += 1

    cap.release()
    return shot_changes

# ======================================================
# 2️⃣ Background Subtraction
# ======================================================
def background_subtraction(video_path, method='MOG2'):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video")

    if method == 'KNN':
        backSub = cv2.createBackgroundSubtractorKNN()
    else:
        backSub = cv2.createBackgroundSubtractorMOG2()

    out_path = os.path.join(
        app.config['OUTPUT_FOLDER'],
        f"bgsub_{os.path.basename(video_path)}"
    )

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(out_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        fg_mask = backSub.apply(frame)
        fg = cv2.bitwise_and(frame, frame, mask=fg_mask)
        out.write(fg)

    cap.release()
    out.release()
    return out_path

# ======================================================
# Flask Routes
# ======================================================
@app.route('/')
def index():
    return jsonify({
        "message": "Computer Vision Flask API - TA Group 2",
        "endpoints": {
            "/detect_shots": "POST a video to detect scene changes",
            "/background_subtraction": "POST a video to extract moving objects"
        }
    })

@app.route('/detect_shots', methods=['POST'])
def api_shot_detection():
    if 'file' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    f = request.files['file']
    if f.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    filename = secure_filename(f.filename)
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    f.save(video_path)

    threshold = float(request.form.get('threshold', 0.6))
    try:
        shots = detect_shot_boundaries(video_path, threshold)
        return jsonify({
            "video": filename,
            "shot_boundaries": shots,
            "count": len(shots)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/background_subtraction', methods=['POST'])
def api_background_subtraction():
    if 'file' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    f = request.files['file']
    if f.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    filename = secure_filename(f.filename)
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    f.save(video_path)

    method = request.form.get('method', 'MOG2')
    try:
        output_path = background_subtraction(video_path, method)
        return send_file(output_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
