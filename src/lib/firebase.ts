import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	projectId: 'personal-website-80b8c',
	appId: '1:604225694916:web:73cca00a0c19dce84aad91',
	storageBucket: 'personal-website-80b8c.firebasestorage.app',
	apiKey: 'AIzaSyAcso_D4NwTM6PbZdvr1hyKlQzcrp7JaOc',
	authDomain: 'personal-website-80b8c.firebaseapp.com',
	messagingSenderId: '604225694916',
	measurementId: 'G-1DPDGW9FF4'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
