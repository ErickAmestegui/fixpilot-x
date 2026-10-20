import {App} from '@modelcontextprotocol/ext-apps';
import {createRoot} from 'react-dom/client';
import RescueChallenge from './RescueChallenge';
import {validateState,type ToolResult} from './engine';
import type {ChallengePort} from './challenge';

const app=new App({name:'FixPilot X Rescue Card',version:'1.0.0'}, {},{autoResize:false});
const port:ChallengePort={label:'MCP Apps bridge → real MCP server',call:async(name,args)=>{
 const raw=await app.callServerTool({name,arguments:args});
 if(raw.isError)throw Error(raw.content.filter(c=>c.type==='text').map(c=>c.text).join('\n'));
 const r=raw.structuredContent as unknown as ToolResult;
 if(!r||!validateState(r.state))throw Error('Invalid server state.');return r;
}};
app.connect().then(()=>createRoot(document.getElementById('root')!).render(<RescueChallenge port={port} embedded/>)).catch(()=>{document.getElementById('root')!.textContent='MCP Apps host unavailable. Open the documented local host, not this card directly.';});
