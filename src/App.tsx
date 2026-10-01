import { HashRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Gallery from "./pages/Gallery";
import PhotoDetail from "./pages/PhotoDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminUpload from "./pages/AdminUpload";
import AdminBlog from "./pages/AdminBlog";

export default function App() {
  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/photo/:id" element={<PhotoDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/upload" element={<AdminUpload />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
      </Routes>
    </HashRouter>
  );
}
