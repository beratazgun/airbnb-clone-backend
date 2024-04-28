import { BadRequestException, Injectable } from '@nestjs/common';
import { DeleteImageBodyDto, PropertyCreateBodyDto } from './dtos';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '@common/core/prisma/prisma.service';
import { omit } from 'lodash';
import GeneratorManager from '@common/core/helpers/GeneratorManager';
import { AwsS3Service } from '@backend/src/shared/aws/aws-s3/aws-s3.service';
import { RedisService, TranslateService } from '@common';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';
import { ICreatePropertyRedis } from '../core/interfaces/redis/ICreateProperty.redis';

@Injectable()
export class PropertyService {
  constructor(
    private prismaService: PrismaService,
    private awsS3Service: AwsS3Service,
    private redisService: RedisService,
    private translateService: TranslateService,
  ) {}

  /**
   * !newProperty
   */
  async newProperty(req: Request, res: Response): Promise<void> {
    const propertySubID = Number(
      GeneratorManager.generateRandomId({
        length: 8,
        type: 'number',
      }),
    );

    await this.redisService.executeCommand((instance, redisKey) =>
      instance.set(
        redisKey({
          prefix: 'property',
          suffix: propertySubID.toString(),
        }),
        JSON.stringify({
          propertySubID,
          propertyOwnerID: req.session.user.id,
          propertyStatus: 'INACTIVE',
        }),
        'EX',
        30 * 24 * 60 * 60,
      ),
    );

    res.status(200).json({
      message: 'Property created successfully',
      isSuccess: true,
      metadata: {
        propertySubID,
      },
    });
  }

  /**
   * !createProperty
   */
  async createProperty(
    body: PropertyCreateBodyDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const redisRecord =
      await this.redisService.executeCommand<ICreatePropertyRedis>(
        (instance, redisKey) =>
          instance.get(
            redisKey({
              prefix: 'property',
              suffix: body.propertySubID.toString(),
            }),
          ),
        {
          parseJson: 'parse',
        },
      );

    if (!redisRecord) {
      return next(
        new BadRequestException(
          'Property not found. Please create a new property first.',
        ),
      );
    }

    if (body.stageType === 'PROPERTY_TYPE') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            propertyType: body.propertyType,
          }),
        ),
      );
    }

    if (body.stageType === 'PLACE_TYPE') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            placeType: body.placeType,
          }),
        ),
      );
    }

    if (body.stageType === 'PROPERTY_LOCATION') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            location: body.location,
          }),
        ),
      );
    }

    if (body.stageType === 'FLOOR_PLAN') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            numberOfBedrooms: body.numberOfBedrooms,
            numberOfBaths: body.numberOfBaths,
            numberOfGuests: body.numberOfGuests,
            numberOfBeds: body.numberOfBeds,
          }),
        ),
      );
    }

    if (body.stageType === 'OPPORTUNITY') {
      const opportunities = await this.prismaService.opportunity.findMany();

      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            opportunity: body.opportunity.map((el) => {
              const opportunityRecord = opportunities.find(
                (oppurtinityRecord) => oppurtinityRecord.opportunity === el,
              );

              return {
                oppurtunityID: opportunityRecord.id,
              };
            }),
          }),
        ),
      );
    }

    if (body.stageType === 'PROPERTY_IMAGES') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            propertyImages: body.images,
          }),
        ),
      );
    }

    if (body.stageType === 'PROPERTY_TITLE') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            title: body.title,
          }),
        ),
      );
    }

    if (body.stageType === 'PROPERTY_DESCRIPTION') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            description: body.description,
          }),
        ),
      );
    }

    if (body.stageType === 'NIGHTLY_PRICE') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            nightlyPrice: body.nightlyPrice,
          }),
        ),
      );
    }

    if (body.stageType === 'LAST_STEP') {
      await this.redisService.executeCommand((instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'property',
            suffix: body.propertySubID.toString(),
          }),
          JSON.stringify({
            ...redisRecord,
            isThereWeapons: body.isThereWeapons,
            isThereDangerousAnimals: body.isThereDangerousAnimals,
            isThereSecurityCameras: body.isThereSecurityCameras,
          }),
        ),
      );
    }

    if (body.stageType === 'COMPLETE') {
      await this.prismaService.$transaction(async (prisma) => {
        const property = await prisma.property.create({
          data: {
            ...omit(redisRecord, [
              'location',
              'propertyImages',
              'opportunity',
              'placeType',
              'propertyType',
              'propertySubID',
              'propertyOwnerID',
              'propertyStatus',
            ]),
            propertySubID: redisRecord.propertySubID,
            propertyLocation: {
              create: redisRecord.location,
            },
            placeType: {
              connect: {
                placeType: redisRecord.placeType,
              },
            },
            propertyType: {
              connect: {
                propertyType: redisRecord.propertyType,
              },
            },
            propertyOwner: {
              connect: {
                id: req.session.user.id,
              },
            },
            isGuestFavorite: false,
            propertyStatus: 'ACTIVE',
          },
        });

        await prisma.propertyImage.createMany({
          data: redisRecord.propertyImages.map((image) => ({
            propertyID: property.id,
            imageLink: image,
          })),
        });

        await prisma.propertyToOpportunity.createMany({
          data: redisRecord.opportunity.map((opportunity) => ({
            propertyID: property.id,
            opportunityID: opportunity.oppurtunityID,
          })),
        });
      });
    }

    res.status(200).json({
      statusCode: 200,
      isSuccess: true,
      payload: {
        message: 'Stage completed successfully',
      },
    });
  }

  /**
   * !uploadImageForProperty
   */
  async uploadImageForProperty(
    file: Express.Multer.File[],
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const metadata = await this.awsS3Service.uploadImage(file, next);

    if (!metadata) {
      return;
    }

    res.status(200).json({
      statusCode: 200,
      isSuccess: true,
      payload: {
        metadata,
      },
    });
  }

  /**
   * !deleteImageForProperty
   */
  async DeleteImageForProperty(
    body: DeleteImageBodyDto,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    body.imageUrls.forEach(async (imageUrl) => {
      await this.awsS3Service.deleteImageFromS3(imageUrl, next);
    });

    res.status(200).json({
      statusCode: 200,
      isSuccess: true,
    });
  }
}
