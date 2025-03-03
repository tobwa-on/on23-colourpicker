import { auth, db, observeAuthState } from '../../firebase'; 
import { collection, getDocs, addDoc, doc, deleteDoc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';

export const fetchPalettes = () => {
    return new Promise((resolve, reject) => {
        observeAuthState(async (user) => {
            if (user) {
                try {
                    const palettesRef = collection(db, 'users', user.uid, 'palettes');
                    const snapshot = await getDocs(palettesRef);
                    const palettes = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    resolve(palettes);
                } catch (error) {
                    console.error('Error fetching palettes: ', error);
                    reject(error);
                }
            } else {
                console.error('User is not authenticated');
                reject(new Error('User is not authenticated'));
            }
        });
    });
};

export const createPalette = async (paletteName, colors) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const palettesRef = collection(db, 'users', user.uid, 'palettes');
            await addDoc(palettesRef, {
                name: paletteName,
                colors: colors,
            });

            console.log('Palette successfully created!');
        } catch (error) {
            console.error('Error creating palette: ', error);
            throw error;
        }
    } else {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const deletePalette = async (paletteId) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const paletteRef = doc(db, 'users', user.uid, 'palettes', paletteId);
            await deleteDoc(paletteRef);
            console.log('Palette successfully deleted!');
        } catch (error) {
            console.error('Error deleting palette: ', error);
            throw error;
        }
    } else {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const fetchPaletteById = async (id) => {
    return new Promise((resolve, reject) => {
        observeAuthState(async (user) => {
            if (user) {
                try {
                    const paletteRef = doc(db, 'users', user.uid, 'palettes', id);
                    const docSnap = await getDoc(paletteRef);
                    
                    if (docSnap.exists()) {
                        resolve({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        reject(new Error('Palette not found'));
                    }
                } catch (error) {
                    console.error('Error fetching palette by ID: ', error);
                    reject(error);
                }
            } else {
                console.error('User is not authenticated');
                reject(new Error('User is not authenticated'));
            }
        });
    });
};


export const deleteColor = async (paletteId, colorToDelete) => {
    const user = auth.currentUser;
  
    if (user) {
      try {
        const paletteRef = doc(db, 'users', user.uid, 'palettes', paletteId);
        
        await updateDoc(paletteRef, {
          colors: arrayRemove(colorToDelete),
        });
  
        console.log('Color successfully deleted!');
      } catch (error) {
        console.error('Error deleting color: ', error);
        throw error;
      }
    } else {
      console.error('User is not authenticated');
      throw new Error('User is not authenticated');
    }
  };


  export const updateColor = async (paletteId, oldColor, newColor) => {
    const user = auth.currentUser;
  
    if (user) {
      try {
        const paletteRef = doc(db, 'users', user.uid, 'palettes', paletteId);
        
        await updateDoc(paletteRef, {
          colors: arrayRemove(oldColor),
        });
  
        await updateDoc(paletteRef, {
          colors: arrayUnion(newColor),
        });
  
        console.log('Color successfully updated!');
      } catch (error) {
        console.error('Error updating color: ', error);
        throw error;
      }
    } else {
      console.error('User is not authenticated');
      throw new Error('User is not authenticated');
    }
  };
