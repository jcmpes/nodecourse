'use strict';
const { User } = require('../models');

class DeleteUserController {
  /**
   * / POST -> Delete user
   */
  async delete(req, res, next) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        const passwordsMatch = await user.comparePassword(password);
        if (passwordsMatch) {
          await User.findOneAndDelete({ email });
          res.json({ deleted: true });
        }
      }
      res.json({ error: 'Invalid email or passwod' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DeleteUserController();
