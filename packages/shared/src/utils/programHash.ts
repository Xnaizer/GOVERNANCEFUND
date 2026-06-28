import { sha256 } from "js-sha256";

export interface ProgramHashInput {
  programId: number;                      
  title: string | null;                   
  description: string | null;             
  totalBudget: string;                    
  picWallet: string;                      
  milestoneCount: number;                 
  province: string | null;                
  regency: string | null;                 
  district: string | null;                
  locationAddress: string | null;         
  executorName: string | null;            
  executorRegistration: string | null;    
  category: string | null;                
  institutionName: string | null;         
  fiscalYear: number | null;              
}

function norm(value: string | number | null | undefined): string {
    if(value === null || value === undefined) return "";
    return String(value).trim();
}

export function computeProgramHash(input: ProgramHashInput): string {
    const joinData = [
        norm(input.programId),
        norm(input.title),
        norm(input.description),
        norm(input.totalBudget),
        norm(input.picWallet).toLowerCase(), 
        norm(input.milestoneCount),
        norm(input.province),
        norm(input.regency),
        norm(input.district),
        norm(input.locationAddress),
        norm(input.executorName),
        norm(input.executorRegistration),
        norm(input.category),
        norm(input.institutionName),
        norm(input.fiscalYear),
    ].join("|");

    return "0x" + sha256(joinData);
}