import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAe9Be2v7Gn-5fng4bygkrttjXqRCdOS5s",
  authDomain: "studybuddy-46d21.firebaseapp.com",
  projectId: "studybuddy-46d21",
  storageBucket: "studybuddy-46d21.firebasestorage.app",
  messagingSenderId: "513261206970",
  appId: "1:513261206970:web:72e0d22cf8f043614cf183",
  measurementId: "G-PCXH2LLJ9K",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
