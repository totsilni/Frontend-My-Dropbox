import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Home from "./components/Home";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase/config";
import UserHome from "./components/UserHome";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsibscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });
    return () => unsibscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user === null ? <Login /> : <Home />} />
        {/* <Route path="/home/:folderId" element={<UserHome />} /> */}
        <Route path="/signup" element={user === null ? <SignUp /> : <Home />} />
        <Route path="/login" element={user === null ? <Login /> : <Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
