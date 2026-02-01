/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets in the system (Admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only - returns all tickets regardless of creator or assignment
 *     responses:
 *       200:
 *         description: List of all tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: User or Admin - create a new support ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Login error on mobile"
 *               description:
 *                 type: string
 *                 example: "Getting error 500 when trying to login from mobile app"
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (Support role cannot create tickets)
 */

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get a ticket by ID
 *     tags: [Tickets]
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
 *         description: Ticket details
 *       404:
 *         description: Ticket not found
 *   put:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Admin or Support (for assigned tickets) - update ticket title and description only
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Login error - Updated"
 *               description:
 *                 type: string
 *                 example: "Updated description with more details"
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 *   delete:
 *     summary: Soft delete a ticket (Admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only - Soft deletes a ticket by setting deleted_at timestamp. Deleted tickets can be restored.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Ticket soft deleted successfully
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /tickets/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted ticket (Admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only - Restores a previously deleted ticket by clearing the deleted_at timestamp
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Ticket restored successfully
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Ticket not found or not deleted
 */

/**
 * @swagger
 * /tickets/assigned:
 *   get:
 *     summary: Get tickets assigned to current support user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Support users only - returns tickets assigned to them
 *     responses:
 *       200:
 *         description: List of assigned tickets
 *       403:
 *         description: Forbidden (Support role required)
 */

/**
 * @swagger
 * /tickets/without_assignment:
 *   get:
 *     summary: Get unassigned tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Support users only - returns tickets without assignment
 *     responses:
 *       200:
 *         description: List of unassigned tickets
 *       403:
 *         description: Forbidden (Support role required)
 */

/**
 * @swagger
 * /tickets/created_by:
 *   get:
 *     summary: Get tickets created by current user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Regular users only - returns tickets they created
 *     responses:
 *       200:
 *         description: List of user's tickets
 *       403:
 *         description: Forbidden (User role required)
 */

/**
 * @swagger
 * /tickets/{id}/self_assign:
 *   patch:
 *     summary: Self-assign a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Support users can assign unassigned tickets to themselves
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       400:
 *         description: Ticket already assigned
 *       403:
 *         description: Forbidden (Support role required)
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /tickets/{id}/assign:
 *   patch:
 *     summary: Assign ticket to a support user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Admin only - assign ticket to any support user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigned_to
 *             properties:
 *               assigned_to:
 *                 type: integer
 *                 description: ID of support user to assign
 *                 example: 2
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Ticket or user not found
 */

/**
 * @swagger
 * /tickets/{id}/change_status:
 *   patch:
 *     summary: Change ticket status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: Admin or Support (for assigned tickets) - change ticket status with workflow validation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticket_status_id
 *             properties:
 *               ticket_status_id:
 *                 type: integer
 *                 description: New status ID (1=open, 2=in_progress, 3=resolved, 4=closed)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Status changed successfully
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
