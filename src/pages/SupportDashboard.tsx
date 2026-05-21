import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { X, Send, Image as ImageIcon, Smile, Menu, MessageSquare, Calendar, Clock, LogOut, ChevronRight } from "lucide-react";
import Picker from "emoji-picker-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const LIVE_SERVICE_URL = "http://localhost:3012";
const UPLOAD_SERVICE_URL = "http://localhost:3006";

interface Conversation {
  _id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage?: string;
  _preview?: string;
  _lastMessageAt?: string;
  lastMessageAt?: string;
}

interface Message {
  _id?: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  message: string;
  messageType?: string;
  fileUrl?: string;
  productData?: any;
  senderName?: string;
  senderAvatar?: string;
  createdAt: string;
}

// ───── Support Sidebar ──────────────────────────────────────────────────────
function SupportSidebar({
  activeTab,
  onTabChange,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
}: {
  activeTab: "messages" | "appointments" | "schedules";
  onTabChange: (tab: "messages" | "appointments" | "schedules") => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { user } = useAuth();

  const tabs = [
    { id: "messages" as const, label: "Quản lý tin nhắn", icon: <MessageSquare size={18} /> },
    { id: "appointments" as const, label: "Quản lý đặt lịch", icon: <Calendar size={18} /> },
    { id: "schedules" as const, label: "Quản lý lịch hẹn", icon: <Clock size={18} /> },
  ];

  const sidebarContent = (
    <aside className="flex h-screen w-64 flex-col overflow-hidden border-r border-gray-200 bg-white text-gray-900 shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:text-white">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-100 p-5 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-lg font-black text-white shadow-sm">
            P
          </div>
          <div>
            <div className="font-black text-gray-950 dark:text-white">PawMart</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Support Panel</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              setSidebarOpen(false);
            }}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
              activeTab === tab.id
                ? "bg-orange-50 font-semibold text-orange-600 shadow-sm dark:bg-orange-500/10 dark:text-orange-300"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white",
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full transition",
                activeTab === tab.id ? "bg-orange-500" : "bg-transparent",
              )}
            />
            {tab.icon}
            <span className="flex-1 text-left">{tab.label}</span>
            <ChevronRight size={14} className={cn("opacity-35 transition", activeTab === tab.id && "opacity-70")} />
          </button>
        ))}
      </nav>

      {/* Footer */}
      <footer className="shrink-0 border-t border-gray-100 p-4 dark:border-gray-800">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-orange-100 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:ring-orange-500/20">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-orange-500">
                {user?.fullName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-950 dark:text-white">{user?.fullName}</div>
            <div className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex min-h-12 w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut size={16} /> Logout
        </button>
      </footer>
    </aside>
  );

  return (
    <>
      <div className="hidden shrink-0 lg:block">{sidebarContent}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

// ───── Chat Tab Content ──────────────────────────────────────────────────────
function ChatTabContent() {
  const { user: authUser } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentConversation = conversations.find((c) => c._id === currentConversationId);

  useEffect(() => {
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "support" as any)) {
      window.location.href = "/";
      return undefined;
    }

    const ls = io(LIVE_SERVICE_URL, { transports: ["websocket", "polling"] });
    setSocket(ls);
    setCurrentUserId(authUser.id || authUser._id || "support_1");

    ls.on("connect", () => {
      console.log("Connected to live chat service");
      ls.emit("joinConversation", {
        conversationId: null,
        userId: authUser.id || authUser._id || "support_1",
        role: authUser.role,
      });
    });

    ls.on("conversationUpdated", async (list: Conversation[]) => {
      const convs = list || [];
      const enriched = await Promise.all(
        convs.map(async (c) => {
          try {
            const res = await fetch(`${LIVE_SERVICE_URL}/api/live/conversations/${c._id}/messages`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              const msgs = data.data;
              const last = msgs[msgs.length - 1];
              const isMine = authUser && (authUser.id === last.senderId || authUser._id === last.senderId);
              const senderLabel = isMine ? "Bạn" : last.senderName || c.customerName || "Customer";
              const preview = `${senderLabel}: ${last.message}`;
              return {
                ...c,
                _preview: preview,
                _lastMessageAt: c.lastMessageAt || last.createdAt,
              };
            }
            return { ...c, _preview: c.lastMessage ? c.lastMessage : "" };
          } catch (e) {
            return { ...c, _preview: c.lastMessage ? c.lastMessage : "" };
          }
        })
      );
      setConversations(enriched);
    });

    ls.on("receiveMessage", (data) => {
      if (!data) return;
      if (data.messages) {
        setLiveMessages(data.messages);
      } else if (data.message) {
        setLiveMessages((prev) => [...prev, data.message]);
      }
    });

    ls.on("error", (err) => console.error("Live socket error", err));

    return () => {
      ls.close();
    };
  }, [authUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveMessages]);

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    fetch(`${LIVE_SERVICE_URL}/api/live/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setLiveMessages(res.data);
      })
      .catch((e) => console.error(e));
    socket?.emit("joinConversation", {
      conversationId,
      userId: authUser?.id || authUser?._id || "support_1",
      role: authUser?.role,
    });
  };

  const handleSendMessage = (text: string) => {
    if (!socket || !currentConversationId) return;
    socket.emit("sendMessage", {
      conversationId: currentConversationId,
      senderId: currentUserId,
      senderRole: authUser?.role,
      message: text,
      senderName: authUser?.fullName || "Support",
      senderAvatar: authUser?.avatarUrl || "",
    });
  };

  const handleUploadFile = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      alert("Chỉ chấp nhận ảnh jpg, png, webp");
      return;
    }

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`Kích thước ảnh lớn hơn ${maxMb}MB`);
      return;
    }

    try {
      setIsUploading(true);
      const form = new FormData();
      form.append("file", file);
      form.append("type", "chat");

      const res = await fetch(`${UPLOAD_SERVICE_URL}/upload`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        alert("Upload thất bại");
        return;
      }

      const data = await res.json();
      const fileUrl = data.url || data.secure_url || (data.data && data.data.url) || "";

      if (!fileUrl) {
        alert("Upload không trả về URL");
        return;
      }

      socket?.emit("sendMessage", {
        conversationId: currentConversationId,
        senderId: currentUserId,
        senderRole: authUser?.role,
        message: "",
        messageType: "image",
        fileUrl,
        senderName: authUser?.fullName || "Support",
        senderAvatar: authUser?.avatarUrl || "",
      });
    } catch (err) {
      console.error("file upload error", err);
      alert("Upload thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 gap-4">
      {/* Conversations Sidebar */}
      <div className="w-72 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col overflow-hidden h-full">
        <div className="shrink-0 border-b border-gray-100 p-4 dark:border-gray-800">
          <h2 className="font-bold text-gray-950 dark:text-white text-sm">Conversations</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1 p-2">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No conversations</div>
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => handleSelectConversation(c._id)}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-gray-800",
                  currentConversationId === c._id
                    ? "bg-orange-50 dark:bg-orange-500/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
              >
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{c.customerName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{c._preview || c.lastMessage || "No messages"}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {c._lastMessageAt || c.lastMessageAt ? new Date((c._lastMessageAt || c.lastMessageAt) as string).toLocaleString() : ""}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden h-full">
        {currentConversationId ? (
          <>
            {/* Chat Header */}
            <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="font-semibold text-gray-950 dark:text-white">{currentConversation?.customerName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{currentConversation?.customerId}</div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              {liveMessages.map((msg, idx) => {
                const isSupport = msg.senderRole === "support" || msg.senderRole === "admin";
                const date = new Date(msg.createdAt);
                const showDate = idx === 0 || new Date(liveMessages[idx - 1].createdAt).toDateString() !== date.toDateString();

                return (
                  <div key={msg._id || idx}>
                    {showDate && (
                      <div className="flex justify-center py-2">
                        <span className="text-xs text-gray-400 dark:text-gray-600">{date.toLocaleDateString("vi-VN")}</span>
                      </div>
                    )}

                    <div className={cn("flex gap-3", isSupport && "flex-row-reverse")}>
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center",
                          isSupport ? "bg-orange-100 dark:bg-orange-500/20" : "bg-gray-200 dark:bg-gray-700"
                        )}
                      >
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold">{msg.senderName?.[0] || "U"}</span>
                        )}
                      </div>

                      <div className={cn("max-w-xs", isSupport && "flex flex-col items-end")}>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{msg.senderName || "User"}</div>

                        {msg.messageType === "image" && msg.fileUrl && (
                          <img src={msg.fileUrl} alt="attachment" className="max-h-48 rounded-lg" />
                        )}

                        {msg.messageType === "product" && msg.productData && (
                          <button
                            onClick={() => window.open(`/products/${msg.productData._id}`, "_blank")}
                            className="flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            {msg.productData.imageUrl && (
                              <img src={msg.productData.imageUrl} alt={msg.productData.name} className="h-16 w-16 object-cover rounded" />
                            )}
                            <div className="text-left">
                              <div className="font-semibold text-sm">{msg.productData.name}</div>
                              <div className="text-sm text-orange-600 font-bold">${msg.productData.price}</div>
                            </div>
                          </button>
                        )}

                        {msg.message && (
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm",
                              isSupport
                                ? "bg-orange-500 text-white dark:bg-orange-600"
                                : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                            )}
                          >
                            {msg.message}
                          </div>
                        )}

                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="relative mb-3">
                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-50">
                    <Picker onEmojiClick={(e) => setInputText(inputText + e.emoji)} />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && inputText.trim()) {
                      handleSendMessage(inputText);
                      setInputText("");
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <label className="flex items-center justify-center rounded-2xl bg-gray-100 p-2.5 cursor-pointer hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition">
                  <ImageIcon size={18} className="text-gray-600 dark:text-gray-300" />
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadFile(file);
                    }}
                    disabled={isUploading}
                  />
                </label>

                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="rounded-2xl bg-gray-100 p-2.5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                >
                  <Smile size={18} className="text-gray-600 dark:text-gray-300" />
                </button>

                <button
                  onClick={() => {
                    if (inputText.trim()) {
                      handleSendMessage(inputText);
                      setInputText("");
                    }
                  }}
                  disabled={isUploading || !inputText.trim()}
                  className="rounded-2xl bg-orange-500 p-2.5 text-white hover:bg-orange-600 transition disabled:opacity-50 dark:hover:bg-orange-600"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-0 items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p>Select a conversation to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// AppointmentsTabContent.tsx — v3

const MORNING = { start: 8, end: 12 };
const AFTERNOON = { start: 13, end: 17 };
const MAX_PER_SLOT = 3;
// Mỗi lịch hẹn chiếm 1 tiếng = ảnh hưởng slot đã chọn + 2 slot 30ph tiếp theo
const SLOTS_OCCUPIED_PER_BOOKING = 2; // số slot tiếp theo bị ảnh hưởng

type SlotKey = string; // "YYYY-MM-DD_HH:mm"

interface SlotInfo {
  label: string;
  key: SlotKey;
  past: boolean;
  count: number; // effective count sau khi cộng spillover từ các slot trước
  full: boolean;
}

/** Sinh tất cả các slot hợp lệ trong ngày */
function buildSlotLabels(): string[] {
  const labels: string[] = [];
  [MORNING, AFTERNOON].forEach(({ start, end }) => {
    for (let h = start; h <= end; h++) {
      const mins = h === end ? [0] : [0, 30];
      mins.forEach((m) =>
        labels.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
      );
    }
  });
  return labels;
}

const ALL_SLOT_LABELS = buildSlotLabels();

/**
 * Tính effective count cho mỗi slot:
 * Khi ai đặt slot X (1 tiếng), slot X, X+30ph, X+60ph đều bị -1 chỗ.
 * Nhưng không được tràn qua giữa buổi (sáng/chiều).
 */
function getEffectiveCounts(
  dateStr: string,
  bookings: Record<SlotKey, number>
): Record<string, number> {
  const effective: Record<string, number> = {};
  ALL_SLOT_LABELS.forEach((label) => (effective[label] = 0));

  ALL_SLOT_LABELS.forEach((label, idx) => {
    const key: SlotKey = `${dateStr}_${label}`;
    const directBookings = bookings[key] ?? 0;
    if (directBookings === 0) return;

    // Xác định buổi của slot này
    const h = parseInt(label.split(":")[0]);
    const inMorning = h >= MORNING.start && h < MORNING.end;
    const inAfternoon = h >= AFTERNOON.start && h < AFTERNOON.end;

    // Cộng vào slot hiện tại và 2 slot tiếp theo (nếu cùng buổi)
    for (let offset = 0; offset <= SLOTS_OCCUPIED_PER_BOOKING; offset++) {
      const targetIdx = idx + offset;
      if (targetIdx >= ALL_SLOT_LABELS.length) break;
      const targetLabel = ALL_SLOT_LABELS[targetIdx];
      const th = parseInt(targetLabel.split(":")[0]);
      // Không tràn qua buổi
      const targetInMorning = th >= MORNING.start && th <= MORNING.end;
      const targetInAfternoon = th >= AFTERNOON.start && th <= AFTERNOON.end;
      if (inMorning && !targetInMorning) break;
      if (inAfternoon && !targetInAfternoon) break;
      effective[targetLabel] = (effective[targetLabel] ?? 0) + directBookings;
    }
  });

  return effective;
}

function getTimeSlots(
  dateStr: string,
  now: Date,
  bookings: Record<SlotKey, number>
): SlotInfo[] {
  const effective = getEffectiveCounts(dateStr, bookings);
  return ALL_SLOT_LABELS.map((label) => {
    const key: SlotKey = `${dateStr}_${label}`;
    const count = effective[label] ?? 0;
    return {
      label,
      key,
      past: new Date(`${dateStr}T${label}`) < now,
      count,
      full: count >= MAX_PER_SLOT,
    };
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PET_TYPES = [
  { value: "dog",      label: "🐕 Chó" },
  { value: "cat",      label: "🐈 Mèo" },
  { value: "hamster",  label: "🐹 Chuột hamster" },
  { value: "rabbit",   label: "🐇 Thỏ" },
  { value: "squirrel", label: "🐿️ Sóc cảnh" },
  { value: "other",    label: "🐾 Khác" },
];

const SERVICES = [
  { icon: "🛁", name: "Tắm rửa",       price: "150k"  },
  { icon: "✂️", name: "Cắt tỉa lông",  price: "200k"  },
  { icon: "👂", name: "Vệ sinh tai",    price: "50k"   },
  { icon: "💅", name: "Cắt móng",       price: "30k"   },
  { icon: "💉", name: "Tiêm chủng",     price: "100k"  },
  { icon: "🦷", name: "Cạo vôi răng",  price: "300k"  },
  { icon: "🏥", name: "Khám sức khỏe", price: "250k"  },
  { icon: "🔪", name: "Triệt sản",      price: "500k"  },
  { icon: "🎓", name: "Huấn luyện",     price: "400k"  },
  { icon: "⚰️", name: "Hỏa táng",      price: "2000k" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function AppointmentsTabContent() {
  const todayStr = (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [bookings, setBookings]         = useState<Record<SlotKey, number>>({});
  const [form, setForm]                 = useState({
    fullName: "", phone: "", address: "",
    petName: "", petType: "",
    apptDate: todayStr(),
  });
  const [selectedSlot, setSelectedSlot] = useState<SlotKey | null>(null);
  const [selectedSvcs, setSelectedSvcs] = useState<string[]>([]);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [notif, setNotif]               = useState<{ msg: string; ok: boolean } | null>(null);

  // Slots tính thẳng mỗi render
  const slots: SlotInfo[] = getTimeSlots(form.apptDate, new Date(), bookings);
  const mornSlots: SlotInfo[] = slots.filter((s: SlotInfo) => {
    const h = parseInt(s.label.split(":")[0]);
    return h >= MORNING.start && h <= MORNING.end;
  });
  const aftSlots: SlotInfo[] = slots.filter((s: SlotInfo) => {
    const h = parseInt(s.label.split(":")[0]);
    return h >= AFTERNOON.start && h <= AFTERNOON.end;
  });

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Vui lòng nhập họ và tên";
    if (!form.phone.trim())    errs.phone    = "Vui lòng nhập số điện thoại";
    if (!form.petName.trim())  errs.petName  = "Vui lòng nhập tên thú cưng";
    if (!form.petType)         errs.petType  = "Vui lòng chọn loài thú cưng";
    if (!form.apptDate)        errs.apptDate = "Vui lòng chọn ngày hẹn";
    if (!selectedSlot)         errs.slot     = "Vui lòng chọn giờ hẹn";
    if (selectedSvcs.length === 0) errs.svcs = "Vui lòng chọn ít nhất 1 dịch vụ";
    if (selectedSlot) {
      const info = slots.find((s: SlotInfo) => s.key === selectedSlot);
      if (info?.past) errs.slot = "Giờ hẹn đã qua, vui lòng chọn lại";
      if (info?.full) errs.slot = "Slot này đã đầy (tối đa 3 khách/slot)";
    }
    return errs;
  };

  const showNotif = (msg: string, ok: boolean) => {
    setNotif({ msg, ok });
    if (ok) setTimeout(() => setNotif(null), 3500);
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showNotif("Vui lòng điền đầy đủ thông tin còn thiếu", false);
      return;
    }
    // Ghi booking vào slot gốc (spillover được tính khi render)
    setBookings((prev) => ({
      ...prev,
      [selectedSlot!]: (prev[selectedSlot!] ?? 0) + 1,
    }));
    const [, m, d] = form.apptDate.split("-");
    const slotTime = selectedSlot!.split("_")[1];
    showNotif(
      `Đặt lịch thành công — ${slotTime} ngày ${d}/${m} cho ${form.petName}`,
      true
    );
    setForm({ fullName: "", phone: "", address: "", petName: "", petType: "", apptDate: todayStr() });
    setSelectedSlot(null);
    setSelectedSvcs([]);
    setErrors({});
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const labelCls = "mb-1 block text-[13px] font-medium text-gray-600 dark:text-gray-400";

  const inputCls = (field: string): string => cn(
    "w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-400 bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-orange-100 dark:bg-gray-800 dark:text-white",
    errors[field]
      ? "border-red-400 focus:border-red-400"
      : "border-gray-200 focus:border-orange-400 dark:border-gray-700"
  );

  const slotCls = (s: SlotInfo): string => cn(
    "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition text-center min-w-[54px]",
    s.key === selectedSlot
      ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 font-semibold"
      : s.full
      ? "border-gray-100 bg-gray-50 text-gray-300 dark:bg-gray-800 dark:text-gray-600 line-through cursor-not-allowed"
      : s.past
      ? "border-gray-100 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
      : s.count >= 2
      ? "border-orange-300 bg-white hover:border-orange-400 dark:bg-gray-800 cursor-pointer"
      : s.count === 1
      ? "border-orange-200 bg-white hover:border-orange-300 dark:bg-gray-800 cursor-pointer"
      : "border-gray-200 bg-white hover:border-orange-300 dark:bg-gray-800 cursor-pointer"
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden p-3">
      <div className="mb-2 flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-orange-500">Support Panel</p>
        <h1 className="text-xl font-black text-gray-950 dark:text-white">Tạo lịch hẹn</h1>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Giờ làm việc: 08:00–12:00 &amp; 13:00–17:00 · Mỗi lịch 1 tiếng · Tối đa 3 khách / slot
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1fr_1.65fr]">

        {/* ── Form card ── */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex-shrink-0 border-b border-gray-100 px-4 py-2 dark:border-gray-800">
            <h2 className="text-sm font-bold text-gray-950 dark:text-white">Thông tin khách hàng</h2>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">

            {([
              { id: "fullName", label: "Họ và tên",     type: "text", ph: "Nhập họ tên",        req: true  },
              { id: "phone",    label: "Số điện thoại", type: "tel",  ph: "0xxxxxxxxx",          req: true  },
              { id: "address",  label: "Địa chỉ",       type: "text", ph: "Địa chỉ khách hàng", req: false },
            ] as { id: keyof typeof form; label: string; type: string; ph: string; req: boolean }[]).map((f) => (
              <div key={f.id}>
                <label className={labelCls}>
                  {f.label}{f.req && <span className="ml-0.5 text-red-400">*</span>}
                </label>
                <input type={f.type} placeholder={f.ph}
                  value={form[f.id]}
                  onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                  className={inputCls(f.id)} />
                {errors[f.id] && <p className="mt-1 text-[11px] text-red-500">{errors[f.id]}</p>}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>
                  Tên thú cưng<span className="ml-0.5 text-red-400">*</span>
                </label>
                <input type="text" placeholder="Bông, Milo..."
                  value={form.petName}
                  onChange={(e) => setForm({ ...form, petName: e.target.value })}
                  className={inputCls("petName")} />
                {errors.petName && <p className="mt-1 text-[11px] text-red-500">{errors.petName}</p>}
              </div>
              <div>
                <label className={labelCls}>
                  Loài<span className="ml-0.5 text-red-400">*</span>
                </label>
                <select value={form.petType}
                  onChange={(e) => setForm({ ...form, petType: e.target.value })}
                  className={inputCls("petType")}>
                  <option value="">-- Chọn loài --</option>
                  {PET_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                {errors.petType && <p className="mt-1 text-[11px] text-red-500">{errors.petType}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Ngày hẹn<span className="ml-0.5 text-red-400">*</span>
              </label>
              <input type="date" min={todayStr()}
                value={form.apptDate}
                onChange={(e) => { setForm({ ...form, apptDate: e.target.value }); setSelectedSlot(null); }}
                className={inputCls("apptDate")} />
              {errors.apptDate && <p className="mt-1 text-[11px] text-red-500">{errors.apptDate}</p>}
            </div>

            {/* Slot picker */}
            <div>
              <label className={labelCls}>
                Giờ hẹn<span className="ml-0.5 text-red-400">*</span>
              </label>
              {([
                { label: "Buổi sáng",  items: mornSlots },
                { label: "Buổi chiều", items: aftSlots  },
              ] as { label: string; items: SlotInfo[] }[]).map((g) => (
                <div key={g.label} className="mb-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{g.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {g.items.map((s: SlotInfo) => (
                      <button key={s.key}
                        disabled={s.past || s.full}
                        onClick={() => { setSelectedSlot(s.key); setErrors((p) => ({ ...p, slot: "" })); }}
                        className={slotCls(s)}
                        title={s.full ? "Hết chỗ" : s.past ? "Đã qua" : `Còn ${MAX_PER_SLOT - s.count} chỗ`}>
                        {s.label}
                        {!s.past && !s.full && (
                          <span className="block text-[9px] font-normal text-gray-400">
                            {MAX_PER_SLOT - s.count} chỗ
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {errors.slot && <p className="mt-1 text-[11px] text-red-500">{errors.slot}</p>}
              <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-gray-400">
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm border border-orange-200 bg-white" />Còn ít chỗ</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-gray-100" />Hết chỗ</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm border border-orange-500 bg-orange-50" />Đã chọn</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Services card ── */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex-shrink-0 border-b border-gray-100 px-4 py-2 dark:border-gray-800">
            <h2 className="text-sm font-bold text-gray-950 dark:text-white">
              Chọn dịch vụ <span className="font-normal text-gray-400 text-xs">(chọn ít nhất 1)</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((s) => (
                <button key={s.name}
                  onClick={() =>
                    setSelectedSvcs((prev) =>
                      prev.includes(s.name) ? prev.filter((x) => x !== s.name) : [...prev, s.name]
                    )
                  }
                  className={cn(
                    "rounded-xl border-2 px-3 py-2.5 text-left transition",
                    selectedSvcs.includes(s.name)
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                      : "border-gray-100 bg-gray-50 hover:border-orange-300 dark:border-gray-800 dark:bg-gray-800"
                  )}>
                  <div className="text-lg">{s.icon}</div>
                  <div className="mt-0.5 text-xs font-semibold text-gray-950 dark:text-white">{s.name}</div>
                  <div className="text-[10px] text-gray-500">{s.price}</div>
                </button>
              ))}
            </div>
            {errors.svcs && <p className="mt-2 text-[11px] text-red-500">{errors.svcs}</p>}
          </div>

          <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            {selectedSvcs.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {selectedSvcs.map((n) => (
                  <span key={n} className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
                    {n}
                  </span>
                ))}
              </div>
            )}
            {notif && (
              <div className={cn(
                "mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                notif.ok
                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400"
              )}>
                {notif.ok ? "✓" : "⚠"} {notif.msg}
              </div>
            )}
            <button onClick={handleSubmit}
              className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[.98]">
              Đặt lịch hẹn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ───── Schedules Tab Content ──────────────────────────────────────────────────────
function SchedulesTabContent() {
  const schedules = [
    { id: 1, customer: "Nguyễn Văn A", pet: "Max (Chó)", service: "Tắm rửa", time: "2024-01-20 09:00", status: "confirmed" },
    { id: 2, customer: "Trần Thị B", pet: "Miu (Mèo)", service: "Cắt tỉa lông", time: "2024-01-20 14:00", status: "pending" },
    { id: 3, customer: "Lê Minh C", pet: "Buddy (Chó)", service: "Khám sức khỏe", time: "2024-01-21 10:00", status: "confirmed" },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Support Panel</p>
        <h1 className="mt-2 text-3xl font-black text-gray-950 dark:text-white">Quản lý lịch hẹn</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Theo dõi tất cả các lịch hẹn chăm sóc thú cưng</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Thú cưng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Dịch vụ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Thời gian</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{schedule.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{schedule.pet}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{schedule.service}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{schedule.time}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                        schedule.status === "confirmed"
                          ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                      )}
                    >
                      {schedule.status === "confirmed" ? "Xác nhận" : "Chờ xác nhận"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ───── Main Component ──────────────────────────────────────────────────────
export default function SupportDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"messages" | "appointments" | "schedules">("messages");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "support")) {
      window.location.href = "/";
    }
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
      <SupportSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Open support menu"
          >
            <Menu size={20} />
          </button>
          <div className="font-semibold text-gray-900 dark:text-white">Support Panel</div>
        </header>

        <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
          {activeTab === "messages" && <ChatTabContent />}
          {activeTab === "appointments" && <AppointmentsTabContent />}
          {activeTab === "schedules" && <SchedulesTabContent />}
        </main>
      </div>
    </div>
  );
}
