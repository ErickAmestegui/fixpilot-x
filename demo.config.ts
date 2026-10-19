import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testDir:'./demo',testMatch:'record.spec.ts',timeout:180_000,reporter:'line',outputDir:'demo-results',use:{...base.use,trace:'off',video:{mode:'on',size:{width:1600,height:1000}}}});
