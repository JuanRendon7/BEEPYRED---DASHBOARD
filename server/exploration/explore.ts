/**
 * Wisphub API Exploration Script
 * Run: cd server && npx tsx exploration/explore.ts
 * Purpose: Capture real API response shapes before writing Zod schemas (per D-18, D-19)
 *
 * BEFORE RUNNING: Ensure server/.env exists with WISPHUB_TOKEN and WISPHUB_BASE_URL set.
 */
import 'dotenv/config'
import axios from 'axios'

const token = process.env.WISPHUB_TOKEN
const baseURL = process.env.WISPHUB_BASE_URL

if (!token || !baseURL) {
  console.error('ERROR: Set WISPHUB_TOKEN and WISPHUB_BASE_URL in server/.env before running')
  process.exit(1)
}

const client = axios.create({
  baseURL,
  headers: {
    'Authorization': `Api-Key ${token}`,
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

async function explore() {
  console.log('='.repeat(60))
  console.log(`Wisphub Exploration — Base URL: ${baseURL}`)
  console.log('='.repeat(60))

  // ── Endpoint 1: Active clients (limited to 1 page, limit=5 for readability) ──
  console.log('\n\n[1] GET /api/clientes/?estado=Activo&limit=5')
  console.log('-'.repeat(60))
  try {
    const r = await client.get('/api/clientes/', { params: { estado: 'Activo', limit: 5 } })
    console.log('Status:', r.status)
    console.log('Response keys:', Object.keys(r.data))
    console.log('Full response:')
    console.log(JSON.stringify(r.data, null, 2))
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('ERROR:', err.response?.status, err.response?.data ?? err.message)
    } else {
      console.error('ERROR:', err)
    }
  }

  // ── Endpoint 2: All clients (no filter) — check pagination structure ──
  console.log('\n\n[2] GET /api/clientes/?limit=5 (no estado filter)')
  console.log('-'.repeat(60))
  try {
    const r = await client.get('/api/clientes/', { params: { limit: 5 } })
    console.log('Status:', r.status)
    console.log('Response keys:', Object.keys(r.data))
    console.log('count:', r.data.count)
    console.log('next:', r.data.next)
    console.log('First result keys:', r.data.results?.[0] ? Object.keys(r.data.results[0]) : 'no results')
    console.log('First result:')
    console.log(JSON.stringify(r.data.results?.[0], null, 2))
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('ERROR:', err.response?.status, err.response?.data ?? err.message)
    } else {
      console.error('ERROR:', err)
    }
  }

  // ── Endpoint 3: Invoices/facturas endpoint ──
  console.log('\n\n[3] GET /api/facturas/?limit=5 (invoice list)')
  console.log('-'.repeat(60))
  try {
    const r = await client.get('/api/facturas/', { params: { limit: 5 } })
    console.log('Status:', r.status)
    console.log('Response keys:', Object.keys(r.data))
    console.log('First result keys:', r.data.results?.[0] ? Object.keys(r.data.results[0]) : 'no results')
    console.log('First result:')
    console.log(JSON.stringify(r.data.results?.[0], null, 2))
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('ERROR:', err.response?.status, err.response?.data ?? err.message)
    } else {
      console.error('ERROR:', err)
    }
  }

  // ── Endpoint 4: Try POST /api/facturas/ (research flagged HTTP method uncertainty) ──
  console.log('\n\n[4] POST /api/facturas/?limit=5 (testing if POST is required)')
  console.log('-'.repeat(60))
  try {
    const r = await client.post('/api/facturas/', {}, { params: { limit: 5 } })
    console.log('Status:', r.status)
    console.log('First result keys:', r.data.results?.[0] ? Object.keys(r.data.results[0]) : 'no results')
    console.log('First result:')
    console.log(JSON.stringify(r.data.results?.[0], null, 2))
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('POST attempt — Status:', err.response?.status, 'Data:', JSON.stringify(err.response?.data))
    } else {
      console.error('ERROR:', err)
    }
  }

  // ── Endpoint 5: Try connected/online filter (MET-02 gap investigation) ──
  console.log('\n\n[5] GET /api/clientes/?estado=Conectado (MET-02: connected clients investigation)')
  console.log('-'.repeat(60))
  try {
    const r = await client.get('/api/clientes/', { params: { estado: 'Conectado', limit: 5 } })
    console.log('Status:', r.status, '— "Conectado" filter worked')
    console.log('count:', r.data.count)
    console.log('Response:')
    console.log(JSON.stringify(r.data, null, 2))
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Conectado filter failed — Status:', err.response?.status)
    } else {
      console.error('ERROR:', err)
    }
  }

  // ── Endpoint 6: Try /api/clientes/?online=true (alternative MET-02 approach) ──
  console.log('\n\n[6] GET /api/clientes/?online=true (MET-02: alternative connected filter)')
  console.log('-'.repeat(60))
  try {
    const r = await client.get('/api/clientes/', { params: { online: 'true', limit: 5 } })
    console.log('Status:', r.status, '— online=true filter accepted')
    console.log('count:', r.data.count)
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('online=true filter — Status:', err.response?.status, JSON.stringify(err.response?.data))
    } else {
      console.error('ERROR:', err)
    }
  }

  // ── Endpoint 7: Single client balance (if any client ID found above) ──
  console.log('\n\n[7] GET /api/clientes/{id}/saldo/ (balance for first found client)')
  console.log('-'.repeat(60))
  try {
    const listResponse = await client.get('/api/clientes/', { params: { limit: 1 } })
    const firstClient = listResponse.data.results?.[0]
    if (firstClient) {
      const clientId = firstClient.id_servicio ?? firstClient.id
      console.log(`Using client ID: ${clientId} (field: ${firstClient.id_servicio !== undefined ? 'id_servicio' : 'id'})`)
      const r = await client.get(`/api/clientes/${clientId}/saldo/`)
      console.log('Status:', r.status)
      console.log('Response keys:', Object.keys(r.data))
      console.log('Full response:')
      console.log(JSON.stringify(r.data, null, 2))
    } else {
      console.log('No clients found — skipping saldo endpoint test')
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('ERROR:', err.response?.status, JSON.stringify(err.response?.data))
    } else {
      console.error('ERROR:', err)
    }
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('Exploration complete. Copy output above into server/exploration/01-raw-responses.md')
  console.log('='.repeat(60))
}

explore().catch(console.error)
