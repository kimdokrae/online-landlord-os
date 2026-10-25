import {parseSettingsJSON,exportSettingsJSON} from './validation.ts';
import type {OfficeSettings} from './defaults.ts';
import {LocalJSONRepository,type Repository} from '../local-repository.ts';
export const settingsStorageKey='online-landlord-os:office-settings:v1';
export interface SettingsRepository extends Repository<OfficeSettings> {}
export class LocalSettingsRepository extends LocalJSONRepository<OfficeSettings> {
 constructor(storage:Pick<Storage,'getItem'|'setItem'>,key=settingsStorageKey){super(storage,key,parseSettingsJSON,exportSettingsJSON);}
}
