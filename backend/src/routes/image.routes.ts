import { Router } from 'express';
import * as imageController from '../controllers/image.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { multerUpload, handleMulterUpload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticateJWT);

router.post(
  '/upload',
  handleMulterUpload(multerUpload.array('files', 10)),
  imageController.uploadImages
);

router.get('/', imageController.listImages);
router.get('/:id', imageController.getImage);
router.delete('/:id', imageController.deleteImage);

export default router;
