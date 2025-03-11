import { auth, db, observeAuthState } from '../../firebase';
import {
    collection,
    getDocs,
    addDoc,
    doc,
    deleteDoc,
    getDoc,
    updateDoc,
    arrayRemove,
    arrayUnion
} from 'firebase/firestore';

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
                        resolve({id: docSnap.id, ...docSnap.data()});
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

export const getIntelligentColor = async (colors) => {
    try {
        // Get the last 5 colors of the palette and convert them to RGB format
        const lastColors = colors.slice(-5).map(color => {
            const hex = color.replace('#', '');
            return [
                parseInt(hex.substring(0, 2), 16),
                parseInt(hex.substring(2, 4), 16),
                parseInt(hex.substring(4, 6), 16)
            ];
        });

        // Fetch a color from the Colormind API using the fetch API
        const response = await fetch('http://colormind.io/api/', {
            method: 'POST',
            body: JSON.stringify({
                model: 'default',
                input: lastColors.concat(new Array(5 - lastColors.length).fill([0, 0, 0]))
            })
        });
        const data = await response.json();
        return `#${data.result[4].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    } catch (error) {
        console.error('Error generating intelligent color:', error);
        throw error;
    }
};

export const addColor = async (paletteId, newColor) => {
    const user = auth.currentUser;

    if (user) {
        if (!newColor || typeof newColor !== 'string' || !/^#[0-9A-F]{6}$/i.test(newColor)) {
            throw new Error('Invalid color format');
        }

        try {
            const paletteRef = doc(db, 'users', user.uid, 'palettes', paletteId);

            // Add the provided color to the palette
            await updateDoc(paletteRef, {
                colors: arrayUnion(newColor),
            });

            console.log('Color successfully added!');
        } catch (error) {
            console.error('Error adding color:', error);
            throw error;
        }
    } else {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const updatePaletteName = async (paletteId, newName) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const paletteRef = doc(db, 'users', user.uid, 'palettes', paletteId);

            // Palette mit dem neuen Namen aktualisieren
            await updateDoc(paletteRef, {
                name: newName,
            });

            console.log('Palette name successfully updated!');
        } catch (error) {
            console.error('Error updating palette name: ', error);
            throw error;
        }
    } else {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
    }
};
