import { Body, Controller, Next, Param, Post, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}
}
