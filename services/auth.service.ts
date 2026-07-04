import { ApiError } from '@/lib/api-response';
import {
  comparePassword,
  createRefreshTokenValue,
  hashPassword,
  signAccessToken,
} from '@/lib/auth';
import { publishEvent } from '@/lib/kafka/producer';
import { SOCIAL_EVENTS } from '@/constants/events';
import { logger } from '@/lib/logger';
import { cacheDelete, cacheSet } from '@/lib/redis/cache';
import { sessionCacheKey } from '@/lib/redis/keys';
import { CACHE_TTL } from '@/constants/cache';
import { refreshTokenRepository } from '@/repositories/refresh-token.repository';
import { userRepository } from '@/repositories/user.repository';
import { LoginDto, RegisterDto, UserDto } from '@/types/dto/auth.dto';

const REFRESH_TOKEN_DAYS = 30;

function getRefreshExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
  return expiresAt;
}

async function issueTokens(user: UserDto) {
  const accessToken = signAccessToken(user);
  const refreshToken = createRefreshTokenValue();
  await refreshTokenRepository.create(user.id, refreshToken, getRefreshExpiry());
  return { accessToken, refreshToken };
}

export const authService = {
  async login(input: LoginDto): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const dto = userRepository.toDto(user);
    const tokens = await issueTokens(dto);

    await cacheSet(sessionCacheKey(user.id), { userId: user.id }, CACHE_TTL.SESSION);
    logger.info('User logged in', { userId: user.id });

    return { user: dto, ...tokens };
  },

  async register(input: RegisterDto): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
    });

    const dto = userRepository.toDto(user);
    const tokens = await issueTokens(dto);

    await publishEvent(SOCIAL_EVENTS.ANALYTICS_TRACKED, {
      action: 'user_registered',
      userId: user.id,
    });

    return { user: dto, ...tokens };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const record = await refreshTokenRepository.findValid(refreshToken);
    if (!record) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    await refreshTokenRepository.revoke(refreshToken);

    const dto = userRepository.toDto(record.user);
    const newRefreshToken = createRefreshTokenValue();
    await refreshTokenRepository.create(record.userId, newRefreshToken, getRefreshExpiry());

    const accessToken = signAccessToken(dto);

    logger.info('Token rotated', { userId: record.userId });
    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      await refreshTokenRepository.revoke(refreshToken);
    }
    if (userId) {
      await cacheDelete(sessionCacheKey(userId));
    }
  },

  async logoutAllDevices(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllForUser(userId);
    await cacheDelete(sessionCacheKey(userId));
    logger.info('Logged out from all devices', { userId });
  },

  async getCurrentUser(userId: string): Promise<UserDto | null> {
    const user = await userRepository.findById(userId);
    return user ? userRepository.toDto(user) : null;
  },
};
