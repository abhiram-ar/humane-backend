import { InitiateCallInputDTO, InitiateCallOutputDTO } from '@application/dto/InitiateCall.dto';

// Multi Device User Call Connect Protocol
export interface IMDUCCProtocolServices {
   initializeCall(dto: InitiateCallInputDTO): Promise<InitiateCallOutputDTO>;
}
