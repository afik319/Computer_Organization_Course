import React, { useEffect, useState } from 'react';

function LessonVideo({ lesson }) {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    // אם השדה video_url מתחיל ב-/api, נניח שזה נתיב API שמייצר Presigned URL
    if (lesson.video_url && lesson.video_url.startsWith('/api/')) {
      fetch(lesson.video_url)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setVideoUrl(data.url);
          } else {
            console.error('Error fetching video URL:', data.error);
          }
        })
        .catch(err => console.error('Fetch error:', err));
    } else {
      // אם כבר קיים URL מלא, השתמש בו
      setVideoUrl(lesson.video_url);
    }
  }, [lesson.video_url]);

  return (
    <div>
      {videoUrl ? (
        <video controls width="800" src={videoUrl}>
          הדפדפן שלך אינו תומך בווידאו.
        </video>
      ) : (
        <p>טוען וידאו...</p>
      )}
    </div>
  );
}

export default LessonVideo;
