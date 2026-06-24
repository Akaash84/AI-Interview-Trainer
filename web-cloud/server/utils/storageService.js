const supabase = require('../config/supabase');

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The file name
 * @param {string} folder - The folder path in the bucket (e.g., 'recordings')
 * @param {string} mimetype - The MIME type of the file
 * @returns {Promise<Object>} - Returns { success, url, path, error }
 */
async function uploadToSupabase(fileBuffer, fileName, folder = 'recordings', mimetype) {
  try {
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'interview-recordings';
    const filePath = `${folder}/${Date.now()}-${fileName}`;

    console.log(`📤 Uploading to Supabase: ${filePath}`);

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log(`✅ Upload successful: ${urlData.publicUrl}`);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      bucket: bucketName
    };
  } catch (error) {
    console.error('❌ Upload to Supabase failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - The file path in the bucket
 * @param {string} bucketName - The bucket name
 * @returns {Promise<Object>} - Returns { success, error }
 */
async function deleteFromSupabase(filePath, bucketName = null) {
  try {
    const bucket = bucketName || process.env.SUPABASE_BUCKET_NAME || 'interview-recordings';
    
    console.log(`🗑️  Deleting from Supabase: ${filePath}`);

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Delete successful');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Delete from Supabase failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get signed URL for private files (valid for specified duration)
 * @param {string} filePath - The file path in the bucket
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @param {string} bucketName - The bucket name
 * @returns {Promise<Object>} - Returns { success, url, error }
 */
async function getSignedUrl(filePath, expiresIn = 3600, bucketName = null) {
  try {
    const bucket = bucketName || process.env.SUPABASE_BUCKET_NAME || 'interview-recordings';

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('❌ Supabase signed URL error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('❌ Get signed URL failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List files in a folder
 * @param {string} folder - The folder path to list
 * @param {string} bucketName - The bucket name
 * @returns {Promise<Object>} - Returns { success, files, error }
 */
async function listFiles(folder = '', bucketName = null) {
  try {
    const bucket = bucketName || process.env.SUPABASE_BUCKET_NAME || 'interview-recordings';

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Supabase list files error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, files: data };
  } catch (error) {
    console.error('❌ List files failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  uploadToSupabase,
  deleteFromSupabase,
  getSignedUrl,
  listFiles
};
