import {Camera, Mic, X, Check, Home, FileText, User, ArrowLeft, Image as ImageIcon,} from "lucide-react";
import { useState } from "react";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function AppDemo() {
  const [progress, setProgress] = useState(75);
  const [photos, setPhotos] = useState<Array<{ id: number; placeholder: boolean }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [textContent, setTextContent] = useState(
    "Completed framing on west wall. Starting electrical rough-in tomorrow."
  );
  const [progressPhase, setProgressPhase] = useState("inspection");
  const [showSuccess, setShowSuccess] = useState(false);

  // Add Unexpected Cost flow (separate screen)
  const [showCostScreen, setShowCostScreen] = useState(false);
  const [costAmount, setCostAmount] = useState("");
  const [costCategory, setCostCategory] = useState("additional-materials");
  const [costDescription, setCostDescription] = useState("");
  const [costPhotos, setCostPhotos] = useState<Array<{ id: number; placeholder: boolean }>>([]);

  // --- handlers (kept same structure) ---
  const handleVoiceRecord = () => {
    setIsRecording(true);
    setRecordingDone(false);
    setTimeout(() => {
      setIsRecording(false);
      setRecordingDone(true);
      if (!textContent) {
        setTextContent(
          "Completed framing on west wall. Starting electrical rough-in tomorrow."
        );
      }
    }, 2000);
  };

  const handlePhotoUpload = () => {
    if (photos.length < 3) {
      setPhotos([...photos, { id: Date.now(), placeholder: true }]);
    }
  };

  const removePhoto = (id: number) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleSendUpdate = () => {
    setShowSuccess(true);
    setTimeout(() => {
      // reset demo
      setShowSuccess(false);
      setProgress(75);
      setPhotos([]);
      setTextContent("");
      setRecordingDone(false);
      setProgressPhase("inspection");
    }, 2000);
  };

  const handleAddCost = () => setShowCostScreen(true);
  const handleBackFromCost = () => setShowCostScreen(false);

  const handleCostPhotoUpload = () => {
    if (costPhotos.length < 2) {
      setCostPhotos([...costPhotos, { id: Date.now(), placeholder: true }]);
    }
  };

  const handleSubmitCost = () => {
    // simulate submit
    setTimeout(() => {
      setShowCostScreen(false);
      setCostAmount("");
      setCostDescription("");
      setCostPhotos([]);
      setCostCategory("additional-materials");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 md:py-12 px-4 flex items-center justify-center">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-start md:items-center">
        {/* Left side — Description */}
        <div className="space-y-6">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
            Interactive Demo
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Try Relay in Action
          </h1>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Voice to Text</h3>
                <p className="text-muted-foreground">Tap the mic to record your update</p>
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
                <h3>Send Update</h3>
                <p className="text-muted-foreground">Share a clean update with your client</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Photo Requirements</h3>
                <p className="text-muted-foreground">
                  Require crews to upload a set number of photos before moving to the next phase.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Custom Phases</h3>
                <p className="text-muted-foreground">
                  Build your own phase structure or start from one of our pre-made templates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side — Phone mockup */}
        <div className="relative">
          {/* Phone frame */}
          <div className="mx-auto w-[340px] h-[700px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative flex flex-col">
              {/* App content (scroll area) */}
              <div className="flex-1 overflow-y-auto pb-16">
                {!showCostScreen ? (
                  <>
                    {/* Header — teal gradient like new screen */}
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 pt-5 pb-6 text-white">
                      <h2 className="text-2xl mb-1">Add Update</h2>
                      <p className="text-sm opacity-90">Wilson Residence - New Roof Installation</p>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 space-y-5">
                      {/* Progress Phase */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Progress Phase</label>
                        <Select value={progressPhase} onValueChange={setProgressPhase}>
                          <SelectTrigger className="w-full bg-white border-gray-300 rounded-2xl">
                            <SelectValue placeholder="Select phase" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inspection">Inspection &amp; Planning</SelectItem>
                            <SelectItem value="foundation">Foundation</SelectItem>
                            <SelectItem value="framing">Framing</SelectItem>
                            <SelectItem value="roofing">Roofing</SelectItem>
                            <SelectItem value="finishing">Finishing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Phase Completion */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700">Phase Completion</span>
                          <span className="text-lg text-emerald-600">{progress}%</span>
                        </div>
                        <Slider
                          value={[progress]}
                          onValueChange={(value) => setProgress(value[0] ?? 0)}
                          max={100}
                          step={1}
                          className="w-full [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Update Description */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Update Description</label>
                        <div className="relative">
                          <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Completed framing on west wall. Starting electrical rough-in tomorrow."
                            className="w-full h-28 px-3 py-2 pr-12 border border-gray-300 rounded-2xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            onClick={handleVoiceRecord}
                            disabled={isRecording}
                            className={`absolute right-2 bottom-2 w-10 h-10 rounded-full flex items-center justify-center transition-all
                              ${
                                isRecording
                                  ? "bg-red-500 animate-pulse"
                                  : recordingDone
                                  ? "bg-green-500"
                                  : "bg-emerald-500 hover:bg-emerald-600"
                              }`}
                            aria-label="Record voice"
                          >
                            <Mic className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Voice recording makes updates even faster
                        </p>
                      </div>

                      {/* Unexpected Extra Cost */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Unexpected Extra Cost (Optional)
                        </label>
                        <button
                          onClick={handleAddCost}
                          className="w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white py-3 rounded-2xl hover:from-orange-500 hover:to-amber-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">$</span>
                          <span className="font-medium">Add Change Order</span>
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          Add any unexpected costs discovered during this phase
                        </p>
                      </div>

                      {/* Photos (3 slots) */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Photos</label>
                        <div className="flex gap-3">
                          {/* Add photo button */}
                          {photos.length < 3 && (
                            <button
                              onClick={handlePhotoUpload}
                              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-50 transition-colors bg-white"
                              aria-label="Add photo"
                            >
                              <Camera className="w-6 h-6 text-gray-400" />
                            </button>
                          )}

                          {/* Photo thumbnails */}
                          {photos.map((photo) => (
                            <div
                              key={photo.id}
                              className="relative w-20 h-20 bg-gray-200 rounded-2xl grid place-items-center"
                            >
                              <ImageIcon className="w-6 h-6 text-gray-500" />
                              <button
                                onClick={() => removePhoto(photo.id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                                aria-label="Remove photo"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Send button */}
                      <button
                        onClick={handleSendUpdate}
                        disabled={!textContent && photos.length === 0}
                        className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-center"
                      >
                        Send Update
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Add Unexpected Cost Screen */}
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 pt-5 pb-6 text-white">
                      <button
                        onClick={handleBackFromCost}
                        className="flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                      </button>
                      <h2 className="text-2xl mb-1">Add Unexpected Cost</h2>
                      <p className="text-sm opacity-90">Test</p>
                    </div>

                    <div className="px-5 py-4 space-y-5">
                      {/* Amount */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Cost Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={costAmount}
                            onChange={(e) => setCostAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Cost Category</label>
                        <Select value={costCategory} onValueChange={setCostCategory}>
                          <SelectTrigger className="w-full bg-white border-gray-300 rounded-2xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="additional-materials">Additional Materials</SelectItem>
                            <SelectItem value="labor">Labor</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="permits">Permits</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Description</label>
                        <textarea
                          value={costDescription}
                          onChange={(e) => setCostDescription(e.target.value)}
                          placeholder="Describe the unexpected cost"
                          className="w-full h-28 px-3 py-2 border border-gray-300 rounded-2xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Photo evidence */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Photo Evidence</label>
                        <div className="flex gap-3">
                          {costPhotos.length < 2 && (
                            <button
                              onClick={handleCostPhotoUpload}
                              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-50 transition-colors bg-white"
                            >
                              <Camera className="w-6 h-6 text-emerald-500" />
                            </button>
                          )}
                          {costPhotos.length < 2 && (
                            <button
                              onClick={handleCostPhotoUpload}
                              className="w-20 h-20 bg-gray-200 rounded-2xl grid place-items-center hover:bg-gray-300 transition-colors"
                            >
                              <ImageIcon className="w-6 h-6 text-gray-500" />
                            </button>
                          )}
                          {costPhotos.map((p) => (
                            <div key={p.id} className="w-20 h-20 bg-gray-200 rounded-2xl grid place-items-center">
                              <ImageIcon className="w-6 h-6 text-gray-500" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleSubmitCost}
                        className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl hover:bg-emerald-700 transition-all text-center"
                      >
                        Submit Cost Request
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Navigation (inside phone chrome) */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-3 flex justify-around items-center">
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <Home className="w-5 h-5" />
                  <span className="text-xs">Projects</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-emerald-600">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">Add Update</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <User className="w-5 h-5" />
                  <span className="text-xs">Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success overlay */}
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[3rem]">
              <div className="bg-white rounded-2xl p-8 mx-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900">Update Sent!</h3>
                <p className="text-gray-600">Your client has been notified</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
