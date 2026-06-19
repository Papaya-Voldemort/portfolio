import { db } from './firebase';
import {
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	getDocs,
	query,
	where,
	orderBy,
	onSnapshot,
	Timestamp
} from 'firebase/firestore';

// Helper to convert Firestore timestamp to standard Date
// Handles both standard SDK Timestamp classes and plain serialized timestamp objects
function toDate(timestamp: unknown): Date {
	if (!timestamp) return new Date();
	if (timestamp instanceof Timestamp) {
		return timestamp.toDate();
	}
	const tsObj = timestamp as { seconds?: number; nanoseconds?: number };
	if (tsObj.seconds !== undefined) {
		return new Timestamp(tsObj.seconds, tsObj.nanoseconds ?? 0).toDate();
	}
	return new Date(timestamp as string | number | Date);
}

// ==========================================
// PROJECTS SECTION
// ==========================================

export interface Project {
	id?: string;
	title: string;
	description: string;
	tags: string[];
	imageUrl: string;
	githubUrl: string;
	liveUrl: string;
	featured: boolean;
	createdAt: Date;
}

/**
 * Retrieve all projects, ordered by creation date descending
 */
export async function getProjects(): Promise<Project[]> {
	const ref = collection(db, 'projects');
	const q = query(ref, orderBy('createdAt', 'desc'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => {
		const data = d.data();
		return {
			id: d.id,
			title: data.title || '',
			description: data.description || '',
			tags: data.tags || [],
			imageUrl: data.imageUrl || '',
			githubUrl: data.githubUrl || '',
			liveUrl: data.liveUrl || '',
			featured: !!data.featured,
			createdAt: toDate(data.createdAt)
		} as Project;
	});
}

/**
 * Add a new project
 */
export async function addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<string> {
	const ref = collection(db, 'projects');
	const docRef = await addDoc(ref, {
		...project,
		createdAt: Timestamp.now()
	});
	return docRef.id;
}

/**
 * Update an existing project
 */
export async function updateProject(
	id: string,
	project: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<void> {
	const ref = doc(db, 'projects', id);
	await updateDoc(ref, project);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
	const ref = doc(db, 'projects', id);
	await deleteDoc(ref);
}

// ==========================================
// BLOG POSTS SECTION
// ==========================================

export interface BlogPost {
	id?: string;
	title: string;
	slug: string;
	content: string;
	summary: string;
	category: string;
	readTime: string;
	imageUrl: string;
	published: boolean;
	createdAt: Date;
}

/**
 * Retrieve blog posts, ordered by creation date descending.
 * Optionally filter only published posts.
 */
export async function getBlogPosts(onlyPublished = true): Promise<BlogPost[]> {
	const ref = collection(db, 'posts');
	let q = query(ref, orderBy('createdAt', 'desc'));
	if (onlyPublished) {
		q = query(ref, where('published', '==', true), orderBy('createdAt', 'desc'));
	}
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => {
		const data = d.data();
		return {
			id: d.id,
			title: data.title || '',
			slug: data.slug || '',
			content: data.content || '',
			summary: data.summary || '',
			category: data.category || '',
			readTime: data.readTime || '',
			imageUrl: data.imageUrl || '',
			published: !!data.published,
			createdAt: toDate(data.createdAt)
		} as BlogPost;
	});
}

/**
 * Retrieve a single blog post by its slug URL string
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
	const ref = collection(db, 'posts');
	const q = query(ref, where('slug', '==', slug));
	const snapshot = await getDocs(q);
	if (snapshot.empty) return null;
	const d = snapshot.docs[0];
	const data = d.data();
	return {
		id: d.id,
		title: data.title || '',
		slug: data.slug || '',
		content: data.content || '',
		summary: data.summary || '',
		category: data.category || '',
		readTime: data.readTime || '',
		imageUrl: data.imageUrl || '',
		published: !!data.published,
		createdAt: toDate(data.createdAt)
	} as BlogPost;
}

/**
 * Create a new blog post
 */
export async function addBlogPost(post: Omit<BlogPost, 'id' | 'createdAt'>): Promise<string> {
	const ref = collection(db, 'posts');
	const docRef = await addDoc(ref, {
		...post,
		createdAt: Timestamp.now()
	});
	return docRef.id;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(
	id: string,
	post: Partial<Omit<BlogPost, 'id' | 'createdAt'>>
): Promise<void> {
	const ref = doc(db, 'posts', id);
	await updateDoc(ref, post);
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<void> {
	const ref = doc(db, 'posts', id);
	await deleteDoc(ref);
}

// ==========================================
// COMMENTS SECTION
// ==========================================

export interface Comment {
	id?: string;
	postId: string;
	authorName: string;
	authorEmail: string;
	authorPhoto: string;
	authorId: string;
	content: string;
	createdAt: Date;
}

/**
 * Fetch comments for a specific post once, ordered by creation date ascending
 */
export async function getCommentsForPost(postId: string): Promise<Comment[]> {
	const ref = collection(db, 'comments');
	const q = query(ref, where('postId', '==', postId), orderBy('createdAt', 'asc'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => {
		const data = d.data();
		return {
			id: d.id,
			postId: data.postId || '',
			authorName: data.authorName || 'Anonymous',
			authorEmail: data.authorEmail || '',
			authorPhoto: data.authorPhoto || '',
			authorId: data.authorId || '',
			content: data.content || '',
			createdAt: toDate(data.createdAt)
		} as Comment;
	});
}

/**
 * Listen to real-time comment updates for a specific blog post
 */
export function subscribeCommentsForPost(postId: string, callback: (comments: Comment[]) => void) {
	const ref = collection(db, 'comments');
	const q = query(ref, where('postId', '==', postId), orderBy('createdAt', 'asc'));
	return onSnapshot(q, (snapshot) => {
		const comments = snapshot.docs.map((d) => {
			const data = d.data();
			return {
				id: d.id,
				postId: data.postId || '',
				authorName: data.authorName || 'Anonymous',
				authorEmail: data.authorEmail || '',
				authorPhoto: data.authorPhoto || '',
				authorId: data.authorId || '',
				content: data.content || '',
				createdAt: toDate(data.createdAt)
			} as Comment;
		});
		callback(comments);
	});
}

/**
 * Post a new comment
 */
export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
	const ref = collection(db, 'comments');
	const docRef = await addDoc(ref, {
		...comment,
		createdAt: Timestamp.now()
	});
	return docRef.id;
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<void> {
	const ref = doc(db, 'comments', id);
	await deleteDoc(ref);
}
