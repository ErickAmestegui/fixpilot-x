import {useEffect,useRef,useState} from 'react';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {CallToolResultSchema} from '@modelcontextprotocol/sdk/types.js';
import {AppBridge,PostMessageTransport} from '@modelcontextprotocol/ext-apps/app-bridge';
import {RESOURCE_MIME_TYPE} from '@modelcontextprotocol/ext-apps/server';
import {RESCUE_APP_URI,RESCUE_APP_TOOLS} from './mcp-app-shared';
import './challenge.css';

const sandboxPolicy="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
export default function RescueAppHost(){
 const frame=useRef<HTMLIFrameElement>(null),bridge=useRef<AppBridge|null>(null),client=useRef<Client|null>(null),transport=useRef<StreamableHTTPClientTransport|null>(null);
 const approval=useRef<((v:boolean)=>void)|null>(null),[review,setReview]=useState<Record<string,unknown>|null>(null),[checked,setChecked]=useState(false);
 const [html,setHtml]=useState(''),[status,setStatus]=useState('Start the local MCP server, then connect.'),[events,setEvents]=useState<string[]>([]),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 const record=(s:string)=>setEvents(v=>[...v,s]);
 useEffect(()=>()=>{approval.current?.(false);void bridge.current?.close();void transport.current?.terminateSession().catch(()=>{});void client.current?.close();},[]);
 async function connect(){
  setBusy(true);setReady(false);setEvents([]);try{
   const c=new Client({name:'fixpilot-x-mcp-apps-local-host',version:'1.0.0'},{capabilities:{extensions:{'io.modelcontextprotocol/ui':{mimeTypes:[RESOURCE_MIME_TYPE]}}}});
   const t=new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3101/mcp'));client.current=c;transport.current=t;await c.connect(t);
   const tools=(await c.listTools()).tools;if(tools.length!==22||RESCUE_APP_TOOLS.some(name=>!(tools.find(v=>v.name===name)?._meta?.ui as {resourceUri?:string})?.resourceUri))throw Error('Expected 22 tools with the four linked Rescue App operations.');
   record(`MCP initialize: ${t.protocolVersion} · ${tools.length} tools · UI capability advertised`);
   const resource=await c.readResource({uri:RESCUE_APP_URI}),content=resource.contents.find(r=>r.mimeType===RESOURCE_MIME_TYPE&&'text'in r);
   if(!content||!('text'in content))throw Error('Build the card first: npm run build:mcp-app.');
   record(`resources/read: ${RESCUE_APP_URI} · ${RESOURCE_MIME_TYPE}`);
   setHtml(content.text.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="${sandboxPolicy}">`));setStatus('Resource loaded. Waiting for the official Apps handshake…');
  }catch(e){setStatus(e instanceof Error?e.message:'Connection failed.');await client.current?.close();client.current=null;}finally{setBusy(false);}
 }
 useEffect(()=>{if(!html||!frame.current?.contentWindow||!client.current)return;
  const c=client.current,b=new AppBridge(null,{name:'FixPilot X local Apps host',version:'1.0.0'},{serverTools:{},logging:{}},{hostContext:{theme:'light',locale:'en',displayMode:'inline'}});bridge.current=b;
  b.oncalltool=async params=>{
   const allowed=['load_assembly','restore_progress','get_assembly_state','complete_step',...RESCUE_APP_TOOLS];if(!allowed.includes(params.name))throw Error('Tool is outside this challenge host capability set.');
   if(params.name==='apply_scenario'){
    setChecked(false);setReview(params.arguments??{});const yes=await new Promise<boolean>(resolve=>{approval.current=resolve;});approval.current=null;setReview(null);
    if(!yes){record('Host refused apply_scenario: no explicit host approval');return {isError:true,content:[{type:'text',text:'Host approval declined. The record was not changed.'}]};}
   }
   const start=performance.now(),result=CallToolResultSchema.parse(await c.callTool({name:params.name,arguments:params.arguments}));record(`${params.name} · ${Math.round(performance.now()-start)} ms · real MCP · ${result.isError?'error':'returned'}`);return result;
  };
  b.oninitialized=()=>{record('ui/initialize + ui/notifications/initialized: official App ↔ AppBridge handshake complete');setReady(true);setStatus('Official SDK handshake verified · local reference host · no Alexa+ connection');};
  void b.connect(new PostMessageTransport(frame.current.contentWindow,frame.current.contentWindow)).catch(e=>setStatus(String(e)));
  return()=>{void b.close();};
 },[html]);
 return <main className="rescue-challenge"><header className="challenge-header"><a className="challenge-brand" href="?challenge">FixPilot <b>X</b> / MCP App lab</a><a href="?challenge">Open full Challenge →</a></header><section style={{padding:'32px 0'}}><p className="challenge-kicker">OFFICIAL SDK · LOCAL REFERENCE HOST</p><h1 style={{fontSize:36,letterSpacing:-1}}>The rescue card, inside an MCP host.</h1><p style={{fontSize:13,color:'#597184',maxWidth:780,lineHeight:1.8}}>This host uses the official MCP Apps AppBridge and renders the server's UI resource in an opaque-origin, script-only sandbox. The card calls the real MCP server through the host. Compatibility is verified here; no native Alexa+, ChatGPT or Claude integration is claimed.</p><button className="challenge-primary" disabled={busy||!!html||!['127.0.0.1','localhost','[::1]'].includes(location.hostname)} onClick={()=>void connect()}>Connect MCP App</button><p role="status" data-testid="apps-host-status">{status}</p><details className="challenge-panel" style={{padding:16}} open><summary>Host protocol evidence</summary><pre style={{fontSize:11,whiteSpace:'pre-wrap',lineHeight:1.8}}>{events.join('\n')}</pre></details></section>{html&&<iframe ref={frame} title="FixPilot X official MCP App rescue card" sandbox="allow-scripts" srcDoc={html} style={{width:'100%',height:ready?1100:400,border:'1px solid #dbe7ed',borderRadius:16,background:'white'}}/>}{review&&<div className="challenge-dialog-backdrop"><section className="challenge-panel challenge-dialog" role="dialog" aria-label="Host approval for MCP App"><h2>Host approval required</h2><p>The embedded card requests applying these changes to its isolated challenge session.</p><pre style={{fontSize:11,whiteSpace:'pre-wrap'}}>{JSON.stringify(review.changes,null,2)}</pre><label className="challenge-checkbox"><input autoFocus type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>I reviewed this card's request in the host.</label><div className="challenge-button-row"><button onClick={()=>approval.current?.(false)}>Decline in host</button><button className="challenge-primary" disabled={!checked} onClick={()=>approval.current?.(true)}>Approve in host</button></div></section></div>}</main>;
}
