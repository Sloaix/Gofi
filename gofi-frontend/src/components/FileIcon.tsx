import React from 'react';
import { 
  Folder, 
  FileText, 
  Code, 
  Image, 
  Video, 
  Music, 
  File, 
  Archive,
  FileDown
} from 'lucide-react';

interface FileIconProps {
  iconType: string;
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ iconType, className = "w-6 h-6" }) => {
  const getIcon = () => {
    switch (iconType) {
      case 'folder':
        return <Folder className={className} />;
      case 'text':
        return <FileText className={className} />;
      case 'code':
        return <Code className={className} />;
      case 'image':
        return <Image className={className} />;
      case 'video':
        return <Video className={className} />;
      case 'audio':
        return <Music className={className} />;
      case 'pdf':
        return <FileDown className={className} />;
      case 'document':
        return <File className={className} />;
      case 'archive':
        return <Archive className={className} />;
      case 'file':
      default:
        return <File className={className} />;
    }
  };

  return getIcon();
};

export default FileIcon; 