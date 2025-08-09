# SharePoint Video Integration Guide

## Overview
Your course platform supports SharePoint video embed codes perfectly! This guide shows you how to use SharePoint Stream videos in your courses.

## How It Works
The platform automatically detects SharePoint embed codes and renders them properly with responsive design.

## Getting SharePoint Embed Code

### Step 1: Upload Video to SharePoint
1. Go to your SharePoint site
2. Navigate to the document library where you want to store the video
3. Upload your video file (MP4, MOV, etc.)
4. SharePoint will automatically process the video

### Step 2: Get the Embed Code
1. Click on the uploaded video to open it
2. Click the **"..."** (three dots) menu
3. Select **"Embed"** or **"Share"**
4. Copy the provided embed code

### Step 3: Use in Course Platform
1. Go to your course admin panel
2. Create or edit a lesson
3. Paste the SharePoint embed code into the **"Video URL"** field
4. Save the lesson

## Example SharePoint Embed Code
```html
<div style="max-width: 640px">
  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
    <iframe 
      src="https://your-company.sharepoint.com/personal/username/_layouts/15/embed.aspx?UniqueId=video-id&embed=%7B%22af%22%3Atrue%2C%22ust%22%3Atrue%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" 
      width="640" 
      height="360" 
      frameborder="0" 
      scrolling="no" 
      allowfullscreen 
      title="Your Video Title" 
      style="border:none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; height: 100%; max-width: 100%;">
    </iframe>
  </div>
</div>
```

## Features
✅ **Responsive Design** - Automatically adapts to different screen sizes  
✅ **Fullscreen Support** - Users can watch in fullscreen mode  
✅ **Security** - SharePoint's built-in security and access controls  
✅ **Quality** - Automatic quality selection based on connection  
✅ **Analytics** - Track video views and engagement  

## Best Practices

### 1. Video Quality
- Upload high-quality videos (1080p recommended)
- Use MP4 format for best compatibility
- Keep file sizes reasonable (under 2GB for better upload times)

### 2. Access Control
- Set appropriate permissions in SharePoint
- Consider who needs access to the video
- Use SharePoint's sharing settings

### 3. Organization
- Create a dedicated folder for course videos
- Use descriptive file names
- Add proper titles and descriptions

### 4. Testing
- Always test the embed code before publishing
- Check on different devices and browsers
- Verify that the video plays correctly

## Troubleshooting

### Video Not Playing
- Check if the video is still available in SharePoint
- Verify that the embed code is complete
- Ensure the video has proper permissions

### Embed Code Issues
- Make sure you copied the entire embed code
- Check that the iframe src URL is valid
- Verify that the video is published and accessible

### Responsive Issues
- The platform automatically handles responsive design
- If you see layout issues, check the original embed code
- Ensure the video has proper aspect ratio settings

## Security Considerations
- SharePoint videos inherit SharePoint's security model
- Users need appropriate permissions to view videos
- Consider using private/unlisted videos for sensitive content
- Monitor video access through SharePoint analytics

## Support
If you encounter any issues:
1. Check this guide first
2. Verify your SharePoint permissions
3. Test with a simple video first
4. Contact your system administrator if needed

## Test Your Setup
Visit the test page to see SharePoint videos in action:
- **Test Page:** `/test-video`
- **Sample Course:** `/Course/688b982b95a9db5ee46123ee`

---

**Note:** This guide assumes you have proper SharePoint permissions and access to SharePoint Stream features. Contact your SharePoint administrator if you need help with permissions or setup. 