import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import {lazy,Suspense} from 'react';
const Challenge=lazy(()=>import('./RescueChallenge'));
const McpAppHost=lazy(()=>import('./RescueAppHost'));
const params=new URLSearchParams(location.search);
const challengeRoute=!params.has('rescue')&&(params.has('challenge')||params.has('judge')||/\/podium\/?$/.test(location.pathname)||/\/challenge\/?$/.test(location.pathname));

createRoot(document.getElementById('root')!).render(<React.StrictMode><Suspense fallback={<p role="status">Opening FixPilot X…</p>}>{params.has('mcp-app')?<McpAppHost/>:challengeRoute?<Challenge/>:<App/>}</Suspense></React.StrictMode>);
