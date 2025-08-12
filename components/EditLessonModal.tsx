"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Save, X, GraduationCap, Video, Target, FileText, Clock } from "lucide-react";

interface Lesson {
  _id?: string;
  title: string;
  description: string;
  embedCode: string;
  video?: string;
  testEmbedCode?: string;
  estimatedDuration?: number;
}

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedLesson: Lesson) => void;
  lesson: Lesson | null;
  lessonIndex: number;
  courseId: string;
}

export default function EditLessonModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  lesson, 
  lessonIndex,
  courseId 
}: EditLessonModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [video, setVideo] = useState("");
  const [testEmbedCode, setTestEmbedCode] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Initialize form with lesson data when modal opens
  useEffect(() => {
    if (lesson && isOpen) {
      setTitle(lesson.title);
      setDescription(lesson.description);
      setEmbedCode(lesson.embedCode || "");
      setVideo(lesson.video || "");
      setTestEmbedCode(lesson.testEmbedCode || "");
      setEstimatedDuration(lesson.estimatedDuration || 0);
    }
  }, [lesson, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;
    
    setLoading(true);
    try {
      // Update the lesson in the course
      const updatedLesson: Lesson = {
        ...lesson,
        title,
        description,
        embedCode,
        video,
        testEmbedCode,
        estimatedDuration
      };

      // Update the course with the modified lesson
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessons: [updatedLesson] // This will replace the lesson at the specific index
        }),
      });

      if (res.ok) {
        toast.success("Lesson updated successfully!");
        onSuccess?.(updatedLesson);
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update lesson.");
      }
    } catch {
      toast.error("Failed to update lesson.");
    }
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Edit Lesson {lessonIndex + 1}</h2>
              <p className="text-sm text-gray-600">Update lesson details and content</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Lesson Information</h3>
                  <p className="text-sm text-gray-600">Title, description, and duration</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Lesson Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter lesson title"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Lesson Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what this lesson covers..."
                  required
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration" className="text-sm font-medium">Estimated Duration (minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="estimatedDuration"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={estimatedDuration}
                    onChange={e => setEstimatedDuration(Number(e.target.value))}
                    className="h-10 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Lesson Content</h3>
                  <p className="text-sm text-gray-600">Add content, video, or test materials</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedCode" className="text-sm font-medium">Content Embed Code (Optional)</Label>
                <Textarea
                  id="embedCode"
                  placeholder="<iframe>...</iframe> or content embed code..."
                  value={embedCode}
                  onChange={e => setEmbedCode(e.target.value)}
                  className="font-mono text-xs resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste embed code for interactive content, presentations, or other materials
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video" className="text-sm font-medium">Video URL (Optional)</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="video"
                    placeholder="https://youtube.com/... or other video platform URL"
                    value={video}
                    onChange={e => setVideo(e.target.value)}
                    className="h-10 pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add a video URL from YouTube, Vimeo, or other video platforms
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testEmbedCode" className="text-sm font-medium">Test Embed Code (Optional)</Label>
                <Textarea
                  id="testEmbedCode"
                  placeholder="<script>...</script> or test embed code..."
                  value={testEmbedCode}
                  onChange={e => setTestEmbedCode(e.target.value)}
                  className="font-mono text-xs resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the embed code from your test platform (e.g., Google Forms, Typeform, etc.)
                </p>
              </div>
            </div>

            {/* Preview */}
            {(embedCode || video || testEmbedCode) && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Content Preview</h3>
                    <p className="text-sm text-gray-600">Preview of your lesson content</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {video && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Video Content</span>
                      </div>
                      <p className="text-xs text-gray-600">{video}</p>
                    </div>
                  )}

                  {embedCode && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Embedded Content</span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono break-all">
                        {embedCode.length > 100 ? `${embedCode.substring(0, 100)}...` : embedCode}
                      </p>
                    </div>
                  )}

                  {testEmbedCode && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Test Content</span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono break-all">
                        {testEmbedCode.length > 100 ? `${testEmbedCode.substring(0, 100)}...` : testEmbedCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Update Lesson
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
