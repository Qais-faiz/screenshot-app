import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

export function FeedbackButton({ pageSource = "landing" }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
        aria-label="Open feedback form"
        title="Send Feedback"
      >
        <MessageCircle size={24} />
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pageSource={pageSource}
      />
    </>
  );
}
