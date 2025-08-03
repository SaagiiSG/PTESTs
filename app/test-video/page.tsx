"use client";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export default function TestVideoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Test data
  const testVideos = {
    directUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", // Sample video URL
    youtubeEmbed: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
    vimeoEmbed: `<iframe src="https://player.vimeo.com/video/148751763?h=1f6f3c8c5c" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
    customEmbed: `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/824804225?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Sample Video"></iframe></div>`,
    sharePointEmbed: `<div style="max-width: 640px"><div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://psychometricsmongolia-my.sharepoint.com/personal/info_psychometrics_mn/_layouts/15/embed.aspx?UniqueId=e9a68380-b1a5-4726-a03c-c82b4a4f7139&embed=%7B%22af%22%3Atrue%2C%22ust%22%3Atrue%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" width="640" height="360" frameborder="0" scrolling="no" allowfullscreen title="EQ Эрх Олгох Сургалт II-20221101_094641-Meeting Recording.mp4" style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;"></iframe></div></div>`
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Video Testing Page</h1>
          <p className="text-gray-600">Test different video implementations to compare direct URLs vs embed codes</p>
        </div>

        <Tabs defaultValue="direct" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="direct">Direct URL</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Embed</TabsTrigger>
          <TabsTrigger value="vimeo">Vimeo Embed</TabsTrigger>
          <TabsTrigger value="custom">Custom Embed</TabsTrigger>
          <TabsTrigger value="sharepoint">SharePoint Embed</TabsTrigger>
        </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Direct Video URL</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">HTML5 Video Player</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Uses HTML5 video element with custom controls. Good for self-hosted videos or direct MP4 files.
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-auto"
                    onLoadedMetadata={handleVideoLoad}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={testVideos.directUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Custom Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlay}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                      
                      <div className="text-white text-sm min-w-[60px]">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => videoRef.current?.requestFullscreen()}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Pros:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full control over video player</li>
                    <li>• Custom controls and styling</li>
                    <li>• No external dependencies</li>
                    <li>• Better performance for self-hosted videos</li>
                  </ul>
                  <h4 className="font-semibold mb-2 mt-3">Cons:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Requires video hosting</li>
                    <li>• Bandwidth costs</li>
                    <li>• Limited format support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>YouTube Embed</span>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">YouTube Player</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Uses YouTube's embed code. Great for YouTube videos with built-in features.
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <div 
                    className="w-full aspect-video"
                    dangerouslySetInnerHTML={{ __html: testVideos.youtubeEmbed }} 
                  />
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Pros:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• No hosting required</li>
                    <li>• Built-in analytics</li>
                    <li>• Automatic quality selection</li>
                    <li>• Mobile optimization</li>
                  </ul>
                  <h4 className="font-semibold mb-2 mt-3">Cons:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• YouTube branding</li>
                    <li>• Limited customization</li>
                    <li>• Requires YouTube account</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vimeo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Vimeo Embed</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Vimeo Player</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Uses Vimeo's embed code. Professional video hosting with customization options.
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <div 
                    className="w-full aspect-video"
                    dangerouslySetInnerHTML={{ __html: testVideos.vimeoEmbed }} 
                  />
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Pros:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Professional appearance</li>
                    <li>• Customizable player</li>
                    <li>• Better privacy controls</li>
                    <li>• No ads (with paid plans)</li>
                  </ul>
                  <h4 className="font-semibold mb-2 mt-3">Cons:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Higher cost than YouTube</li>
                    <li>• Smaller audience reach</li>
                    <li>• Limited free features</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharepoint" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>SharePoint Embed</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">SharePoint Stream</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Uses SharePoint Stream embed code. Perfect for enterprise video hosting with security features.
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: testVideos.sharePointEmbed }} 
                  />
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Pros:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Enterprise-grade security</li>
                    <li>• Built-in access controls</li>
                    <li>• Responsive design</li>
                    <li>• SharePoint integration</li>
                    <li>• Professional appearance</li>
                  </ul>
                  <h4 className="font-semibold mb-2 mt-3">Cons:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Requires SharePoint license</li>
                    <li>• Limited to Microsoft ecosystem</li>
                    <li>• More complex setup</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Custom Embed</span>
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">Responsive Embed</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Custom responsive embed code with proper aspect ratio handling.
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: testVideos.customEmbed }} 
                  />
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Pros:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Fully customizable</li>
                    <li>• Responsive design</li>
                    <li>• Works with any video platform</li>
                    <li>• Professional appearance</li>
                  </ul>
                  <h4 className="font-semibold mb-2 mt-3">Cons:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Requires technical knowledge</li>
                    <li>• Need to handle responsive design</li>
                    <li>• Platform-specific limitations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-3">For Your Course Platform:</h3>
              <p className="text-gray-700 mb-4">
                Based on your current implementation, I recommend using <strong>embed codes</strong> because:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• ✅ Your system already supports both approaches</li>
                <li>• ✅ Embed codes work with any video platform (YouTube, Vimeo, etc.)</li>
                <li>• ✅ No hosting costs or bandwidth concerns</li>
                <li>• ✅ Professional video players with built-in features</li>
                <li>• ✅ Better mobile experience</li>
                <li>• ✅ Automatic quality selection and optimization</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Implementation:</strong> Your lesson page already handles embed codes perfectly with the `dangerouslySetInnerHTML` approach when the video field doesn't start with 'http'.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 