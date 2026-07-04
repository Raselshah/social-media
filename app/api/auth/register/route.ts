import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { RegisterSchema } from '@/lib/validation';
import {
  validationError,
  conflict,
  handleApiError,
} from '@/lib/api-response';
import { createRefreshToken, signAccessToken, setAuthCookies } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = RegisterSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return validationError(errors);
    }

    const { firstName, lastName, email, password } = validationResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return conflict('Email already registered');
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });

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
        message: 'Registration successful',
      },
      { status: 201 }
    );

    // Set cookies on response
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
