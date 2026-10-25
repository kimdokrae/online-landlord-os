import {existsSync} from 'node:fs';
import path from 'node:path';

/** Server-only presence check. Unverified artwork stays in the owner's project, outside release ZIPs. */
export function legacyAssetsAvailable(kind:'stable'|'world-v2'|'interior',root=process.cwd()){
 const files=kind==='stable'?['garden-terrain.webp']:kind==='world-v2'?['world-v2/terrain.webp','world-v2/edge-mask.svg']:['world-v2/interior.webp'];
 return files.every(file=>existsSync(path.join(root,'public/skycity',file)));
}
