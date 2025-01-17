import { HIDRpcEnums, HID_COSMOS_MODULE, HYPERSIGN_NETWORK_CREDENTIALSTATUS_PATH } from '../constants';
import * as generatedProto from '../generated/ssi/tx';
import { SigningStargateClient, DeliverTxResponse } from '@cosmjs/stargate';
import axios from 'axios';
import { HIDClient } from '../hid/client';
import { ICredentialRPC } from './ICredential';
import { CredentialStatus, CredentialProof, Credential } from '../generated/ssi/credential';

export class CredentialRPC implements ICredentialRPC {
  public credentialRestEP: string;
  constructor() {
    this.credentialRestEP = HIDClient.hidNodeRestEndpoint + HYPERSIGN_NETWORK_CREDENTIALSTATUS_PATH;
  }

  async registerCredentialStatus(
    credentialStatus: CredentialStatus,
    proof: CredentialProof
  ): Promise<DeliverTxResponse> {
    if (!credentialStatus) {
      throw new Error('CredentialStatus must be passed as a param while registerting credential status');
    }

    if (!proof) {
      throw new Error('Proof must be passed as a param while registering crdential status');
    }

    const typeUrl = `${HID_COSMOS_MODULE}.${HIDRpcEnums.MsgRegisterCredentialStatus}`;

    const txMessage = {
      typeUrl, // Same as above
      value: generatedProto[HIDRpcEnums.MsgRegisterCredentialStatus].fromPartial({
        credentialStatus,
        proof,
        creator: HIDClient.getHidWalletAddress(),
      }),
    };

    const fee = 'auto';
    const hidClient: SigningStargateClient = HIDClient.getHidClient();
    const txResult: DeliverTxResponse = await hidClient.signAndBroadcast(
      HIDClient.getHidWalletAddress(),
      [txMessage],
      fee
    );
    return txResult;
  }

  async resolveCredentialStatus(credentialId: string): Promise<Credential> {
    credentialId = credentialId + ':'; // TODO:  we need to sort this out ... need to remove later
    const get_didUrl = `${this.credentialRestEP}/${credentialId}`;
    const response = await axios.get(get_didUrl);
    if (!response.data) {
      throw new Error('Could not resolve credential status of credentialId ' + credentialId);
    }
    const credStatus: Credential = response.data.credStatus;
    if (!credStatus || !credStatus.claim || !credStatus.proof) {
      throw new Error('No credential status found. Probably invalid credentialId');
    }
    return credStatus;
  }
}
