import { useNavigate } from "react-router-dom";
import DocumentUploadSection from "../components/upload/DocumentUploadSection";

export default function UploadPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-w-0 w-full max-w-[1100px] flex-1 flex-col gap-6 sm:gap-7">
     
 <DocumentUploadSection 
        variant="default" 
        title="Upload Files" 
        subtitle="Supported formats: PDF, DOC, XLS, PPT, PNG, JPG" 
            onUploadComplete={() => { 
              // If upload was initiated from a team, return to that team's detail page. 
              const teamId = localStorage.getItem("teamId"); 
              if (teamId) { 
                // cleanup and navigate back to team 
                localStorage.removeItem("teamId"); 
                navigate(`/team/${teamId}`); 
                return; 
              } 
 
              // Default: navigate to global My Documents page 
              navigate("/documents"); 
            }} 
      /> 
    </div> 
  ); 
}
