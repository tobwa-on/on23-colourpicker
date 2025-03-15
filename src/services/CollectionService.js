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
    arrayUnion,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';
import { saveAs } from 'file-saver';

export const fetchCollections = () => {
    return new Promise((resolve, reject) => {
        observeAuthState(async (user) => {
            if (user) {
                try {
                    const collectionRef = collection(db, 'users', user.uid, 'palettes');
                    const q = query(collectionRef, orderBy('last_modified', 'desc'));
                    const snapshot = await getDocs(q);
                    const collections = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    resolve(collections);
                } catch (error) {
                    console.error('Error fetching collections: ', error);
                    reject(error);
                }
            } else {
                console.error('User is not authenticated');
                reject(new Error('User is not authenticated'));
            }
        });
    });
};

export const createCollection = async (collectionName, colors) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = collection(db, 'users', user.uid, 'palettes');
            await addDoc(collectionRef, {
                name: collectionName,
                colors: colors,
                last_modified: serverTimestamp()
            });

            console.log('Collection successfully created!');
        } catch (error) {
            console.error('Error creating Collection: ', error);
            throw error;
        }
    } else {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const deleteCollection = async (collectionId) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);
            await deleteDoc(collectionRef);
            console.log('Collection successfully deleted!');
        } catch (error) {
            console.error('Error deleting collection: ', error);
            throw error;
        }
    } else {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const fetchCollectionById = async (id) => {
    return new Promise((resolve, reject) => {
        observeAuthState(async (user) => {
            if (user) {
                try {
                    const collectionRef = doc(db, 'users', user.uid, 'palettes', id);
                    const docSnap = await getDoc(collectionRef);

                    if (docSnap.exists()) {
                        resolve({id: docSnap.id, ...docSnap.data()});
                    } else {
                        reject(new Error('Collection not found'));
                    }
                } catch (error) {
                    console.error('Error fetching collection by ID: ', error);
                    reject(error);
                }
            } else {
                console.error('User is not authenticated');
                reject(new Error('User is not authenticated'));
            }
        });
    });
};

export const deleteColor = async (collectionId, colorToDelete) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);

            await updateDoc(collectionRef, {
                colors: arrayRemove(colorToDelete),
                last_modified: serverTimestamp()
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

export const updateColor = async (collectionId, oldColor, newColor) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);

            await updateDoc(collectionRef, {
                colors: arrayRemove(oldColor),
                last_modified: serverTimestamp()
            });

            await updateDoc(collectionRef, {
                colors: arrayUnion(newColor),
                last_modified: serverTimestamp()
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
        const randomColor = colors[Math.floor(Math.random() * colors.length)].replace('#', '');
        const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${randomColor}&mode=complement&count=1`);
        const data = await response.json();
        return data.colors[0].hex.value;
    } catch (error) {
        console.error('Error generating intelligent color:', error);
        throw error;
    }
};

export const addColor = async (collectionId, newColor) => {
    const user = auth.currentUser;

    if (user) {
        console.log(typeof newColor !== 'string');
        if (!newColor || typeof newColor !== 'string' || !/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(newColor)) {
            throw new Error('Invalid color format');
        }

        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);

            await updateDoc(collectionRef, {
                colors: arrayUnion(newColor),
                last_modified: serverTimestamp()
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

export const updateCollectionName = async (collectionId, newName) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);
            await updateDoc(collectionRef, {
                name: newName,
                last_modified: serverTimestamp()
            });

            console.log('Collection name successfully updated!');
        } catch (error) {
            console.error('Error updating collection name: ', error);
            throw error;
        }
    } else {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const downloadCollectionAsImage = async (collection) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const boxSize = 100;
    canvas.width = collection.colors.length * boxSize;
    canvas.height = boxSize;

    collection.colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.fillRect(index * boxSize, 0, boxSize, boxSize);

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
                suggestedName: `${collection.name}.png`,
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
        saveAs(blob, `${collection.name}.png`);
    }
};

export const downloadCollectionAsJson = async (collection) => {
    const jsonData = {
        name: collection.name,
        colors: collection.colors
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });

    saveAs(blob, `${collection.name}.json`);
};

const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
};
