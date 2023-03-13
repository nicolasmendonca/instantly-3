import type {
  InstantlyClient,
  Project,
  Task,
  TaskStatus,
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
  updateDoc,
  query,
  where,
  QueryConstraint,
  deleteDoc,
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
import {
  workspaceSchema,
  workspaceWithoutIdSchema,
} from "./schemas/workspace.schema";
import { userProfileWithoutIdSchema } from "./schemas/userProfile.schema";
import {
  workspaceMemberSchema,
  workspaceMemberWithoutIdSchema,
} from "./schemas/workspaceMember.schema";
import {
  projectSchema,
  projectWithoutIdSchema,
} from "./schemas/project.schema";
import {
  taskStatusSchema,
  taskStatusWithoudIdSchema,
} from "./schemas/taskStatus.schema";
import { taskSchema, taskWithoutIdSchema } from "./schemas/task.schema";

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
            transaction.set(
              userDoc,
              userProfileWithoutIdSchema.parse({
                name: currentUser.displayName,
                avatarUrl: currentUser.photoURL,
              })
            );
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
    return workspaceSchema.parse({
      id: workspaceDoc.id,
      ...workspaceDoc.data(),
    });
  };

  public getWorkspacesForUser: InstantlyClient["getWorkspacesForUser"] =
    async ({ userId }): Promise<Workspace[]> => {
      let workspaces: Workspace[] = [];
      const _collection = await getDocs(
        collection(this.firestore, "users", userId, "workspaces")
      );
      _collection.forEach((doc) => {
        workspaces.push(
          workspaceSchema.parse({
            id: doc.id,
            ...doc.data(),
          })
        );
      });
      return workspaces;
    };

  public createNewWorkspace: InstantlyClient["createNewWorkspace"] = async (
    name
  ): Promise<Workspace["id"]> => {
    const {
      uid: userCreatorId,
      photoURL: userAvatarUrl,
      displayName: userDisplayName,
    } = this.auth.currentUser!;
    const avatarUrl = generateWorkspaceAvatar(name);
    const workspaceCollection = collection(this.firestore, "workspaces");
    const workspaceCreationPayload = workspaceWithoutIdSchema.parse({
      name,
      avatarUrl,
      userCreatorId,
    });
    const workspaceDoc = await addDoc(
      workspaceCollection,
      workspaceCreationPayload
    );
    const role = "admin";
    await Promise.all([
      setDoc(
        doc(
          this.firestore,
          "users",
          userCreatorId,
          "workspaces",
          workspaceDoc.id
        ),
        workspaceCreationPayload
      ),
      setDoc(
        doc(
          this.firestore,
          "workspaces",
          workspaceDoc.id,
          "members",
          userCreatorId
        ),
        workspaceMemberWithoutIdSchema.parse({
          role,
          avatarUrl: userAvatarUrl!,
          name: userDisplayName,
        })
      ),
    ]);
    return workspaceDoc.id;
  };

  public getWorkspaceMemberProfile: InstantlyClient["getWorkspaceMemberProfile"] =
    async ({ workspaceId, memberId }): Promise<WorkspaceMemberProfile> => {
      const workspaceMemberProfileDoc = await getDoc(
        doc(this.firestore, "workspaces", workspaceId, "members", memberId)
      );
      return workspaceMemberSchema.parse({
        id: workspaceMemberProfileDoc.id,
        ...workspaceMemberProfileDoc.data(),
      });
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
        return projectSchema.parse({
          id: doc.id,
          ...doc.data(),
        });
      });
    };

  public getProjectForWorkspace: InstantlyClient["getProjectForWorkspace"] =
    async ({ workspaceId, projectId }): Promise<Project> => {
      const projectDoc = await getDoc(
        doc(this.firestore, "workspaces", workspaceId, "projects", projectId)
      );
      return projectSchema.parse({
        id: projectDoc.id,
        ...projectDoc.data(),
      });
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

    const projectPayload = projectWithoutIdSchema.parse({
      name,
      emoji: "📝",
      defaultTaskStatusId: "",
    });

    // Create the project document
    const projectDoc = await addDoc(projectCollection, projectPayload);

    // Create the default task statuses
    const taskStatusesCollection = collection(
      this.firestore,
      "workspaces",
      workspaceId,
      "projects",
      projectDoc.id,
      "task-statuses"
    );

    const [todoTask] = await Promise.all([
      addDoc(
        taskStatusesCollection,
        taskStatusWithoudIdSchema.parse({
          label: "To Do",
        })
      ),
      addDoc(
        taskStatusesCollection,
        taskStatusWithoudIdSchema.parse({
          label: "In Progress",
        })
      ),
      addDoc(
        taskStatusesCollection,
        taskStatusWithoudIdSchema.parse({
          label: "Done",
        })
      ),
    ]);

    // Asign the first "To Do" task status as the default task status for the project
    await updateDoc(projectDoc, "defaultTaskStatusId", todoTask.id);

    // Return the project id
    return projectDoc.id;
  };

  /**
   * Tasks
   */

  public getTasksForProject: InstantlyClient["getTasksForProject"] = async ({
    workspaceId,
    projectId,
    filters,
  }) => {
    let tasks: Task[] = [];

    const _collection = collection(
      this.firestore,
      "workspaces",
      workspaceId,
      "projects",
      projectId,
      "tasks"
    );

    let _queryFilters: QueryConstraint[] = [];

    if (filters.archived !== undefined) {
      _queryFilters.push(where("archived", "==", filters.archived));
    }

    if (filters.status !== undefined) {
      _queryFilters.push(where("status", "==", filters.status));
    }

    const _documents = await getDocs(query(_collection, ..._queryFilters));

    _documents.forEach((doc) => {
      tasks.push(
        taskSchema.parse({
          id: doc.id,
          ...doc.data(),
        })
      );
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
      return taskSchema.parse({
        id: doc.id,
        ...doc.data(),
      });
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
      taskWithoutIdSchema.parse(taskPayload)
    );
    const loadedTask = await getDoc(taskDocRef);
    return taskSchema.parse({
      id: loadedTask.id,
      ...loadedTask.data(),
    });
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
      taskWithoutIdSchema.parse(taskWithoutId)
    );
  };

  public deleteTask: InstantlyClient["deleteTask"] = ({
    workspaceId,
    projectId,
    taskId,
  }) => {
    return deleteDoc(
      doc(
        this.firestore,
        "workspaces",
        workspaceId,
        "projects",
        projectId,
        "tasks",
        taskId
      )
    );
  };

  public getTaskStatuses: InstantlyClient["getTaskStatuses"] = async ({
    workspaceId,
    projectId,
  }) => {
    const statusesCollection = await getDocs(
      collection(
        this.firestore,
        "workspaces",
        workspaceId,
        "projects",
        projectId,
        "task-statuses"
      )
    );
    return statusesCollection.docs.map((doc) => {
      return taskStatusSchema.parse({
        id: doc.id,
        ...doc.data(),
      });
    });
  };
}
