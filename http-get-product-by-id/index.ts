import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { products } from "../data";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  const productId = context.bindingData.id;

  const product = products.find((product) => product.id === String(productId));

  if (!product) {
    context.res = {
      status: 404,
      body: "Product not found",
    };
    return;
  }

  context.res = {
    status: 200,
    body: product,
  };
};

export default httpTrigger;
