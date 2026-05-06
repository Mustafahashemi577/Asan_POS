import { ImageIcon, ImagePlus, Loader2, X } from "lucide-react";
import type { RefObject } from "react";
import type { ImagePreview } from "./useproductform";

interface ProductImageUploadProps {
  imagePreviews: ImagePreview[];
  imageUploading: boolean;
  isLoading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onRemove: (index: number) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductImageUpload({
  imagePreviews,
  imageUploading,
  isLoading,
  fileInputRef,
  onRemove,
  onChange,
}: ProductImageUploadProps) {
  const hasNoImages = imagePreviews.length === 0;
  const hasSingleImage = imagePreviews.length === 1;
  const hasMultipleImages = imagePreviews.length > 1;

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={onChange}
      disabled={isLoading}
    />
  );

  // ── CASE 1: No images ──
  if (hasNoImages) {
    return (
      <label className="block w-full cursor-pointer">
        <div className="w-full h-44 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors relative">
          {imageUploading ? (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">Click to upload images</span>
            </div>
          )}
        </div>
        {fileInput}
      </label>
    );
  }

  // ── CASE 2: Single image ──
  if (hasSingleImage) {
    return (
      <div className="space-y-2">
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200">
          <img
            src={imagePreviews[0].preview}
            alt="Product"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(0)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          {imageUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit text-gray-400 hover:text-gray-600 transition-colors">
          {imageUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
          <span className="text-xs">Add more photos</span>
          {fileInput}
        </label>
      </div>
    );
  }

  // ── CASE 3: Multiple images ──
  if (hasMultipleImages) {
    return (
      <div className="flex flex-wrap gap-2">
        {imagePreviews.map((item, index) => (
          <div
            key={index}
            className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0"
          >
            <img
              src={item.preview}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        {/* Add more tile */}
        <label className="w-20 h-20 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shrink-0 gap-1">
          {imageUploading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] text-gray-400">Add</span>
            </>
          )}
          {fileInput}
        </label>
      </div>
    );
  }

  return null;
}
