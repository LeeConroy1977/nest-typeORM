import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

//This makes sure we alway pass a class instead of just any
interface ClasssConstructor {
  new (...arg: any[]): {};
}

export function Serialize(dto: ClasssConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(
    context: ExecutionContext,
    handler: CallHandler<any>,
  ): Observable<any> {
    // run something before the request is handled by the request handler

    return handler.handle().pipe(
      map((data: any) => {
        // Run something before the response is sent out
        return plainToClass(this.dto, data, {
          // this make the Expose() in the dto work
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
