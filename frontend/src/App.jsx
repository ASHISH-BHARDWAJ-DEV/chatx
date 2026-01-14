import { Navigate, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import PageLoader from "./components/PageLoader";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  console.log({ authUser, isCheckingAuth });

  return (
    <div className="min-h-screen bg-[#0f0f10] relative flex items-center justify-center p-4 overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="absolute top-0 -left-4 size-96 bg-white opacity-[0.06] blur-[120px]" />
      
      <div className="absolute bottom-0 -right-4 size-96 bg-gray-400 opacity-[0.05] blur-[120px]" />
  
      <Routes>
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
      </Routes>
  
      <Toaster />
    </div>
  );
  
}

export default App;
