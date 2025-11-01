import { Camera, Mic, X, Check } from "lucide-react";
import { useState } from "react";
import { Slider } from "../ui/slider";

export function AppDemo() {
  const [progress, setProgress] = useState(75);
  const [photos, setPhotos] = useState<Array<{ id: number; placeholder: boolean }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const tags = [
    { id: "schedule", label: "On Schedule", color: "bg-blue-100 text-blue-700" },
    { id: "weather", label: "Good Weather", color: "bg-green-100 text-green-700" },
    { id: "team", label: "Team Effort", color: "bg-purple-100 text-purple-700" }
  ];

  const handleVoiceRecord = () => {
    setIsRecording(true);
    setRecordingDone(false);
    
    // Simulate recording for 2 seconds
    setTimeout(() => {
      setIsRecording(false);
      setRecordingDone(true);
      setTextContent("Completed west section of the roof today. All shingles installed and looking great. Moving to north side tomorrow morning. Weather looking good for the next few days.");
    }, 2000);
  };

  const handlePhotoUpload = () => {
    if (photos.length < 2) {
      setPhotos([...photos, { id: Date.now(), placeholder: true }]);
    }
  };

  const removePhoto = (id: number) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSendUpdate = () => {
    setShowSuccess(true);
    setTimeout(() => {
      // Reset demo
      setShowSuccess(false);
      setProgress(75);
      setPhotos([]);
      setTextContent("");
      setSelectedTags([]);
      setRecordingDone(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Description */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full mb-4">
              Interactive Demo
            </span>
            <h1 className="mb-4">
              Try Relay in Action
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: '1.125rem' }}>
              Experience how easy it is to send professional updates to homeowners. 
              Try the voice-to-text feature, add photos, and send a complete progress update.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Voice-to-Text</h3>
                <p className="text-muted-foreground">Click the microphone to record your update</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Add Photos</h3>
                <p className="text-muted-foreground">Upload progress photos to show your work</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Update Client</h3>
                <p className="text-muted-foreground">Easily update your client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Phone mockup */}
        <div className="relative">
          {/* Phone frame */}
          <div className="mx-auto w-[340px] h-[700px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
              {/* Status bar */}
              <div className="h-6 bg-gradient-to-r from-blue-500 to-teal-400" />

              {/* App content */}
              <div className="h-full overflow-y-auto pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-teal-400 px-5 pt-2 pb-6 text-white">
                  <h2 className="text-xl">Add Update</h2>
                  <p className="text-sm opacity-90">Wilson Residence - New Roof Installation</p>
                </div>

                <div className="px-5 py-4 space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">Update Progress</span>
                      <span className="text-lg text-teal-600">{progress}%</span>
                    </div>
                    <input
                      type="range"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      max={100}
                      min={0}
                      step={1}
                      className="relative w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-blue-500/50 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
                      style={{
                        background: `linear-gradient(to right, 
                          #3b82f6 0%, 
                          #14b8a6 ${progress}%, 
                          #e5e7eb ${progress}%, 
                          #e5e7eb 100%)`
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">Phase: New Roof Installation</p>
                  </div>

                  {/* Text input */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      What did you get done today?
                    </label>
                    <div className="relative">
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Tap the mic to record your update..."
                        className="w-full h-32 px-3 py-2 pr-12 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={handleVoiceRecord}
                        disabled={isRecording}
                        className={`absolute right-2 bottom-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isRecording 
                            ? "bg-red-500 animate-pulse" 
                            : recordingDone
                            ? "bg-green-500"
                            : "bg-teal-500 hover:bg-teal-600"
                        }`}
                      >
                        <Mic className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      Voice to text enabled · Just tap and speak
                    </p>
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Add Photos
                    </label>
                    <div className="flex gap-3">
                      {/* Add photo button */}
                      {photos.length < 2 && (
                        <button
                          onClick={handlePhotoUpload}
                          className="w-24 h-24 border-2 border-dashed border-teal-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-teal-500 hover:bg-teal-50 transition-colors"
                        >
                          <Camera className="w-6 h-6 text-teal-500" />
                          <span className="text-xs text-teal-600">Take Photo</span>
                        </button>
                      )}
                      
                      {/* Photo thumbnails */}
                      {photos.map(photo => (
                        <div key={photo.id} className="relative w-24 h-24 bg-teal-100 rounded-lg">
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-8 h-8 text-teal-400" />
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      📸 Photos help clients see your progress
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Quick Tags (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedTags.includes(tag.id)
                              ? tag.color
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notification info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-lg">ℹ️</span>
                      <span>
                        <strong>Client will be notified</strong><br />
                        Sarah Wilson will receive an SMS and email update immediately
                      </span>
                    </p>
                  </div>

                  {/* Send button */}
                  <button
                    onClick={handleSendUpdate}
                    disabled={!textContent && photos.length === 0}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Send Update to Client
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Success overlay */}
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[3rem]">
              <div className="bg-white rounded-2xl p-8 mx-8 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900">Update Sent!</h3>
                <p className="text-gray-600">Sarah Wilson has been notified</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
