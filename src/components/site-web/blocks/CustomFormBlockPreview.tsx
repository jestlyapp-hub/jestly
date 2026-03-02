import { memo } from "react";
import type { CustomFormBlockContent } from "@/types";

function CustomFormBlockPreviewInner({ content }: { content: CustomFormBlockContent }) {
  return (
    <div className="py-4 max-w-md mx-auto space-y-3">
      {content.fields.map((field, i) => (
        <div key={i}>
          <label className="block text-[11px] font-medium text-[#999] mb-1">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          {field.type === "textarea" ? (
            <div className="w-full h-16 bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg" />
          ) : (
            <div className="w-full h-9 bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg" />
          )}
        </div>
      ))}
      <span className="inline-block bg-[#6a18f1] text-white text-[12px] font-semibold px-4 py-2 rounded-lg">
        {content.submitLabel}
      </span>
    </div>
  );
}

export default memo(CustomFormBlockPreviewInner);
