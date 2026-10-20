import {AssemblyMcpClient} from './mcp-client';
import type {ChallengePort} from './challenge';
export async function connectChallengeMcp():Promise<ChallengePort>{
 const client=new AssemblyMcpClient();await client.connect();
 if(client.tools.length!==22){await client.close();throw Error('Expected the existing 22-tool catalog.');}
 return {label:'MCP Streamable HTTP · '+client.transport?.protocolVersion,call:(name,args)=>client.call(name,args),close:()=>client.close()};
}
