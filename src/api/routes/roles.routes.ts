import { Router } from 'express';
import { listRoles, createRole, updateRole, deleteRole } from '../controllers/roles.controller.js';

const router = Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List role configurations
 *     description: Returns all role configurations for job search filtering.
 *     responses:
 *       200:
 *         description: List of role configurations
 */
router.get('/', listRoles);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a role configuration
 *     description: Creates a new role configuration with keywords and ATS threshold.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *               - keywords
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: Backend Engineer
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Node.js", "TypeScript", "Express"]
 *               minAtsThreshold:
 *                 type: integer
 *                 default: 60
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Role configuration created
 *       400:
 *         description: Validation error
 */
router.post('/', createRole);

/**
 * @swagger
 * /roles/{id}:
 *   patch:
 *     summary: Update a role configuration
 *     description: Partially updates an existing role configuration.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               minAtsThreshold:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role configuration updated
 *       404:
 *         description: Role configuration not found
 */
router.patch('/:id', updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role configuration
 *     description: Permanently deletes a role configuration.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role configuration deleted
 *       404:
 *         description: Role configuration not found
 */
router.delete('/:id', deleteRole);

export const rolesRouter = router;
