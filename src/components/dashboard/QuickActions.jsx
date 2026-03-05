import QuickActionCard from "./QuickActionCard";
import {
  UploadCloud,
  FolderPlus,
  Tag,
  ScanText,
  MessageSquare,
} from "lucide-react";

function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <QuickActionCard
        title="Upload Document"
        description="Add new files"
        icon={<UploadCloud className="w-4 h-4" />}
        color="indigo"
      />
      <QuickActionCard
        title="Create Folder"
        description="Organize files"
        icon={<FolderPlus className="w-4 h-4" />}
        color="emerald"
      />
      <QuickActionCard
        title="Add tags"
        description="Label documents"
        icon={<Tag className="w-4 h-4" />}
        color="sky"
      />
      <QuickActionCard
        title="OCR Extract"
        description="Extract text"
        icon={<ScanText className="w-4 h-4" />}
        color="amber"
      />
      <QuickActionCard
        title="Add Comment"
        description="Collaborate"
        icon={<MessageSquare className="w-4 h-4" />}
        color="rose"
      />
    </div>
  );
}

export default QuickActions;
