
module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	extends: ['eslint:recommended', 'plugin:react/recommended'],
	plugins: ['react'],
	settings: {
		react: {
			version: 'detect',
		},
	},
	rules: {
		// reglas menos estrictas temporalmente al restaurar archivos
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'react/jsx-no-undef': 'off',
		'react/no-unescaped-entities': 'off',
		'no-unused-vars': ['warn', { 'args': 'none', 'ignoreRestSiblings': true }],
	},
};
