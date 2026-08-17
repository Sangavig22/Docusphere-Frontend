export const FAQ_DATA = [
  {
    category: "Account",
    items: [
      {
        question: "How do I verify my account email if I missed the verification link?",
        answer: "You can request a new verification link from the login page using the Resend Verification Email option. Also check your spam or junk folder."
      },
      {
        question: "Can I sign in using Google or GitHub?",
        answer: "Yes. DocuSphere supports Google and GitHub OAuth2 sign-in."
      }
    ]
  },
  {
    category: "Documents & Uploads",
    items: [
      {
        question: "What is the maximum file size?",
        answer: "The maximum document upload size is 50 MB."
      },
      {
        question: "How long do deleted documents remain in the Recycle Bin?",
        answer: "Deleted documents are moved to the Recycle Bin. The system permanently purges soft-deleted documents daily at 2:00 AM. Restore them before the cleanup occurs."
      }
    ]
  },
  {
    category: "Sharing & Security",
    items: [
      {
        question: "Can I share a document without allowing downloads?",
        answer: "Yes. When creating a share link, you can disable download permission."
      },
      {
        question: "Can I set an expiration date for a share link?",
        answer: "Yes. Share links can have an expiration date and time. After expiration, access is revoked."
      },
      {
        question: "What happens if I forget the password of a protected document?",
        answer: "Document owners can use the document security settings to reset the protection password. Shared-link visitors cannot reset the document password."
      }
    ]
  },
  {
    category: "Version Control",
    items: [
      {
        question: "How do I restore a previous version?",
        answer: "Open the document preview, go to Version History, select the required version, and choose Restore."
      }
    ]
  },
  {
    category: "OCR & AI Summarization",
    items: [
      {
        question: "Why does my document show 'AI summarization unavailable'?",
        answer: "OCR text extraction may complete successfully while AI summarization is unavailable. This can occur when the Gemini AI service cannot process the request because of configuration, quota, or service availability issues. Please contact the administrator if the problem continues."
      }
    ]
  }
];

export const TUTORIAL_VIDEOS = [
  // Documents Category
  {
    id: "upload-document",
    title: "How to Upload Documents",
    description: "Upload PDF, Word, or image files easily into your DocuSphere workspace.",
    category: "Documents",
    duration: "1:02",
    youtubeUrl: "https://youtu.be/D2fd7vrNdCE?si=nB5nSdGlgywMlA4U",
    videoId: "D2fd7vrNdCE",
    available: true
  },
  {
    id: "manage-documents",
    title: "How to Manage Documents",
    description: "Organize your files, create directories, and navigate the document dashboard.",
    category: "Documents",
    duration: "2:12",
    youtubeUrl: "https://youtu.be/M2N2eeWm1wE?si=5dLHsJBgEWcc6pPl",
    videoId: "M2N2eeWm1wE",
    available: true
  },
  {
    id: "document-actions",
    title: "How to Use Document Actions",
    description: "Perform bulk operations, download, rename, star, or delete files.",
    category: "Documents",
    duration: "2:30",
    youtubeUrl: "https://youtu.be/ssQD3ShDI0c?si=2cf9vXQMFfenVw45",
    videoId: "ssQD3ShDI0c",
    available: true
  },

  // OCR & AI Category
  {
    id: "ocr-summary",
    title: "How to Use OCR and AI Summary",
    description: "Extract text from scanned documents and images, and generate concise summaries using Gemini AI.",
    category: "OCR & AI",
    duration: "1:34",
    youtubeUrl: "https://youtu.be/sF4RPxbnSV4?si=oXiiKGExPCOkBb3j",
    videoId: "sF4RPxbnSV4",
    available: true
  },

  // Collaboration Category
  {
    id: "create-team",
    title: "How to Create a Team",
    description: "Set up collaborative team workspaces and invite members to share resources.",
    category: "Collaboration",
    duration: "1:18",
    youtubeUrl: "https://youtu.be/zhIjTBPeFFU?si=iOnZa2dGwoYqeoq0",
    videoId: "zhIjTBPeFFU",
    available: true
  },
  {
    id: "invite-team-members",
    title: "How to Invite Team Members",
    description: "Invite members to your team, assign roles, and collaborate together on shared documents.",
    category: "Collaboration",
    duration: "1:05",
    youtubeUrl: "https://youtu.be/Rt4OrIFGCyM?si=_aU_i0pn9wqPkZkr",
    videoId: "Rt4OrIFGCyM",
    available: true
  },
  {
    id: "team-chat",
    title: "How to Use Team Chat",
    description: "Chat with team members in real-time to discuss documents and coordinate work.",
    category: "Collaboration",
    duration: "1:45",
    youtubeUrl: "https://youtu.be/TbxC5QdwfYw?si=jIG-JinGO55uZufP",
    videoId: "TbxC5QdwfYw",
    available: true
  },

  // Sharing & Security Category
  {
    id: "share-revoke-permission",
    title: "How to Share Documents and Revoke Permissions",
    description: "Generate sharing links, configure viewing/editing permissions, and revoke access instantly.",
    category: "Sharing & Security",
    duration: "2:05",
    youtubeUrl: "https://youtu.be/NRfjHbIhepw?si=3kxLr753Y6NuzvWf",
    videoId: "NRfjHbIhepw",
    available: true
  },

  // Version Control Category
  {
    id: "version-history-restore",
    title: "How to View Version History and Restore Versions",
    description: "Track document changes, compare history, and roll back to previous versions when needed.",
    category: "Version Control",
    duration: "1:52",
    youtubeUrl: "https://youtu.be/8K1_nItSR_M?si=8AsE6W-o0pxRKWm8",
    videoId: "8K1_nItSR_M",
    available: true
  },

  // Online Editors Category
  {
    id: "editor-docs",
    title: "How to Use Online Editor for Docx Files",
    description: "Create, view, and edit text documents directly inside your browser with the online editor.",
    category: "Online Editors",
    duration: "2:08",
    youtubeUrl: "https://youtu.be/xDJtyDfMsf0?si=hqSdwOh1s5kshwQ7",
    videoId: "xDJtyDfMsf0",
    available: true
  },
  {
    id: "editor-presentation",
    title: "How to Use Online Editor for Presentations",
    description: "Design presentation slides and customize layouts using the integrated presentation editor.",
    category: "Online Editors",
    duration: "2:22",
    youtubeUrl: "https://youtu.be/UNC7lDeXlLA?si=Dv4lk8cr8YSizqX5",
    videoId: "UNC7lDeXlLA",
    available: true
  },
  {
    id: "editor-excel",
    title: "How to Use Online Editor for Spreadsheets",
    description: "Edit Excel and sheet files online, create tables, and perform formula calculations.",
    category: "Online Editors",
    duration: "2:14",
    youtubeUrl: "https://youtu.be/UsHDXNUTlF0?si=M3gpZFnE_GRNZhhk",
    videoId: "UsHDXNUTlF0",
    available: true
  }
];

export const STEP_GUIDES = [
  {
    title: "How to Upload a Document",
    category: "Documents & Uploads",
    description: "Upload local files safely into your DocuSphere workspace.",
    time: "2 min",
    steps: [
      "Open the Documents page from the sidebar menu.",
      "Click the Upload button on the top right.",
      "Select a document from your computer (PDF, Word, or image up to 50 MB).",
      "Wait for file processing to complete.",
      "Open the file to view, download, or run analysis."
    ]
  },
  {
    title: "How to Share a Document",
    category: "Collaboration & Sharing",
    description: "Create shared links with dynamic permission configurations.",
    time: "3 min",
    steps: [
      "Open the document preview or click Actions next to the file.",
      "Select Share Document option.",
      "Configure Permissions (allow or block downloads, set read/write permissions).",
      "Set Expiration Date and Time (optional) to revoke link automatically.",
      "Copy and share the link with visitors."
    ]
  },
  {
    title: "How to Extract Text with OCR",
    category: "OCR & AI Summarization",
    description: "Perform OCR text extraction using Google Vision.",
    time: "3 min",
    steps: [
      "Open the OCR page from the sidebar menu.",
      "Select the uploaded document.",
      "Choose OCR analysis and wait for text extraction to finish.",
      "View or download the extracted plain text."
    ]
  }
];
