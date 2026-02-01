/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - role_id
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Francisca"
 *               last_name:
 *                 type: string
 *                 example: "Parra"
 *               email:
 *                 type: string
 *                 example: "fparra@incide.com"
 *               password:
 *                 type: string
 *                 example: "Secret123!"
 *               role_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: User created successfully
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Soft delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only - Soft deletes a user by setting deleted_at timestamp. Deleted users cannot login.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       204:
 *         description: User soft deleted successfully
 *       403:
 *         description: Forbidden (Admin role required)
 */

/**
 * @swagger
 * /users/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only - Restores a previously deleted user by clearing the deleted_at timestamp
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: User restored successfully
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: User not found or not deleted
 */
