import {
  handleApiError,
  unauthorized,
  validationError,
} from '@/lib/api-response';
import { createRefreshToken, setAuthCookies, signAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LoginSchema } from '@/lib/validation';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return unauthorized('Invalid email or password');
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return unauthorized('Invalid email or password');
    }

    // Create tokens using auth.ts functions
    const accessToken = signAccessToken({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    const refreshToken = createRefreshToken();

    // Hash and store refresh token
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );

    // Set cookies on response
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
