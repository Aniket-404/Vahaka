declare module 'firebase/app' {
  export function initializeApp(config: any): any;
}

declare module 'firebase/firestore' {
  export function getFirestore(app: any): any;
  export function collection(db: any, path: string): any;
  export function addDoc(reference: any, data: any): Promise<any>;
  export function getDocs(query: any): Promise<any>;
  export function doc(db: any, collection: string, id?: string): any;
  export function getDoc(reference: any): Promise<any>;
  export function setDoc(reference: any, data: any): Promise<void>;
  export function updateDoc(reference: any, data: any): Promise<void>;
  export function deleteDoc(reference: any): Promise<void>;
  export function query(reference: any, ...args: any[]): any;
  export function where(field: string, op: string, value: any): any;
} 