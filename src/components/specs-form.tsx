import { Input } from "@/components/ui/input"

export type SpecType = "cpu" | "vga" | "ram" | "ssd" | "hdd" | "psu" | "motherboard" | "cooler" | "casing" | "monitor"

interface SpecField {
  key: string
  label: string
  type?: "number" | "text"
}

const CPU_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "family", label: "Family (Alder Lake / Zen 5 / ...)" },
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
  { key: "pcie_lanes", label: "PCIe Lanes", type: "number" },
  { key: "max_temp", label: "Max Temp (°C)", type: "number" },
  { key: "cpu_mark", label: "CPU Mark", type: "number" },
  { key: "instruction_set", label: "Instruction Set (SSE4/AVX2/AVX-512...)" },
  { key: "bus_speed", label: "Bus Speed" },
  { key: "package_type", label: "Package Type" },
  { key: "max_memory_speed", label: "Max Memory Speed" },
  { key: "multithreading", label: "Multithreading", type: "text" },
  { key: "unlocked", label: "Unlocked", type: "text" },
  { key: "ecc_support", label: "ECC Support", type: "text" },
  { key: "usage", label: "Usage (Desktop/Laptop/Server...)" },
  { key: "release_date", label: "Release Date" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const VGA_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand (NVIDIA/AMD)" },
  { key: "vendor", label: "Vendor (ASUS/MSI/Gigabyte...)" },
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
  { key: "pixel_rate", label: "Pixel Rate" },
  { key: "texture_rate", label: "Texture Rate" },
  { key: "fp32_performance", label: "FP32 Performance" },
  { key: "tdp", label: "TDP (W)", type: "number" },
  { key: "recommended_psu", label: "Recommended PSU (W)", type: "number" },
  { key: "power_connectors", label: "Power Connectors" },
  { key: "length", label: "Length (mm)", type: "number" },
  { key: "width", label: "Width (mm)", type: "number" },
  { key: "height", label: "Height (mm)", type: "number" },
  { key: "slot_width", label: "Slot Width" },
  { key: "outputs", label: "Outputs" },
  { key: "max_monitors", label: "Max Monitors", type: "number" },
  { key: "directx_support", label: "DirectX Support" },
  { key: "vulkan_support", label: "Vulkan Support", type: "text" },
  { key: "opengl_support", label: "OpenGL Support" },
  { key: "cooling", label: "Cooling (Active/Blower/AIO...)" },
  { key: "multi_gpu", label: "Multi-GPU (SLI/CrossFire)" },
  { key: "bus_interface", label: "Bus Interface (PCIe 4.0 x16)" },
  { key: "hdmi_version", label: "HDMI Version" },
  { key: "dp_version", label: "DisplayPort Version" },
  { key: "cuda_cores", label: "CUDA Cores", type: "number" },
  { key: "rgb", label: "RGB", type: "text" },
  { key: "release_date", label: "Release Date" },
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
  { key: "height", label: "Height (mm)", type: "number" },
  { key: "heat_spreader", label: "Heat Spreader", type: "text" },
  { key: "rgb", label: "RGB", type: "text" },
  { key: "ecc", label: "ECC", type: "text" },
  { key: "registered", label: "Registered", type: "text" },
  { key: "xmp_support", label: "XMP Support", type: "text" },
  { key: "dual_rank", label: "Dual Rank", type: "text" },
  { key: "release_date", label: "Release Date" },
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
  { key: "power_idle", label: "Power Idle (W)", type: "number" },
  { key: "power_active", label: "Power Active (W)", type: "number" },
  { key: "weight", label: "Weight (g)", type: "number" },
  { key: "max_operating_temp", label: "Max Operating Temp (°C)", type: "number" },
  { key: "encryption", label: "Encryption" },
  { key: "release_date", label: "Release Date" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const SSD_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "capacity", label: "Capacity", type: "number" },
  { key: "capacity_unit", label: "Capacity Unit" },
  { key: "interface", label: "Interface" },
  { key: "pcie_gen", label: "PCIe Gen (3.0/4.0/5.0)" },
  { key: "form_factor", label: "Form Factor" },
  { key: "read_speed", label: "Read Speed (MB/s)", type: "number" },
  { key: "write_speed", label: "Write Speed (MB/s)", type: "number" },
  { key: "random_read", label: "Random Read" },
  { key: "random_write", label: "Random Write" },
  { key: "controller", label: "Controller" },
  { key: "nand_type", label: "NAND Type" },
  { key: "dram_cache", label: "DRAM Cache", type: "text" },
  { key: "lithography", label: "Lithography" },
  { key: "tbw", label: "TBW", type: "number" },
  { key: "mtbf", label: "MTBF (hours)", type: "number" },
  { key: "dwpd", label: "DWPD", type: "number" },
  { key: "power_idle", label: "Power Idle (W)", type: "number" },
  { key: "power_active", label: "Power Active (W)", type: "number" },
  { key: "weight", label: "Weight (g)", type: "number" },
  { key: "max_operating_temp", label: "Max Operating Temp (°C)", type: "number" },
  { key: "nvme_mi", label: "NVMe-MI", type: "text" },
  { key: "s_mart_health", label: "S.M.A.R.T Health", type: "text" },
  { key: "trim_support", label: "TRIM Support", type: "text" },
  { key: "encryption", label: "Encryption" },
  { key: "release_date", label: "Release Date" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
]

const PSU_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "wattage", label: "Wattage (W)", type: "number" },
  { key: "certification", label: "Certification (80 Plus)" },
  { key: "modular_type", label: "Modular Type" },
  { key: "form_factor", label: "Form Factor" },
  { key: "fan_size", label: "Fan Size (mm)", type: "number" },
  { key: "pcie_6_2pin", label: "PCIe 6+2-pin", type: "number" },
  { key: "sata_connectors", label: "SATA Connectors", type: "number" },
  { key: "cpu_connector", label: "CPU Connector" },
  { key: "mb_connector", label: "MB Connector" },
  { key: "protection", label: "Protection" },
  { key: "rgb", label: "RGB", type: "text" },
  { key: "fanless_mode", label: "Fanless Mode", type: "text" },
  { key: "efficiency_rating", label: "Efficiency Rating" },
  { key: "pfc_type", label: "PFC Type" },
  { key: "atx_version", label: "ATX Version (2.4/3.0/3.1)" },
  { key: "dimensions", label: "Dimensions (mm)" },
  { key: "weight", label: "Weight (kg)", type: "number" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
  { key: "release_date", label: "Release Date" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const MOTHERBOARD_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "socket", label: "Socket" },
  { key: "chipset", label: "Chipset" },
  { key: "form_factor", label: "Form Factor" },
  { key: "memory_type", label: "Memory Type" },
  { key: "memory_slots", label: "Memory Slots", type: "number" },
  { key: "max_memory", label: "Max Memory (GB)", type: "number" },
  { key: "memory_speed", label: "Memory Speed" },
  { key: "pcie_slots", label: "PCIe Slots" },
  { key: "m2_slots", label: "M.2 Slots", type: "number" },
  { key: "sata_ports", label: "SATA Ports", type: "number" },
  { key: "lan", label: "LAN" },
  { key: "wifi", label: "WiFi" },
  { key: "bluetooth", label: "Bluetooth" },
  { key: "audio_chipset", label: "Audio Chipset" },
  { key: "usb_ports", label: "USB Ports" },
  { key: "video_outputs", label: "Video Outputs" },
  { key: "ram_channel", label: "RAM Channel" },
  { key: "bios_type", label: "BIOS Type" },
  { key: "sli_crossfire", label: "SLI/CrossFire", type: "text" },
  { key: "rgb", label: "RGB", type: "text" },
  { key: "pcie_version", label: "PCIe Version" },
  { key: "cpu_support", label: "CPU Support" },
  { key: "raid_support", label: "RAID Support" },
  { key: "audio_channels", label: "Audio Channels", type: "number" },
  { key: "ethernet_speed", label: "Ethernet Speed" },
  { key: "hdmi_ports", label: "HDMI Ports", type: "number" },
  { key: "dp_ports", label: "DP Ports", type: "number" },
  { key: "usb_c_ports", label: "USB-C Ports", type: "number" },
  { key: "back_panel_io", label: "Back Panel I/O" },
  { key: "internal_connectors", label: "Internal Connectors" },
  { key: "bios_features", label: "BIOS Features" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
  { key: "release_date", label: "Release Date" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const COOLER_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "cooler_type", label: "Type (Air/AIO)" },
  { key: "radiator_size", label: "Radiator Size (mm)", type: "number" },
  { key: "fan_size", label: "Fan Size (mm)", type: "number" },
  { key: "fan_count", label: "Fan Count", type: "number" },
  { key: "max_fan_speed", label: "Max Fan Speed (RPM)", type: "number" },
  { key: "max_airflow", label: "Max Airflow (CFM)" },
  { key: "max_noise", label: "Max Noise (dBA)" },
  { key: "tdp", label: "TDP (W)", type: "number" },
  { key: "height", label: "Height (mm)", type: "number" },
  { key: "socket_compatibility", label: "Socket Compatibility" },
  { key: "material", label: "Material" },
  { key: "heat_pipes", label: "Heat Pipes", type: "number" },
  { key: "rgb", label: "RGB", type: "text" },
  { key: "pump_speed", label: "Pump Speed (RPM)" },
  { key: "dimensions", label: "Dimensions (mm)" },
  { key: "weight", label: "Weight (g)", type: "number" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
  { key: "release_date", label: "Release Date" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const CASING_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "type", label: "Type (Mid/Full Tower)" },
  { key: "motherboard_support", label: "Motherboard Support" },
  { key: "material", label: "Material" },
  { key: "side_panel", label: "Side Panel" },
  { key: "drive_bays_35", label: "3.5\" Bays", type: "number" },
  { key: "drive_bays_25", label: "2.5\" Bays", type: "number" },
  { key: "expansion_slots", label: "Expansion Slots", type: "number" },
  { key: "max_gpu_length", label: "Max GPU Length (mm)", type: "number" },
  { key: "max_cpu_cooler_height", label: "Max Cooler Height (mm)", type: "number" },
  { key: "max_psu_length", label: "Max PSU Length (mm)", type: "number" },
  { key: "fan_slots", label: "Fan Slots" },
  { key: "included_fans", label: "Included Fans" },
  { key: "radiator_support", label: "Radiator Support" },
  { key: "front_io", label: "Front I/O" },
  { key: "psu_shroud", label: "PSU Shroud", type: "text" },
  { key: "dust_filters", label: "Dust Filters", type: "text" },
  { key: "cable_management", label: "Cable Management", type: "text" },
  { key: "dimensions", label: "Dimensions (mm)" },
  { key: "weight", label: "Weight (kg)", type: "number" },
  { key: "rgb", label: "RGB", type: "text" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
  { key: "release_date", label: "Release Date" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const MONITOR_FIELDS: SpecField[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "screen_size", label: "Screen Size (inch)", type: "number" },
  { key: "resolution", label: "Resolution" },
  { key: "panel_type", label: "Panel Type" },
  { key: "refresh_rate", label: "Refresh Rate (Hz)", type: "number" },
  { key: "response_time", label: "Response Time (ms)", type: "number" },
  { key: "aspect_ratio", label: "Aspect Ratio" },
  { key: "brightness", label: "Brightness (cd/m²)", type: "number" },
  { key: "contrast_ratio", label: "Contrast Ratio" },
  { key: "hdr", label: "HDR" },
  { key: "color_gamut", label: "Color Gamut" },
  { key: "color_depth", label: "Color Depth" },
  { key: "viewing_angle", label: "Viewing Angle" },
  { key: "adaptive_sync", label: "Adaptive Sync" },
  { key: "curvature", label: "Curvature" },
  { key: "built_in_speakers", label: "Built-in Speakers", type: "text" },
  { key: "vesa_mount", label: "VESA Mount" },
  { key: "connectivity", label: "Connectivity" },
  { key: "usb_hub", label: "USB Hub", type: "text" },
  { key: "power_consumption", label: "Power Consumption (W)", type: "number" },
  { key: "height_adjustable", label: "Height Adjustable", type: "text" },
  { key: "swivel", label: "Swivel", type: "text" },
  { key: "tilt", label: "Tilt", type: "text" },
  { key: "pivot", label: "Pivot", type: "text" },
  { key: "dimensions", label: "Dimensions (mm)" },
  { key: "weight", label: "Weight (kg)", type: "number" },
  { key: "warranty", label: "Warranty (years)", type: "number" },
  { key: "release_date", label: "Release Date" },
  { key: "launch_price", label: "Launch Price ($)", type: "number" },
]

const FIELDS: Record<SpecType, SpecField[]> = {
  cpu: CPU_FIELDS,
  vga: VGA_FIELDS,
  ram: RAM_FIELDS,
  ssd: SSD_FIELDS,
  hdd: HDD_FIELDS,
  psu: PSU_FIELDS,
  motherboard: MOTHERBOARD_FIELDS,
  cooler: COOLER_FIELDS,
  casing: CASING_FIELDS,
  monitor: MONITOR_FIELDS,
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
