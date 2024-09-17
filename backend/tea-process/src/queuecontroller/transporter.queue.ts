// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { KafkaConsumer } from '../kafka/kafka.consumer';
// // import { TransporterBlockchainService } from '../blockchain/transporter.blockchain';

// @Injectable()
// export class TransporterQueueReceiver implements OnModuleInit {
//   constructor(
//     private readonly kafkaConsumer: KafkaConsumer,
//     // private readonly transporterBlockchainService: TransporterBlockchainService,
//   ) {}

//   async onModuleInit() {
//     console.log(
//       'TransporterQueueReceiver.onModuleInit() - Subscribing to transporter-topic',
//     );

//     // Receive messages from the Kafka queue
//     // await this.kafkaConsumer.consume(
//     //   { topics: ['transporter-topic']},
//     //   {
//     //     eachMessage: async ({ topic, partition, message }) => {
//     //       try {
//     //         console.log(
//     //           '-----MESSAGE RECEIVED FROM QUEUE (transporter-topic)------',
//     //         );
//     //         const parsedMessage = JSON.parse(message.value.toString());
//     //         console.log('Received Message (transporter-topic):', parsedMessage);

//     //         if (parsedMessage.type === 'createStorage') {
//     //           console.log('Processing createStorage...');
//     //           // await this.transporterBlockchainService.createStorage(
//     //           //   parsedMessage,
//     //           // );
//     //         } else if (parsedMessage.type === 'updateStorage') {
//     //           console.log('Processing updateStorage...');
//     //           // await this.transporterBlockchainService.updateStorage(
//     //           //   parsedMessage,
//     //           // );
//     //         } else if (parsedMessage.type === 'createShipping') {
//     //           console.log('Processing createShipping...');
//     //           // await this.transporterBlockchainService.createShipping(
//     //           //   parsedMessage,
//     //           // );
//     //         } else {
//     //           console.error('Unknown message type:', parsedMessage.type);
//     //         }
//     //       } catch (error) {
//     //         console.error(
//     //           'Error processing message from transporter-topic:',
//     //           error,
//     //         );
//     //       }
//     //     },
//     //   },
//     //   'transporter-group', // Unique group ID for TransporterQueueReceiver
//     // );
//   }
// }
