import type { Request, Response, NextFunction } from 'express';
import { RoleConfig } from '../../db/models/role-config.model.js';
import { success } from '#utils/response.js';
import { AppError } from '#utils/app-error.js';

/**
 * GET /api/roles
 * Returns all role configurations.
 */
export const listRoles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await RoleConfig.findAll({ order: [['createdAt', 'DESC']] });
    success(res, roles);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/roles
 * Creates a new role configuration.
 *
 * Body: { roleName, keywords, minAtsThreshold?, isActive? }
 */
export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleName, keywords, minAtsThreshold, isActive } = req.body as {
      roleName?: string;
      keywords?: string[];
      minAtsThreshold?: number;
      isActive?: boolean;
    };

    if (!roleName || !roleName.trim()) {
      throw new AppError('roleName is required', 400, 'VALIDATION_ERROR');
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new AppError('keywords must be a non-empty array of strings', 400, 'VALIDATION_ERROR');
    }

    const role = await RoleConfig.create({
      roleName: roleName.trim(),
      keywords,
      minAtsThreshold: minAtsThreshold ?? 60,
      isActive: isActive ?? true,
    });

    success(res, role, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/roles/:id
 * Updates an existing role configuration.
 *
 * Body: { roleName?, keywords?, minAtsThreshold?, isActive? }
 */
export const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const role = await RoleConfig.findByPk(id);

    if (!role) {
      throw new AppError('Role configuration not found', 404, 'ROLE_NOT_FOUND');
    }

    const { roleName, keywords, minAtsThreshold, isActive } = req.body as {
      roleName?: string;
      keywords?: string[];
      minAtsThreshold?: number;
      isActive?: boolean;
    };

    if (roleName !== undefined) role.roleName = roleName.trim();
    if (keywords !== undefined) role.keywords = keywords;
    if (minAtsThreshold !== undefined) role.minAtsThreshold = minAtsThreshold;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();
    success(res, role);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/roles/:id
 * Deletes a role configuration.
 */
export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const role = await RoleConfig.findByPk(id);

    if (!role) {
      throw new AppError('Role configuration not found', 404, 'ROLE_NOT_FOUND');
    }

    await role.destroy();
    success(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};
