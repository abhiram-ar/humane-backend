// @ts-nocheck

import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import fs from 'fs';
import path from 'path';

const classify = async (modelPath: string, filePath: string) => {
   try {
      const imageBuffer = fs.readFileSync(filePath);
      console.log('image loaded');

      const model = await nsfwjs.load(`file://${modelPath}`, { size: 299 });
      console.log('model loaded');

      const imageTensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;
      console.log('tensor');

      const predictios = await model.classify(imageTensor);
      console.log(predictios);

      // imp: memory leak
      imageTensor.dispose();
   } catch (error) {
      console.log('err', error);
   }
};

const modelPath = path.resolve('./models/inception_v3/model.json');
const filePath = path.resolve('./test-images/sunny.png');
console.log('model path', modelPath);

classify(modelPath, filePath);
