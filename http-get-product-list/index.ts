import { SqlQuerySpec } from "@azure/cosmos";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { productContainer, stockContainer } from "../model/cosmosConfig";

const fetchProducts = async (context: Context) => {
  context.log("Fetching all products.");
  const { resources: products } = await productContainer.items
    .query("SELECT * FROM c")
    .fetchAll();
  context.log(`Fetched ${products.length} products.`);
  return products;
};

const fetchStockForProduct = async (productId: string, context: Context) => {
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
  context.log(
    `Fetched stock for product ID: ${productId}, stock count: ${
      stock?.count || 0
    }`
  );
  return stock;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP GET request to fetch product list processed.");
  try {
    const products = await fetchProducts(context);
    const stocks = await Promise.all(
      products.map(async (product) => {
        const stock = await fetchStockForProduct(product.id, context);
        return { ...product, stock: stock?.count || 0 };
      })
    );

    context.log("Successfully fetched products and their stock counts.");
    context.res = {
      status: 200,
      body: stocks,
    };
  } catch (err) {
    context.log.error("Error fetching products and stocks", err);
    context.res = {
      status: 500,
      body: "Error fetching products: " + err.message,
    };
  }
};

export default httpTrigger;
