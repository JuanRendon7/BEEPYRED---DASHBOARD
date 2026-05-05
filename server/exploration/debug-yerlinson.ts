/**
 * Debug script: Yerlinson Maturana invoice structure
 * Run: cd server && npx tsx exploration/debug-yerlinson.ts
 */
import 'dotenv/config'
import axios from 'axios'

const token = process.env.WISPHUB_TOKEN
const baseURL = process.env.WISPHUB_BASE_URL

if (!token || !baseURL) {
  console.error('ERROR: Set WISPHUB_TOKEN and WISPHUB_BASE_URL in server/.env')
  process.exit(1)
}

const client = axios.create({
  baseURL,
  headers: { 'Authorization': `Api-Key ${token}`, 'Content-Type': 'application/json' },
  timeout: 15_000,
})

async function fetchAll<T>(endpoint: string, params = {}): Promise<T[]> {
  const all: T[] = []
  let offset = 0
  while (true) {
    const r = await client.get(endpoint, { params: { ...params, limit: 300, offset } })
    all.push(...r.data.results)
    if (!r.data.next) break
    offset += 300
  }
  return all
}

async function run() {
  // ── 1. Buscar cliente por nombre ──
  console.log('\n[1] Buscando "Yerlinson" en /api/clientes/')
  const clientes = await fetchAll<any>('/api/clientes/')
  const match = clientes.filter(c =>
    (c.nombre ?? '').toLowerCase().includes('yerlinson')
  )
  console.log(`  Total clientes: ${clientes.length}`)
  console.log(`  Matches: ${match.length}`)
  for (const c of match) {
    console.log(`  → id_servicio=${c.id_servicio}, nombre="${c.nombre}", estado="${c.estado}", estado_facturas="${c.estado_facturas}"`)
    console.log('    Campos del cliente:', Object.keys(c).join(', '))
  }

  if (match.length === 0) {
    console.log('  No se encontró el cliente. Revisa el nombre.')
    process.exit(0)
  }

  const clienteIds = match.map(c => c.id_servicio)

  // ── 2. Buscar todas las facturas y filtrar por cliente ──
  console.log('\n[2] Cargando todas las facturas (/api/facturas/)...')
  const facturas = await fetchAll<any>('/api/facturas/')
  console.log(`  Total facturas: ${facturas.length}`)

  // Estados únicos de facturas (para entender el modelo de datos)
  const estados = [...new Set(facturas.map((f: any) => f.estado))]
  console.log(`  Estados únicos de facturas: ${JSON.stringify(estados)}`)

  // Facturas del cliente
  const facturasCliente = facturas.filter((f: any) => {
    const idServicio = f.articulos?.[0]?.servicio?.id_servicio
    return clienteIds.includes(idServicio)
  })

  console.log(`\n[3] Facturas de Yerlinson (por articulos[0].servicio.id_servicio): ${facturasCliente.length}`)

  if (facturasCliente.length === 0) {
    // Buscar por otros campos posibles
    console.log('\n  ⚠️  No encontrado por articulos[0].servicio.id_servicio')
    console.log('  Revisando estructura de articulos en muestra de 3 facturas...')
    for (const f of facturas.slice(0, 3)) {
      console.log('\n  Factura id:', f.id)
      console.log('  estado:', f.estado)
      console.log('  saldo:', f.saldo)
      console.log('  total_cobrado:', f.total_cobrado)
      console.log('  articulos (primero):', JSON.stringify(f.articulos?.[0], null, 2))
    }

    // Intentar buscar por cliente directo
    console.log('\n[4] Buscando facturas del cliente vía /api/facturas/?cliente=<id>...')
    for (const id of clienteIds) {
      try {
        const r = await client.get('/api/facturas/', { params: { cliente: id, limit: 10 } })
        console.log(`  ?cliente=${id}: count=${r.data.count}`)
        for (const f of r.data.results.slice(0, 5)) {
          console.log(`    → id=${f.id}, estado="${f.estado}", saldo=${f.saldo}, total_cobrado=${f.total_cobrado}`)
          console.log(`      articulos[0]:`, JSON.stringify(f.articulos?.[0], null, 2))
        }
      } catch (e: any) {
        console.log(`  ?cliente=${id}: ERROR ${e.response?.status}`)
      }
    }

    // Intentar por id_servicio
    for (const id of clienteIds) {
      try {
        const r = await client.get('/api/facturas/', { params: { id_servicio: id, limit: 10 } })
        console.log(`  ?id_servicio=${id}: count=${r.data.count}`)
      } catch (e: any) {
        console.log(`  ?id_servicio=${id}: ERROR ${e.response?.status}`)
      }
    }

  } else {
    for (const f of facturasCliente) {
      console.log(`\n  Factura id=${f.id}`)
      console.log(`    estado:         "${f.estado}"`)
      console.log(`    saldo:          ${f.saldo}`)
      console.log(`    total_cobrado:  ${f.total_cobrado}`)
      console.log(`    articulos[0]:`, JSON.stringify(f.articulos?.[0], null, 2))
    }
  }

  // ── 5. Muestra estructura completa de 1 factura "Pendiente de Pago" ──
  const pendiente = facturas.find((f: any) => f.estado === 'Pendiente de Pago')
  if (pendiente) {
    console.log('\n[5] Factura "Pendiente de Pago" de muestra (estructura completa):')
    console.log(JSON.stringify(pendiente, null, 2))
  }

  // ── 6. Muestra estructura completa de 1 factura "Vencido" (si existe) ──
  const vencida = facturas.find((f: any) => f.estado === 'Vencido' || f.estado === 'Vencida')
  if (vencida) {
    console.log('\n[6] Factura "Vencido/a" de muestra (estructura completa):')
    console.log(JSON.stringify(vencida, null, 2))
  } else {
    console.log('\n[6] No se encontraron facturas con estado "Vencido" o "Vencida"')
  }
}

run().catch(console.error)
