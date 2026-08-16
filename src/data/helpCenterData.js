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
  // Documents
  {
    id: "upload-document",
    title: "How to Upload a Document",
    description: "Learn how to upload your first document to DocuSphere.",
    category: "Documents",
    duration: "45 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "search-filter-documents",
    title: "How to Search and Filter Documents",
    description: "Learn how to find specific documents using search filters.",
    category: "Documents",
    duration: "1 min 15 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "rename-organize-documents",
    title: "How to Rename and Organize Documents",
    description: "Keep your files organized in directories.",
    category: "Documents",
    duration: "50 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "recycle-bin",
    title: "How to Use the Recycle Bin",
    description: "Restore soft-deleted files or purge them permanently.",
    category: "Documents",
    duration: "1 min",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  // OCR & AI
  {
    id: "extract-text-ocr",
    title: "How to Extract Text with OCR",
    description: "Use Google Vision to perform optical character recognition.",
    category: "OCR & AI",
    duration: "1 min 30 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "generate-ai-summary",
    title: "How to Generate an AI Summary",
    description: "Get brief summaries and key points of files using Gemini.",
    category: "OCR & AI",
    duration: "1 min 20 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "ocr-processing-status",
    title: "How to Understand OCR Processing Status",
    description: "Learn about active, completed, or failed jobs.",
    category: "OCR & AI",
    duration: "45 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  // Collaboration
  {
    id: "create-team",
    title: "How to Create a Team",
    description: "Establish collaborative workspaces for shared files.",
    category: "Collaboration",
    duration: "1 min 10 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "invite-team-members",
    title: "How to Invite Team Members",
    description: "Add members to your workspace to collaborate.",
    category: "Collaboration",
    duration: "1 min 05 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "document-comments",
    title: "How to Use Document Comments",
    description: "Add notes and feedback on specific page areas.",
    category: "Collaboration",
    duration: "1 min 15 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "team-chat",
    title: "How to Use Team Chat",
    description: "Chat in real-time inside the shared workspace.",
    category: "Collaboration",
    duration: "1 min 45 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  // Sharing & Security
  {
    id: "share-document",
    title: "How to Share a Document",
    description: "Create public sharing links for your documents.",
    category: "Sharing & Security",
    duration: "1 min 10 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "set-share-permissions",
    title: "How to Set Share Permissions",
    description: "Control who can view, edit, or download files.",
    category: "Sharing & Security",
    duration: "1 min 15 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "set-share-expiration",
    title: "How to Set Share Expiration",
    description: "Revoke sharing links automatically at a specified date.",
    category: "Sharing & Security",
    duration: "55 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "password-protect",
    title: "How to Password-Protect a Document",
    description: "Require a password to access files or link details.",
    category: "Sharing & Security",
    duration: "1 min 30 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  // Version Control
  {
    id: "view-version-history",
    title: "How to View Version History",
    description: "Trace modifications and updates on files.",
    category: "Version Control",
    duration: "1 min",
    youtubeUrl: "",
    videoId: "",
    available: false
  },
  {
    id: "restore-older-version",
    title: "How to Restore an Older Version",
    description: "Roll back updates to a prior saved version.",
    category: "Version Control",
    duration: "1 min 25 sec",
    youtubeUrl: "",
    videoId: "",
    available: false
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
