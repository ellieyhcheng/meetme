'use strict';

module.exports = (() => {
	const dotenv = require('dotenv');
    dotenv.config();
	switch (process.env.NODE_ENV) {
	case 'development':
		return {
			// Firebase authentication settings
			// firebase: {
			// 	cert: JSON.parse(process.env.ADMIN_FIREBASE)
			// },
			// Server settings
			server: {
				port: process.env.PORT || 8000,
			}
		};
	default:
		return {
			// Firebase authentication settings
			// firebase: {
			// 	cert: JSON.parse(process.env.ADMIN_FIREBASE)
			// },
			// Server settings
			server: {
				port: process.env.PORT || 8000,
			}
		};
	}
})();