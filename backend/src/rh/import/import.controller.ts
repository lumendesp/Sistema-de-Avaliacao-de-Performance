import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ImportDto } from './dto/import.dto';

@ApiTags('RH - Importação')
@Controller('rh/import')
@UseGuards(JwtAuthGuard) // Protege a rota, garantindo que o usuário esteja logado
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    // --- NOVO ENDPOINT PARA UPLOAD EM MASSA (.ZIP) ---
    @Post('bulk-history')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Importa um lote de históricos a partir de um arquivo .zip.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                cycleId: { type: 'number' },
                file: { type: 'string', format: 'binary', description: 'Arquivo .zip contendo os arquivos .xlsx' },
            },
        },
    })
    async uploadBulkHistory(
        @UploadedFile() file: Express.Multer.File,
        @Body() importDto: ImportDto,
    ) {
        return this.importService.importBulkHistory(file, importDto.cycleId);
    }

    //
    @Post('history')
    // A verificação de Roles ('HR', 'ADMIN') não será adicionada por agora
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Importa um histórico de avaliação a partir de um arquivo Excel.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                cycleId: { type: 'number' },
                file: { type: 'string', format: 'binary', description: 'Arquivo .xlsx individual.' },
            },
        },
    })
    async uploadHistory(
        @UploadedFile() file: Express.Multer.File,
        @Body() importDto: ImportDto,
    ) {
        return this.importService.importHistory(file, importDto.cycleId);
    }
}