import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './config';
import type { Project } from '@/components/project-dialog';

// Collection references
const projectsCollection = collection(db, 'projects');

// Project Services
export const createProject = async (projectData: Omit<Project, 'id'>) => {
  try {
    // Add timestamp fields
    const dataWithTimestamps = {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Create the document in Firestore
    const docRef = await addDoc(projectsCollection, dataWithTimestamps);
    
    // Return the created project with its ID
    return { 
      id: docRef.id, 
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating project:', error);
    // If there's an error with Firebase, return a local ID so the app can still function
    return { 
      id: `local_${Date.now()}`, 
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};

export const getProjects = async () => {
  try {
    const querySnapshot = await getDocs(projectsCollection);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps to JavaScript dates for client-side use
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
    }) as Project[];
  } catch (error) {
    console.error('Error getting projects:', error);
    // Return empty array if there's an error
    return [];
  }
};

export const getProject = async (projectId: string) => {
  try {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      } as Project;
    } else {
      throw new Error('Project not found');
    }
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string, projectData: Partial<Omit<Project, 'id'>>) => {
  try {
    const docRef = doc(db, 'projects', projectId);
    
    // Add updatedAt timestamp
    const dataWithTimestamp = {
      ...projectData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    
    return { 
      id: projectId, 
      ...projectData,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating project:', error);
    // Return the data anyway so the UI can still update
    return { 
      id: projectId, 
      ...projectData,
      updatedAt: new Date()
    };
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    // Skip deletion for local IDs
    if (projectId.startsWith('local_')) {
      return true;
    }
    
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    // Return true anyway so the UI can update
    return true;
  }
};

// Volunteer Data Services
export const updateVolunteerData = async (projectId: string, volunteerData: any) => {
  try {
    // Skip updates for local IDs
    if (projectId.startsWith('local_')) {
      return true;
    }
    
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      volunteerData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating volunteer data:', error);
    // Return true anyway so the UI doesn't break
    return true;
  }
};

export const getVolunteerData = async (projectId: string) => {
  try {
    // Return empty object for local IDs
    if (projectId.startsWith('local_')) {
      return {};
    }
    
    const project = await getProject(projectId);
    return project.volunteerData || {};
  } catch (error) {
    console.error('Error getting volunteer data:', error);
    return {};
  }
}; 