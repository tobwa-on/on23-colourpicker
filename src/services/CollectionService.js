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

let authStateInitialized = false;
let currentUser = null;

observeAuthState((user) => {
    currentUser = user;
    authStateInitialized = true;
});

export const fetchCollections = async (showToast) => {
    if (!authStateInitialized) {
        return new Promise((resolve, reject) => {
            setTimeout(() => fetchCollections(showToast).then(resolve).catch(reject), 100);
        });
    }

    if (!currentUser) {
        if (showToast) showToast('error', 'User is not authenticated');
        throw new Error('User is not authenticated');
    }

    try {
        const collectionRef = collection(db, 'users', currentUser.uid, 'palettes');
        const q = query(collectionRef, orderBy('last_modified', 'desc'));
        const snapshot = await getDocs(q);
        const collections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return collections;
    } catch (error) {
        if (showToast) showToast('error', 'Collections could not be loaded!');
        throw error;
    }
};

export const createCollection = async (collectionName, colors, showToast) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = collection(db, 'users', user.uid, 'palettes');
            await addDoc(collectionRef, {
                name: collectionName,
                colors: colors,
                last_modified: serverTimestamp()
            });
            if (showToast) showToast('success', 'Collection created successfully!');
        } catch (error) {
            if (showToast) showToast('error', 'Collection could not be created!');
            throw error;
        }
    } else {
        if (showToast) showToast('error', 'User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const deleteCollection = async (collectionId, showToast) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);
            await deleteDoc(collectionRef);
            if (showToast) showToast('success', 'Collection successfully deleted!');
        } catch (error) {
            if (showToast) showToast('error', 'Collection could not be deleted');
            throw error;
        }
    } else {
        if (showToast) showToast('error', 'User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const fetchCollectionById = async (id, showToast) => {
    return new Promise((resolve, reject) => {
        observeAuthState(async (user) => {
            if (user) {
                try {
                    const collectionRef = doc(db, 'users', user.uid, 'palettes', id);
                    const docSnap = await getDoc(collectionRef);

                    if (docSnap.exists()) {
                        resolve({id: docSnap.id, ...docSnap.data()});
                    } else {
                        if (showToast) showToast('error', 'Error fetching collection by ID');
                        reject(new Error('Collection not found'));
                    }
                } catch (error) {
                    if (showToast) showToast('error', 'Error fetching collection by ID');
                    reject(error);
                }
            } else {
                if (showToast) showToast('error', 'User is not authenticated');
                reject(new Error('User is not authenticated'));
            }
        });
    });
};

export const deleteColor = async (collectionId, colorToDelete, showToast) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);

            await updateDoc(collectionRef, {
                colors: arrayRemove(colorToDelete),
                last_modified: serverTimestamp()
            });

            if (showToast) showToast('success', 'Color successfully deleted!');
        } catch (error) {
            if (showToast) showToast('error', 'Color could not be deleted.');
            throw error;
        }
    } else {
        if (showToast) showToast('error', 'User is not authenticated');
        throw new Error('User is not authenticated');
    }
};

export const updateColor = async (collectionId, oldColor, newColor, showToast) => {
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

            if (showToast) showToast('success', 'Color successfully updated!');
        } catch (error) {
            if (showToast) showToast('error', 'Color could not be updated.');
            throw error;
        }
    } else {
        if (showToast) showToast('error', 'User is not authenticated');
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

export const addColor = async (collectionId, newColor, showToast) => {
    const user = auth.currentUser;

    if (user) {
        if (!newColor || typeof newColor !== 'string' || !/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(newColor)) {
            throw new Error('Invalid color format');
        }

        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);

            await updateDoc(collectionRef, {
                colors: arrayUnion(newColor),
                last_modified: serverTimestamp()
            });

            if (showToast) showToast('success', 'Color successfully added!');
        } catch (error) {
            if (showToast) showToast('error', 'Color could not be added.');
            throw error;
        }
    } else {
        if (showToast) showToast('error', 'User is not authenticated');
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

export const updateCollectionName = async (collectionId, newName, showToast) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const collectionRef = doc(db, 'users', user.uid, 'palettes', collectionId);
            await updateDoc(collectionRef, {
                name: newName,
                last_modified: serverTimestamp()
            });

            if (showToast) showToast('success', 'Collection name successfully updated!');
        } catch (error) {
            if (showToast) showToast('error', 'Collection name could not be updated.');
            throw error;
        }
    } else {
        if (showToast) showToast('error', 'User is not authenticated');
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
