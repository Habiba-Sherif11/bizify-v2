import { ChatBotBubble } from "@/features/entrepreneur/components/ChatBotBubble";

export default function EntrepreneurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main>{children}</main>
      <ChatBotBubble />
    </div>
  );
}
