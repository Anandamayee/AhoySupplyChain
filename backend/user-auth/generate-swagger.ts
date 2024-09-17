// generate-swagger.ts

import { NestFactory } from '@nestjs/core';
import { AuthModule } from './src/auth.module'; // Adjust the path as necessary
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function generateSwagger() {
  const app = await NestFactory.create(AuthModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('')
    .setDescription('Tea Supply Chain Management APIs')
    .setVersion('1.0')
    // .addTag('Tea Supply Chain Management APIs') // Optional: add tags to categorize endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Write the Swagger document to a file
  fs.writeFileSync('swagger-spec.json', JSON.stringify(document, null, 2));

  await app.close();
}

generateSwagger()
  .then(() => {
    console.log('Swagger file generated successfully.');
  })
  .catch((error) => {
    console.error('Error generating Swagger file:', error);
  });
