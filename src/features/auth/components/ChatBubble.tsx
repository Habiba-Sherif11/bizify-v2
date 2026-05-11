"use client";

function AiAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3Z"/>
        <path d="M20 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-sm">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </div>
  );
}

interface Props {
  role: "ai" | "user";
  text: string;
}

export function ChatBubble({ role, text }: Props) {
  if (role === "ai") {
    return (
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div className="max-w-[80%] bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 flex-row-reverse">
      <UserAvatar />
      <div className="max-w-[80%] bg-cyan-600/10 border border-neutral-200 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
        <p className="text-sm text-neutral-800 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
