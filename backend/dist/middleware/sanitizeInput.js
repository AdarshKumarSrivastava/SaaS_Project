"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const xss_1 = __importDefault(require("xss"));
// Recursively traverse and sanitize objects/arrays/strings
const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
        return (0, xss_1.default)(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (typeof obj === 'object' && obj !== null) {
        const sanitizedObj = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitizedObj[key] = sanitizeObject(value);
        }
        return sanitizedObj;
    }
    return obj;
};
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        // req.body is usually safe to reassign, but mutating might be safer if it's an object.
        // We will reassign it as it is standard in many middlewares (like body-parser).
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        const sanitizedQuery = sanitizeObject(req.query);
        for (const key of Object.keys(req.query)) {
            delete req.query[key];
        }
        Object.assign(req.query, sanitizedQuery);
    }
    if (req.params) {
        const sanitizedParams = sanitizeObject(req.params);
        for (const key of Object.keys(req.params)) {
            delete req.params[key];
        }
        Object.assign(req.params, sanitizedParams);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
