# Sample Data Found in the Project

## Summary
The project contains several hardcoded sample data files that are used as fallbacks when the backend API fails or doesn't return data. These may be interfering with your image uploads or displaying incorrect data.

---

## Files with Sample Data

### 1. **sampledatas.tsx** (Root level)
- **Contains:** `sampleTestimonials`
- **Used by:** `components/Testimonial.tsx`
- **Purpose:** Fallback testimonials data
- **Impact:** When testimonials cannot be loaded from backend, shows hardcoded testimonials

### 2. **components/Gallery.tsx**
- **Contains:** `sampleImages` (15 placeholder images from picsum.photos)
- **Purpose:** Fallback gallery images
- **Impact:** ⚠️ **HIGH PRIORITY** - When gallery images fail to load from backend, it shows placeholder images instead
- **Code Location:** Lines 18-32

```tsx
const sampleImages: SchoolImage[] = [
    { id: '1', url: 'https://picsum.photos/800/600?random=19', caption: 'School Building' },
    { id: '2', url: 'https://picsum.photos/800/600?random=20', caption: 'Classroom' },
    // ... 13 more placeholder images
];
```

**Logic:**
- Tries to fetch from `school.gallery` 
- If fails or empty, falls back to `sampleImages`
- **This means you might not see your uploaded images if there's ANY error**

### 3. **pages/Staff.tsx**
- **Contains:** `sampleStaff` (4 staff members with randomuser.me photos)
- **Purpose:** Fallback staff/people data
- **Impact:** ⚠️ **HIGH PRIORITY** - When people/staff data fails to load, shows placeholder staff
- **Code Location:** Lines 14-45

```tsx
const sampleStaff: StaffMember[] = [
  {
    id: '1',
    name: 'John Doe',
    title: 'Principal',
    photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'John has over 20 years of experience...',
  },
  // ... 3 more sample staff
];
```

### 4. **services/school.ts**
- **Contains:** `sampleSchool` (Full school object)
- **Purpose:** Complete sample school data
- **Impact:** ⚠️ **IMPORTED** but not actively used in SchoolHome.tsx (dead import)
- **Action:** Can be safely removed

### 5. **components/Testimonial.tsx**
- **Contains:** Uses `sampleTestimonials` from sampledatas.tsx
- **Logic:** Fallback priority:
  1. Props `testimonials`
  2. Props `testimonial`
  3. Fetch by `schoolId`
  4. **Fallback to sampleTestimonials**

---

## 🔴 Critical Issues

### Issue #1: Gallery Always Shows Sample Data on Error
**File:** `components/Gallery.tsx`

The gallery component silently falls back to sample images if:
- API request fails
- Backend returns empty array
- Any network error occurs

**This means:**
- Your uploaded images might be saved to Cloudinary
- But the frontend shows placeholder images instead
- **No error is visible to the user**

### Issue #2: Staff/People Shows Sample Data on Error
**File:** `pages/Staff.tsx`

Similar issue - falls back to sample staff if API fails.

---

## 🎯 Recommended Actions

### Option 1: Remove Sample Data (Production-Ready)
Remove all sample data fallbacks so you can see real errors:

```bash
# Remove unused sample school
rm services/school.ts

# Remove sample testimonials
rm sampledatas.tsx
```

Then update components to NOT use fallbacks.

### Option 2: Add Error Visibility (Debug Mode)
Keep sample data but show clear errors when using fallbacks:

```tsx
// In Gallery.tsx
.catch(err => {
  console.error('Error fetching gallery:', err);
  alert('⚠️ Using sample images - API failed: ' + err.message); // ADD THIS
  if (mounted) setImages(sampleImages);
});
```

### Option 3: Disable Fallbacks Temporarily
Comment out the fallback lines to force errors to surface:

```tsx
// Gallery.tsx line ~57
// else setImages(sampleImages);  // COMMENT THIS OUT
else setImages([]); // USE THIS INSTEAD
```

---

## 🧪 How This Affects Your Image Upload Issue

**Most Likely Scenario:**
1. You upload an image successfully to Cloudinary ✅
2. Image is saved to database ✅
3. Frontend tries to fetch the gallery/people data
4. **Something fails** (CORS, auth, wrong endpoint, etc.) ❌
5. Frontend silently shows sample data instead 🤦
6. You see placeholder images, not your uploaded ones
7. You think the upload failed, but it actually succeeded!

**To Test This Theory:**
1. Check your Cloudinary dashboard - are images there?
2. Check your database directly - are gallery/people records saved?
3. If yes to both, then the issue is the FETCH, not the UPLOAD

---

## 📝 Next Steps

1. **Check if uploads are actually working:**
   ```bash
   # Check Cloudinary uploads
   curl -sS http://localhost:4000/__debug/test-upload
   ```

2. **Check if the problem is the FETCH:**
   ```bash
   # Try fetching gallery
   curl -sS http://localhost:4000/api/schools/1/gallery
   
   # Try fetching people
   curl -sS http://localhost:4000/api/schools/1/people
   ```

3. **Temporarily disable fallbacks** to see real errors

4. **Watch network tab** in browser DevTools to see actual API responses

---

## Files to Modify

1. `components/Gallery.tsx` - Line 57: Remove sample fallback
2. `pages/Staff.tsx` - Line 76: Remove sample fallback  
3. `components/Testimonial.tsx` - Line 59: Remove sample fallback
4. `services/school.ts` - Can delete (unused)
5. `sampledatas.tsx` - Can delete if testimonials removed
