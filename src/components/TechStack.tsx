import { Code } from 'lucide-react';

interface TechStackProps {
  technologies: string[];
}

export const TechStack = ({ technologies }: TechStackProps) => {
  if (!technologies.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Code className="w-4 h-4 text-muted-foreground" />
      {technologies.map((tech) => (
        <span
          key={tech}
          className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border border-border"
        >
          {tech}
        </span>
      ))}
    </div>
  );
};
