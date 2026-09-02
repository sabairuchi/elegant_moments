import express from 'express';
import { getEnquiries, createEnquiry } from '../../controllers/enquiryController.js';

const router = express.Router();

router.get('/', getEnquiries);
router.post('/', createEnquiry);

export default router;
