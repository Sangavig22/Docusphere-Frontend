import { useMemo, useState } from "react";

const mockDocuments = [
  { id: 1, name: "Q4_Report_2024.pdf", uploaded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), starred: true },
  { id: 2, name: "Q3_Report_2024.pdf", uploaded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), starred: false },
  { id: 3, name: "Budget_2024.xlsx", uploaded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), starred: true },
  { id: 4, name: "Presentation_2024.pptx", uploaded: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), starred: false },
  { id: 5, name: "Meeting_Notes.docx", uploaded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), starred: true },
  { id: 6, name: "Project_Plan.pdf", uploaded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), starred: false },
  { id: 7, name: "Design_Assets.zip", uploaded: new Date(Date.now() - 45 * 60 * 60 * 1000), starred: true },
];

// Custom hook to manage dashboard data
export function useDashboardData() {
  const [documents] = useState(mockDocuments);
  const [referenceNow] = useState(() => Date.now());

  // Calculate counts dynamically
  const counts = useMemo(() => {
    const sevenDaysAgoMs = referenceNow - 7 * 24 * 60 * 60 * 1000;

    return {
      total: documents.length,
      recent: documents.filter((doc) => doc.uploaded?.getTime?.() >= sevenDaysAgoMs).length,
      starred: documents.filter(doc => doc.starred).length,
      uploads: documents.length,
    };
  }, [documents, referenceNow]);

  return {
    documents,
    counts,
  };
}
