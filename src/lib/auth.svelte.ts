import { auth } from './firebase';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	onAuthStateChanged,
	type User
} from 'firebase/auth';

// Constant for the admin email
export const ADMIN_EMAIL = 'elinelson992@gmail.com';

class AuthState {
	#user = $state<User | null>(null);
	#loading = $state(true);

	constructor() {
		// Check if we are in browser environment
		if (typeof window !== 'undefined') {
			onAuthStateChanged(auth, (u) => {
				this.#user = u;
				this.#loading = false;
			});
		} else {
			this.#loading = false;
		}
	}

	get user() {
		return this.#user;
	}

	get loading() {
		return this.#loading;
	}

	get isAdmin() {
		return this.#user?.email === ADMIN_EMAIL;
	}
}

export const authState = new AuthState();

/**
 * Sign in using email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
	const credential = await signInWithEmailAndPassword(auth, email, pass);
	return credential.user;
}

/**
 * Sign up using email and password
 */
export async function signUpWithEmail(email: string, pass: string): Promise<User> {
	const credential = await createUserWithEmailAndPassword(auth, email, pass);
	return credential.user;
}

/**
 * Sign in using Google OAuth Popup
 */
export async function loginWithGoogle(): Promise<User> {
	const provider = new GoogleAuthProvider();
	const credential = await signInWithPopup(auth, provider);
	return credential.user;
}

/**
 * Sign out the currently logged-in user
 */
export async function logout(): Promise<void> {
	await signOut(auth);
}
