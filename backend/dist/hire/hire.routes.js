"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hire_controller_1 = require("./hire.controller");
const router = (0, express_1.Router)();
router.post('/otp', hire_controller_1.sendOtp);
router.post('/submit', hire_controller_1.submitOffer);
exports.default = router;
