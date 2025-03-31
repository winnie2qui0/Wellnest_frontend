# 🧠 Mental Health App – AI Chatbot & 3D Companion

A mobile-friendly mental wellness app built with **React Native**, **React.js**, **OpenAI**, and **Three.js**.  
This app provides emotional support through an AI-powered chatbot, real-time mood detection, task recommendations, and a 3D animated chick companion for visual comfort and interaction.

---

![demo screenshot or gif here](./assets/demo.gif)

---

## 🚀 Features

- 💬 **AI Chatbot** using OpenAI API for CBT-inspired conversation and emotional support
- 🎯 **Emotion Detection** using TensorFlow.js to detect real-time mood and recommend personalized activities
- 🐣 **3D Animated Chick** built with React Three Fiber + TypeScript to enhance engagement
- 📄 **Mental Health Resources** including booking info for on-campus/off-campus therapy
- 🧭 **Interactive User Journey** including onboarding, daily missions, emotion comics, and mood logs

---

## 🛠 Tech Stack

- **Frontend:** React Native, React.js, TypeScript, Tailwind CSS (optional)
- **AI & NLP:** OpenAI API, TensorFlow.js
- **3D Rendering:** React Three Fiber (`@react-three/drei/native`), Three.js, glTF
- **Others:** Expo, WebSocket, Custom Hook, Context API, Figma

---

## 📁 Folder Structure

src/ ├── assets/ # Static assets (images, models, etc.) ├── components/
│ ├── Chick.tsx # 3D chick model with animation using R3F + TS │ ├── CustomButton.js # Reusable button component │ ├── Loader.tsx # Loading animation screen │ ├── Trigger.tsx # Event-based animation trigger │ ├── WebSocket.js # Real-time message sync (chatroom or event) │ └── UseAudioManager.js # Custom hook for audio playback ├── constants/ # Color palette, font sizes, spacing values ├── content/ # Static text or emotion-related task data ├── navigation/ # React Navigation stack logic ├── scenes/ # 3D visualization scenes (if separated) ├── screens/
│ ├── ChatbotScreen.js # AI chatbot interface │ ├── ComicScreen.js # Emotion-based comic presentation │ ├── MissionsScreen.js # Mood-based tasks and rewards │ ├── QuestionnaireScreen.js # Self-assessment flow │ ├── AppointmentScreen.js # Booking for mental health counseling │ └── HomeScreen.js # Main dashboard


---

## 📽 Demo Video

👉 **[Click here to watch the demo video](https://drive.google.com/file/d/1qi08N-vroGFlp0b__W9Z201iuonssLNx/view?usp=sharing)**  

---

## 🔧 Getting Started

```bash
git clone https://github.com/your-username/mental-health-app.git
cd mental-health-app
npm install
npx expo start
