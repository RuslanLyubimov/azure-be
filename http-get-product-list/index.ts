import { AppConfigurationClient } from "@azure/app-configuration";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { products } from "../data";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: products,
  };
};

export default httpTrigger;
