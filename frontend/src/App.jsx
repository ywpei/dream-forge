import { useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import StarField from "./components/StarField";
import HomePage from "./pages/HomePage";
import InterpretPage from "./pages/InterpretPage";
import CreatePage from "./pages/CreatePage";
import LibraryPage from "./pages/LibraryPage";
import DetailPage from "./pages/DetailPage";

/**
 * 页面过渡动画包装器。
 * 每个页面切换时带淡入淡出 + 上滑效果。
 */
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
}

/**
 * 应用根组件：星空背景 + 路由 + 页面过渡动画。
 */
export default function App() {
  const location = useLocation();

  return (
    <>
      {/* 全局星空背景 */}
      <StarField />

      {/* 页面内容 */}
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/interpret" element={<InterpretPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/detail/:id" element={<DetailPage />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>
    </>
  );
}