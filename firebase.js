import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyByAY9UaX54HDpXY5_Kx7C1LuU2jKf4tbw",
    authDomain: "on23-colourpicker-693f6.firebaseapp.com",
    projectId: "on23-colourpicker-693f6",
    storageBucket: "on23-colourpicker-693f6.firebasestorage.app",
    messagingSenderId: "333660382782",
    appId: "1:333660382782:web:e86370e235aae6903f936f"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };


export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User registered:', user);
    } catch (error) {
        console.error('Error registering user:', error.message);
    }
};

export const signInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User registered:', user);
    } catch (error) {
        console.error('Error registering user:', error.message);
    }
};

