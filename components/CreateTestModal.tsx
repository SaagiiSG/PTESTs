"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Plus, BookOpen, DollarSign, Image as ImageIcon, Code, Languages, X } from "lucide-react";

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTestModal({ isOpen, onClose, onSuccess }: CreateTestModalProps) {
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
        toast.success("Test created successfully!");
        // Reset form
        setTitle("");
        setDescriptionMn("");
        setDescriptionEn("");
        setEmbedCode("");
        setPrice(0);
        setThumbnailUrl("");
        setUniqueCodes("");
        setThumbnailPreview("");
        onSuccess?.();
        onClose();
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
        toast.success('Thumbnail uploaded successfully!');
      } else {
        toast.error('Failed to upload thumbnail.');
      }
    } catch {
      toast.error('Failed to upload thumbnail.');
    }
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create New Test</h2>
              <p className="text-sm text-gray-600">Add a new test to your platform</p>
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <p className="text-sm text-gray-600">Test title, descriptions, and pricing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Test Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter test title"
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

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Languages className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold">Descriptions</h4>
                    <p className="text-sm text-gray-600">Provide descriptions in both languages</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionMn" className="text-sm font-medium">Description (Mongolian) *</Label>
                    <Textarea
                      id="descriptionMn"
                      value={descriptionMn}
                      onChange={e => setDescriptionMn(e.target.value)}
                      placeholder="Describe the test in Mongolian..."
                      required
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn" className="text-sm font-medium">Description (English) *</Label>
                    <Textarea
                      id="descriptionEn"
                      value={descriptionEn}
                      onChange={e => setDescriptionEn(e.target.value)}
                      placeholder="Describe the test in English..."
                      required
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Code className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Test Embed Code</h3>
                  <p className="text-sm text-gray-600">Add the embed code for your test</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedCode" className="text-sm font-medium">Embed Code *</Label>
                <Textarea
                  id="embedCode"
                  value={embedCode}
                  onChange={e => setEmbedCode(e.target.value)}
                  placeholder="<iframe>...</iframe> or script..."
                  required
                  className="font-mono text-sm resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500">Paste the complete embed code from your test platform</p>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Test Thumbnail</h3>
                  <p className="text-sm text-gray-600">Upload an image to represent your test</p>
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
                    <p className="text-xs text-gray-500">This is how your test will appear</p>
                  </div>
                </div>
              )}
            </div>

            {/* Unique Codes */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Code className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Access Codes</h3>
                  <p className="text-sm text-gray-600">Add unique codes for test access</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueCodes" className="text-sm font-medium">Unique Codes</Label>
                <Textarea
                  id="uniqueCodes"
                  value={uniqueCodes}
                  onChange={e => setUniqueCodes(e.target.value)}
                  placeholder="Enter unique codes, one per line or comma-separated"
                  className="font-mono text-sm resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Enter codes separated by commas or new lines</p>
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
                    Create Test
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