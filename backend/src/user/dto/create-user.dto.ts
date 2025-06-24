export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  active?: boolean;
  positionId?: number;
  trackId?: number;
  unitId?: number;
}
