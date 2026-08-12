import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// Recursively traverse and sanitize objects/arrays/strings
const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj;
  }
  return obj;
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
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
