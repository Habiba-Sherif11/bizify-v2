"use client";

function BizifyMark() {
  return (
    <svg
      width="13"
      height="15"
      viewBox="0 0 193 216"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M192.482 215.579H162.485V188.98H192.482V215.579ZM154.276 172.466H102.851V129.351H154.276V172.466ZM154.276 86.2324H102.851V43.1172H154.276V86.2324Z"
        fill="white"
      />
      <path
        d="M102.851 43.1152H51.4258V86.2334H102.851V129.349H51.4258V172.468H102.851V215.583H51.4258V215.585H0V0H102.851V43.1152Z"
        fill="white"
      />
    </svg>
  );
}

function AiAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(245,158,11,0.35)]">
      <BizifyMark />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#0891B2] flex items-center justify-center shrink-0">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
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
        <div className="max-w-[80%] bg-[#FAFAFA] border border-[#E9E9E9] rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-[#1C1C1E] leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 flex-row-reverse">
      <UserAvatar />
      <div className="max-w-[80%] bg-amber-100 border border-amber-200 rounded-2xl rounded-tr-sm px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <p className="text-sm text-[#1C1C1E] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
