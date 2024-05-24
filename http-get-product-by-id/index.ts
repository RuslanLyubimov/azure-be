import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { SqlQuerySpec } from "@azure/cosmos";
import { productContainer, stockContainer } from "../model/cosmosConfig";

const getProductById = async (id: string, context: Context) => {
  context.log(`Fetching product with ID: ${id}`);
  const { resource: product } = await productContainer.item(id, id).read();
  context.log(
    `Fetched product: ${product ? JSON.stringify(product) : "Not found"}`
  );
  return product;
};

const getStockForProduct = async (productId: string, context: Context) => {
  context.log(`Fetching stock for product ID: ${productId}`);
  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM c WHERE c.product_id = @productId",
    parameters: [
      {
        name: "@productId",
        value: productId,
      },
    ],
  };

  const {
    resources: [stock],
  } = await stockContainer.items.query(querySpec).fetchAll();
  context.log(`Fetched stock: ${stock ? JSON.stringify(stock) : "Not found"}`);
  return stock;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const id = req.params.id;
  context.log(`Product ID to find: ${id}`);

  if (!id) {
    context.log("No product ID provided");
    context.res = {
      status: 400,
      body: "Item not found, please provide an id.",
    };
    return;
  }

  try {
    const product = await getProductById(id, context);

    if (!product) {
      context.log(`Product not found for ID: ${id}`);
      context.res = {
        status: 404,
        body: "Product not found",
      };
      return;
    }

    const stock = await getStockForProduct(id, context);

    if (!stock) {
      context.log(`Stock not found for product ID: ${id}`);
      context.res = {
        status: 404,
        body: "Stock not found for product",
      };
      return;
    }

    context.log(`Returning product and stock information for ID: ${id}`);
    context.res = {
      status: 200,
      body: { ...product, count: stock.count },
    };
  } catch (err) {
    context.log.error("Error fetching product and stock", err);
    context.res = {
      status: 500,
      body: "Error fetching product: " + err.message,
    };
  }
};

export default httpTrigger;
