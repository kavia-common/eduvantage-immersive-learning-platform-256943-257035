 /**
  * App routes using React Router v6.
  * Defines core pages and lazy loading boundaries.
  * Ensures protected pages are gated and common components are used.
  */
import React, { lazy, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

const Home = lazy(() => import("../views/Home"));
const Dashboard = lazy(() => import("../views/Dashboard"));
const Classroom = lazy(() => import("../views/Classroom"));
const Analytics = lazy(() => import("../views/Analytics"));
const Profile = lazy(() => import("../views/Profile"));
const Settings = lazy(() => import("../views/Settings"));
const NotFound = lazy(() => import("../views/NotFound"));
const Login = lazy(() => import("../views/Login"));
const Signup = lazy(() => import("../views/Signup"));
const OAuthCallback = lazy(() => import("../views/OAuthCallback"));
const FeedView = lazy(() => import("../views/Feed"));
const Wellbeing = lazy(() => import("../views/Wellbeing"));
const Career = lazy(() => import("../views/Career"));
const StylePreview = lazy(() => import("../views/StylePreview"));
const FeedDemo = lazy(() => import("../views/FeedDemo"));
const Courses = lazy(() => import("../views/Courses"));
const CourseDetailPage = lazy(() => import("../views/CourseDetailPage")); // new route
const InstructorDashboard = lazy(() => import("../views/InstructorDashboard"));
const Cart = lazy(() => import("../views/Cart"));
const Wishlist = lazy(() => import("../views/Wishlist"));

// ADD: dynamic imports for quiz management
const InstructorCourseQuizzes = lazy(() => import("../pages/InstructorCourseQuizzes"));
const InstructorQuizCreate = lazy(() => import("../pages/InstructorQuizCreate"));
const InstructorQuizEdit = lazy(() => import("../pages/InstructorQuizEdit"));

/**
 * PUBLIC_INTERFACE
 * Exported list of route definitions consumed by <App />.
 * - label is used for sidebar and TopNav title
 * - icon is displayed in the Sidebar
 */
export function PrefetchProfileOnIdle() {
  useEffect(() => {
    const cb = () => {
      // Hint the browser to warm up DNS/TLS if backend is remote; also dynamic import for the route chunk.
      try {
        import("../views/Profile");
      } catch (_) {}
    };
    const id = ("requestIdleCallback" in window)
      ? window.requestIdleCallback(cb)
      : setTimeout(cb, 2000);
    return () => {
      if ("cancelIdleCallback" in window && typeof id === "number") {
        window.cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, []);
  return null;
}

// PUBLIC_INTERFACE
// Routes array used by the App to render <Routes>. Keep order meaningful for aliases and 404.
export const routes = [
  // Core public page
  { path: "/", element: <Home />, label: "Home", icon: "🏠" },

  // Core protected modules
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    label: "Dashboard",
    icon: "📊",
  },
  {
    path: "/classroom",
    element: (
      <ProtectedRoute>
        <Classroom />
      </ProtectedRoute>
    ),
    label: "Classroom",
    icon: "🎓",
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
    label: "Analytics",
    icon: "📈",
  },
  {
    path: "/courses",
    element: <Courses />,
    label: "Courses",
    icon: "🎓",
  },
  {
    // New dynamic course detail route
    path: "/courses/:id",
    element: <CourseDetailPage />,
    label: "Course Detail",
  },
  {
    path: "/feed",
    element: (
      <ProtectedRoute>
        <FeedView />
      </ProtectedRoute>
    ),
    label: "Feed",
    icon: "📰",
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    label: "Profile",
    icon: "👤",
  },
  {
    path: "/instructor",
    element: (
      <ProtectedRoute>
        <InstructorDashboard />
      </ProtectedRoute>
    ),
    label: "Instructor",
    icon: "🧑‍🏫",
  },
  {
    path: "/wishlist",
    element: (
      <ProtectedRoute>
        <Wishlist />
      </ProtectedRoute>
    ),
    label: "Wishlist",
    icon: "💖",
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute>
        <Cart />
      </ProtectedRoute>
    ),
    label: "Cart",
    icon: "🛒",
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
    label: "Settings",
    icon: "⚙️",
  },
  {
    path: "/wellbeing",
    element: (
      <ProtectedRoute>
        <Wellbeing />
      </ProtectedRoute>
    ),
    label: "Wellbeing",
    icon: "🧠",
  },
  {
    path: "/career",
    element: (
      <ProtectedRoute>
        <Career />
      </ProtectedRoute>
    ),
    label: "Career",
    icon: "🧭",
  },

  // Utility preview routes (not in sidebar)
  { path: "/style-preview", element: <StylePreview />, label: "Style Preview" },
  { path: "/feed-demo", element: <FeedDemo />, label: "Feed Demo" },

  // Auth routes (not in sidebar)
  { path: "/login", element: <Login />, label: "Login" },
  { path: "/signup", element: <Signup />, label: "Signup" },
  { path: "/auth/callback", element: <OAuthCallback />, label: "OAuth Callback" },

  // ---- INSTRUCTOR QUIZ MANAGEMENT DYNAMIC ROUTES ----
  {
    path: "/instructor/courses/:courseId/quizzes",
    element: (
      <ProtectedRoute>
        <InstructorCourseQuizzes />
      </ProtectedRoute>
    ),
    label: "Quizzes",
    icon: "",
  },
  {
    path: "/instructor/courses/:courseId/quizzes/new",
    element: (
      <ProtectedRoute>
        <InstructorQuizCreate />
      </ProtectedRoute>
    ),
    label: "Create Quiz",
    icon: "",
  },
  {
    path: "/instructor/courses/:courseId/quizzes/:quizId/edit",
    element: (
      <ProtectedRoute>
        <InstructorQuizEdit />
      </ProtectedRoute>
    ),
    label: "Edit Quiz",
    icon: "",
  },
  // ---- END: QUIZ MANAGEMENT ROUTES ----

  // Aliases and 404
  { path: "/home", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFound />, label: "Not Found" },
];


/**
 * PUBLIC_INTERFACE
 * Filtered routes used in the sidebar navigation (excludes auth/utility routes).
 */
export const navRoutes = routes.filter(
  (r) =>
    r.label &&
    r.path &&
    !["/home", "*", "/login", "/signup", "/auth/callback", "/style-preview", "/courses/:id"].includes(r.path)
);
