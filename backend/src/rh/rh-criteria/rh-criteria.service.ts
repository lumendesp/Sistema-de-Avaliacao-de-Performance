// backend/src/rh/rh-criteria/rh-criteria.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { CreateConfiguredCriterionDto } from './dto/create-configured-criterion.dto';
import { UpdateConfiguredCriterionDto } from './dto/update-configured-criterion.dto';
import { CriterionName } from '@prisma/client';
import { getCriterionDisplayName } from 'src/utils/criterion-formatter';

@Injectable()
export class RhCriteriaService {
  constructor(private prisma: PrismaService) {}

  // CRUD Criterion
  async createCriterion(data: CreateCriterionDto) {
    return this.prisma.criterion.create({ data });
  }

  async getAllCriteria() {
    const criteria = await this.prisma.criterion.findMany();
    return criteria.map(criterion => ({
      ...criterion,
      displayName: getCriterionDisplayName(criterion.name)
    }));
  }

  async getCriterionById(id: number) {
    const criterion = await this.prisma.criterion.findUnique({ where: { id } });
    if (criterion) {
      return {
        ...criterion,
        displayName: getCriterionDisplayName(criterion.name)
      };
    }
    return criterion;
  }

  async updateCriterion(id: number, data: UpdateCriterionDto) {
    return this.prisma.criterion.update({ where: { id }, data });
  }

  async deleteCriterion(id: number) {
    // Soft delete (desativa)
    return this.prisma.criterion.update({ where: { id }, data: { active: false } });
  }

  // Populate all criteria from enum
  async populateCriteria() {
    const criteriaData: Array<{ name: CriterionName; generalDescription: string; weight: number }> = [
      { name: CriterionName.ORGANIZACAO_NO_TRABALHO, generalDescription: 'Capacidade de manter o ambiente organizado', weight: 10 },
      { name: CriterionName.ATENDER_AOS_PRAZOS, generalDescription: 'Capacidade de cumprir prazos estabelecidos', weight: 10 },
      { name: CriterionName.SENTIMENTO_DE_DONO, generalDescription: 'Demonstra responsabilidade e compromisso com os resultados', weight: 10 },
      { name: CriterionName.RESILIENCIA_NAS_ADVERSIDADES, generalDescription: 'Capacidade de se adaptar e superar desafios', weight: 10 },
      { name: CriterionName.CAPACIDADE_DE_APRENDER, generalDescription: 'Disposição para aprender e se desenvolver continuamente', weight: 10 },
      { name: CriterionName.TEAM_PLAYER, generalDescription: 'Capacidade de trabalhar em equipe e colaborar', weight: 10 },
      { name: CriterionName.FAZER_MAIS_COM_MENOS, generalDescription: 'Eficiência na utilização de recursos', weight: 10 },
      { name: CriterionName.ENTREGAR_COM_QUALIDADE, generalDescription: 'Compromisso com a qualidade das entregas', weight: 10 },
      { name: CriterionName.PENSAR_FORA_DA_CAIXA, generalDescription: 'Criatividade e inovação na resolução de problemas', weight: 10 },
      { name: CriterionName.GENTE, generalDescription: 'Habilidades de relacionamento e liderança', weight: 10 },
      { name: CriterionName.RESULTADOS, generalDescription: 'Foco em resultados e performance', weight: 10 },
      { name: CriterionName.EVOLUCAO_DA_ROCKET_COR, generalDescription: 'Contribuição para o crescimento da empresa', weight: 10 },
    ];

    const createdCriteria: any[] = [];
    for (const criterion of criteriaData) {
      const existing = await this.prisma.criterion.findFirst({
        where: { name: criterion.name }
      });
      
      if (!existing) {
        const created = await this.prisma.criterion.create({
          data: criterion
        });
        createdCriteria.push(created);
      }
    }

    return createdCriteria;
  }

  // ConfiguredCriterion
  async addConfiguredCriterion(data: CreateConfiguredCriterionDto) {
    return this.prisma.configuredCriterion.create({ data });
  }

  async getConfiguredCriteria() {
    const configuredCriteria = await this.prisma.configuredCriterion.findMany({
      include: {
        criterion: true,
        track: true,
        unit: true,
        position: true,
        group: true,
      },
    });

    return configuredCriteria.map(config => ({
      ...config,
      criterion: {
        ...config.criterion,
        displayName: getCriterionDisplayName(config.criterion.name)
      }
    }));
  }

  async updateConfiguredCriterion(id: number, data: UpdateConfiguredCriterionDto) {
    return this.prisma.configuredCriterion.update({ where: { id }, data });
  }

  async deleteConfiguredCriterion(id: number) {
    return this.prisma.configuredCriterion.delete({ where: { id } });
  }

  // Track-specific criteria management
  async getCriteriaByTrack(trackId: number) {
    const criteria = await this.prisma.configuredCriterion.findMany({
      where: { trackId },
      include: {
        criterion: true,
        track: true,
        unit: true,
        position: true,
        group: true,
      },
    });

    return criteria.map(config => ({
      ...config,
      criterion: {
        ...config.criterion,
        displayName: getCriterionDisplayName(config.criterion.name)
      }
    }));
  }

  async addCriterionToTrack(
    trackId: number,
    criterionId: number,
    groupId: number,
    unitId: number,
    positionId: number,
    mandatory: boolean = false
  ) {
    const result = await this.prisma.configuredCriterion.create({
      data: {
        trackId,
        criterionId,
        groupId,
        unitId,
        positionId,
        mandatory,
      },
      include: {
        criterion: true,
        track: true,
        unit: true,
        position: true,
        group: true,
      },
    });

    return {
      ...result,
      criterion: {
        ...result.criterion,
        displayName: getCriterionDisplayName(result.criterion.name)
      }
    };
  }

  async removeCriterionFromTrack(trackId: number, criterionId: number) {
    const configuredCriterion = await this.prisma.configuredCriterion.findFirst({
      where: {
        trackId,
        criterionId,
      },
    });

    if (!configuredCriterion) {
      throw new Error('Criterion not found in track');
    }

    return this.prisma.configuredCriterion.delete({
      where: { id: configuredCriterion.id },
    });
  }

  async updateCriterionInTrack(trackId: number, criterionId: number, data: { mandatory?: boolean; unitId?: number; positionId?: number }) {
    const configuredCriterion = await this.prisma.configuredCriterion.findFirst({
      where: {
        trackId,
        criterionId,
      },
    });

    if (!configuredCriterion) {
      throw new Error('Criterion not found in track');
    }

    const result = await this.prisma.configuredCriterion.update({
      where: { id: configuredCriterion.id },
      data,
      include: {
        criterion: true,
        track: true,
        unit: true,
        position: true,
        group: true,
      },
    });

    return {
      ...result,
      criterion: {
        ...result.criterion,
        displayName: getCriterionDisplayName(result.criterion.name)
      }
    };
  }

  // Get tracks with their criterion groups and criteria
  async getTracksWithCriteria() {
    const tracks = await this.prisma.track.findMany({
      include: {
        CriterionGroup: {
          include: {
            configuredCriteria: {
              include: {
                criterion: true,
              },
            },
          },
        },
      },
    });

    return tracks.map(track => ({
      ...track,
      CriterionGroup: track.CriterionGroup.map(group => ({
        ...group,
        configuredCriteria: group.configuredCriteria.map(config => ({
          ...config,
          criterion: {
            ...config.criterion,
            displayName: getCriterionDisplayName(config.criterion.name)
          }
        }))
      }))
    }));
  }

  // Create default criterion group for a track
  async createDefaultGroup(trackId: number, unitId: number, positionId: number) {
    const defaultGroup = await this.prisma.criterionGroup.create({
      data: {
        name: 'Critérios Padrão',
        trackId,
        unitId,
        positionId,
      },
      include: {
        track: true,
        unit: true,
        position: true,
        configuredCriteria: {
          include: {
            criterion: true,
          },
        },
      },
    });

    return defaultGroup;
  }

  // Get all units
  async getUnits() {
    return this.prisma.unit.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Get all positions
  async getPositions() {
    return this.prisma.position.findMany({
      orderBy: { name: 'asc' },
    });
  }
}