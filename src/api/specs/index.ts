import { api } from "@/api/client"

export interface SpecCPU {
  brand?: string | null
  model?: string | null
  cores?: number | null
  threads?: number | null
  smp_cpus?: number | null
  integrated_graphics?: string | null
  base_clock?: number | null
  boost_clock?: number | null
  l1_cache?: string | null
  l2_cache?: string | null
  l3_cache?: string | null
  max_memory_size?: number | null
  max_memory_type?: string | null
  memory_channels?: number | null
  memory_bandwidth?: string | null
  tdp?: number | null
  socket?: string | null
  lithography?: string | null
  pcie_version?: string | null
  multithreading?: boolean | null
  unlocked?: boolean | null
  ecc_support?: boolean | null
  release_date?: string | null
  launch_price?: number | null
}

export interface SpecVGA {
  brand?: string | null
  model?: string | null
  chipset?: string | null
  architecture?: string | null
  fabrication?: string | null
  transistor_count?: string | null
  die_size?: string | null
  core_clock?: number | null
  boost_clock?: number | null
  vram_size?: number | null
  vram_type?: string | null
  vram_bus?: number | null
  vram_bandwidth?: string | null
  shader_units?: number | null
  tmus?: number | null
  rops?: number | null
  tensor_cores?: number | null
  rt_cores?: number | null
  pixel_rate?: string | null
  texture_rate?: string | null
  fp32_performance?: string | null
  tdp?: number | null
  recommended_psu?: number | null
  power_connectors?: string | null
  length?: number | null
  width?: number | null
  height?: number | null
  slot_width?: number | null
  outputs?: string | null
  max_monitors?: number | null
  directx_support?: string | null
  vulkan_support?: boolean | null
  opengl_support?: string | null
  release_date?: string | null
  launch_price?: number | null
}

export interface SpecRAM {
  brand?: string | null
  model?: string | null
  capacity?: number | null
  kit_type?: string | null
  modules?: number | null
  memory_type?: string | null
  form_factor?: string | null
  speed?: number | null
  cas_latency?: string | null
  timings?: string | null
  voltage?: number | null
  height?: number | null
  heat_spreader?: boolean | null
  rgb?: boolean | null
  ecc?: boolean | null
  registered?: boolean | null
  xmp_support?: boolean | null
  dual_rank?: boolean | null
  release_date?: string | null
  launch_price?: number | null
}

export interface SpecSSD {
  brand?: string | null
  model?: string | null
  capacity?: number | null
  capacity_unit?: string | null
  interface?: string | null
  form_factor?: string | null
  read_speed?: number | null
  write_speed?: number | null
  random_read?: string | null
  random_write?: string | null
  controller?: string | null
  nand_type?: string | null
  dram_cache?: boolean | null
  lithography?: string | null
  tbw?: number | null
  mtbf?: number | null
  dwpd?: number | null
  power_idle?: number | null
  power_active?: number | null
  weight?: number | null
  max_operating_temp?: number | null
  nvme_mi?: boolean | null
  s_mart_health?: boolean | null
  trim_support?: boolean | null
  encryption?: string | null
  release_date?: string | null
  warranty?: number | null
}

export interface SpecHDD {
  brand?: string | null
  model?: string | null
  capacity?: number | null
  capacity_unit?: string | null
  interface?: string | null
  form_factor?: string | null
  rpm?: number | null
  read_speed?: number | null
  write_speed?: number | null
  cache_size?: number | null
  tbw?: number | null
  mtbf?: number | null
  power_idle?: number | null
  power_active?: number | null
  weight?: number | null
  max_operating_temp?: number | null
  encryption?: string | null
  release_date?: string | null
  warranty?: number | null
  launch_price?: number | null
}

export interface SpecPSU {
  brand?: string | null
  model?: string | null
  wattage?: number | null
  certification?: string | null
  modular_type?: string | null
  form_factor?: string | null
  fan_size?: number | null
  pcie_6_2pin?: number | null
  sata_connectors?: number | null
  cpu_connector?: string | null
  mb_connector?: string | null
  protection?: string | null
  rgb?: boolean | null
  fanless_mode?: boolean | null
  efficiency_rating?: string | null
  pfc_type?: string | null
  dimensions?: string | null
  weight?: number | null
  warranty?: number | null
  release_date?: string | null
  launch_price?: number | null
}

export interface SpecMotherboard {
  brand?: string | null
  model?: string | null
  socket?: string | null
  chipset?: string | null
  form_factor?: string | null
  memory_type?: string | null
  memory_slots?: number | null
  max_memory?: number | null
  memory_speed?: string | null
  pcie_slots?: string | null
  m2_slots?: number | null
  sata_ports?: number | null
  lan?: string | null
  wifi?: string | null
  bluetooth?: string | null
  audio_chipset?: string | null
  usb_ports?: string | null
  video_outputs?: string | null
  ram_channel?: string | null
  bios_type?: string | null
  sli_crossfire?: boolean | null
  rgb?: boolean | null
  pcie_version?: string | null
  warranty?: number | null
  release_date?: string | null
  launch_price?: number | null
}

export interface SpecCooler {
  brand?: string | null
  model?: string | null
  cooler_type?: string | null
  radiator_size?: number | null
  fan_size?: number | null
  fan_count?: number | null
  max_fan_speed?: number | null
  max_airflow?: string | null
  max_noise?: string | null
  tdp?: number | null
  height?: number | null
  socket_compatibility?: string | null
  material?: string | null
  heat_pipes?: number | null
  rgb?: boolean | null
  pump_speed?: string | null
  dimensions?: string | null
  weight?: number | null
  warranty?: number | null
  release_date?: string | null
  launch_price?: number | null
}

export interface SpecCasing {
  brand?: string | null
  model?: string | null
  type?: string | null
  motherboard_support?: string | null
  material?: string | null
  side_panel?: string | null
  drive_bays_35?: number | null
  drive_bays_25?: number | null
  expansion_slots?: number | null
  max_gpu_length?: number | null
  max_cpu_cooler_height?: number | null
  max_psu_length?: number | null
  fan_slots?: string | null
  included_fans?: string | null
  radiator_support?: string | null
  front_io?: string | null
  psu_shroud?: boolean | null
  dust_filters?: boolean | null
  cable_management?: boolean | null
  dimensions?: string | null
  weight?: number | null
  rgb?: boolean | null
  warranty?: number | null
  release_date?: string | null
  launch_price?: number | null
}

export interface SpecMonitor {
  brand?: string | null
  model?: string | null
  screen_size?: number | null
  resolution?: string | null
  panel_type?: string | null
  refresh_rate?: number | null
  response_time?: number | null
  aspect_ratio?: string | null
  brightness?: number | null
  contrast_ratio?: string | null
  hdr?: string | null
  color_gamut?: string | null
  color_depth?: string | null
  viewing_angle?: string | null
  adaptive_sync?: string | null
  curvature?: string | null
  built_in_speakers?: boolean | null
  vesa_mount?: string | null
  connectivity?: string | null
  usb_hub?: boolean | null
  power_consumption?: number | null
  height_adjustable?: boolean | null
  swivel?: boolean | null
  tilt?: boolean | null
  pivot?: boolean | null
  dimensions?: string | null
  weight?: number | null
  warranty?: number | null
  release_date?: string | null
  launch_price?: number | null
}

export interface ProductSpecs {
  cpu?: SpecCPU | null
  vga?: SpecVGA | null
  ram?: SpecRAM | null
  ssd?: SpecSSD | null
  hdd?: SpecHDD | null
  psu?: SpecPSU | null
  motherboard?: SpecMotherboard | null
  cooler?: SpecCooler | null
  casing?: SpecCasing | null
  monitor?: SpecMonitor | null
}

interface SpecResponse {
  spec_type: string
  data: Record<string, unknown> | null
}

export const specApi = {
  async getByProductId(productId: string): Promise<ProductSpecs> {
    const res = await api.request<SpecResponse>(`/products/${productId}/specs`)
    if (!res || !res.spec_type || !res.data) return {}
    return { [res.spec_type]: res.data }
  },

  upsert(productId: string, data: ProductSpecs) {
    const keys = Object.keys(data) as (keyof ProductSpecs)[]
    const specType = keys[0]
    const body = specType && data[specType] ? data[specType] : data
    return api.request<ProductSpecs>(`/products/${productId}/specs`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  },
}
