"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateTestForm() {
  const [title, setTitle] = useState("");
  const [descriptionMn, setDescriptionMn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uniqueCodes, setUniqueCodes] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: { mn: descriptionMn, en: descriptionEn },
          embedCode,
          price,
          thumbnailUrl,
          uniqueCodes: uniqueCodes
            .split(/\n|,/)
            .map(code => code.trim())
            .filter(code => code.length > 0),
        }),
      });
      if (res.ok) {
        toast.success("Test created!");
        setTitle("");
        setDescriptionMn("");
        setDescriptionEn("");
        setEmbedCode("");
        setPrice(0);
        setThumbnailUrl("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create test.");
      }
    } catch {
      toast.error("Failed to create test.");
    }
    setLoading(false);
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

  return (
    <Card className="space-y-6 p-6 rounded-2xl bg-muted shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (Mongolian)</label>
          <Textarea
            value={descriptionMn}
            onChange={e => setDescriptionMn(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (English)</label>
          <Textarea
            value={descriptionEn}
            onChange={e => setDescriptionEn(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Embed Code</label>
          <Textarea
            value={embedCode}
            onChange={e => setEmbedCode(e.target.value)}
            required
            className="font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (	e)</label>
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
          <label className="block text-sm font-medium mb-1">Unique Codes (one per line or comma-separated)</label>
          <Textarea
            value={uniqueCodes}
            onChange={e => setUniqueCodes(e.target.value)}
            placeholder="Enter unique codes, one per line or comma-separated"
            className="font-mono"
          />
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading ? "Creating..." : "Create Test"}
        </Button>
      </form>
    </Card>
  );
} 