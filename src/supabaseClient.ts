import { createClient } from '@supabase/supabase-js';
import { convertImageToWebp } from './utils/imageOptimization';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iehlzsbbjhtwmjkyestf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaGx6c2Jiamh0d21qa3llc3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTA4MTIsImV4cCI6MjEwNzU4NjgxMn0.h_hdGv1veUe3TuTXHaVYQWEMtq3WibHaPHg94uUyDRM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadBannerImage = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const optimizedFile = await convertImageToWebp(file, 0.85); // 85% quality WebP
    
    const fileExt = optimizedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `hero/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, optimizedFile, { cacheControl: '31536000', upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('banners')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error('Error uploading banner image:', error);
    return { success: false, error: error.message };
  }
};
