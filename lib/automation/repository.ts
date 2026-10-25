import {LocalJSONRepository,type Repository} from '../local-repository.ts';
import type {DiscoveryData} from './model.ts';
import {parseDiscovery,exportDiscovery} from './validation.ts';
export const discoveryStorageKey='online-landlord-os:automation-discovery:v1';
export interface DiscoveryRepository extends Repository<DiscoveryData> {}
export class LocalDiscoveryRepository extends LocalJSONRepository<DiscoveryData> {
  constructor(storage:Pick<Storage,'getItem'|'setItem'>,key=discoveryStorageKey){super(storage,key,parseDiscovery,exportDiscovery);}
}
