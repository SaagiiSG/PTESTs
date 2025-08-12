# Admin Courses Page Update

## Overview
The admin courses page has been completely transformed from a mock data display to a fully functional real data management system. The page now displays real courses from the database and allows full CRUD operations on both courses and lessons.

## Key Changes

### 1. Real Data Integration
- **Replaced mock data** with real API calls to `/api/courses`
- **Updated interfaces** to match the actual course model structure
- **Added loading states** and proper error handling

### 2. Lessons Instead of Tests
- **Changed from "Course Tests"** to "Course Lessons"
- **Updated statistics cards** to show lesson counts and durations
- **Removed test-specific fields** like questions, passing scores, etc.

### 3. Full CRUD Functionality

#### Course Management
- **Create Course**: Via CreateCourseModal (existing)
- **Edit Course**: Via new EditCourseModal
- **Delete Course**: With confirmation dialog
- **View Course Details**: Real-time display of course information

#### Lesson Management
- **Edit Lessons**: Via new EditLessonModal
- **Delete Lessons**: With confirmation dialog
- **Add Lessons**: Through course editing
- **Lesson Types**: Support for video, content, and test materials

### 4. New Components

#### EditCourseModal
- Full course editing interface
- Lesson management within courses
- Thumbnail upload support
- Form validation and error handling

#### EditLessonModal
- Individual lesson editing
- Support for video URLs, embed codes, and test materials
- Duration estimation
- Content preview functionality

### 5. Enhanced UI Features
- **Responsive design** with flexbox layouts
- **Loading states** and error messages
- **Confirmation dialogs** for destructive actions
- **Real-time updates** after operations
- **Search and filtering** capabilities
- **Sorting options** by various criteria

### 6. Course Status Management (NEW!)
- **Active/Inactive Status**: Courses can be activated or deactivated instead of deleted
- **Status Filtering**: Filter courses by active, inactive, or all statuses
- **Visual Indicators**: Inactive courses are visually distinguished with reduced opacity
- **Bulk Actions**: Select multiple courses and activate/deactivate them simultaneously
- **Keyboard Shortcuts**: Quick access to bulk actions with Ctrl+B
- **Status Persistence**: Deactivated courses retain all data and can be reactivated

## API Endpoints Used

### GET `/api/courses`
- Fetches all courses for display

### PATCH `/api/courses/[courseId]`
- Updates course details, lessons, and status

### DELETE `/api/courses/[courseId]`
- Deletes entire courses (use sparingly)

### POST `/api/upload-thumbnail`
- Handles course thumbnail uploads

## Data Model

### Course Interface
```typescript
interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  lessons: Lesson[];
  status: 'active' | 'inactive';  // NEW: Course status field
  createdAt: string;
  updatedAt: string;
}
```

### Lesson Interface
```typescript
interface Lesson {
  _id?: string;
  title: string;
  description: string;
  embedCode: string;
  video?: string;
  testEmbedCode?: string;
  estimatedDuration?: number;
}
```

## Usage Instructions

### Editing a Course
1. Click the "Edit" button on any course card
2. Modify course details in the modal
3. Add, edit, or remove lessons
4. Click "Update Course" to save changes

### Editing a Lesson
1. Click the edit icon on any lesson card
2. Modify lesson details in the modal
3. Add video URLs, embed codes, or test materials
4. Click "Update Lesson" to save changes

### Adding Lessons
1. Use the "Add Lesson" button in course editing
2. Or click "Add First Lesson" for empty courses

### Managing Course Status
1. **Individual Status Toggle**: Use the toggle switch on each course card
   - **Green switch = Active**: Course is visible to students
   - **Gray switch = Inactive**: Course is hidden from students
2. **Bulk Status Management**: 
   - Click "Bulk Actions" button or press Ctrl+B
   - Select courses using checkboxes
   - Use "Activate Selected" or "Deactivate Selected" buttons
3. **Status Filtering**: Use the status dropdown to filter by active/inactive courses

### Deleting Items
1. Click delete buttons for courses or lessons
2. Confirm the action in the dialog
3. Items are permanently removed

## Course Status System

### Active Courses
- **Visible to students** in course listings
- **Can be enrolled in** by students
- **Full functionality** available
- **Green switch** in the ON position
- **Green badge** with checkmark icon

### Inactive Courses
- **Hidden from students** in course listings
- **Cannot be enrolled in** by students
- **All data preserved** (lessons, progress, etc.)
- **Gray switch** in the OFF position
- **Gray badge** with X icon
- **Reduced visual prominence** (opacity and styling)

### Status Toggle Switch
- **Intuitive toggle**: Simple ON/OFF switch for each course
- **Immediate feedback**: Switch updates instantly with loading state
- **Loading state**: Shows spinner while updating
- **Confirmation**: Asks for confirmation before deactivating
- **Default state**: All courses default to 'active' status
- **Smart updates**: Only calls API when status actually changes

### Database Schema
- **Status field**: Added to Course model with enum ['active', 'inactive']
- **Default value**: New courses automatically get 'active' status
- **Existing courses**: Will be updated to have 'active' status by default
- **Validation**: Only accepts 'active' or 'inactive' values

### Benefits of Status System
- **Preserves student progress** when courses are temporarily unavailable
- **Maintains course data** for future reactivation
- **Better than deletion** for temporary course unavailability
- **Audit trail** of course status changes
- **Flexible course management** without data loss
- **Intuitive interface** with familiar toggle switches

## Bulk Actions

### Features
- **Multi-select**: Checkbox selection for multiple courses
- **Bulk Status Updates**: Activate/deactivate multiple courses at once
- **Visual Feedback**: Selected courses are highlighted with blue ring
- **Keyboard Shortcuts**: Ctrl+B to toggle bulk mode, Escape to exit
- **Confirmation Dialogs**: Prevents accidental bulk operations

### Usage
1. **Enter Bulk Mode**: Click "Bulk Actions" or press Ctrl+B
2. **Select Courses**: Use checkboxes to select courses
3. **Perform Actions**: Use bulk action buttons
4. **Exit Mode**: Click "Exit Bulk Mode" or press Escape

## Technical Implementation

### State Management
- Uses React hooks for local state
- Manages modal states and selected items
- Handles loading and error states
- Tracks bulk selection and action mode

### API Integration
- RESTful API calls with proper error handling
- Automatic refresh after successful operations
- Toast notifications for user feedback
- Status updates via PATCH endpoint

### Security
- Admin-only access control
- Proper authentication checks
- Input validation and sanitization
- Confirmation dialogs for destructive actions

### Performance
- Efficient bulk operations with Promise.all
- Optimistic UI updates
- Debounced search and filtering
- Lazy loading of course data

## Future Enhancements

### Potential Improvements
- **Bulk operations** for multiple courses/lessons
- **Drag and drop** lesson reordering
- **Rich text editor** for lesson descriptions
- **File upload** for lesson materials
- **Analytics dashboard** for course performance
- **Student progress tracking** integration
- **Course scheduling** and availability windows
- **Advanced status workflows** (draft, review, published, archived)

### Performance Optimizations
- **Pagination** for large course lists
- **Virtual scrolling** for many lessons
- **Caching** of course data
- **Optimistic updates** for better UX
- **Background sync** for bulk operations

## Troubleshooting

### Common Issues
1. **Courses not loading**: Check database connection and API endpoints
2. **Modal not opening**: Verify component imports and state management
3. **Updates not saving**: Check API permissions and validation
4. **Thumbnail uploads failing**: Verify upload endpoint configuration
5. **Status not updating**: Check course model and API endpoint

### Debug Information
- Check browser console for error messages
- Verify API responses in Network tab
- Confirm admin user permissions
- Check database connection status
- Verify course status field exists in database

## Migration Notes

### Database Changes
- **Add status field** to courses collection if not exists
- **Default value**: Set existing courses to 'active' status
- **Index optimization**: Add index on status field for better filtering performance

### API Updates
- **PATCH endpoint**: Now supports status updates
- **GET endpoint**: Returns status information
- **Validation**: Ensures status is 'active' or 'inactive'

### Frontend Updates
- **Status filtering**: New filter dropdown
- **Bulk actions**: New UI components
- **Visual indicators**: Status badges and styling
- **Keyboard shortcuts**: Enhanced user experience
