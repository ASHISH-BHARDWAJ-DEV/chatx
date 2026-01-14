import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
 
  const selectedUserId = selectedUser?._id?.toString ? selectedUser._id.toString() : String(selectedUser?._id || "");
  const isOnline = onlineUsers.includes(selectedUserId);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-gray-800/50 border-b
   border-gray-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
      <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>

        <div>
          <h3 className="text-white font-medium">{selectedUser.fullName}</h3>
          <p className="text-gray-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;