# Comprehensive Guide to Configuring Supabase Storage

This guide provides a concise yet detailed walkthrough for setting up and managing Supabase Storage, including creating buckets, defining access policies, and configuring MIME types.

---

## 1. Prerequisites

Before you begin, ensure you have:

- A Supabase account and an active project.
- Basic familiarity with the Supabase Dashboard.
- The supabase-js library installed in your project if you plan to interact with storage via code.

---

## 2. Creating a Storage Bucket

A bucket is a container for your files, similar to a folder.

### Steps to Create a Bucket:

1. *Navigate to Storage:* In your Supabase project dashboard, click the *Storage* icon in the left sidebar.
2. *New Bucket:* Click the *"New Bucket"* or *"Create a new bucket"* button.
3. *Configure the Bucket:*
   - *Bucket Name:* Provide a unique, descriptive name for your bucket (e.g., avatars, public_assets, documents).
   - *Public Access:*
     - ✅ *Checked (Public Bucket):* Anyone with the URL can access the files in this bucket without needing a special token. Ideal for public images, CSS, etc.
     - ❌ *Unchecked (Private Bucket):* Access is restricted by Storage Policies (Row Level Security). This is the default and recommended option for user-specific or sensitive files.
4. *Submit:* Click *"Create bucket"*.

---

## 3. Configuring Bucket Access with Policies

Policies are powerful SQL rules that control who can do what with your files (SELECT, INSERT, UPDATE, DELETE). They are the security core of Supabase Storage.

### How to Add Policies:

1. Navigate to the *Storage* section in your dashboard.
2. Click the overflow menu (three dots) on your desired bucket and select *"Policies"*.
3. You will be taken to the SQL Editor with templates to help you create policies.

### Common Policy Examples:

#### Example 1: Allow Public Read-Only Access

sql
-- Policy: Allow public read access to the 'assets' bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'assets' );


#### Example 2: Allow Authenticated Users to Upload

sql
-- Policy: Allow authenticated uploads to the 'documents' bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'documents' );


#### Example 3: Users Can Manage Their Own Files

Allow users to view their own files:

sql
-- Policy: Allow read access to own files in 'avatars' bucket
CREATE POLICY "Read Own Avatars"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );


Allow users to upload, update, or delete their own files:

sql
-- Policy: Allow full control over own files in 'avatars' bucket
CREATE POLICY "Manage Own Avatars"
ON storage.objects FOR ALL -- Covers INSERT, UPDATE, DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );


> *Note:* (storage.foldername(name))[1] extracts the first folder name from the file path, which we structure to be the user's ID.

---

## 4. Configuring MIME Types and File Sizes

You can restrict which types and sizes of files are allowed in a bucket for security and consistency.

### Steps to Configure:

1. In the *Storage* section, click on the bucket you want to configure.
2. Select the *"Settings"* tab.

### Allowed MIME Types:

Enter the allowed MIME types, one per line.

- You can use wildcards. For example, image/* allows any image type (image/png, image/jpeg, etc.).
- Leave it empty to allow all MIME types (less secure).

### File Size Limit:

Specify the maximum file size allowed for a single upload (e.g., 5MB, 1GB).

### Common MIME Types:

text
# Images
image/jpeg
image/png
image/gif
image/webp
image/svg+xml

# Documents
application/pdf
application/msword
text/plain
text/csv

# Audio/Video
audio/mpeg
video/mp4


---

## 5. Interacting with Storage (JavaScript Example)

Here’s how you might upload a file using the supabase-js client, which demonstrates the practical application of these configurations.

### Uploading a File

javascript
import { createClient } from '@supabase/supabase-js';

// Initialize the client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Upload a user's avatar ---
// This assumes your policy requires files to be in a folder named with the user's ID.
async function uploadAvatar(userId, file) {
  if (!userId || !file) {
    console.error("User ID and file are required.");
    return;
  }

  // The path inside the bucket.
  const filePath = `${userId}/${file.name}`;

  const { data, error } = await supabase
    .storage
    .from('avatars') // Your bucket name
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // If true, it will overwrite an existing file with the same name.
    });

  if (error) {
    console.error('Error uploading file:', error.message);
  } else {
    console.log('File uploaded successfully:', data);
  }
}


### Generating a Public URL

javascript
// --- Get public URL for a file ---
function getAvatarUrl(filePath) {
    const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
}


---