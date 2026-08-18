"use client";

import { KLIO_MODELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Bot,
  Code2,
  GraduationCap,
  PenTool,
  Search,
  Eye,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Bot,
  Code2,
  GraduationCap,
  PenTool,
  Search,
  Eye,
};

interface ModelSelectorProps {
  selected: string;
  onSelect: (modelId: string) => void;
}

export function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {KLIO_MODELS.map((model) => {
        const Icon = iconMap[model.icon] || Bot;
        return (
          <button
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all shrink-0",
              selected === model.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{model.name}</span>
          </button>
        );
      })}
    </div>
  );
}
