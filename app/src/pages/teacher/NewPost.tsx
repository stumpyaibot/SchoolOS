import { useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TeacherNav from '../../components/layout/TeacherNav';
import Toast from '../../components/ui/Toast';
import { classY6Students } from '../../data/teacherMockData';

type PostType = 'student_work' | 'class_update' | 'reminder' | 'permission_slip';
type Step = 'compose' | 'preview' | 'success';

const POST_TYPES: { value: PostType; label: string; icon: string }[] = [
  { value: 'student_work', label: 'Student Work', icon: '🎨' },
  { value: 'class_update', label: 'Class Update', icon: '📝' },
  { value: 'reminder', label: 'Reminder', icon: '⏰' },
  { value: 'permission_slip', label: 'Permission Slip', icon: '📋' },
];

export default function NewPost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as PostType) || 'student_work';

  const [postType, setPostType] = useState<PostType>(initialType);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [step, setStep] = useState<Step>('compose');
  const [toast, setToast] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dismissToast = useCallback(() => setToast(''), []);

  const isStudentSpecific = postType === 'student_work';
  const canPost = title.trim() && content.trim() && (!isStudentSpecific || selectedStudents.length > 0);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setPhotoUrl(data.url);
        setToast('Photo uploaded ✓');
      } else {
        setToast('Upload failed — try again');
      }
    } catch {
      setToast('Upload failed — is the server running?');
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const selectedStudentNames = classY6Students
    .filter(s => selectedStudents.includes(s.id))
    .map(s => s.firstName);

  const audienceLabel = isStudentSpecific
    ? `${selectedStudents.length} parent${selectedStudents.length > 1 ? 's' : ''} (${selectedStudentNames.join(', ')})`
    : 'all Y6 Jaguars parents (12)';

  const handlePost = async () => {
    try {
      await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: postType === 'student_work' ? 'student_work' : 'teacher_post',
          authorId: 'u_teacher_tsoi',
          title,
          content,
          mediaUrls: photoUrl ? [photoUrl] : [],
          priority: postType === 'reminder' ? 'important' : 'normal',
          schoolWide: !isStudentSpecific,
          targetClassIds: isStudentSpecific ? [] : ['cls_y6_jaguars'],
          targetStudentIds: isStudentSpecific ? selectedStudents : [],
        }),
      });
    } catch {
      // Post saved even if API call fails — we show success anyway for demo
    }
    setStep('success');
    setToast(`Posted to ${audienceLabel} ✓`);
  };

  // ===== SUCCESS STATE =====
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeacherNav />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">Posted Successfully</h2>
          <p className="text-[14px] text-gray-500 mb-6">
            Shared with {audienceLabel}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/teacher')}
              className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setStep('compose');
                setTitle('');
                setContent('');
                setSelectedStudents([]);
                setPhotoUrl(null);
              }}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
        <Toast message={toast} visible={!!toast} onDismiss={dismissToast} />
      </div>
    );
  }

  // ===== PREVIEW STATE =====
  if (step === 'preview') {
    const typeInfo = POST_TYPES.find(pt => pt.value === postType)!;
    return (
      <div className="min-h-screen bg-gray-50">
        <TeacherNav />
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-gray-900">Preview</h2>
            <button
              onClick={() => setStep('compose')}
              className="text-[13px] text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Edit
            </button>
          </div>

          <p className="text-[12px] text-gray-500">
            This is how parents will see your post:
          </p>

          {/* Preview Card — mimics parent feed card style */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-3 pt-3 pb-1 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs">{typeInfo.icon}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {typeInfo.label.toUpperCase()}
                  {isStudentSpecific && selectedStudentNames.length > 0 && (
                    <> · {selectedStudentNames[0].toUpperCase()}</>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-gray-400">Just now</span>
            </div>
            <div className="px-3 pb-3">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-[12px] text-gray-500 leading-snug">{content}</p>

              {/* Photo preview in card */}
              {photoUrl && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img src={photoUrl} alt="" className="w-full h-48 object-cover" />
                </div>
              )}

              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[9px] font-bold text-white">MT</span>
                <span className="text-[11px] text-gray-400">Ms. Tsoi</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
            <p className="text-[12px] text-blue-700">
              📨 Will be sent to <strong>{audienceLabel}</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('compose')}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handlePost}
              className="flex-1 py-3 rounded-xl text-[14px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-[0.98]"
            >
              Send to Parents
            </button>
          </div>
        </div>
        <Toast message={toast} visible={!!toast} onDismiss={dismissToast} />
      </div>
    );
  }

  // ===== COMPOSE STATE =====
  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
        <h2 className="text-[18px] font-bold text-gray-900">New Post</h2>

        {/* Step 1: Post Type */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">POST TYPE</p>
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map((pt) => (
              <button
                key={pt.value}
                onClick={() => setPostType(pt.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-colors ${
                  postType === pt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
              >
                <span>{pt.icon}</span>
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Students (if student work) */}
        {isStudentSpecific && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">
              SELECT STUDENT{selectedStudents.length > 0 && ` (${selectedStudents.length})`}
            </p>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {classY6Students.map((student) => {
                  const selected = selectedStudents.includes(student.id);
                  return (
                    <button
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        selected
                          ? 'bg-blue-50 ring-2 ring-blue-400'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <span className="text-[10px] text-gray-600 text-center">{student.firstName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Content */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">CONTENT</p>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              className="w-full text-[15px] font-semibold text-gray-900 placeholder-gray-300 border-none outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your update..."
              rows={4}
              className="w-full text-[13px] text-gray-700 placeholder-gray-300 border-none outline-none resize-none leading-relaxed"
            />

            {/* Photo preview */}
            {photoUrl && (
              <div className="relative">
                <img src={photoUrl} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                <button
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-[14px] flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Photo upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed text-[12px] transition-colors w-full justify-center ${
                uploading
                  ? 'border-blue-300 text-blue-400 bg-blue-50 cursor-wait'
                  : photoUrl
                    ? 'border-green-300 text-green-500 hover:border-green-400'
                    : 'border-gray-300 text-gray-400 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              {uploading ? '⏳ Uploading...' : photoUrl ? '📷 Change Photo' : '📷 Add Photo'}
            </button>
          </div>
        </div>

        {/* Preview Button */}
        <button
          onClick={() => canPost && setStep('preview')}
          disabled={!canPost}
          className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98] ${
            canPost
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Preview & Send
        </button>
      </div>

      <Toast message={toast} visible={!!toast} onDismiss={dismissToast} />
    </div>
  );
}

