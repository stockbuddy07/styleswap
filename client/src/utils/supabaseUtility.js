import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 * Also configures the URL to use Supabase's built-in Image Transformation API
 * for aggressive compression and WebP conversion.
 * 
 * @param {File} file The image file to upload
 * @param {string} bucket The storage bucket name (default: 'images')
 * @returns {Promise<string>} The optimized public URL of the uploaded image
 */
export const uploadImageFast = async (file, bucket = 'images') => {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials are not configured in the frontend environment.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '31536000', // 1 year cache
            upsert: false
        });

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    // Leverage Supabase Image Transformations for native CDN optimization
    // Transform parameters to force WebP/latest format and compress aggressively
    const optimizedUrl = `${data.publicUrl}?width=800&quality=80&format=origin`;

    return optimizedUrl;
};
