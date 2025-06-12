# DA1 MetaMetaData System Instructions

## Project Status
- **Current Version:** 1.a.1 (Pre-release)
- **Working File:** metadata-form-live-01.html (LIVE TESTING VERSION)
- **Status:** File operations fully implemented - ready for live metadata embedding tests
- **FFmpeg Generation:** Complete and working
- **File Operations:** All core file operations working with proper save functionality

## ✅ LATEST COMPLETED TASKS (December 9, 2025)
- ✅ **Fixed Save Functionality** - Save button now properly downloads files with updated filenames
- ✅ **Enhanced FileType Options** - Added 64-character custom text field for "Other" file types
- ✅ **Improved File Path Display** - Copy-pasteable path under filename with intelligent wrapping
- ✅ **Removed Save as Template** - Cleaned up right sidebar (Template option available in FileType dropdown)
- ✅ **Persistent File State** - Filename and path persist across page refreshes
- ✅ **DA1neverBlank New Files** - New documents load with educational metadata (never blank)

## ✅ CORE FUNCTIONALITY COMPLETE
- ✅ Complete 200+ field metadata form with DA1 File & System Properties
- ✅ FFmpeg command generation for MP3 metadata embedding
- ✅ XML import/export for .da1xml files  
- ✅ Auto-save functionality + proper manual save to disk
- ✅ Load File, Save, Save As, New File - all working correctly
- ✅ Header filename display working (shows actual loaded filename)
- ✅ Clean UX flow without intrusive dialogs
- ✅ Educational comments for coding students

## 🚧 PRIORITY TASKS FOR LIVE LAUNCH
1. **User Qualification Form** - Collect name, email, phone, bio before access
2. **Token System Implementation** - Payment flow and token verification
3. **Demo Limitations** - Preview mode with watermarked exports
4. **Payment Integration** - Stripe/PayPal for token purchases
5. **Audio Overlay System** - Dainis voice track for demo exports
6. **Production Deployment** - Domain setup and hosting configuration

## DA1neverBlank System - Core Philosophy

### Ecosystem Education Through Persistent Tagging
The DA1neverBlank system creates **persistently tagged files** by embedding comprehensive metadata that educates the entire digital ecosystem. When files contain DA1neverBlank data - including field descriptions, types, and lengths - they serve as educational tools that teach platforms, tools, and users about proper metadata handling.

### Key Principles:
1. **Never Blank Fields:** Every metadata field contains meaningful data or educational placeholders
2. **Ecosystem Education:** Each tagged file teaches the digital ecosystem about metadata standards
3. **Persistent Attribution:** Metadata survives platform transfers and format conversions
4. **Educational Embedding:** Field descriptions and types included in metadata educate tools and users

### File Operations Philosophy:
- **Auto-save + Manual Save:** Auto-save for security, manual save for user confidence and timestamp control
- **DA1neverBlank New Files:** New files load with complete DA1neverBlank educational data, not blank fields
- **Persistent Filename Display:** Users always know their current file and save location
- **Copy-Pasteable Paths:** Full file paths visible for user reference and workflow integration

## Core Functionality

## User Qualification Requirements

### Required User Information Fields:
1. **First Name** (required)
2. **Last Name** (required) 
3. **Email Address** (required)
4. **Phone Number** (required)
5. **Website/URL** (optional)
6. **Short Bio** (required - 500 chars max)

### Qualification Process:
1. User fills out metadata form
2. User provides qualification information
3. System generates preview with limited metadata
4. User receives sample MP3 with Dainis's audio track overlaid
5. User prompted to purchase DA1 tokens for full functionality

## DA1 Token System

### Token Pricing Structure:
- **Starting Price:** 10 DA1 tokens minimum purchase
- **Token Value:** [To be defined - suggest $1-5 per token]
- **Usage:** 1 token = 1 complete metadata embedding operation

### Preview/Demo Limitations:
- **Limited Metadata:** Show only core fields (title, artist, album)
- **Audio Overlay:** Add Dainis's voice explaining DA1 system
- **Watermark:** Include "DA1 Demo" metadata tags
- **Full Export:** Requires token purchase

### Purchase Flow:
1. User completes qualification
2. System shows preview with limited metadata
3. Prompt: "Purchase 10 DA1 tokens to unlock full metadata embedding"
4. Payment processing [integration needed]
5. Token balance management
6. Full feature unlock

## Technical Implementation Notes:
- User qualification form to be added to metadata-form.html
- Token verification system needed
- Payment integration required
- Demo audio overlay functionality
- Limited metadata export for previews

## Important: 
- Always maintain DA1 Version as "1.a.1" (system controlled)
- Educational comments help with code understanding
- Preserve all working FFmpeg functionality

---

## 📁 ARCHIVED COMPLETED WORK

### File Operations Implementation (Phases 1-3 Complete)
**Phase 1: Core File State Management** ✅
- Persistent filename display (survives page refresh)
- Copy-pasteable file path under "Current Filename" 
- File state restoration from localStorage
- Real-time path updates when files change

**Phase 2: Standardized File Operations** ✅
- **Load File:** Proper file picker with state updates
- **Save:** Auto-save + manual save with "All changes saved" message + actual file download
- **Save As:** Directory selection with file state updates  
- **New File:** "Current File Saved. Loading Blank Document..." → DA1neverBlank data

**Phase 3: FileType Improvements** ✅
- Dropdown: File, Template, **Other** (with 64-char custom text input)

### UI/UX Improvements Archive
- Removed "Save as Template" button from right sidebar (redundant with FileType dropdown)
- Fixed file path display with intelligent text wrapping
- Enhanced filename display persistence across all file operations
- Improved copy-to-clipboard functionality for file paths