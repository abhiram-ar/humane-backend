import {
   GetRelationShipStatusInputDTO,
   GetRelationShipStatusOutputDTO,
} from '@application/DTO-mapper/friendship/GetRelationshipStatus.dto';

export interface IGetRelationShipStatus {
   execute(dto: GetRelationShipStatusInputDTO): Promise<GetRelationShipStatusOutputDTO>;
}
