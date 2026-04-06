import * as path from "node:path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const endpoint = process.env.WEB_GRPC_ENDPOINT ?? "localhost:50051";
const protoPath = path.resolve(process.cwd(), "../../packages/proto/library/v1/library.proto");

type Callback<T> = (error: grpc.ServiceError | null, response: T) => void;

type AnyClient = grpc.Client & {
  [method: string]: (request: unknown, callback: Callback<any>) => void;
};

let client: AnyClient | null = null;

function getClient(): AnyClient {
  if (client) {
    return client;
  }

  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const loaded = grpc.loadPackageDefinition(packageDefinition) as any;
  const createdClient = new loaded.library.v1.LibraryService(endpoint, grpc.credentials.createInsecure()) as AnyClient;
  client = createdClient;
  return createdClient;
}

export function callRpc<TRequest extends object, TResponse>(method: string, request: TRequest): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const c = getClient();
    c[method](request, (error: grpc.ServiceError | null, response: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response as TResponse);
    });
  });
}
