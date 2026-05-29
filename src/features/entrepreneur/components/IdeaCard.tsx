"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Clock, MoreHorizontal, Pencil, Archive, ExternalLink, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type IdeaStatus = string;

export interface IdeaCardProps {
  id: string;
  title: string;
  date: string;
  status: IdeaStatus;
  description: string;
  skills?: string[];
  domain?: string | null;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  pipelineComplete?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const STATUS_MAP: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  DRAFT:     { label: "Draft",     className: "bg-amber-500 text-white border-transparent hover:bg-amber-500",  Icon: Clock  },
  VALIDATED: { label: "Validated", className: "bg-green-600 text-white border-transparent hover:bg-green-600",  Icon: Check  },
  CONVERTED: { label: "Converted", className: "bg-blue-600 text-white border-transparent hover:bg-blue-600",   Icon: Check  },
};
const DEFAULT_STATUS = { label: "Draft", className: "bg-amber-500 text-white border-transparent hover:bg-amber-500", Icon: Clock };

export function IdeaCard({
  id,
  title,
  date,
  status,
  skills,
  domain,
  pipelineComplete = false,
  isFavorited = false,
  onToggleFavorite,
  onEdit,
  onDelete,
  isSelectable = false,
  isSelected = false,
  onSelect,
}: IdeaCardProps) {
  const { label, className: badgeClassName, Icon } = STATUS_MAP[status] ?? DEFAULT_STATUS;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  return (
    <Card
      size="sm"
      onClick={isSelectable ? onSelect : undefined}
      className={cn(
        "transition-all",
        isSelectable ? "cursor-pointer select-none" : "hover:shadow-md",
        isSelected ? "ring-2 ring-cyan-500/25 border-cyan-500 dark:border-cyan-500" : ""
      )}
    >
      <CardHeader>
        <CardTitle className="font-semibold leading-6">
          {isSelectable ? (
            <span className="truncate block">{title}</span>
          ) : (
            <Link
              href={`/entrepreneur/ideas/${id}`}
              className="truncate block hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {title}
            </Link>
          )}
        </CardTitle>
        <CardDescription>{date}</CardDescription>
        <CardAction className="flex items-center gap-0.5">
          {isSelectable ? (
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected ? "bg-cyan-500 border-cyan-500" : "border-neutral-300 dark:border-neutral-600"
              )}
            >
              {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={isFavorited ? "Remove from favourites" : "Add to favourites"}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
                  >
                    <Heart
                      className={cn(
                        "size-3.5 transition-colors",
                        isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorited ? "Remove from favourites" : "Add to favourites"}
                </TooltipContent>
              </Tooltip>

              <div className="relative" ref={menuRef}>
                <Tooltip open={!menuOpen ? undefined : false}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="More options"
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>

                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 w-44 bg-popover border border-border rounded-xl shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start gap-2.5 px-3 rounded-none font-normal"
                    >
                      <Link href={`/entrepreneur/ideas/${id}`} onClick={() => setMenuOpen(false)}>
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                        View idea
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setMenuOpen(false); onEdit?.(); }}
                      className="w-full justify-start gap-2.5 px-3 rounded-none font-normal"
                    >
                      <Pencil className="size-3.5 text-muted-foreground" />
                      Edit idea
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setMenuOpen(false); onToggleFavorite?.(); }}
                      className="w-full justify-start gap-2.5 px-3 rounded-none font-normal"
                    >
                      <Heart className={cn("size-3.5", isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                      {isFavorited ? "Remove from favourites" : "Add to favourites"}
                    </Button>
                    <Separator className="my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setMenuOpen(false); onDelete?.(); }}
                      className="w-full justify-start gap-2.5 px-3 rounded-none font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Archive className="size-3.5" />
                      Archive idea
                    </Button>
                  </div>
                )}
              </div>
            </TooltipProvider>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 pt-0">
        {/* Status badge + domain tag + pipeline badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn("gap-1", badgeClassName)}>
            <Icon className="size-2.5" />
            {label}
          </Badge>
          {domain && (
            <Badge
              variant="outline"
              className="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
            >
              {domain}
            </Badge>
          )}
          {pipelineComplete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 gap-1 cursor-default"
                  >
                    <Sparkles className="size-2.5" />
                    Full analysis
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  All business pipeline sections are complete for this idea.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="rounded-full font-normal">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="rounded-full font-normal text-muted-foreground">
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
