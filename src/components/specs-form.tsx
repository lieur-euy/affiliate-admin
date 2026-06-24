import { Input } from "@/components/ui/input"

export type SpecType = "cpu" | "gpu" | "ram" | "ssd" | "hdd"

interface SpecField {
  key: string
  label: string
  type?: "number" | "text"
}

const CPU_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "cores", label: "Cores", type: "number" },
  { key: "threads", label: "Threads", type: "number" },
  { key: "smp_cpus", label: "SMP CPUs", type: "number" },
  { key: "integrated_graphics", label: "Integrated Graphics" },
  { key: "base_clock", label: "Base Clock (GHz)", type: "number" },
  { key: "boost_clock", label: "Boost Clock (GHz)", type: "number" },
  { key: "l1_cache", label: "L1 Cache" },
  { key: "l2_cache", label: "L2 Cache" },
  { key: "l3_cache", label: "L3 Cache" },
  { key: "max_memory_size", label: "Max Memory Size (GB)", type: "number" },
  { key: "max_memory_type", label: "Max Memory Type" },
  { key: "memory_channels", label: "Memory Channels", type: "number" },
  { key: "memory_bandwidth", label: "Memory Bandwidth" },
  { key: "tdp", label: "TDP (W)", type: "number" },
  { key: "socket", label: "Socket" },
  { key: "lithography", label: "Lithography" },
  { key: "pcie_version", label: "PCIe Version" },
  { key: "multithreading", label: "Multithreading", type: "text" },
  { key: "unlocked", label: "Unlocked", type: "text" },
  { key: "ecc_support", label: "ECC Support", type: "text" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const GPU_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "chipset", label: "Chipset" },
  { key: "architecture", label: "Architecture" },
  { key: "fabrication", label: "Fabrication" },
  { key: "transistor_count", label: "Transistor Count" },
  { key: "die_size", label: "Die Size" },
  { key: "core_clock", label: "Core Clock (MHz)", type: "number" },
  { key: "boost_clock", label: "Boost Clock (MHz)", type: "number" },
  { key: "vram_size", label: "VRAM Size (GB)", type: "number" },
  { key: "vram_type", label: "VRAM Type" },
  { key: "vram_bus", label: "VRAM Bus (bit)", type: "number" },
  { key: "vram_bandwidth", label: "VRAM Bandwidth" },
  { key: "shader_units", label: "Shader Units", type: "number" },
  { key: "tmus", label: "TMUs", type: "number" },
  { key: "rops", label: "ROPs", type: "number" },
  { key: "tensor_cores", label: "Tensor Cores", type: "number" },
  { key: "rt_cores", label: "RT Cores", type: "number" },
  { key: "tdp", label: "TDP (W)", type: "number" },
  { key: "recommended_psu", label: "Recommended PSU (W)", type: "number" },
  { key: "power_connectors", label: "Power Connectors" },
  { key: "length", label: "Length (mm)", type: "number" },
  { key: "slot_width", label: "Slot Width" },
  { key: "outputs", label: "Outputs" },
  { key: "max_monitors", label: "Max Monitors", type: "number" },
  { key: "directx_support", label: "DirectX Support" },
  { key: "vulkan_support", label: "Vulkan Support", type: "text" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const RAM_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "capacity", label: "Capacity (GB)", type: "number" },
  { key: "kit_type", label: "Kit Type" },
  { key: "modules", label: "Modules", type: "number" },
  { key: "memory_type", label: "Memory Type" },
  { key: "form_factor", label: "Form Factor" },
  { key: "speed", label: "Speed (MHz)", type: "number" },
  { key: "cas_latency", label: "CAS Latency" },
  { key: "timings", label: "Timings" },
  { key: "voltage", label: "Voltage (V)", type: "number" },
  { key: "heat_spreader", label: "Heat Spreader", type: "text" },
  { key: "rgb", label: "RGB", type: "text" },
  { key: "ecc", label: "ECC", type: "text" },
  { key: "xmp_support", label: "XMP Support", type: "text" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const HDD_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "capacity", label: "Capacity", type: "number" },
  { key: "capacity_unit", label: "Capacity Unit" },
  { key: "interface", label: "Interface" },
  { key: "form_factor", label: "Form Factor" },
  { key: "rpm", label: "RPM", type: "number" },
  { key: "read_speed", label: "Read Speed (MB/s)", type: "number" },
  { key: "write_speed", label: "Write Speed (MB/s)", type: "number" },
  { key: "cache_size", label: "Cache Size (MB)", type: "number" },
  { key: "tbw", label: "TBW", type: "number" },
  { key: "mtbf", label: "MTBF (hours)", type: "number" },
  { key: "encryption", label: "Encryption" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
]

const SSD_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "capacity", label: "Capacity", type: "number" },
  { key: "capacity_unit", label: "Capacity Unit" },
  { key: "interface", label: "Interface" },
  { key: "form_factor", label: "Form Factor" },
  { key: "read_speed", label: "Read Speed (MB/s)", type: "number" },
  { key: "write_speed", label: "Write Speed (MB/s)", type: "number" },
  { key: "random_read", label: "Random Read" },
  { key: "random_write", label: "Random Write" },
  { key: "controller", label: "Controller" },
  { key: "nand_type", label: "NAND Type" },
  { key: "dram_cache", label: "DRAM Cache", type: "text" },
  { key: "tbw", label: "TBW", type: "number" },
  { key: "mtbf", label: "MTBF (hours)", type: "number" },
  { key: "trim_support", label: "TRIM Support", type: "text" },
  { key: "encryption", label: "Encryption" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
]

const FIELDS: Record<SpecType, SpecField[]> = {
  cpu: CPU_FIELDS,
  gpu: GPU_FIELDS,
  ram: RAM_FIELDS,
  ssd: SSD_FIELDS,
  hdd: HDD_FIELDS,
}

interface SpecsFormProps {
  specType: SpecType
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export function SpecsForm({ specType, data, onChange }: SpecsFormProps) {
  const fields = FIELDS[specType]

  const setVal = (key: string, raw: string, isNumber?: boolean) => {
    const val = raw === "" ? null : isNumber ? Number(raw) : raw
    onChange({ ...data, [key]: val })
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
          <Input
            type={f.type === "number" ? "number" : "text"}
            value={(data[f.key] as string | number) ?? ""}
            onChange={(e) => setVal(f.key, e.target.value, f.type === "number")}
            className="h-8 text-xs"
          />
        </div>
      ))}
    </div>
  )
}
