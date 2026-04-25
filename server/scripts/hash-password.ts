/**
 * Utility to generate bcrypt hashes for AUTH_USERS env var.
 * Usage: npx tsx scripts/hash-password.ts <password>
 */
import bcrypt from 'bcryptjs'

async function main() {
  const password = process.argv[2]
  if (!password) {
    console.error('Usage: npx tsx scripts/hash-password.ts <password>')
    process.exit(1)
  }
  const hash = await bcrypt.hash(password, 10)
  console.log(hash)
}

main().catch(console.error)
