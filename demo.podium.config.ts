import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testDir:'./demo',testMatch:'podium.spec.ts',timeout:150_000,reporter:'line',outputDir:'demo-podium-results/recording',use:{...base.use,trace:'off',viewport:{width:1440,height:1000},video:{mode:'on',size:{width:1440,height:1000}}}});
