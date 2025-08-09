"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Plus, BookOpen, DollarSign, Image as ImageIcon, Code, Languages, Star, Brain, Stethoscope, User } from "lucide-react";
import { processEmbedCode, analyzeEmbedCode } from "@/lib/embedCodeUtils";

export default function CreateTestForm() {
  const [title, setTitle] = useState("");
  const [descriptionMn, setDescriptionMn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [testType, setTestType] = useState<'Talent' | 'Aptitude' | 'Clinic' | 'Personality'>('Talent');
  const [embedCode, setEmbedCode] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uniqueCodes, setUniqueCodes] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [embedCodeAnalysis, setEmbedCodeAnalysis] = useState<any>(null);

  // Analyze embed code when it changes
  const handleEmbedCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEmbedCode(code);
    
    if (code.trim()) {
      const analysis = analyzeEmbedCode(code);
      setEmbedCodeAnalysis(analysis);
    } else {
      setEmbedCodeAnalysis(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Process the embed code before sending
      const processedEmbedCode = processEmbedCode(embedCode, true);
      
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: { mn: descriptionMn, en: descriptionEn },
          testType,
          embedCode: processedEmbedCode,
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
        setTitle("");
        setDescriptionMn("");
        setDescriptionEn("");
        setTestType('Talent');
        setEmbedCode("");
        setPrice(0);
        setThumbnailUrl("");
        setUniqueCodes("");
        setEmbedCodeAnalysis(null);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-gray-600">Test title, descriptions, and pricing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Test Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter test title"
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
          <Label htmlFor="testType" className="text-sm font-medium">Test Type *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setTestType('Talent')}
              className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                testType === 'Talent'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${testType === 'Talent' ? 'bg-blue-500' : 'bg-gray-100'}`}>
                <Star className={`w-5 h-5 ${testType === 'Talent' ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-sm font-medium">Talent</span>
              <span className="text-xs text-gray-500">Талант</span>
            </button>
            
            <button
              type="button"
              onClick={() => setTestType('Aptitude')}
              className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                testType === 'Aptitude'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${testType === 'Aptitude' ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                <Brain className={`w-5 h-5 ${testType === 'Aptitude' ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-sm font-medium">Aptitude</span>
              <span className="text-xs text-gray-500">Ур чадвар</span>
            </button>
            
            <button
              type="button"
              onClick={() => setTestType('Clinic')}
              className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                testType === 'Clinic'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${testType === 'Clinic' ? 'bg-purple-500' : 'bg-gray-100'}`}>
                <Stethoscope className={`w-5 h-5 ${testType === 'Clinic' ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-sm font-medium">Clinic</span>
              <span className="text-xs text-gray-500">Клиник</span>
            </button>
            
            <button
              type="button"
              onClick={() => setTestType('Personality')}
              className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                testType === 'Personality'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${testType === 'Personality' ? 'bg-orange-500' : 'bg-gray-100'}`}>
                <User className={`w-5 h-5 ${testType === 'Personality' ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-sm font-medium">Personality</span>
              <span className="text-xs text-gray-500">Төрх байдал</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-base font-semibold">Descriptions</h4>
              <p className="text-sm text-gray-600">Provide descriptions in both languages</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="descriptionMn" className="text-sm font-medium">Description (Mongolian) *</Label>
              <Textarea
                id="descriptionMn"
                value={descriptionMn}
                onChange={e => setDescriptionMn(e.target.value)}
                placeholder="Describe the test in Mongolian..."
                required
                rows={4}
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
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
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
            onChange={handleEmbedCodeChange}
            placeholder="<iframe>...</iframe> or script..."
            required
            className="font-mono text-sm resize-none"
            rows={6}
          />
          <p className="text-xs text-gray-500">Paste the complete embed code from your test platform</p>
        </div>

        {embedCodeAnalysis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-semibold mb-2 text-blue-800">Embed Code Analysis</h5>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <strong>Type:</strong> <span className="capitalize">{embedCodeAnalysis.type}</span>
              </p>
              <p className="text-gray-700">
                <strong>Needs Conversion:</strong> {embedCodeAnalysis.needsConversion ? 'Yes' : 'No'}
              </p>
              {embedCodeAnalysis.needsConversion && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-700">
                    <strong>✅ Will be converted to iframe format</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ImageIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Test Thumbnail</h3>
            <p className="text-sm text-gray-600">Upload an image to represent your test</p>
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
              <p className="text-xs text-gray-500">This is how your test will appear</p>
            </div>
          </div>
        )}
      </div>

      {/* Unique Codes */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
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
            rows={4}
          />
          <p className="text-xs text-gray-500">Enter codes separated by commas or new lines</p>
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
              Creating Test...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Test
            </div>
          )}
        </Button>
      </div>
    </form>
  );
} 