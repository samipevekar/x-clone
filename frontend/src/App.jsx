import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { Toaster } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RightPanelSkeleton from "./components/skeletons/RightPanelSkeleton";

// Lazy-loaded components
const HomePage = lazy(() => import("./pages/home/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/login/LoginPage"));
const SignUpPage = lazy(() => import("./pages/auth/signup/SignUpPage"));
const Sidebar = lazy(() => import("./components/common/Sidebar"));
const RightPanel = lazy(() => import("./components/common/RightPanel"));
const NotificationPage = lazy(() => import("./pages/notification/NotificationPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const Bookmark = lazy(() => import("./pages/bookmark/Bookmark"));
const Search = lazy(() => import("./pages/search/Search"));

function App() {
  const URL = import.meta.env.VITE_URL;

  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch(`${URL}/api/auth/me`, {
          headers: {
            "auth-token": localStorage.getItem("auth-token")
          },
          credentials: "include"
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log(localStorage.getItem("auth-token"))
  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && (
        <Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
          <Sidebar />
        </Suspense>
      )}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/search"
            element={authUser ? <Search /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/bookmark"
            element={authUser ? <Bookmark /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:username"
            element={authUser ? <ProfilePage /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      {authUser && (
        <Suspense fallback={<RightPanelSkeleton />}>
          <RightPanel />
        </Suspense>
      )}
      <Toaster />
    </div>
  );
}

export default App;
