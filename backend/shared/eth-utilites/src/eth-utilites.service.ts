import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, ContractInterface, Wallet, ethers, providers } from 'ethers';
import { toUtf8String } from 'ethers/lib/utils';
import { UserDBProvider } from '@app/db-utilites/dbProviders/userDBProvider';
import { UserKeyModel } from '@app/db-utilites/Model/UserModel/UserKeyModel';
import {
  decryptData,
  encryptData,
} from '@app/db-utilites/DbInstance.providers';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EthUtilitesService {
  private readonly logger = new Logger(EthUtilitesService.name);
  private readonly provider: providers.JsonRpcProvider;
  private readonly rpcURL: string;
  private readonly contractABI;
  private readonly contractAddress: string;
  @Inject('USERDB_PROVIDER') private readonly userDBProvider: UserDBProvider;

  constructor(readonly configService: ConfigService) {
    this.rpcURL = configService.get('JSON_RPC_HTTP_ENDPOINT');
    this.contractAddress = configService.get('PROXY_CONTRACT_ADDRESS_2');
    this.provider = new providers.JsonRpcProvider(this.rpcURL);
    this.contractABI = JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname, '../../shared/eth-utilites/src/contract/artifacts/contracts/ChaiContract.sol/ChaiContract.json',
        ),
        'utf8',
      ),
    );
    //prod
    // this.contractABI = JSON.parse(
    //   fs.readFileSync(
    //     path.resolve(
    //       __dirname, '../../abi/ChaiContract.json',
    //     ),
    //     'utf8',
    //   ),
    // );
  }

  public async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  public async getTransactionReceipt(
    transactionHash: string,
  ): Promise<providers.TransactionReceipt> {
    return this.provider.getTransactionReceipt(transactionHash);
  }

  public getContractInstance(signer: any): Contract {
    return new Contract(
      this.contractAddress,
      this.contractABI.abi,
      signer,
    );
  }

  public getContractAddress(): string {
    return this.contractAddress;
  }

  public getRpcUrl(): string {
    return this.rpcURL;
  }

  public getProvider(): providers.JsonRpcProvider {
    return this.provider;
  }

  public async getWallet(GSTNumber: string): Promise<Wallet> {
    try {
      const userDetails = await this.userDBProvider.findUserKey(GSTNumber);
      let wallet: Wallet;
      if (userDetails?.GSTNumber) {
        const { dataObject } = await decryptData(
          this.configService,
          'BESU_DATA_SECRET',
          userDetails.encryptedPrivateKey,
        );
        wallet = new ethers.Wallet(dataObject);
      }
      return wallet;
    } catch (error) {
      throw error;
    }
  }

  public async createParticipantWallet(GSTNumber: string): Promise<Wallet> {
    try {
      const wallet = await ethers.Wallet.createRandom();
      const privateKey: any = wallet._signingKey().privateKey;
      // Encrypt data using your helper function
      const encryptPrivateKey = await encryptData(
        this.configService,
        'BESU_DATA_SECRET',
        privateKey,
      );
      const userKeyDetails: UserKeyModel = {
        GSTNumber: GSTNumber,
        encryptedPrivateKey: encryptPrivateKey,
        account: wallet.address,
      };
      await this.userDBProvider.createUserKey(userKeyDetails);
      return new Wallet(privateKey, this.provider);
    } catch (error) {
      this.logger.log('createParticipantWallet()', error);
      throw error;
    }
  }

  /* Function fetches the entire transation using transaction hash from blockchain
    and with the fetched transaction and blocknumber it queries the blockchain and fetches
    the custom error message */
  public async parseTxAndThrow(
    txHash: string,
    wallet: Wallet,
  ): Promise<string> {
    try {
      const tx = await wallet.provider.getTransaction(txHash);
      return await wallet.provider.call(tx);
    } catch (err) {
      const code = JSON.parse(
        JSON.stringify({ err }.err),
      )?.error?.error?.data?.substr('Reverted '.length);
      const byteStringReasonLength = 138;
      const reason = toUtf8String(
        ('0x' + code?.substr(byteStringReasonLength)).replace(/0+$/g, ''),
      );
      return reason;
    }
  }
}
