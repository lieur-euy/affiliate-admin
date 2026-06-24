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

export interface SpecGPU {
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
}

export interface ProductSpecs {
  cpu?: SpecCPU | null
  gpu?: SpecGPU | null
  ram?: SpecRAM | null
  ssd?: SpecSSD | null
  hdd?: SpecHDD | null
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
