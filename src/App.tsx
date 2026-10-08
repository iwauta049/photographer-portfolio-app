import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import PhotoDetail from "./pages/PhotoDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminUpload from "./pages/AdminUpload";
import AdminBlog from "./pages/AdminBlog";
import AdminProfile from "./pages/AdminProfile";

export default function App() {
  useEffect(() => {
    function protectImage(event: MouseEvent | DragEvent) {
      if (event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }
    }

    document.addEventListener("contextmenu", protectImage);
    document.addEventListener("dragstart", protectImage);

    return () => {
      document.removeEventListener("contextmenu", protectImage);
      document.removeEventListener("dragstart", protectImage);
    };
  }, []);

  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/photo/:id" element={<PhotoDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Routes>
      <Footer />
    </HashRouter>
  );
}
