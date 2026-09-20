/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts"
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createApp: () => (/* binding */ createApp)
/* harmony export */ });
/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cors */ "cors");
/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _routes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./routes */ "./src/routes/index.ts");



const createApp = () => {
    const app = express__WEBPACK_IMPORTED_MODULE_1___default()();
    app.use(cors__WEBPACK_IMPORTED_MODULE_0___default()());
    app.use(express__WEBPACK_IMPORTED_MODULE_1___default().json());
    app.use('/api', _routes__WEBPACK_IMPORTED_MODULE_2__.apiRouter);
    return app;
};


/***/ },

/***/ "./src/config/env.ts"
/*!***************************!*\
  !*** ./src/config/env.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   env: () => (/* binding */ env)
/* harmony export */ });
const env = {
    port: Number(process.env.API_PORT) || 3001,
    host: process.env.API_HOST || '0.0.0.0',
};


/***/ },

/***/ "./src/modules/app/app.repository.ts"
/*!*******************************************!*\
  !*** ./src/modules/app/app.repository.ts ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   readAppData: () => (/* binding */ readAppData),
/* harmony export */   writeAppData: () => (/* binding */ writeAppData)
/* harmony export */ });
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:path */ "node:path");
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_json_file__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/json-file */ "./src/utils/json-file.ts");


const storageDir = node_path__WEBPACK_IMPORTED_MODULE_0___default().resolve(process.cwd(), 'storage');
const appDataPath = node_path__WEBPACK_IMPORTED_MODULE_0___default().join(storageDir, 'app.json');
const defaultAppData = {
    title: 'React App',
};
const readAppData = async () => {
    return (0,_utils_json_file__WEBPACK_IMPORTED_MODULE_1__.readJsonFile)(appDataPath, {
        defaultValue: defaultAppData,
    });
};
const writeAppData = async (data) => {
    return (0,_utils_json_file__WEBPACK_IMPORTED_MODULE_1__.writeJsonFile)(appDataPath, data);
};


/***/ },

/***/ "./src/modules/app/app.routes.ts"
/*!***************************************!*\
  !*** ./src/modules/app/app.routes.ts ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appRouter: () => (/* binding */ appRouter)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _app_repository__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app.repository */ "./src/modules/app/app.repository.ts");


const appRouter = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
appRouter.get('/app', async (_req, res, next) => {
    try {
        const appData = await (0,_app_repository__WEBPACK_IMPORTED_MODULE_1__.readAppData)();
        res.json(appData);
    }
    catch (error) {
        next(error);
    }
});
appRouter.put('/app/title', async (req, res, next) => {
    try {
        const { title } = req.body;
        if (typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                message: 'title must be a non-empty string',
            });
        }
        const appData = await (0,_app_repository__WEBPACK_IMPORTED_MODULE_1__.writeAppData)({
            title: title.trim(),
        });
        return res.json(appData);
    }
    catch (error) {
        return next(error);
    }
});
appRouter.delete('/app/title', async (_req, res, next) => {
    try {
        const appData = await (0,_app_repository__WEBPACK_IMPORTED_MODULE_1__.writeAppData)({
            title: '',
        });
        return res.json(appData);
    }
    catch (error) {
        return next(error);
    }
});


/***/ },

/***/ "./src/routes/health.ts"
/*!******************************!*\
  !*** ./src/routes/health.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   healthRouter: () => (/* binding */ healthRouter)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);

const healthRouter = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
healthRouter.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'server',
    });
});


/***/ },

/***/ "./src/routes/index.ts"
/*!*****************************!*\
  !*** ./src/routes/index.ts ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   apiRouter: () => (/* binding */ apiRouter)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _modules_app_app_routes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/app/app.routes */ "./src/modules/app/app.routes.ts");
/* harmony import */ var _health__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./health */ "./src/routes/health.ts");



const apiRouter = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
apiRouter.use(_health__WEBPACK_IMPORTED_MODULE_2__.healthRouter);
apiRouter.use(_modules_app_app_routes__WEBPACK_IMPORTED_MODULE_1__.appRouter);


/***/ },

/***/ "./src/utils/json-file.ts"
/*!********************************!*\
  !*** ./src/utils/json-file.ts ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   readJsonFile: () => (/* binding */ readJsonFile),
/* harmony export */   writeJsonFile: () => (/* binding */ writeJsonFile)
/* harmony export */ });
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:fs/promises */ "node:fs/promises");
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_fs_promises__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:path */ "node:path");
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(node_path__WEBPACK_IMPORTED_MODULE_1__);


const ensureDir = async (filePath) => {
    await (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.mkdir)(node_path__WEBPACK_IMPORTED_MODULE_1___default().dirname(filePath), { recursive: true });
};
const readJsonFile = async (filePath, { defaultValue, isValid }) => {
    await ensureDir(filePath);
    try {
        const file = await (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.readFile)(filePath, 'utf-8');
        const data = JSON.parse(file);
        if (!isValid || isValid(data)) {
            return data;
        }
    }
    catch (error) {
        const nodeError = error;
        if (nodeError.code !== 'ENOENT') {
            throw error;
        }
    }
    await writeJsonFile(filePath, defaultValue);
    return defaultValue;
};
const writeJsonFile = async (filePath, data) => {
    await ensureDir(filePath);
    await (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.writeFile)(filePath, `${JSON.stringify(data, null, 2)}\n`);
    return data;
};


/***/ },

/***/ "cors"
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
(module) {

module.exports = require("cors");

/***/ },

/***/ "express"
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
(module) {

module.exports = require("express");

/***/ },

/***/ "node:fs/promises"
/*!***********************************!*\
  !*** external "node:fs/promises" ***!
  \***********************************/
(module) {

module.exports = require("node:fs/promises");

/***/ },

/***/ "node:path"
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
(module) {

module.exports = require("node:path");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./src/server.ts ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app */ "./src/app.ts");
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config/env */ "./src/config/env.ts");


const app = (0,_app__WEBPACK_IMPORTED_MODULE_0__.createApp)();
app.listen(_config_env__WEBPACK_IMPORTED_MODULE_1__.env.port, _config_env__WEBPACK_IMPORTED_MODULE_1__.env.host, () => {
    console.log(`API server is running on http://localhost:${_config_env__WEBPACK_IMPORTED_MODULE_1__.env.port}`);
});

})();

/******/ })()
;
//# sourceMappingURL=server.cjs.map