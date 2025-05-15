"use strict";

const { sanitize } = require("@strapi/utils");

module.exports = ({ strapi }) => ({
  async callback(ctx) {
    try {
      const provider = "google";
      const { email, name } = ctx.state.user; // Provided by Strapi's Google provider

      if (!email) {
        return ctx.badRequest("Email is required");
      }

      // Find existing user by email
      const existingUser = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { email: email.toLowerCase() } });

      let user;
      let jwt;

      if (existingUser) {
        // User exists, use existing user
        user = existingUser;
        jwt = strapi.plugins["users-permissions"].services.jwt.issue({
          id: user.id,
        });
      } else {
        // Create new user
        const pluginStore = await strapi.store({
          type: "plugin",
          name: "users-permissions",
        });

        const settings = await pluginStore.get({ key: "advanced" });
        const role = await strapi
          .query("plugin::users-permissions.role")
          .findOne({ where: { type: settings.default_role } });

        user = await strapi.query("plugin::users-permissions.user").create({
          data: {
            email: email.toLowerCase(),
            username: name || email.split("@")[0],
            provider,
            confirmed: true,
            role: role ? role.id : null,
          },
        });

        jwt = strapi.plugins["users-permissions"].services.jwt.issue({
          id: user.id,
        });
      }

      // Sanitize user data
      const schema = strapi.getModel("plugin::users-permissions.user");
      const sanitizedUser = await sanitize.contentAPI.output(user, schema);

      // Redirect to frontend with JWT and user data
      ctx.redirect(
        `http://localhost:3000/login?jwt=${jwt}&user=${encodeURIComponent(JSON.stringify(sanitizedUser))}`,
      );
    } catch (error) {
      strapi.log.error("Google callback error:", error);
      ctx.redirect("http://localhost:3000/login?error=Authentication failed");
    }
  },
});
