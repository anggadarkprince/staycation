const User = require('../models/User');

module.exports = {
    getPermissions: async (userId) => {
        const user = await User.findById(userId).populate({
            path: 'roleId',
            populate: {
                path: 'permissionId',
                model: 'Permission'
            }
        });

        const userPermissions = {};
        user.roleId.forEach(role => {
            role.permissionId.forEach(ownedPermission => {
                userPermissions[ownedPermission.permission] = ownedPermission;
            });
        });

        return userPermissions;
    },
};