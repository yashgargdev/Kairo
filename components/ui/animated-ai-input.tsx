"use client";

import { ArrowUp, Bot, Check, ChevronDown, ImageIcon, Paperclip, StickyNote, GitBranch, Code2, X, FileText, FileCode, File, Loader2, AlertCircle } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { CHAT_MODELS, IMAGE_MODELS, MODEL_GROUPS, IMAGE_MODEL_GROUPS, type ModelDef } from "@/lib/api/model-config";

// ── Provider icons ─────────────────────────────────────────────────────────────
const OPENAI_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 260" className="w-3.5 h-3.5 shrink-0">
    <path fill="#fff" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
  </svg>
);

const GEMINI_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
    <defs>
      <linearGradient id="gem-g" x1="0%" x2="69%" y1="100%" y2="30%">
        <stop offset="0%" stopColor="#1C7DFF" />
        <stop offset="52%" stopColor="#1C69FF" />
        <stop offset="100%" stopColor="#F0DCD6" />
      </linearGradient>
    </defs>
    <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#gem-g)" />
  </svg>
);

const ANTHROPIC_ICON = (
  <svg fill="#d97706" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
    <path fillRule="evenodd" d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
  </svg>
);

const META_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
    <path d="M2.5 12c0-2.485 1.254-4.68 3.14-6.076C7.524 4.53 9.686 4 12 4s4.476.53 6.36 1.924C20.246 7.32 21.5 9.515 21.5 12c0 2.485-1.254 4.68-3.14 6.076C16.476 19.47 14.314 20 12 20s-4.476-.53-6.36-1.924C3.754 16.68 2.5 14.485 2.5 12Z" stroke="#1877F2" strokeWidth="1.5"/>
    <ellipse cx="12" cy="12" rx="4" ry="7.5" stroke="#1877F2" strokeWidth="1.5"/>
    <path d="M4.5 9h15M4.5 15h15" stroke="#1877F2" strokeWidth="1.5"/>
  </svg>
);

const GROQ_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#f55036" strokeWidth="1.5"/>
    <path d="M15 9.5A4 4 0 1 0 12 16v-4h3" stroke="#f55036" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SARVAM_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.4"/>
    <path d="M7 12c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 8v4l2.5 2.5" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const STABILITY_ICON = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5"/>
    <path d="M8 12h8M10 9l2-2 2 2M10 15l2 2 2-2" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GROUP_ICON: Record<string, React.ReactNode> = {
  Google:          GEMINI_ICON,
  OpenAI:          OPENAI_ICON,
  Anthropic:       ANTHROPIC_ICON,
  Meta:            META_ICON,
  Groq:            GROQ_ICON,
  'Sarvam AI':     SARVAM_ICON,
  'Stability AI':  STABILITY_ICON,
};

function getIcon(model: ModelDef) {
  return GROUP_ICON[model.group] ?? <Bot className="w-3.5 h-3.5 text-zinc-500" />;
}

// ── Hook ───────────────────────────────────────────────────────────────────────
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback((reset?: boolean) => {
    const el = textareaRef.current;
    if (!el) return;
    if (reset) { el.style.height = `${minHeight}px`; return; }
    el.style.height = `${minHeight}px`;
    el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight ?? Infinity))}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    window.addEventListener("resize", () => adjustHeight());
    return () => window.removeEventListener("resize", () => adjustHeight());
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

// ── Tools ──────────────────────────────────────────────────────────────────────
export const TOOLS = [
  { id: "code",    label: "Code",    icon: Code2,       color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20", hint: "Respond with well-formatted code blocks, specifying the language for each block." },
  { id: "image",   label: "Image",   icon: ImageIcon,   color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20",           hint: "" },
  { id: "diagram", label: "Diagram", icon: GitBranch,   color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",           hint: "" },
  { id: "notes",   label: "Notes",   icon: StickyNote,  color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",        hint: "If the response contains any tabular data, output it as a fenced csv code block." },
];

// ── File attachment helpers ────────────────────────────────────────────────────
const TEXT_EXTENSIONS = /\.(txt|md|mdx|json|jsonc|csv|tsv|xml|yaml|yml|toml|env|ini|conf|log|ts|tsx|js|jsx|mjs|cjs|py|rb|go|rs|java|c|cpp|cc|h|hpp|cs|php|swift|kt|kts|scala|r|sql|sh|bash|zsh|fish|ps1|html|htm|css|scss|sass|less|vue|svelte|astro|prisma|graphql|gql|tf|hcl|dockerfile|makefile)$/i

// Formats we can extract server-side
const EXTRACTABLE_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|xlsm|ppt|pptx)$/i

// Truly unsupported — can't extract meaningful text
const UNSUPPORTED_EXTENSIONS = /\.(zip|rar|7z|tar|gz|bz2|xz|exe|dll|so|dylib|dmg|pkg|deb|rpm|bin|iso|img|db|sqlite|sqlite3|mdb|accdb|eml|msg|ics|odt|ods|odp|pages|numbers|keynote|mp3|mp4|wav|avi|mov|mkv|flac|aac)$/i

function getFileStatus(file: File): 'text' | 'image' | 'extractable' | 'unsupported' {
  if (file.type.startsWith('image/')) return 'image'
  if (TEXT_EXTENSIONS.test(file.name) || file.type.startsWith('text/')) return 'text'
  if (EXTRACTABLE_EXTENSIONS.test(file.name)) return 'extractable'
  if (UNSUPPORTED_EXTENSIONS.test(file.name)) return 'unsupported'
  if (!file.type || file.type === 'application/octet-stream') return 'unsupported'
  return 'text'
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface Attachment {
  name: string
  content: string
  size: string
  status: 'text' | 'image' | 'extractable' | 'extracting' | 'unsupported' | 'error'
  errorMsg?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
interface AIInputProps {
  onSend: (message: string, model: string) => void;
  disabled?: boolean;
  className?: string;
  defaultModelId?: string;
}

const DEFAULT_MODEL      = CHAT_MODELS.find(m => m.id === 'claude-4-6-sonnet') ?? CHAT_MODELS[0];
const DEFAULT_IMAGE_MODEL = IMAGE_MODELS.find(m => m.id === 'dall-e-3') ?? IMAGE_MODELS[0];

export function AIInput({ onSend, disabled, className, defaultModelId }: AIInputProps) {
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelDef>(
    () => (defaultModelId ? CHAT_MODELS.find(m => m.id === defaultModelId) : null) ?? DEFAULT_MODEL
  );
  const userPickedRef = useRef(false);
  const lastChatModelRef = useRef<ModelDef>(
    (defaultModelId ? CHAT_MODELS.find(m => m.id === defaultModelId) : null) ?? DEFAULT_MODEL
  );
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 56, maxHeight: 280 });

  // Sync to settings default after localStorage hydrates, unless user manually picked
  useEffect(() => {
    if (userPickedRef.current || !defaultModelId) return;
    const model = CHAT_MODELS.find(m => m.id === defaultModelId);
    if (model) { setSelectedModel(model); lastChatModelRef.current = model; }
  }, [defaultModelId]);

  const toggleTool = (id: string) => {
    setActiveTools(prev => {
      const isActive = prev.includes(id)
      const next = isActive ? prev.filter(t => t !== id) : [...prev, id]

      if (id === 'image') {
        if (!isActive) {
          // Switching TO image mode — save current chat model, switch to image model
          if (!selectedModel.imageGen) lastChatModelRef.current = selectedModel
          setSelectedModel(DEFAULT_IMAGE_MODEL)
          userPickedRef.current = false
        } else {
          // Switching FROM image mode — restore last chat model
          setSelectedModel(lastChatModelRef.current)
          userPickedRef.current = false
        }
      }
      return next
    })
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    files.forEach(file => {
      const size = formatSize(file.size)
      const fileStatus = getFileStatus(file)

      // ── Truly unsupported (zip, exe, media, etc.) ──────────────────────────
      if (fileStatus === 'unsupported') {
        const ext = file.name.split('.').pop()?.toUpperCase() ?? 'This format'
        setAttachments(prev => [...prev, {
          name: file.name, content: '', size, status: 'unsupported',
          errorMsg: `${ext} files cannot be read by AI models. Try exporting as plain text, CSV, or JSON.`,
        }])
        return
      }

      // ── Extractable binary (PDF, DOCX, XLSX, PPTX) — call server ──────────
      if (fileStatus === 'extractable') {
        const idx = Date.now() + Math.random()
        setAttachments(prev => [...prev, {
          name: file.name, content: '', size, status: 'extracting',
        }])

        const formData = new FormData()
        formData.append('file', file)

        fetch('/api/extract', { method: 'POST', body: formData })
          .then(async res => {
            const json = await res.json()
            setAttachments(prev => prev.map(a =>
              a.name === file.name && a.status === 'extracting'
                ? json.text
                  ? { ...a, content: json.text, status: 'text' as const }
                  : { ...a, status: 'error' as const, errorMsg: json.error ?? 'Failed to extract text.' }
                : a
            ))
          })
          .catch(() => {
            setAttachments(prev => prev.map(a =>
              a.name === file.name && a.status === 'extracting'
                ? { ...a, status: 'error' as const, errorMsg: 'Network error during extraction.' }
                : a
            ))
          })
        return
      }

      // ── Regular text / image files — read locally ─────────────────────────
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        setAttachments(prev => [...prev, { name: file.name, content, size, status: fileStatus }])
      }
      if (fileStatus === 'image') {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleSend = useCallback(() => {
    const hasText = value.trim()
    const validAttachments = attachments.filter(a => a.status === 'text' && a.content)
    if ((!hasText && !validAttachments.length) || disabled) return

    // Append tool hints
    const hints = activeTools
      .map(id => TOOLS.find(t => t.id === id)?.hint)
      .filter(Boolean)
      .join(' ')

    // Append file contents (text files only — images are not yet sent to API)
    const fileContext = validAttachments
      .filter(a => a.status === 'text')
      .map(a => `\`\`\`\n// File: ${a.name}\n${a.content}\n\`\`\``)
      .join('\n\n')

    let message = hasText ? value.trim() : ''
    if (fileContext) message = message ? `${message}\n\n${fileContext}` : fileContext
    if (hints) message = `${message}\n\n[${hints}]`

    onSend(message, selectedModel.id)
    setValue("")
    setActiveTools([])
    setAttachments([])
    adjustHeight(true)
  }, [value, disabled, onSend, selectedModel, activeTools, attachments, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && (value.trim() || attachments.length) && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 focus-within:border-white/[0.14] transition-colors">
        <div className="relative flex flex-col">

          {/* Active tools pill bar */}
          <AnimatePresence>
            {activeTools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 px-3 pt-2 pb-1 flex-wrap overflow-hidden"
              >
                {activeTools.map(id => {
                  const tool = TOOLS.find(t => t.id === id);
                  if (!tool) return null;
                  return (
                    <span key={id} className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border", tool.bg, tool.color)}>
                      <tool.icon className="w-3 h-3" />{tool.label}
                    </span>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attachment pills */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 px-3 pt-2 pb-1 flex-wrap overflow-hidden"
              >
                {attachments.map((att, i) => {
                  const isError = att.status === 'unsupported' || att.status === 'error'
                  const isExtracting = att.status === 'extracting'
                  const isCode = /\.(ts|tsx|js|jsx|py|json|md|html|css|sh|sql|rs|go|java|c|cpp)$/i.test(att.name)
                  const Icon = isError ? AlertCircle : isCode ? FileCode : FileText
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col gap-1 max-w-[240px]"
                    >
                      <span className={cn(
                        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border",
                        isError      ? "border-red-500/30 bg-red-500/10 text-red-300" :
                        isExtracting ? "border-amber-500/20 bg-amber-500/5 text-amber-300" :
                                       "border-white/[0.1] bg-white/[0.05] text-zinc-300"
                      )}>
                        {isExtracting
                          ? <Loader2 className="w-3 h-3 shrink-0 text-amber-400 animate-spin" />
                          : <Icon className={cn("w-3 h-3 shrink-0", isError ? "text-red-400" : "text-zinc-400")} />
                        }
                        <span className="truncate">{att.name}</span>
                        <span className={cn("shrink-0 text-[10px]", isError ? "text-red-500" : "text-zinc-600")}>{att.size}</span>
                        {!isExtracting && (
                          <button
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                            className={cn("ml-0.5 transition-colors shrink-0", isError ? "text-red-400 hover:text-red-200" : "text-zinc-600 hover:text-zinc-300")}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                      {isExtracting && (
                        <p className="text-[10px] text-amber-500 px-1">Extracting text…</p>
                      )}
                      {isError && att.errorMsg && (
                        <p className="text-[10px] text-red-400 leading-relaxed px-1">{att.errorMsg}</p>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <div className="overflow-y-auto" style={{ maxHeight: "280px" }}>
            <Textarea
              value={value}
              placeholder="Ask anything… (Shift+Enter for new line)"
              className="w-full rounded-xl rounded-b-none px-4 py-3 bg-transparent border-none text-white placeholder:text-zinc-600 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed"
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={e => { setValue(e.target.value); adjustHeight(); }}
              disabled={disabled}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center px-2 pb-2 pt-1 gap-1">
            {/* Model selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 h-8 px-2 text-xs rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] focus-visible:ring-0 max-w-[180px]"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedModel.id}
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      transition={{ duration: 0.1 }}
                      className="flex items-center gap-1.5 min-w-0"
                    >
                      {getIcon(selectedModel)}
                      <span className="truncate">{selectedModel.label}</span>
                      <ChevronDown className="w-3 h-3 opacity-40 shrink-0" />
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-72 bg-[#111] border-white/10 text-white p-1 max-h-[420px] overflow-y-auto"
                sideOffset={8}
                align="start"
              >
                {(activeTools.includes('image') ? IMAGE_MODEL_GROUPS : MODEL_GROUPS).map((group, gi) => {
                  const list = (activeTools.includes('image') ? IMAGE_MODELS : CHAT_MODELS).filter(m => m.group === group)
                  return (
                    <div key={group}>
                      {gi > 0 && <DropdownMenuSeparator className="bg-white/[0.06] my-1" />}
                      <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        {GROUP_ICON[group]}
                        {group}
                      </DropdownMenuLabel>
                      {list.map(model => (
                        <DropdownMenuItem
                          key={model.id}
                          onSelect={() => { userPickedRef.current = true; setSelectedModel(model); }}
                          className="flex items-start justify-between gap-2 px-2 py-2 rounded-lg focus:bg-white/[0.08] focus:text-white cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-zinc-200">{model.label}</div>
                            <div className="text-[10px] text-zinc-600 mt-0.5 leading-relaxed truncate">{model.description}</div>
                          </div>
                          {selectedModel.id === model.id && (
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-white/[0.08] mx-0.5" />

            {/* Tool toggles */}
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleTool(tool.id)}
                title={`Toggle ${tool.label} tool`}
                className={cn(
                  "flex items-center gap-1 h-8 px-2 text-xs rounded-lg border transition-all duration-150",
                  activeTools.includes(tool.id)
                    ? cn(tool.bg, tool.color)
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
                )}
              >
                <tool.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tool.label}</span>
              </button>
            ))}

            <div className="h-4 w-px bg-white/[0.08] mx-0.5" />

            {/* File attachment */}
            <label className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] cursor-pointer transition-colors" title="Attach file">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="*/*"
                onChange={handleFileChange}
              />
              <Paperclip className={cn("w-3.5 h-3.5", attachments.length > 0 && "text-amber-400")} />
            </label>

            {/* Send */}
            <button
              type="button"
              onClick={handleSend}
              disabled={(!value.trim() && !attachments.some(a => a.status === 'text' && a.content)) || attachments.some(a => a.status === 'extracting') || disabled}
              className={cn(
                "ml-auto flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
                (value.trim() || attachments.some(a => a.status === 'text' && a.content)) && !attachments.some(a => a.status === 'extracting') && !disabled
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-white/[0.06] text-zinc-600 cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-zinc-700 mt-2 font-mono">
        Shift+Enter for new line · Your keys never leave your browser
      </p>
    </div>
  );
}
