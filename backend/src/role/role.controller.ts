import { Body, Controller, Post } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() data: { type: string }) {
    return this.roleService.createRole(data.type);
  }
}
