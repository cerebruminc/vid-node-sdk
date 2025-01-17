import { HIDRpcEnums, HID_COSMOS_MODULE, HYPERSIGN_NETWORK_SCHEMA_PATH } from '../constants';
import * as generatedProto from '../generated/ssi/tx';

import axios from 'axios';
import { HIDClient } from '../hid/client';
import { Schema, SchemaProof } from '../generated/ssi/schema';
import { SignInfo } from '../generated/ssi/did';
import { SigningStargateClient } from '@cosmjs/stargate';

export interface ISchemaRPC {
  createSchema(schema: Schema, proof: SchemaProof): Promise<object>;
  resolveSchema(schemaId: string): Promise<object>;
}

export class SchemaRpc implements ISchemaRPC {
  public schemaRestEp: string;
  constructor() {
    this.schemaRestEp = HIDClient.hidNodeRestEndpoint + HYPERSIGN_NETWORK_SCHEMA_PATH;
  }

  // async createSchema(schema: Schema, signature: string, verificationMethodId: string): Promise<object> {
  //   const typeUrl = `${HID_COSMOS_MODULE}.${HIDRpcEnums.MsgCreateSchema}`;

  //   const signInfo: SignInfo = {
  //     verification_method_id: verificationMethodId,
  //     signature,
  //   };

  //   const txMessage = {
  //     typeUrl, // Same as above
  //     value: generatedProto[HIDRpcEnums.MsgCreateSchema].fromJSON({
  //       schema,
  //       signatures: [signInfo],
  //       creator: HIDClient.getHidWalletAddress(),
  //     }),
  //   };

  //   // TODO: need to find a way to make it dynamic
  //   const fee = 'auto';
  //   const hidClient: SigningStargateClient = HIDClient.getHidClient();
  //   const txResult = await hidClient.signAndBroadcast(HIDClient.getHidWalletAddress(), [txMessage], fee);
  //   return txResult;
  // }

  async createSchema(schema: Schema, proof: SchemaProof): Promise<object> {
    const typeUrl = `${HID_COSMOS_MODULE}.${HIDRpcEnums.MsgCreateSchema}`;

    const txMessage = {
      typeUrl, // Same as above
      value: generatedProto[HIDRpcEnums.MsgCreateSchema].fromJSON({
        schemaDoc: schema,
        schemaProof: proof,
        creator: HIDClient.getHidWalletAddress(),
      }),
    };

    // TODO: need to find a way to make it dynamic
    const fee = 'auto';
    const hidClient: SigningStargateClient = HIDClient.getHidClient();
    const txResult = await hidClient.signAndBroadcast(HIDClient.getHidWalletAddress(), [txMessage], fee);
    return txResult;
  }

  async resolveSchema(schemaId: string): Promise<Array<object>> {
    const getSchemaUrl = `${this.schemaRestEp}/${schemaId}:`;
    const response = await axios.get(getSchemaUrl);
    const { schema } = response.data;
    return schema;
  }
}
