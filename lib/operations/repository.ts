import {connectionKey,validateState,type ConnectionState} from './model.ts';
export interface OperationsRepository {load():ConnectionState|null;save(state:ConnectionState):ConnectionState}
export class BrowserOperationsRepository implements OperationsRepository{
 private mode:ConnectionState['mode'];
 private storage?:Pick<Storage,'getItem'|'setItem'>;
 constructor(mode:ConnectionState['mode'],storage?:Pick<Storage,'getItem'|'setItem'>){this.mode=mode;this.storage=storage;}
 private get store(){return this.storage??localStorage;}
 load(){const raw=this.store.getItem(connectionKey(this.mode));return raw?validateState(JSON.parse(raw),this.mode):null;}
 save(state:ConnectionState){const safe=validateState(state,this.mode);this.store.setItem(connectionKey(this.mode),JSON.stringify(safe));return safe;}
}
