import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAVZ0fgohixTY7lpfUeBirOQC2GAXcXLMY",
  authDomain: "xsoverse.firebaseapp.com",
  projectId: "xsoverse",
  storageBucket: "xsoverse.firebasestorage.app",
  messagingSenderId: "751405135088",
  appId: "1:751405135088:web:5a9efd95f01ced298c3e35",
  measurementId: "G-0QB2EJ57NC",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export default app;
