import { memo } from "react";
import type { BlogPreviewBlockContent } from "@/types";

function BlogPreviewBlockPreviewInner({ content }: { content: BlogPreviewBlockContent }) {
  const cols = content.columns === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="py-6">
      {content.title && <h3 className="text-lg font-bold mb-5">{content.title}</h3>}
      <div className={`grid ${cols} gap-4`}>
        {content.posts.map((post, i) => (
          <div key={i} className="rounded-xl border border-[#E6E6E4] overflow-hidden hover:shadow-sm transition-shadow group cursor-pointer">
            {post.imageUrl ? (
              <img src={post.imageUrl} alt={post.title} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-[var(--site-primary-light)] flex items-center justify-center text-[11px] text-[var(--site-primary)] font-medium">Image</div>
            )}
            <div className="p-4">
              <div className="text-[10px] opacity-40 mb-1">{post.date}</div>
              <div className="text-[13px] font-semibold mb-1 group-hover:text-[var(--site-primary)] transition-colors">{post.title}</div>
              <div className="text-[11px] opacity-50 line-clamp-2">{post.excerpt}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(BlogPreviewBlockPreviewInner);
