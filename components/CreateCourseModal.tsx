"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Plus, Trash2, GraduationCap, DollarSign, Image as ImageIcon, X } from "lucide-react";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [lessons, setLessons] = useState([
    { title: "", description: "", embedCode: "", video: "", testEmbedCode: "", testId: "" },
  ]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLessonChange = (idx: number, field: string, value: string) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === idx ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const addLesson = () => {
    setLessons((prev) => [...prev, { title: "", description: "", embedCode: "", video: "", testEmbedCode: "", testId: "" }]);
  };

  const removeLesson = (idx: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.url);
        toast.success('Thumbnail uploaded successfully!');
      } else {
        toast.error('Failed to upload thumbnail.');
      }
    } catch {
      toast.error('Failed to upload thumbnail.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price, thumbnailUrl, lessons }),
      });
      if (res.ok) {
        toast.success("Course created successfully!");
        // Reset form
        setTitle("");
        setDescription("");
        setPrice(0);
        setThumbnailUrl("");
        setLessons([{ title: "", description: "", embedCode: "", video: "", testEmbedCode: "", testId: "" }]);
        setThumbnailPreview("");
        onSuccess?.();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create course.");
      }
    } catch {
      toast.error("Failed to create course.");
    }
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create New Course</h2>
              <p className="text-sm text-gray-600">Add a new course to your platform</p>
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
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <p className="text-sm text-gray-600">Course title, description, and pricing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Course Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter course title"
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Price (₮) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      min={0}
                      placeholder="0"
                      required
                      className="h-10 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Course Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what students will learn in this course..."
                  required
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Course Thumbnail</h3>
                  <p className="text-sm text-gray-600">Upload an image to represent your course</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnail" className="text-sm font-medium">Upload Image</Label>
                  <div className="relative">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="h-10"
                    />
                    <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl" className="text-sm font-medium">Or Enter URL</Label>
                  <Input
                    id="thumbnailUrl"
                    value={thumbnailUrl}
                    onChange={e => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                    className="h-10"
                  />
                </div>
              </div>

              {thumbnailPreview && (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-16 h-12 object-cover rounded border" 
                  />
                  <div>
                    <p className="text-sm font-medium">Thumbnail Preview</p>
                    <p className="text-xs text-gray-500">This is how your course will appear</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lessons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Course Lessons</h3>
                    <p className="text-sm text-gray-600">Add lessons to your course</p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addLesson}
                  className="flex items-center gap-2"
                >
                  <span className="flex flex-row items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </span>
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {lessons.map((lesson, idx) => (
                  <Card key={idx} className="py-6 border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-600">{idx + 1}</span>
                          </div>
                          <CardTitle className="text-sm">Lesson {idx + 1}</CardTitle>
                        </div>
                        {lessons.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeLesson(idx)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Lesson Title *</Label>
                        <Input
                          placeholder="Enter lesson title"
                          value={lesson.title}
                          onChange={e => handleLessonChange(idx, "title", e.target.value)}
                          required
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Lesson Description *</Label>
                        <Textarea
                          placeholder="Describe what this lesson covers..."
                          value={lesson.description}
                          onChange={e => handleLessonChange(idx, "description", e.target.value)}
                          required
                          rows={2}
                          className="resize-none text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Video Embed Code (Optional)</Label>
                        <Textarea
                          placeholder="<iframe>...</iframe> or video embed code..."
                          value={lesson.embedCode}
                          onChange={e => handleLessonChange(idx, "embedCode", e.target.value)}
                          className="font-mono text-xs resize-none"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Test Embed Code (Optional)</Label>
                        <Textarea
                          placeholder="<script>...</script> or test embed code..."
                          value={lesson.testEmbedCode}
                          onChange={e => handleLessonChange(idx, "testEmbedCode", e.target.value)}
                          className="font-mono text-xs resize-none"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Paste the embed code from your test platform (e.g., Google Forms, Typeform, etc.)
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Test ID (Optional)</Label>
                        <Input
                          placeholder="Enter test ID for reference"
                          value={lesson.testId || ""}
                          onChange={e => handleLessonChange(idx, "testId", e.target.value)}
                          className="h-8 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Optional: Add a test ID for easier management
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Video URL (Optional)</Label>
                        <Input
                          placeholder="https://youtube.com/..."
                          value={lesson.video || ""}
                          onChange={e => handleLessonChange(idx, "video", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

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
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Course
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