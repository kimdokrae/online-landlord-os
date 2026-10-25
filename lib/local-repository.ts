/** Shared single-key local adapter. Domain parsers own validation/versioning. */
export interface Repository<T> {load():Promise<T|null>;save(value:T):Promise<void>}
export class LocalJSONRepository<T> implements Repository<T> {
  private readonly storage:Pick<Storage,'getItem'|'setItem'>;
  private readonly key:string;
  private readonly parse:(raw:string)=>T;
  private readonly serialize:(value:T)=>string;
  constructor(storage:Pick<Storage,'getItem'|'setItem'>,key:string,parse:(raw:string)=>T,serialize:(value:T)=>string) {this.storage=storage;this.key=key;this.parse=parse;this.serialize=serialize;}
  async load(){const raw=this.storage.getItem(this.key);return raw===null?null:this.parse(raw);}
  async save(value:T){const raw=this.serialize(value);this.storage.setItem(this.key,raw);}
}
