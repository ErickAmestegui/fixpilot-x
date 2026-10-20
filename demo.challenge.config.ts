import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testDir:'./demo',testMatch:'challenge.spec.ts',timeout:230_000,reporter:'line',outputDir:'demo-challenge-results',use:{...base.use,trace:'off',viewport:{width:1600,height:1000},video:{mode:'on',size:{width:1600,height:1000}}}});
