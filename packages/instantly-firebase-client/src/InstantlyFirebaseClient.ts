import type { InstantlyClient } from "instantly-client";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export class InstantlyFirebaseClient implements InstantlyClient {
  private app: FirebaseApp;
  private analytics: Analytics;

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyAMOtufXQ7RWZXfNis6WmmGjII9rSwPlpg",
      authDomain: "instantly-5a09f.firebaseapp.com",
      projectId: "instantly-5a09f",
      storageBucket: "instantly-5a09f.appspot.com",
      messagingSenderId: "792644441612",
      appId: "1:792644441612:web:70b0d971c3738482ec4029",
      measurementId: "G-PRZ4PHDPTG",
    };
    this.app = initializeApp(firebaseConfig);
    this.analytics = getAnalytics(this.app);
  }

  public authenticateWithGoogle: InstantlyClient["authenticateWithGoogle"] =
    async () => {
      const auth = getAuth(this.app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result);
    };
}
