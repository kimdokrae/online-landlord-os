import {defaultDepartments,type OfficeSettings} from './defaults.ts';
type DisplayRoom={id:string;name:string;purpose?:string};
export function roomDepartmentId(room:DisplayRoom):string|undefined{
 const map:Record<string,string>={executive:'executive',development:'development',marketing:'marketing',finance:'finance'};
 if(map[room.id])return map[room.id];
 if(room.id==='work')return room.purpose==='lab'?'development':room.purpose==='studio'?'marketing':room.purpose==='support'?'support':'operations';
 if(room.id==='support')return room.purpose==='lab'?'quality':room.purpose==='studio'?'content':room.purpose==='finance'?'finance':'operations';
}
export function roomDisplayName(config:OfficeSettings,room:DisplayRoom):string{
 const department=roomDepartmentId(room);return department&&config.departments[department].name!==defaultDepartments[department].name?config.departments[department].name:room.name;
}
/** Choose a readable foreground for user-selected accent colors. */
export function accentForeground(hex:string):'#000000'|'#ffffff'{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.179?'#000000':'#ffffff';}
