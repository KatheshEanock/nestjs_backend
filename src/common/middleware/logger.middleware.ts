import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const start = Date.now();

    console.log(`⬅️  Incoming: [${method}] ${originalUrl} - IP: ${ip}`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      console.log(
        `➡️  Outgoing: [${method}] ${originalUrl} - ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
