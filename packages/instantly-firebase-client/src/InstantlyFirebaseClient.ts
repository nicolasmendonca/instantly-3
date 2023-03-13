import {
  InstantlyClient,
  Project,
  Task,
  userSchema,
  Workspace,
  WorkspaceMember,
} from "instantly-core";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  setDoc,
  collection,
  initializeFirestore,
  runTransaction,
  type Firestore,
  getDocs,
  getDoc,
  doc,
  enableIndexedDbPersistence,
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
import { workspaceSchema } from "./schemas/workspace.schema";
import {
  workspaceMemberSchema,
  workspaceMemberWithoutIdSchema,
} from "./schemas/workspaceMember.schema";
import { projectSchema } from "./schemas/project.schema";
import {
  taskStatusListSchema,
  taskStatusSchema,
} from "./schemas/taskStatus.schema";
import { taskSchema } from "./schemas/task.schema";

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

  public getAuthUser: InstantlyClient["getAuthUser"] = async () => {
    // Firebase needs to wait until onAuthStateChange is initialized before it can resolve the user
    const currentUser = this.auth.currentUser;
    return currentUser
      ? userSchema.parse({
          id: currentUser.uid,
          name: currentUser.displayName ?? "Anon",
          avatarUrl: currentUser.photoURL!,
        })
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
        const { id, ...userWithoutId } = userSchema.parse({
          id: currentUser.uid,
          name: currentUser.displayName,
          avatarUrl: currentUser.photoURL,
        });
        const userDoc = doc(this.firestore, "users", currentUser.uid);
        await runTransaction(this.firestore, async (transaction) => {
          const userDocSnapshot = await transaction.get(userDoc);
          // If the user profile doesn't exist, create it
          if (!userDocSnapshot.exists()) {
            transaction.set(userDoc, userWithoutId);
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

  public createNewWorkspace: InstantlyClient["createNewWorkspace"] = async ({
    workspace,
    workspaceMember,
  }): Promise<void> => {
    const { id: workspaceId, ...workspaceWithoutId } =
      workspaceSchema.parse(workspace);
    const workspaceDoc = doc(this.firestore, "workspaces", workspaceId);
    await Promise.all([
      setDoc(workspaceDoc, workspaceWithoutId),
      setDoc(
        doc(
          this.firestore,
          "users",
          workspaceMember.id,
          "workspaces",
          workspaceId
        ),
        workspaceWithoutId
      ),
      setDoc(
        doc(
          this.firestore,
          "workspaces",
          workspaceId,
          "members",
          workspaceMember.id
        ),
        workspaceMemberWithoutIdSchema.parse(workspaceMember)
      ),
    ]);
  };

  public getWorkspaceMember: InstantlyClient["getWorkspaceMember"] = async ({
    workspaceId,
    memberId,
  }): Promise<WorkspaceMember> => {
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
    project,
    taskStatuses,
  }): Promise<void> => {
    const { id: projectId, ...projectWithoutId } = projectSchema.parse(project);
    const validatedTaskStatuses = taskStatusListSchema.parse(taskStatuses);
    taskStatusSchema;
    const projectDoc = doc(
      this.firestore,
      "workspaces",
      workspaceId,
      "projects",
      projectId
    );

    // Create the project document
    await setDoc(projectDoc, projectWithoutId);

    const taskStatusPromises = validatedTaskStatuses.map((taskStatus) => {
      const taskStatusDoc = doc(
        this.firestore,
        "workspaces",
        workspaceId,
        "projects",
        projectId,
        "task-statuses",
        taskStatus.id
      );

      const { id, ...taskStatusRest } = taskStatus;

      return setDoc(taskStatusDoc, taskStatusRest);
    });

    await Promise.all(taskStatusPromises);
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
    const { id: taskId, ...taskWithoutId } = taskSchema.parse(taskPayload);
    const taskDoc = doc(
      this.firestore,
      "workspaces",
      workspaceId,
      "projects",
      projectId,
      "tasks",
      taskId
    );
    await setDoc(taskDoc, taskWithoutId);
  };

  public updateTask: InstantlyClient["updateTask"] = async (
    { workspaceId, projectId },
    task
  ): Promise<void> => {
    const { id: taskId, ...taskWithoutId } = taskSchema.parse(task);
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
      taskWithoutId
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
