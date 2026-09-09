import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDmf6vKwIylTMXcr9uN8i0AVuyqqkHRnBo",
    authDomain: "turing-store-d12f5.firebaseapp.com",
    projectId: "turing-store-d12f5",
    storageBucket: "turing-store-d12f5.firebasestorage.app",
    messagingSenderId: "707005393696",
    appId: "1:707005393696:web:0aa5cfc5413f595583c545",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);