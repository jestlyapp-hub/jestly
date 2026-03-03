"use client";

interface CustomBooleanCellProps {
  value: boolean;
  onCommit: (value: boolean) => void;
}

export default function CustomBooleanCell({ value, onCommit }: CustomBooleanCellProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onCommit(!value);
      }}
      className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer transition-colors"
      style={{
        borderColor: value ? "#4F46E5" : "#D0D0CE",
        backgroundColor: value ? "#4F46E5" : "transparent",
      }}
    >
      {value && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
