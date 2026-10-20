/** Replays an exported digital test fixture in a NEW local MCP session, never a saved browser project. */
import {readFile,writeFile} from 'node:fs/promises';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {ChallengeSession,readSeed,type ChallengeReceipt} from '../src/challenge';
import {scenarioBaseToken} from '../src/rescue';
import {validateState,type ToolResult} from '../src/engine';
const file=process.argv[2];if(!file)throw Error('Usage: npm run challenge:replay -- evidence.json [output.json]');
const record=JSON.parse(await readFile(file,'utf8'));if(!Array.isArray(record.receipts)||!validateState(record.state))throw Error('Invalid evidence export.');
readSeed(record.seed);const client=new Client({name:'fixpilot-challenge-replay',version:'1.0.0'}),transport=new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3101/mcp'));
await client.connect(transport);
try{
 const catalog=(await client.listTools()).tools;if(catalog.length!==22)throw Error('Expected 22 MCP tools.');
 const session=new ChallengeSession({label:'Real MCP replay · '+transport.protocolVersion,call:async(name,args)=>{const raw=await client.callTool({name,arguments:args});if(raw.isError)throw Error('MCP execution failed.');return raw.structuredContent as unknown as ToolResult;}});
 const allowed=['load_assembly','restore_progress','preview_scenario','compare_scenarios','explain_recovery','apply_scenario','complete_step','get_assembly_state'];
 for(const r of record.receipts as ChallengeReceipt[]){if(r.kind==='error')continue;if(!allowed.includes(r.tool))throw Error('Unexpected replay capability.');const args=structuredClone(r.args);if(r.tool==='apply_scenario')args.baseToken=scenarioBaseToken(session.state);await session.call(r.tool,args);}
 const projection=(s:typeof session.state)=>({assemblyId:s.assemblyId,completed:[...s.completed].sort((a,b)=>a-b),missing:[...s.missing].sort(),missingTools:[...s.missingTools].sort()});
 const matched=JSON.stringify(projection(session.state))===JSON.stringify(projection(record.state));
 const result={mocked:false,fixtureOnly:true,protocol:transport.protocolVersion,toolCount:catalog.length,matchedOriginalFinalState:matched,disclosure:'Replays recorded digital approvals in a fresh isolated session. Does not verify or perform physical work. Audit timestamps and IDs are regenerated.',final:projection(session.state),receipts:session.receipts};
 if(process.argv[3])await writeFile(process.argv[3],JSON.stringify(result,null,2));console.log(JSON.stringify({matchedOriginalFinalState:matched,protocol:transport.protocolVersion,toolCount:catalog.length,final:result.final,receiptCount:session.receipts.length}));if(!matched)process.exitCode=1;
}finally{await transport.terminateSession().catch(()=>{});await client.close();}
