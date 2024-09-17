import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  BaseContract,
  ContractReceipt,
  ContractTransaction,
  Wallet,
  ethers,
} from 'ethers';
import { EthUtilitesService } from './eth-utilites.service';
import { ConfigService } from '@nestjs/config';
import { SOLIDITY_METHODS } from '@app/db-utilites/Enums/enums';

export class BlockchainHelper {
  private readonly logger = new Logger(BlockchainHelper.name);
  constructor(
    readonly configService: ConfigService,
    @Inject('ETHEREUM_SERVICE') private etherUtilities: EthUtilitesService,
  ) {}

  async sendTransaction(methodName: string, ...args: any): Promise<ContractReceipt> {
    let contractReceipt: ContractReceipt;
    let wallet: Wallet;
    try {
      if (methodName === SOLIDITY_METHODS.registerTeaTokenPlayers) {
        await this.etherUtilities.createParticipantWallet(args[0]);
      }
      
      wallet = await this.etherUtilities.getWallet(args[0]);
      
      const provider = this.etherUtilities.getProvider();
      const signer = wallet.connect(provider);
      const signedContract = this.etherUtilities.getContractInstance(signer);
      const txn: ContractTransaction = await signedContract[methodName](
        ...args.slice(1),
        {
          gasPrice: ethers.utils.parseUnits('0', 'gwei'),
        },
      );
      contractReceipt = await txn.wait();
    } catch (error) {
      this.logger.error(JSON.stringify(error, null, 2), error?.stack);
      if (error.transactionHash !== undefined) {
        const reason = await this.etherUtilities.parseTxAndThrow(
          error.transactionHash,
          wallet,
        );
        throw new InternalServerErrorException(reason);
      } else {
        throw new InternalServerErrorException(error);
      }
    }
    if (contractReceipt.status === 0) {
      throw new InternalServerErrorException(
        `blockchain transaction: ${contractReceipt.transactionHash} not successfully commited.`,
      );
    }
    return contractReceipt;
  }

}
