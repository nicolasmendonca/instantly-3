import type { InstantlyClient } from "instantly-client";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  addDoc,
  doc,
  setDoc,
  collection,
  initializeFirestore,
  runTransaction,
  type Firestore,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  Unsubscribe,
  type Auth,
} from "firebase/auth";
import { generateWorkspaceAvatar } from "./avatar";

export class InstantlyFirebaseClient implements InstantlyClient {
  private app: FirebaseApp;
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
    this.auth = getAuth(this.app);
    getAnalytics(this.app);
  }

  public subscribeToAuthState: InstantlyClient["subscribeToAuthState"] = (
    onLogin,
    onLogout
  ): Unsubscribe => {
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

  public loginWithGoogle: InstantlyClient["loginWithGoogle"] =
    async (): Promise<void> => {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      const currentUser = this.auth.currentUser;

      if (currentUser) {
        const userDoc = doc(this.firestore, "users", currentUser.uid);
        await runTransaction(this.firestore, async (transaction) => {
          const userDocSnapshot = await transaction.get(userDoc);
          // If the user profile doesn't exist, create it
          if (!userDocSnapshot.exists()) {
            transaction.set(userDoc, <TypesPerFirestorePath["/users/:userId"]>{
              name: currentUser.displayName,
              avatarUrl: currentUser.photoURL,
            });
          }
        });
      }
    };

  public logout: InstantlyClient["logout"] = async () => {
    await this.auth.signOut();
  };

  public createNewWorkspace: InstantlyClient["createNewWorkspace"] = async (
    name
  ): Promise<void> => {
    const avatarUrl = generateWorkspaceAvatar(name);
    const workspaceCollection = collection(this.firestore, "workspaces");
    const workspaceDoc = await addDoc(workspaceCollection, <
      TypesPerFirestorePath["/workspaces/:workspaceId"]
    >{
      name,
      avatarUrl,
    });
    setDoc(
      doc(
        this.firestore,
        "users",
        this.auth.currentUser!.uid,
        "workspaces",
        workspaceDoc.id
      ),
      <TypesPerFirestorePath["/users/:userId/workspaces/:workspaceId"]>{
        role: "owner",
        name,
        avatarUrl,
      }
    );
  };
}

type TypesPerFirestorePath = {
  "/users/:userId": {
    name: string;
    avatarUrl: string;
  };
  "/users/:userId/workspaces/:workspaceId": {
    role: "owner" | "member" | "guest";
    name: string;
  };
  "/workspaces/:workspaceId": {
    name: string;
    avatarUrl: string;
  };
};
