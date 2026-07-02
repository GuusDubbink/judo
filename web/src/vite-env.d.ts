/// <reference types="vite/client" />

declare module '@data' {
  import type { JudoData } from './types'
  const data: JudoData
  export default data
}
