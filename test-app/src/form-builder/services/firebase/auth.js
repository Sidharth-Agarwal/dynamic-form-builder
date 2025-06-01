import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword
  } from 'firebase/auth';
  
  let auth;
  
  export const initializeAuth = (app) => {
    try {
      auth = getAuth(app);
      return auth;
    } catch (error) {
      console.error('Error initializing Auth:', error);
      throw error;
    }
  };
  
  export const signIn = async (email, password) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };
  
  export const logOut = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  export const getCurrentUser = () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    return auth.currentUser;
  };
  
  export const authStateListener = (callback) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    
    return onAuthStateChanged(auth, callback);
  };
  
  export const registerUser = async (email, password) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };
  
  export { auth };