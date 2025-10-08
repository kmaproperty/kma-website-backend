import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return null;
    }

    if (data && data in user) {
      return user[data as keyof typeof user];
    }

    return user;
  },
);
