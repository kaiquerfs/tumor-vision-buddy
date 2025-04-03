
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Analise = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home since this is the same functionality
    navigate("/");
  }, [navigate]);
  
  return null;
};

export default Analise;
