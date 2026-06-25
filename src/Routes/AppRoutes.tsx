import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../Pages/Login";


export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}