// import { createConsumer, type Consumer } from "@rails/actioncable"

// // Vite provides these types, but TS sometimes needs the hint
// /// <reference types="vite/client" />

// declare global {
//   // eslint-disable-next-line no-var
//   var __actionCableConsumer: Consumer | undefined
// }

// const WS_URL = import.meta.env.VITE_WS_URL

// if (!WS_URL) {
//   throw new Error("VITE_WS_URL is not defined")
// }

// const consumer: Consumer =
//   globalThis.__actionCableConsumer ??
//   (globalThis.__actionCableConsumer = createConsumer(WS_URL))

// // Prevent duplicate websocket connections during Vite HMR
// if (import.meta.hot) {
//   import.meta.hot.dispose(() => {
//     consumer.disconnect()
//     globalThis.__actionCableConsumer = undefined
//   })
// }

// export default consumer


// cable.ts
import { createConsumer } from "@rails/actioncable"

const consumer = createConsumer(import.meta.env.VITE_WS_URL)

export default consumer
