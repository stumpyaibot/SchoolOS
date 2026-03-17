import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import BottomTabBar from './components/layout/BottomTabBar';
import RoleSelect from './pages/RoleSelect';
import HomeFeed from './pages/HomeFeed';
import ClassView from './pages/ClassView';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import ChatThread from './pages/ChatThread';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';
import ActionDetail from './pages/ActionDetail';
import EventDetail from './pages/EventDetail';
import Search from './pages/Search';
import MediaGallery from './pages/MediaGallery';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import NewPost from './pages/teacher/NewPost';
import StudentProfile from './pages/teacher/StudentProfile';
import TeacherMessages from './pages/teacher/TeacherMessages';
import ResponseDashboard from './pages/teacher/ResponseDashboard';

function TeacherModeDetector() {
  const location = useLocation();
  useEffect(() => {
    const isFullWidth = location.pathname.startsWith('/teacher') || location.pathname === '/';
    if (isFullWidth) {
      document.body.classList.add('teacher-mode');
    } else {
      document.body.classList.remove('teacher-mode');
    }
  }, [location.pathname]);
  return null;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}

function TabLayout() {
  return (
    <>
      <PageTransition>
        <Outlet />
      </PageTransition>
      <BottomTabBar />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TeacherModeDetector />
      <Routes>
        {/* Landing / Role Select */}
        <Route path="/" element={<RoleSelect />} />

        {/* Parent Tab Screens — show bottom nav */}
        <Route element={<TabLayout />}>
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/class/:childId" element={<ClassView />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/ai" element={<AIAssistant />} />
        </Route>

        {/* Detail Screens — no bottom nav */}
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/post/:postId" element={<PageTransition><PostDetail /></PageTransition>} />
        <Route path="/action/:itemId" element={<PageTransition><ActionDetail /></PageTransition>} />
        <Route path="/event/:eventId" element={<PageTransition><EventDetail /></PageTransition>} />
        <Route path="/messages/:convId" element={<PageTransition><ChatThread /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/gallery/:childId" element={<PageTransition><MediaGallery /></PageTransition>} />

        {/* Teacher Screens — desktop layout, no phone frame */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/post/new" element={<NewPost />} />
        <Route path="/teacher/student/:studentId" element={<StudentProfile />} />
        <Route path="/teacher/messages" element={<TeacherMessages />} />
        <Route path="/teacher/responses/:itemId" element={<ResponseDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

