import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAPMbObWOTgxGF3gs446Y3bMvTqa4y7A_k",
  authDomain: "auth-development-38db1.firebaseapp.com",
  projectId: "auth-development-38db1",
  storageBucket: "auth-development-38db1.appspot.com",
  messagingSenderId: "1087001453884",
  appId: "1:1087001453884:web:298100eec367aa20ccaa39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app)

export { auth, storage };