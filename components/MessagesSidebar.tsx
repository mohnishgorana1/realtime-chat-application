import axios from "axios";
import SearchArea from "./SearchArea";
import { useAppUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function MessagesSidebar({
  selectedChat,
  setSelectedChat,
}: any) {
  const [allChats, setAllChats] = useState<any[]>([]);
  const { appUser } = useAppUser();

  const fetchChats = async () => {
    const response = await axios.get(
      `/api/chats?userId=${appUser?._id}&isGroup=${false}`
    );
    if (response.data.success) {
      setAllChats(response.data.chats);
    }
  };
  // Samne wale user ka data nikalne ke liye helper
  const getOtherUser = (participants: any[]) => {
    return participants.find((p) => p._id !== appUser?._id);
  };

  useEffect(() => {
    if (appUser?._id) {
      fetchChats();
    }
  }, [appUser]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-6">
        <h2 className="text-2xl font-black tracking-tight">Chats</h2>
      </div>

      {/* search area */}
      <div className="px-4 pb-4">
        <SearchArea
          onSelectUser={(chat) => {
            setSelectedChat(chat);
            fetchChats();
          }}
        />
      </div>

      {/* ALL chats */}
      {allChats.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4 opacity-40">
          <p className="text-sm text-center">No conversations yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar divide-y divide-primary/10">
          {allChats.map((chat) => {
            const otherUser = getOtherUser(chat.participants);

            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all active:scale-95  ${
                  selectedChat?._id === chat._id
                    ? "border border-primary/50 shadow-sm shadow-primary/20"
                    : "hover:bg-secondary/60 text-foreground"
                }`}
              >
                {/* Profile Image / Avatar */}
                <div className="relative shrink-0">
                  {otherUser?.avatar ? (
                    <Image
                      src={otherUser.avatar}
                      width={48}
                      height={48}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-background"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold border-2 border-background">
                      {otherUser?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-sm truncate">
                      {otherUser?.name || "Unknown User"}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        selectedChat?._id === chat._id
                          ? "opacity-70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {chat.updatedAt
                        ? new Date(chat.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  <p
                    className={`text-xs truncate ${
                      selectedChat?._id === chat._id
                        ? "opacity-80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {chat.latestMessage?.content || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
