"use client";
import {usePublicDemo} from './public-provider';
import {PublicFinanceView,PublicSection} from './business-dashboard';
import {PageHeading,EmptyState} from '../ui';
export function SectionView({section}:{section:string}){
 const demo=usePublicDemo();
 if(demo?.enabled&&section==='finance')return <PublicFinanceView/>;
 if(demo?.enabled&&['tasks','reports','boardroom'].includes(section))return <PublicSection section={section}/>;
 return <><PageHeading pageId={section}/><EmptyState pageId={section}/></>;
}
