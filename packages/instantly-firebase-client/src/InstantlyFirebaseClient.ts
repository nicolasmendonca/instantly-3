import type {
  InstantlyClient,
  Project,
  Task,
  User,
  Workspace,
  WorkspaceMemberProfile,
} from "instantly-client";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  addDoc,
  setDoc,
  collection,
  initializeFirestore,
  runTransaction,
  type Firestore,
  getDocs,
  getDoc,
  doc,
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

  /**
   * Authentication
   */
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

  /**
   * Workspaces
   */
  public getWorkspace: InstantlyClient["getWorkspace"] = async ({
    workspaceId,
  }): Promise<Workspace> => {
    const workspaceDocReference = doc(
      this.firestore,
      "workspaces",
      workspaceId
    );
    const workspaceDoc = await getDoc(workspaceDocReference);
    return {
      id: workspaceDoc.id,
      ...(workspaceDoc.data() as TypesPerFirestorePath["/workspaces/:workspaceId"]),
    };
  };

  public createNewWorkspace: InstantlyClient["createNewWorkspace"] = async (
    name
  ): Promise<Workspace["id"]> => {
    const avatarUrl = generateWorkspaceAvatar(name);
    const workspaceCollection = collection(this.firestore, "workspaces");
    const workspaceDoc = await addDoc(workspaceCollection, {
      name,
      avatarUrl,
    } satisfies TypesPerFirestorePath["/workspaces/:workspaceId"]);
    const role = "admin";
    await Promise.all([
      setDoc(
        doc(
          this.firestore,
          "users",
          this.auth.currentUser!.uid,
          "workspaces",
          workspaceDoc.id
        ),
        {
          role,
          workspaceName: name,
        } satisfies TypesPerFirestorePath["/users/:userId/workspaces/:workspaceId"]
      ),
      setDoc(
        doc(
          this.firestore,
          "workspaces",
          workspaceDoc.id,
          "members",
          this.auth.currentUser!.uid
        ),
        {
          role,
          avatarUrl: this.auth.currentUser!.photoURL!,
          name: this.auth.currentUser!.displayName ?? "Anon",
        } satisfies TypesPerFirestorePath["/workspaces/:workspaceId/members/:memberId"]
      ),
    ]);
    return workspaceDoc.id;
  };

  public getTasksForWorkspace: InstantlyClient["getTasksForWorkspace"] =
    async ({ workspaceId }: { workspaceId: Workspace["id"] }) => {
      let tasks: Task[] = [];
      const _collection = await getDocs(
        collection(this.firestore, "workspaces", workspaceId, "tasks")
      );
      _collection.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...(doc.data() as TypesPerFirestorePath["/workspaces/:workspaceId/tasks/:taskId"]),
        });
      });
      return tasks;
    };

  public getWorkspaceMemberProfile: InstantlyClient["getWorkspaceMemberProfile"] =
    async ({ workspaceId, memberId }): Promise<WorkspaceMemberProfile> => {
      const workspaceMemberProfileDoc = await getDoc(
        doc(this.firestore, "workspaces", workspaceId, "members", memberId)
      );
      return {
        id: workspaceMemberProfileDoc.id,
        ...(workspaceMemberProfileDoc.data() as TypesPerFirestorePath["/workspaces/:workspaceId/members/:memberId"]),
      };
    };

  /**
   * Projects
   */
  public getProjectsForWorkspace: InstantlyClient["getProjectsForWorkspace"] =
    async ({ workspaceId }) => {
      const projectsCollection = await getDocs(
        collection(this.firestore, "workspaces", workspaceId, "projects")
      );

      return projectsCollection.docs.map((doc) => {
        return {
          id: doc.id,
          ...(doc.data() as TypesPerFirestorePath["/workspaces/:workspaceId/projects"]),
        };
      });
    };
}

type TypesPerFirestorePath = {
  "/users/:userId": Omit<User, "id">;
  "/users/:userId/workspaces/:workspaceId": {
    role: WorkspaceMemberProfile["role"];
    workspaceName: string;
  };
  "/workspaces/:workspaceId": Omit<Workspace, "id">;
  "/workspaces/:workspaceId/members/:memberId": Omit<
    WorkspaceMemberProfile,
    "id"
  >;
  "/workspaces/:workspaceId/projects": Omit<Project, "id">;
  "/workspaces/:workspaceId/tasks/:taskId": Omit<Task, "id">;
};
