export const getUploadUrl = async (fileName, fileType) => {
  try {
    const response = await fetch(`/api/upload-url?fileName=${fileName}&fileType=${fileType}`);
    if (!response.ok) throw new Error(`Failed to get upload URL: ${response.statusText}`);
    const { url, key } = await response.json();
    return { url, key };
  } catch (error) {
    console.log('❌ Failed to get upload URL:', error);
    throw error;
  }
};
