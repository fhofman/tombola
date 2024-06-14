import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: polygon,
  transport: http()
})