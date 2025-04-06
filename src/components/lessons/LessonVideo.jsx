import React, { useEffect, useState, useRef } from 'react';

function LessonVideo({ lesson }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    async function loadVideo() {
      setIsLoading(true);
      setError(null);

      try {
        if (lesson.video_url && lesson.video_url.startsWith('/api/')) {
          const res = await fetch(lesson.video_url);
          const data = await res.json();

          if (data.success) {
            setVideoUrl(data.url);
          } else {
            throw new Error(data.error || 'Failed to load video');
          }
        } else {
          setVideoUrl(lesson.video_url);
        }
      } catch (err) {
        console.log('Error fetching video URL:', err);
        setError('שגיאה בטעינת הוידאו');
      } finally {
        setIsLoading(false);
      }
    }

    loadVideo();
  }, [lesson.video_url]);

  // כאשר הסרטון נטען – להפעיל אוטומטית מצב פליי
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-black">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-black text-white">
        <div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[1000px] mx-auto">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full h-auto max-h-[600px] object-contain"
        onLoadedMetadata={handleLoadedMetadata}
      >
        הדפדפן שלך אינו תומך בווידאו.
      </video>
    </div>
  );
}

export default LessonVideo;
