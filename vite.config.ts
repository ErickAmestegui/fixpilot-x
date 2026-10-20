import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins:[react()],
  base:'./',
  // Recorder/report output is not source. Windows can lock a video while it is finalized.
  server:{watch:{ignored:['**/demo-results/**','**/demo-final-results/**','**/demo-rescue-results/**','**/test-results/**','**/playwright-report/**']}},
  test:{include:['tests/**/*.test.ts']},
  build:{chunkSizeWarningLimit:800},
});
