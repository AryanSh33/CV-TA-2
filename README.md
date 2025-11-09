
# 🎥 CV TA

A full-stack web application for performing **Computer Vision-based video processing** tasks such as **Shot Boundary Detection** and **Background Subtraction** using an intuitive web interface.

---

## 🚀 Features

- 🎬 **Shot Boundary Detection** — Detects scene changes in videos using histogram comparison.
- 👤 **Background Subtraction** — Extracts moving objects from video sequences using **MOG2** or **KNN** methods.
- 💻 **React Frontend** — Interactive and responsive UI for uploading and processing videos.
- ⚙️ **Flask Backend API** — Handles all video processing operations via RESTful endpoints.

---

## 🛠️ Tech Stack

### **Backend**
- Python (Flask)
- OpenCV (`cv2`)
- NumPy
- Flask-CORS

### **Frontend**
- React (TypeScript)
- Tailwind CSS

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Python 3.8+**
- **Node.js 16+**
- **OpenCV**
- **npm** or **yarn**

---

## ⚙️ Installation Guide

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/cv-ta-2.git
cd cv-ta-2
````

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate     # Windows
# or source venv/bin/activate for macOS/Linux
pip install -r requirements.txt
```

### 3️⃣ Frontend Setup

```bash
cd ..  # Return to project root
npm install
```

---

## 🚀 Running the Application

### ▶️ Start the Backend Server

```bash
cd backend
.\venv\Scripts\activate  # Windows
python app.py
```

Backend will run on:
👉 **[http://localhost:5000](http://localhost:5000)**

### ▶️ Start the Frontend Development Server

```bash
npm run dev
```

Frontend will run on:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📥 API Endpoints

### 🎬 Shot Boundary Detection

**URL:** `/detect_shots`
**Method:** `POST`
**Form Data:**

* `file` — Video file (required)
* `threshold` — Detection sensitivity *(default: 0.6)*

**Response:** Processed video file with detected shot boundaries.

---

### 👤 Background Subtraction

**URL:** `/background_subtraction`
**Method:** `POST`
**Form Data:**

* `file` — Video file (required)
* `method` — `'MOG2'` or `'KNN'` *(default: 'MOG2')*

**Response:** Processed video highlighting moving foreground objects.

---

## 🗂️ Project Structure

```
cv-ta-2/
├── backend/
│   ├── app.py             # Flask server
│   ├── uploads/           # Temporary video storage
│   └── outputs/           # Processed video outputs
├── components/            # React components
├── pages/                 # Next.js/React pages
└── public/                # Static assets

```

---

## 🧾 License

This project is licensed under the **MIT License** — feel free to modify and distribute.



