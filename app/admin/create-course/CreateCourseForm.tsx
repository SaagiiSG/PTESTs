"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Plus, Trash2, GraduationCap, DollarSign, Image as ImageIcon } from "lucide-react";

export default function CreateCourseForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [lessons, setLessons] = useState([
    { title: "", description: "", embedCode: "", video: "" },
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
    setLessons((prev) => [...prev, { title: "", description: "", embedCode: "", video: "" }]);
  };

  const removeLesson = (idx: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('📁 File selected:', file.name, file.size, file.type);
    
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    
    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    try {
      console.log('📤 Uploading thumbnail...');
      const res = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Thumbnail uploaded:', data);
        setThumbnailUrl(data.url);
        toast.success('Thumbnail uploaded successfully!');
      } else {
        const error = await res.json();
        console.error('❌ Thumbnail upload failed:', error);
        toast.error('Failed to upload thumbnail.');
      }
    } catch (error) {
      console.error('❌ Thumbnail upload error:', error);
      toast.error('Failed to upload thumbnail.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Debug: Log the data being sent
    const courseData = { title, description, price, thumbnailUrl, lessons };
    console.log('🚀 Submitting course data:', courseData);
    
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log('✅ Course created successfully:', result);
        toast.success("Course created successfully!");
        setTitle("");
        setDescription("");
        setPrice(0);
        setThumbnailUrl("");
        setLessons([{ title: "", description: "", embedCode: "", video: "" }]);
      } else {
        const err = await res.json();
        console.error('❌ Course creation failed:', err);
        toast.error(err.error || "Failed to create course.");
      }
    } catch (error) {
      console.error('❌ Course creation error:', error);
      toast.error("Failed to create course.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-gray-600">Course title, description, and pricing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Course Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter course title"
              required
              className="h-11"
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
                className="h-11 pl-10"
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
            rows={4}
            className="resize-none"
          />
        </div>
      </div>

      {/* Thumbnail */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <ImageIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Course Thumbnail</h3>
            <p className="text-sm text-gray-600">Upload an image to represent your course</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="thumbnail" className="text-sm font-medium">Upload Image</Label>
            <div className="relative">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="h-11"
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
              className="h-11"
            />
          </div>
        </div>

        {thumbnailPreview && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              src={thumbnailPreview} 
              alt="Thumbnail preview" 
              className="w-20 h-16 object-cover rounded-lg border" 
            />
            <div>
              <p className="text-sm font-medium">Thumbnail Preview</p>
              <p className="text-xs text-gray-500">This is how your course will appear</p>
              {thumbnailUrl && (
                <p className="text-xs text-blue-600 mt-1">URL: {thumbnailUrl}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Debug info */}
        {thumbnailUrl && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Debug:</strong> Current thumbnailUrl: "{thumbnailUrl}"
            </p>
          </div>
        )}
      </div>

      {/* Lessons */}
      <div className="space-y-6">
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
            className="flex flex-row items-center gap-2"
          >
            <span className="flex flex-row items-center justify-center">
              <span> Add Lesson </span>
            </span>
          </Button>
        </div>

        <div className="space-y-4">
          {lessons.map((lesson, idx) => (
            <Card key={idx} className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">{idx + 1}</span>
                    </div>
                    <CardTitle className="text-base">Lesson {idx + 1}</CardTitle>
                  </div>
                  {lessons.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeLesson(idx)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Lesson Title *</Label>
                  <Input
                    placeholder="Enter lesson title"
                    value={lesson.title}
                    onChange={e => handleLessonChange(idx, "title", e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Lesson Description *</Label>
                  <Textarea
                    placeholder="Describe what this lesson covers..."
                    value={lesson.description}
                    onChange={e => handleLessonChange(idx, "description", e.target.value)}
                    required
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Embed Code *</Label>
                  <Textarea
                    placeholder="<iframe>...</iframe> or script..."
                    value={lesson.embedCode}
                    onChange={e => handleLessonChange(idx, "embedCode", e.target.value)}
                    required
                    className="font-mono text-sm resize-none"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Video URL (Optional)</Label>
                  <Input
                    placeholder="https://youtube.com/..."
                    value={lesson.video || ""}
                    onChange={e => handleLessonChange(idx, "video", e.target.value)}
                    className="h-10"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t">
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Course...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Course
            </div>
          )}
        </Button>
      </div>
    </form>
  );
} 