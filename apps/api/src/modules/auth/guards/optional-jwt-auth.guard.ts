import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to allow unauthenticated requests
  handleRequest(err, user, info, context) {
    // If there's no user, just return null (don't throw an error)
    return user || null;
  }

  // Override canActivate to always return true
  canActivate(context: ExecutionContext) {
    // Always allow the request to proceed
    return super.canActivate(context) as Promise<boolean> | boolean;
  }
}
