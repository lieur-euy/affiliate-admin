import { useState, useRef } from "react"
import { ChevronDown } from "lucide-react"

interface Option { value: string; label: string }

interface SearchableSelectProps {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: Option[]
  className?: string
}

export function SearchableSelect({ value, onChange, placeholder, options, className }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <div onClick={() => setOpen(!open)}
        className="flex h-9 w-full cursor-pointer items-center gap-1 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs">
        <span className="flex-1 truncate">{selected?.label || placeholder}</span>
        <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-56 rounded-lg border bg-popover p-1 shadow-md">
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder} className="mb-1 w-full rounded-md border-b px-2 py-1.5 text-xs outline-none" />
            <div className="max-h-48 overflow-y-auto">
              <div onClick={() => { onChange(""); setOpen(false); setSearch("") }}
                className="cursor-pointer rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted">
                {placeholder}
              </div>
              {filtered.map(o => (
                <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); setSearch("") }}
                  className={`cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-muted ${value === o.value ? "bg-primary/10 font-medium" : ""}`}>
                  {o.label}
                </div>
              ))}
              {filtered.length === 0 && <div className="px-2 py-3 text-center text-xs text-muted-foreground">Not found</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
