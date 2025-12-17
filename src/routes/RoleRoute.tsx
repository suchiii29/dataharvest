import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  role: "admin" | "farmer";
  children: JSX.Element;
}

const RoleRoute = ({ role, children }: Props) => {
  const { role: userRole, loading } = useAuth();

  if (loading) return null;

  if (userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
