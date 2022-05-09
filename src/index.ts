import Did from './did';
import Credential  from './credential';
import Schema from './schema/schema';
import { OfflineSigner } from "@cosmjs/proto-signing";
import { HIDClient } from './hid/hidClient';

export = class HypersignSSISdk{
    did: Did;
    credential: any;
    schema: any;
    
    private signer: OfflineSigner;
    private nodeEndpoint: string; // http://localhost:26657 | 'TEST' | 'MAIN'
    private nodeRestEndpoint: string; // "" | http://localhost:1318
    constructor(offlineSigner: OfflineSigner, nodeEndpoint: string, nodeRestEndpoint?: string){
        
        // TODO validate if offlinesigner is of type OfflineSiner
        this.signer = offlineSigner; 

        if(!nodeEndpoint){
            throw new Error("HID Node enpoint must be passed. Possible values:  'TEST' | 'MAIN' | <custom node url>")
        }

        this.nodeEndpoint = nodeEndpoint; 
        this.nodeRestEndpoint = nodeRestEndpoint ? nodeRestEndpoint : "";
        this.did = {} as Did;
    }

    async init(){
        const hidClient = new HIDClient(this.signer, this.nodeEndpoint, this.nodeRestEndpoint);
        await hidClient.init();
        this.did = new Did();
        // this.schema = new Schema(this.options, this.wallet);
        // this.credential = new Credential(this.options, this.wallet);
    }

}

