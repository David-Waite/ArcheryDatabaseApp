import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ArcherPage from "./pages/ArcherPage.jsx";

function App() {
  return (
    <div>
      <main>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/archer/:id" element={<ArcherPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
