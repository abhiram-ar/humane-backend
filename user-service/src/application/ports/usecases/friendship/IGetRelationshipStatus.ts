import {
   GetRelationShipStatusInputDTO,
   GetRelationShipStatusOutputDTO,
} from '@dtos/friendship/GetRelationshipStatus.dto';

export interface IGetRelationShipStatus {
   execute(dto: GetRelationShipStatusInputDTO): Promise<GetRelationShipStatusOutputDTO>;
}
