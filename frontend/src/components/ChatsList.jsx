import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  
  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  const formatLastMessageTime = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
                {chat.lastMessage && (
                  <span className="text-xs text-slate-400">
                    {formatLastMessageTime(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-slate-400 truncate mt-1">
                  {chat.lastMessage.senderId === authUser?._id ? "You: " : ""}
                  {chat.lastMessage.text || "Image"}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
