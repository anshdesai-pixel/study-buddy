"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNoteAction } from "@/app/_actions/note.actions";
import { CreateNoteInput } from "@/common/types/request/note.types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Sparkles, RefreshCw, Loader2, ArrowDown, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { generateSuggestions } from "@/lib/gemini";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

const CreateNoteForm = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // AI suggestion states
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [noteContent, setNoteContent] = useState<string>("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [contentSummary, setContentSummary] = useState<string>("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] =
    useState<boolean>(false);
  const [showTitleSuggestions, setShowTitleSuggestions] =
    useState<boolean>(false);

  // Debounce timer for API calls
  const summaryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear summary timer on unmount
  useEffect(() => {
    return () => {
      if (summaryTimerRef.current) {
        clearTimeout(summaryTimerRef.current);
      }
    };
  }, []);

  // Count words in a string
  const countWords = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  // Generate title suggestions
  async function generateTitleSuggestions() {
    if (!noteTitle.trim()) {
      toast.error("Please enter a title first");
      return;
    }

    setIsGeneratingTitle(true);
    setShowTitleSuggestions(true);
    try {
      const basePrompt = `Based on the note title "${noteTitle}", generate 3 alternative concise note title suggestions. Each suggestion should be descriptive but concise. Directly give me the three alternative suggestions without saying here are 3 suggestions.`;

      const prompt = noteContent
        ? `${basePrompt}. Context from the note content: ${noteContent}. Make the suggestions different from but related to the original title.`
        : `${basePrompt}. Make the suggestions different from but related to the original title.`;

      const suggestions = await generateSuggestions(prompt);

      let parsedSuggestions = suggestions
        .split("\n")
        .map((s) =>
          s
            .replace(/^\d+\.\s*/, "")
            .replace(/^-\s*/, "")
            .trim()
        )
        .filter(Boolean)
        .filter((s) => s.toLowerCase() !== noteTitle.toLowerCase());

      // Ensure suggestions are unique
      parsedSuggestions = [...new Set(parsedSuggestions)];

      // Add fallbacks if needed
      while (parsedSuggestions.length < 3) {
        const fallbacks = [
          `${noteTitle} Summary`,
          `Notes on ${noteTitle}`,
          `${noteTitle} Thoughts`,
          `${noteTitle} Ideas`,
          `Key Points: ${noteTitle}`,
        ];

        for (const fallback of fallbacks) {
          if (
            !parsedSuggestions.includes(fallback) &&
            fallback.toLowerCase() !== noteTitle.toLowerCase() &&
            parsedSuggestions.length < 3
          ) {
            parsedSuggestions.push(fallback);
          }
        }
      }

      setTitleSuggestions(parsedSuggestions.slice(0, 3));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to generate title suggestions.");
      setTitleSuggestions([
        `${noteTitle} Summary`,
        `Notes on ${noteTitle}`,
        `${noteTitle} Thoughts`,
      ]);
    } finally {
      setIsGeneratingTitle(false);
    }
  }

  // Create content summary or organize with AI
  async function summarizeContent(content: string) {
    setNoteContent(content);

    // Don't summarize if content is too short
    if (countWords(content) < 10) {
      setContentSummary("");
      return;
    }

    // Clear previous timer if it exists
    if (summaryTimerRef.current) {
      clearTimeout(summaryTimerRef.current);
    }

    // Set a debounce timeout to avoid too many API calls
    summaryTimerRef.current = setTimeout(async () => {
      setIsGeneratingSummary(true);
      try {
        // For notes, we should offer to organize or enhance the content rather than just summarize
        const prompt = `Based on this note content: "${content}", provide an short, well-structured version with better organization, clearer wording, and proper formatting using markdown. Improve upon the original content while keeping the same key information. Make it more concise and easier to read.`;
        const enhancedContent = await generateSuggestions(prompt);
        setContentSummary(enhancedContent.trim());
      } catch (error) {
        console.error("Failed to enhance content:", error);
        setContentSummary("");
      } finally {
        setIsGeneratingSummary(false);
      }
    }, 1000); // 1000ms debounce for content enhancement
  }

  // Apply the enhanced content to the main content
  const applyContentEnhancement = () => {
    if (contentSummary) {
      setNoteContent(contentSummary);
      setContentSummary("");
      toast.success("Content enhanced");
    }
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const data: CreateNoteInput = {
      title: noteTitle,
      content: noteContent,
      userId: userId,
    };

    if (!data.title) {
      toast.error("Please provide a title for your note");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createNoteAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Note created successfully");
        (event.target as HTMLFormElement).reset();
        setIsOpen(false);
        setNoteTitle("");
        setNoteContent("");
        setTitleSuggestions([]);
        setContentSummary("");
        setShowTitleSuggestions(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsLoading(false);
      setNoteTitle("");
      setNoteContent("");
      setTitleSuggestions([]);
      setContentSummary("");
      setShowTitleSuggestions(false);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Create New Note
            <Tooltip>
              <TooltipTrigger asChild>
                <Sparkles className="ml-2 h-4 w-4 text-yellow-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>AI-powered suggestions available</p>
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center">
              Note Title
            </Label>
            <div className="flex gap-2">
              <Input
                id="title"
                name="title"
                placeholder="Note title"
                aria-label="Note title"
                maxLength={120}
                required
                disabled={isLoading}
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateTitleSuggestions}
                    disabled={isGeneratingTitle || !noteTitle.trim()}
                    className="shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 hover:opacity-90"
                  >
                    {isGeneratingTitle ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate title suggestions</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {showTitleSuggestions && (
              <div className="relative max-h-40 overflow-y-auto max-w-[520px]">
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-black text-white hover:text-white hover:bg-indigo-800"
                    onClick={() => setShowTitleSuggestions(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Card className="border bg-gradient-to-r from-indigo-50 to-purple-50 dark:bg-gradient-to-r dark:from-indigo-900 dark:to-purple-900">
                  <CardContent className="p-2">
                    <p className="text-sm font-medium mb-2 flex items-center">
                      <Sparkles className="h-3 w-3 mr-2 text-indigo-600" />
                      Title Suggestions
                    </p>

                    {isGeneratingTitle ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-5 w-5 text-indigo-600 animate-spin mr-2" />
                        <span className="text-sm text-indigo-600">
                          {`Creating titles based on "${noteTitle}"...`}
                        </span>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {titleSuggestions.map((title, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start text-left h-auto py-2 hover:bg-indigo-100 hover:text-indigo-900 hover:border-indigo-300 transition-all"
                            onClick={() => {
                              setNoteTitle(title);
                              setShowTitleSuggestions(false);
                            }}
                          >
                            {title}
                          </Button>
                        ))}
                      </div>
                    )}

                    {!isGeneratingTitle && titleSuggestions.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs w-full text-indigo-600 dark:text-white dark:hover:text-indigo-800 hover:text-indigo-800 hover:bg-indigo-100"
                        onClick={generateTitleSuggestions}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerate suggestions
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            <div>
              <Label htmlFor="description" className="flex items-center">
                Content
                {isGeneratingSummary && (
                  <Loader2 className="ml-2 h-3 w-3 animate-spin text-gray-400" />
                )}
              </Label>
              <Textarea
                name="content"
                placeholder="Note content"
                disabled={isLoading}
                aria-label="Note content"
                value={noteContent}
                onChange={(e) => summarizeContent(e.target.value)}
                className="min-h-[100px] max-h-[400px]"
              />
              {contentSummary && (
                <Card className="border bg-gradient-to-r from-indigo-50 to-purple-50 dark:bg-gradient-to-r dark:from-indigo-900 dark:to-purple-900 max-h-40 overflow-y-auto max-w-[520px]">
                  <CardContent className="p-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-white mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-blue-700 dark:text-white">
                            AI Summary
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-300 bg-blue-100"
                                onClick={applyContentEnhancement}
                              >
                                <ArrowDown className="h-3 w-3 mr-1" />
                                Apply
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Replace content with this summary</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-blue-900 dark:text-white">
                          {contentSummary}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                aria-label="Cancel"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                aria-label="Submit Button"
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create Note</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteForm;
