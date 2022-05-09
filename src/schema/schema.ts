import { ISchema, ISchemaTemplateSchema, ISchemaTemplate } from "./ISchema";
import { v4 as uuidv4 } from "uuid";
import * as constant from "../constants";
import Utils from "../utils";
import axios from "axios";
import IOptions from "../IOptions";
import { SchemaRpc, ISchemaRPC } from '../rpc/schemaRPC'

const SC_PREFIX = "sch_";
const SCHEMA_URL = "https://json-schema.org/draft-07/schema#";
const W3_SCHEMA_JSON_URL =
  "https://w3c-ccg.github.io/vc-json-schemas/schema/1.0/schema.json";

class SchemaTemplateSchema implements ISchemaTemplateSchema {
  $schema: string;
  description: string;
  type: string;
  properties: any;
  required: Array<string>;
  additionalProperties: boolean;
  constructor({
    properties,
    additionalProperties,
    description,
  }: ISchemaTemplateSchema) {
    this.$schema = SCHEMA_URL;
    this.description = description;
    this.type = "object";
    this.properties = {};
    this.required = Object.keys(properties); // TODO: right now all requried... later we can change this.
    this.additionalProperties = additionalProperties as boolean;
    this.required.forEach((key) => {
      this.properties[`${key}`] = {
        type: typeof properties[key] ? typeof properties[key] : "string",
      };
    });
  }

  get(): ISchemaTemplateSchema {
    return this;
  }
}

export interface IScheme {
  schemaUrl: string;
  generateSchema({
    name,
    author,
    description,
    properties,
  }: ISchema): Promise<ISchemaTemplate>;
  registerSchema(schema: ISchemaTemplate, signatures?: string): Promise<any>;
  getSchema(schemaId: string): Promise<any>;
}

export default class Schema implements IScheme {
  private utils: Utils;
  schemaUrl: string;
  schemaRpc: ISchemaRPC;
  constructor(options: IOptions, wallet) {
    this.utils = new Utils(options, wallet);
    this.schemaUrl = this.utils.nodeurl + constant.HYPERSIGN_NETWORK_SCHEMA_EP;
    this.schemaRpc = new SchemaRpc(wallet);
  }

  public async generateSchema({
    name,
    author,
    description,
    properties,
  }: ISchema): Promise<ISchemaTemplate> {
    let newSchema: ISchemaTemplate = {} as ISchemaTemplate;

    const didDoc = await this.utils.resolve(author);
    if (!didDoc) throw new Error("Could not resolve author did");

    newSchema.type = W3_SCHEMA_JSON_URL;
    newSchema.modelVersion = "v1.0";
    newSchema.id = SC_PREFIX + uuidv4();
    newSchema.name = name;
    newSchema.author = author;
    newSchema.authored = new Date().toString();
    newSchema.schema = new SchemaTemplateSchema({
      properties,
      additionalProperties: false,
      description,
    }).get();
    return newSchema;
  }

  public async registerSchema(schema: ISchemaTemplate, signatures?: string): Promise<any> {
    const schemaId = schema["id"];
    if(!schemaId){
      throw new Error('Invalid schema')
    }
    return this.schemaRpc.createSchema({
      schema,
      signatures
    });
  }
  
  public async getSchema(schemaId: string): Promise<any> {
    return await this.schemaRpc.getSchema(schemaId)
  }
}
