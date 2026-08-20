"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { KLIO_MODELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import {
  Plus,
  Search,
  MessageSquare,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderInput,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Check,
} from "lucide-react";

interface ConversationItem {
  id: string;
  title: string | null;
  modelId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  model: { name: string; displayName: string };
  folder: { id: string; name: string } | null;
}

interface FolderItem {
  id: string;
  name: string;
  _count: { conversations: number };
}

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  currentModelId: string;
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
  currentModelId,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [contextMenu, setContextMenu] = useState<{
    type: "conversation" | "folder";
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [moveMenuConvId, setMoveMenuConvId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [convRes, folderRes] = await Promise.all([
        fetch("/api/conversations"),
        fetch("/api/folders"),
      ]);
      if (convRes.ok) setConversations(await convRes.json());
      if (folderRes.ok) setFolders(await folderRes.json());
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
        setMoveMenuConvId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleContextMenu = (
    e: React.MouseEvent,
    type: "conversation" | "folder",
    id: string
  ) => {
    e.preventDefault();
    setContextMenu({ type, id, x: e.clientX, y: e.clientY });
  };

  const handleDeleteConversation = async (id: string) => {
    setContextMenu(null);
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    fetchData();
    if (activeConversationId === id) onNewChat();
  };

  const handleRenameConversation = async (id: string, title: string) => {
    setContextMenu(null);
    await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    fetchData();
  };

  const handleMoveConversation = async (
    convId: string,
    folderId: string | null
  ) => {
    setContextMenu(null);
    setMoveMenuConvId(null);
    await fetch(`/api/conversations/${convId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    fetchData();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    setNewFolderName("");
    setIsCreatingFolder(false);
    fetchData();
  };

  const handleRenameFolder = async (id: string) => {
    if (!editingFolderName.trim()) return;
    await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingFolderName.trim() }),
    });
    setEditingFolderId(null);
    fetchData();
  };

  const handleDeleteFolder = async (id: string) => {
    setContextMenu(null);
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    fetchData();
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredConversations = conversations.filter((c) =>
    searchQuery
      ? (c.title || "New conversation")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true
  );

  const groupedConversations = folders.map((folder) => ({
    folder,
    conversations: filteredConversations.filter(
      (c) => c.folderId === folder.id
    ),
  }));

  const ungroupedConversations = filteredConversations.filter(
    (c) => !c.folderId
  );

  const getModelIcon = (modelId: string) => {
    const model = KLIO_MODELS.find((m) => m.id === modelId);
    return model?.name || modelId;
  };

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center py-2 px-1 border-r border-border bg-background h-full">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Open sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button
          onClick={onNewChat}
          className="mt-2 p-2 rounded-lg hover:bg-muted transition-colors"
          title="New chat"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[280px] border-r border-border bg-background h-full shrink-0">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-semibold">Chats</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Folders
        </span>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="New folder"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        {isCreatingFolder && (
          <div className="flex items-center gap-1 px-2 py-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
              placeholder="Folder name"
              className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleCreateFolder}
              className="p-0.5 rounded hover:bg-muted"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName("");
              }}
              className="p-0.5 rounded hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {groupedConversations.map(({ folder, conversations: convs }) => (
          <div key={folder.id}>
            <div
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer group"
              onClick={() => toggleFolder(folder.id)}
              onContextMenu={(e) => handleContextMenu(e, "folder", folder.id)}
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              )}
              {expandedFolders.has(folder.id) ? (
                <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              {editingFolderId === folder.id ? (
                <input
                  autoFocus
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameFolder(folder.id);
                    if (e.key === "Escape") setEditingFolderId(null);
                  }}
                  onBlur={() => handleRenameFolder(folder.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 rounded border border-input bg-background px-1 py-0.5 text-xs focus:outline-none"
                />
              ) : (
                <span className="flex-1 text-xs font-medium truncate">
                  {folder.name}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">
                {convs.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolderId(folder.id);
                  setEditingFolderName(folder.name);
                }}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            {expandedFolders.has(folder.id) && (
              <div className="ml-3">
                {convs.map((conv) => (
                  <ConversationRow
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={() => onSelectConversation(conv.id)}
                    onContextMenu={(e) =>
                      handleContextMenu(e, "conversation", conv.id)
                    }
                    getModelIcon={getModelIcon}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {ungroupedConversations.length > 0 && (
          <div className="mt-1">
            <div className="px-2 py-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Chats
              </span>
            </div>
            {ungroupedConversations.map((conv) => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConversationId}
                onSelect={() => onSelectConversation(conv.id)}
                onContextMenu={(e) =>
                  handleContextMenu(e, "conversation", conv.id)
                }
                getModelIcon={getModelIcon}
              />
            ))}
          </div>
        )}

        {filteredConversations.length === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">No conversations</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[160px] rounded-lg border border-border bg-background shadow-lg py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.type === "conversation" ? (
            <>
              <button
                onClick={() => {
                  const conv = conversations.find(
                    (c) => c.id === contextMenu.id
                  );
                  const newTitle = prompt(
                    "Rename conversation",
                    conv?.title || "New conversation"
                  );
                  if (newTitle !== null)
                    handleRenameConversation(contextMenu.id, newTitle);
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Rename
              </button>
              <div className="relative group">
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  onClick={() =>
                    setMoveMenuConvId(
                      moveMenuConvId === contextMenu.id ? null : contextMenu.id
                    )
                  }
                >
                  <FolderInput className="h-3.5 w-3.5" /> Move to...
                </button>
                {moveMenuConvId === contextMenu.id && (
                  <div className="absolute left-full top-0 ml-1 min-w-[140px] rounded-lg border border-border bg-background shadow-lg py-1">
                    <button
                      onClick={() => handleMoveConversation(contextMenu.id, null)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Ungrouped
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() =>
                          handleMoveConversation(contextMenu.id, f.id)
                        }
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        <Folder className="h-3.5 w-3.5" /> {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <hr className="my-1 border-border" />
              <button
                onClick={() => handleDeleteConversation(contextMenu.id)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 hover:bg-muted transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  const folder = folders.find((f) => f.id === contextMenu.id);
                  if (folder) {
                    setEditingFolderId(folder.id);
                    setEditingFolderName(folder.name);
                  }
                  setContextMenu(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Rename
              </button>
              <button
                onClick={() => handleDeleteFolder(contextMenu.id)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 hover:bg-muted transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ConversationRow({
  conv,
  isActive,
  onSelect,
  onContextMenu,
  getModelIcon,
}: {
  conv: ConversationItem;
  isActive: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  getModelIcon: (id: string) => string;
}) {
  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors group",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate">
        {conv.title || "New conversation"}
      </span>
      <span className="text-[10px] text-muted-foreground shrink-0">
        {getModelIcon(conv.modelId)}
      </span>
      <span className="text-[10px] text-muted-foreground shrink-0">
        {formatRelativeTime(conv.updatedAt)}
      </span>
    </div>
  );
}
