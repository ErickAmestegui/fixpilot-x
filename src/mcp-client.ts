import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {validateState, type AssemblyState} from './engine';

export type ToolResult={state:AssemblyState,message:string,kind:'success'|'warning'|'info',data?:unknown};
export class AssemblyMcpClient {
  client:Client|null=null;
  transport:StreamableHTTPClientTransport|null=null;
  tools:string[]=[];
  async connect() {
    const client=new Client({name:'fixpilot-x-web',version:'1.0.0'});
    try {
      this.transport=new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3101/mcp'));
      await client.connect(this.transport);
      this.tools=(await client.listTools()).tools.map(t=>t.name);
      this.client=client;
    } catch(error) { await client.close().catch(()=>{}); throw error; }
  }
  async call(name:string,args:Record<string,unknown>):Promise<ToolResult> {
    if(!this.client) throw new Error('MCP no está conectado.');
    const result=await this.client.callTool({name,arguments:args});
    if(result.isError) throw new Error(result.content instanceof Array ? result.content.map(c=>'text' in c?c.text:'').join('\n'):'Error MCP');
    const data=result.structuredContent as ToolResult|undefined;
    if(!data || !validateState(data.state) || typeof data.message!=='string') throw new Error('Respuesta MCP inválida; no se modificó el estado local.');
    return data;
  }
  async close() { try { await this.transport?.terminateSession(); } catch { /* Already closed or unavailable. */ } finally { await this.client?.close();this.client=null;this.transport=null;this.tools=[]; } }
}
