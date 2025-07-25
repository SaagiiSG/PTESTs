"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
        toast.success('Thumbnail uploaded!');
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
        toast.success("Course created!");
        setTitle("");
        setDescription("");
        setPrice(0);
        setThumbnailUrl("");
        setLessons([{ title: "", description: "", embedCode: "", video: "" }]);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create course.");
      }
    } catch {
      toast.error("Failed to create course.");
    }
    setLoading(false);
  };

  return (
    <Card className="space-y-6 p-6 rounded-2xl bg-muted shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Course Description</label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (e)</label>
          <Input
            type="number"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
          <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="Thumbnail preview" className="mt-2 w-32 h-20 object-cover rounded" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
          <Input
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Lessons</label>
          {lessons.map((lesson, idx) => (
            <Card key={idx} className="p-4 mb-4 flex flex-col gap-2 bg-background rounded-xl border border-muted-foreground/10">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Lesson {idx + 1}</span>
                {lessons.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeLesson(idx)}>
                    Remove
                  </Button>
                )}
              </div>
              <Input
                placeholder="Lesson Title"
                value={lesson.title}
                onChange={e => handleLessonChange(idx, "title", e.target.value)}
                required
              />
              <Textarea
                placeholder="Lesson Description"
                value={lesson.description}
                onChange={e => handleLessonChange(idx, "description", e.target.value)}
                required
              />
              <Textarea
                placeholder="<iframe>...</iframe> or script..."
                value={lesson.embedCode}
                onChange={e => handleLessonChange(idx, "embedCode", e.target.value)}
                required
                className="font-mono"
              />
              <Input
                placeholder="Video URL or embed code (optional)"
                value={lesson.video || ""}
                onChange={e => handleLessonChange(idx, "video", e.target.value)}
              />
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addLesson} className="mt-2 rounded-xl">
            + Add Lesson
          </Button>
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </Card>
  );
} 