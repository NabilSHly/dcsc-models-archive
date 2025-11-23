import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";

 interface ProtectedRouteProps {
   children: React.ReactNode;
 }

 const ProtectedRoute = ({ children }: ProtectedRouteProps) => {

  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return null;                    // optional: show a spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
 };

 export default ProtectedRoute;
