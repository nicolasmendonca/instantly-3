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
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
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
    enableIndexedDbPersistence(this.firestore);
    getPerformance(this.app);
    this.auth = getAuth(this.app);
    getAnalytics(this.app);
  }

  private async waitForAuthInit() {
    let unsubscribe: Unsubscribe;
    await new Promise<void>((resolve) => {
      unsubscribe = this.auth.onAuthStateChanged((_) => resolve());
    });
    (await unsubscribe!)();
  }

  public getAuthUser: InstantlyClient["getAuthUser"] = async () => {
    // Firebase needs to wait until onAuthStateChange is initialized before it can resolve the user
    await this.waitForAuthInit();
    const currentUser = this.auth.currentUser;
    return currentUser
      ? {
          id: currentUser.uid,
          name: currentUser.displayName ?? "Anon",
        }
      : null;
  };

  /**
   * Authentication
   */
  public subscribeToAuthState: InstantlyClient["subscribeToAuthState"] = (
    callback
  ): Unsubscribe => {
    const unsubscribe = this.auth.onAuthStateChanged(callback);

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

  public getWorkspacesForUser: InstantlyClient["getWorkspacesForUser"] =
    async ({ userId }): Promise<Workspace[]> => {
      let workspaces: Workspace[] = [];
      const _collection = await getDocs(
        collection(this.firestore, "users", userId, "workspaces")
      );
      _collection.forEach((doc) => {
        workspaces.push({
          id: doc.id,
          ...(doc.data() as TypesPerFirestorePath["/users/:userId/workspaces/:workspaceId"]),
        });
      });
      return workspaces;
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
          avatarUrl,
          name,
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
          ...(doc.data() as TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId"]),
        };
      });
    };

  public getProjectForWorkspace: InstantlyClient["getProjectForWorkspace"] =
    async ({ workspaceId, projectId }): Promise<Project> => {
      const projectDoc = await getDoc(
        doc(this.firestore, "workspaces", workspaceId, "projects", projectId)
      );
      return {
        id: projectDoc.id,
        ...(projectDoc.data() as TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId"]),
      };
    };

  public createProject: InstantlyClient["createProject"] = async ({
    workspaceId,
    name,
  }): Promise<Project["id"]> => {
    const projectCollection = collection(
      this.firestore,
      "workspaces",
      workspaceId,
      "projects"
    );
    const projectDoc = await addDoc(projectCollection, {
      name,
      emoji: "📝",
    } satisfies TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId"]);
    return projectDoc.id;
  };

  /**
   * Tasks
   */

  public getTasksForProject: InstantlyClient["getTasksForProject"] = async ({
    workspaceId,
    projectId,
  }) => {
    let tasks: Task[] = [];
    const _collection = await getDocs(
      collection(
        this.firestore,
        "workspaces",
        workspaceId,
        "projects",
        projectId,
        "tasks"
      )
    );
    _collection.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...(doc.data() as TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId/tasks/:taskId"]),
      });
    });
    return tasks;
  };

  public getTaskForProject: InstantlyClient["getTaskForProject"] = ({
    workspaceId,
    projectId,
    taskId,
  }) => {
    return getDoc(
      doc(
        this.firestore,
        "workspaces",
        workspaceId,
        "projects",
        projectId,
        "tasks",
        taskId
      )
    ).then((doc) => {
      return {
        id: doc.id,
        ...(doc.data() as TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId/tasks/:taskId"]),
      };
    });
  };

  public createTask: InstantlyClient["createTask"] = async (
    { projectId, workspaceId },
    taskPayload
  ) => {
    const taskCollection = collection(
      this.firestore,
      "workspaces",
      workspaceId,
      "projects",
      projectId,
      "tasks"
    );
    const taskDocRef = await addDoc(
      taskCollection,
      taskPayload satisfies TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId/tasks/:taskId"]
    );
    const loadedTask = await getDoc(taskDocRef);
    return {
      ...(loadedTask.data() as TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId/tasks/:taskId"]),
      id: loadedTask.id,
    };
  };

  public updateTask: InstantlyClient["updateTask"] = async (
    { workspaceId, projectId, taskId },
    task
  ): Promise<void> => {
    const { id, ...taskWithoutId } = task;
    await setDoc(
      doc(
        this.firestore,
        "workspaces",
        workspaceId,
        "projects",
        projectId,
        "tasks",
        taskId
      ),
      taskWithoutId satisfies TypesPerFirestorePath["/workspaces/:workspaceId/projects/:projectId/tasks/:taskId"]
    );
  };
}

type TypesPerFirestorePath = {
  "/users/:userId": Omit<User, "id">;
  "/users/:userId/workspaces/:workspaceId": Omit<Workspace, "id">;
  "/workspaces/:workspaceId": Omit<Workspace, "id">;
  "/workspaces/:workspaceId/members/:memberId": Omit<
    WorkspaceMemberProfile,
    "id"
  >;
  "/workspaces/:workspaceId/projects/:projectId": Omit<Project, "id">;
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId": Omit<
    Task,
    "id"
  >;
};
