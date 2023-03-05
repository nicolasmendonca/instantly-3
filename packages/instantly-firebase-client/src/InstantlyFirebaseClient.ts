import type { InstantlyClient } from "instantly-client";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  doc,
  initializeFirestore,
  runTransaction,
  type Firestore,
} from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

export class InstantlyFirebaseClient implements InstantlyClient {
  private app: FirebaseApp;
  private analytics: Analytics;
  private auth: Auth;
  private firestore: Firestore;

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
    this.firestore = initializeFirestore(this.app, {});
    this.analytics = getAnalytics(this.app);
    this.auth = getAuth(this.app);
  }

  public subscribeToAuthState: InstantlyClient["subscribeToAuthState"] = (
    onLogin,
    onLogout
  ) => {
    const unsubscribe = this.auth.onAuthStateChanged((user) => {
      if (user) {
        onLogin({
          id: user.uid,
          name: user.displayName ?? "Anon",
        });
      } else {
        onLogout();
      }
    });

    return unsubscribe;
  };

  public loginWithGoogle: InstantlyClient["loginWithGoogle"] = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  };

  public logout: InstantlyClient["logout"] = async () => {
    await this.auth.signOut();
  };

  public createNewWorkspace: InstantlyClient["createNewWorkspace"] = async (
    name
  ) => {
    await runTransaction(this.firestore, async (transaction) => {
      const workspaceId = crypto.randomUUID();
      transaction.set(doc(this.firestore, "workspaces", workspaceId), {
        name,
      });
      transaction.set(
        doc(this.firestore, "users-workspaces", this.auth.currentUser!.uid),
        {
          [workspaceId]: true,
        }
      );
    });
  };
}
