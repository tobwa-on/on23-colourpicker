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
import { saveAs } from 'file-saver';

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
        // Pick a random color from the current palette
        const randomColor = colors[Math.floor(Math.random() * colors.length)].replace('#', '');

        // Fetch a complementary color from the Color API
        const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${randomColor}&mode=complement&count=1`);
        const data = await response.json();
        return data.colors[0].hex.value;
    } catch (error) {
        console.error('Error generating intelligent color:', error);
        throw error;
    }
};

export const addColor = async (paletteId, newColor) => {
    const user = auth.currentUser;

    if (user) {
        console.log(typeof newColor !== 'string');
        if (!newColor || typeof newColor !== 'string' || !/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(newColor)) {
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

export const downloadPaletteAsImage = async (palette) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const boxSize = 100;
    canvas.width = palette.colors.length * boxSize;
    canvas.height = boxSize;

    palette.colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.fillRect(index * boxSize, 0, boxSize, boxSize);

        // Determine font color based on background color brightness
        const rgb = hexToRgb(color);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        ctx.fillStyle = brightness > 125 ? '#000000' : '#FFFFFF';

        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(color, index * boxSize + boxSize / 2, boxSize / 2 + 7);
    });

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: `${palette.name}.png`,
                types: [{
                    description: 'PNG Image',
                    accept: { 'image/png': ['.png'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error('Error saving file:', error);
        }
    } else {
        saveAs(blob, `${palette.name}.png`);
    }
};

const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
};
