import { useParams } from 'react-router-dom';
import { useState } from 'react';
import BackHeader from '../components/layout/BackHeader';
import { feedItems, getStudentById } from '../data/mockData';

export default function MediaGallery() {
  const { childId } = useParams<{ childId: string }>();
  const child = childId ? getStudentById(childId) : null;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Collect all media from feed items relevant to this child
  const mediaItems = feedItems
    .filter(item => {
      if (!childId) return item.mediaUrls && item.mediaUrls.length > 0;
      return (
        (item.mediaUrls && item.mediaUrls.length > 0) &&
        (item.targetAudiences.studentIds?.includes(childId) ||
         item.targetAudiences.classIds?.includes(child?.classId || ''))
      );
    })
    .flatMap(item =>
      (item.mediaUrls || []).map(url => ({
        url,
        title: item.title,
        timestamp: item.timestamp,
        postId: item.id,
      }))
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title={child ? `${child.firstName}'s Gallery` : 'Gallery'} />

      <div className="px-2.5 pt-2 pb-20">
        {mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">📸</span>
            <p className="text-[14px] font-semibold text-gray-500">No photos yet</p>
            <p className="text-[12px] text-gray-400 mt-1">Photos shared by teachers will appear here.</p>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-gray-400 mb-3">{mediaItems.length} photo{mediaItems.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-3 gap-1">
              {mediaItems.map((media, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(media.url)}
                  className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity active:scale-[0.97]"
                >
                  <img
                    src={media.url}
                    alt={media.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-[80vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={selectedImage}
            download
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 text-white rounded-full px-5 py-2.5 text-[13px] font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            ⬇ Download Full Size
          </a>
        </div>
      )}
    </div>
  );
}
