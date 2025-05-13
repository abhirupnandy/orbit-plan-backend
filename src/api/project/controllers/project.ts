/**
 * project controller
 */

// import { factories } from '@strapi/strapi'
//
// export default factories.createCoreController('api::project.project');

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::project.project', ({ strapi }) => ({
    async find(ctx) {
        const { query } = ctx;
        const projects = await strapi.entityService.findMany('api::project.project', {
            ...query,
            populate: { tags: true, categories: true, users_permissions_users: true },
        });

        const sanitizedProjects = projects.map(project => ({
            ...project,
            AssignedUsers: project.users_permissions_users.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
            })),
            users_permissions_users: undefined,
        }));

        return { data: sanitizedProjects, meta: { pagination: ctx.pagination } };
    },
}));