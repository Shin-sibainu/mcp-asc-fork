import type { XmcpConfig } from 'xmcp'

const config: XmcpConfig = {
  stdio: true,
  http: true,
  paths: {
    tools: 'src/tools',
    prompts: false,
    resources: false,
  },
}

export default config
