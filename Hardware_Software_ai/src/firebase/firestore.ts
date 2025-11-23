import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from './config';

// Project interface
export interface Project {
  id?: string;
  name: string;
  description: string;
  components: string[];
  difficulty: string;
  code: string;
  wiring: Array<{
    instruction: string;
    image_url: string;
    component: string;
  }>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User library interface
export interface UserLibrary {
  id?: string;
  userId: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  status: 'processing' | 'completed';
  preview?: {
    deviceName: string;
    deviceImage: string;
    codeSnippet: string;
    pinDiagram: string;
  };
}

// Projects collection operations
export const projectsCollection = collection(db, 'projects');

export const addProject = async (project: Omit<Project, 'id'>): Promise<string> => {
  const docRef = await addDoc(projectsCollection, {
    ...project,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<void> => {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: new Date()
  });
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);
  
  if (projectSnap.exists()) {
    return { id: projectSnap.id, ...projectSnap.data() } as Project;
  }
  return null;
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const q = query(
    projectsCollection,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Project[];
};

// User libraries collection operations
export const userLibrariesCollection = collection(db, 'userLibraries');

export const addUserLibrary = async (library: Omit<UserLibrary, 'id'>): Promise<string> => {
  const docRef = await addDoc(userLibrariesCollection, library);
  return docRef.id;
};

export const getUserLibraries = async (userId: string): Promise<UserLibrary[]> => {
  const q = query(
    userLibrariesCollection,
    where('userId', '==', userId),
    orderBy('uploadDate', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserLibrary[];
};

// Real-time listeners
export const subscribeToUserProjects = (
  userId: string, 
  callback: (projects: Project[]) => void
): (() => void) => {
  const q = query(
    projectsCollection,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
    callback(projects);
  });
};

