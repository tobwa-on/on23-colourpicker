import { auth, db, observeAuthState } from '../../firebase'; 
import { collection, getDocs, addDoc } from 'firebase/firestore';

export const fetchPalettes = () => {
    return new Promise((resolve, reject) => {
        observeAuthState(async (user) => {
            if (user) {
                try {
                    const palettesRef = collection(db, 'users', user.uid, 'palettes');
                    const snapshot = await getDocs(palettesRef);
                    const palettes = snapshot.docs.map(doc => doc.data());
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
