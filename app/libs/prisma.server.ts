import { PrismaClient } from '@prisma/client'

import { singleton } from '~/utils'

const prisma = singleton('prisma', () => {
  const logThreshold = 0
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' }
    ]
  })

  client.$on('query', async e => {
    if (e.duration < logThreshold) return

    console.info(`prisma:query - ${e.duration}ms - ${e.query}`)
  })

  client.$connect()

  return client
})

export { prisma }
